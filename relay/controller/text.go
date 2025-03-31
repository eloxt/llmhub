package controller

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/eloxt/llmhub/common/config"
	"github.com/eloxt/llmhub/common/logger"
	"github.com/eloxt/llmhub/relay"
	"github.com/eloxt/llmhub/relay/adaptor"
	"github.com/eloxt/llmhub/relay/adaptor/openai"
	"github.com/eloxt/llmhub/relay/apitype"
	"github.com/eloxt/llmhub/relay/billing"
	"github.com/eloxt/llmhub/relay/channeltype"
	"github.com/eloxt/llmhub/relay/meta"
	"github.com/eloxt/llmhub/relay/model"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RelayTextHelper(c *gin.Context) *model.ErrorWithStatusCode {
	ctx := c.Request.Context()
	contextMeta := meta.GetByContext(c)
	textRequest, err := getAndValidateTextRequest(c, contextMeta.Mode)
	if err != nil {
		logger.Errorf(ctx, "getAndValidateTextRequest failed: %s", err.Error())
		return openai.ErrorWrapper(c, err, "invalid_text_request", http.StatusBadRequest)
	}
	contextMeta.IsStream = textRequest.Stream

	// map model name
	contextMeta.OriginModelName = textRequest.Model
	textRequest.Model, _ = getMappedModelName(textRequest.Model, contextMeta.ModelMapping)
	contextMeta.ActualModelName = textRequest.Model
	// set system prompt if not empty
	systemPromptReset := setSystemPrompt(ctx, textRequest, contextMeta.ForcedSystemPrompt)
	// get model config
	modelConfig, ok := billing.GetChannelModelConfig(contextMeta.ChannelId, contextMeta.OriginModelName)
	if !ok {
		return openai.ErrorWrapper(c, fmt.Errorf("model config not found"), "model_config_not_found", http.StatusBadRequest)
	}
	// pre-consume quota
	promptTokens := getPromptTokens(textRequest, contextMeta.Mode)
	contextMeta.PromptTokens = promptTokens
	preConsumedQuota, bizErr := preConsumeQuota(ctx, textRequest, promptTokens, modelConfig.Prompt, contextMeta)
	if bizErr != nil {
		logger.Warnf(ctx, "preConsumeQuota failed: %+v", *bizErr)
		return bizErr
	}

	adaptorInstance := relay.GetAdaptor(contextMeta.APIType)
	if adaptorInstance == nil {
		return openai.ErrorWrapper(c, fmt.Errorf("invalid api type: %d", contextMeta.APIType), "invalid_api_type", http.StatusBadRequest)
	}
	adaptorInstance.Init(contextMeta)

	// get request body
	requestBody, err := getRequestBody(c, contextMeta, textRequest, adaptorInstance)
	if err != nil {
		return openai.ErrorWrapper(c, err, "convert_request_failed", http.StatusInternalServerError)
	}

	// do request
	resp, err := adaptorInstance.DoRequest(c, contextMeta, requestBody)
	if err != nil {
		logger.Errorf(ctx, "DoRequest failed: %s", err.Error())
		return openai.ErrorWrapper(c, err, "do_request_failed", http.StatusInternalServerError)
	}
	if isErrorHappened(contextMeta, resp) {
		returnPreConsumedQuota(ctx, preConsumedQuota, contextMeta.TokenId)
		return RelayErrorHandler(resp)
	}

	// do response
	usage, respErr := adaptorInstance.DoResponse(c, resp, contextMeta)
	if respErr != nil {
		logger.Errorf(ctx, "respErr is not nil: %+v", respErr)
		returnPreConsumedQuota(ctx, preConsumedQuota, contextMeta.TokenId)
		return respErr
	}
	// post-consume quota
	go postConsumeQuota(ctx, usage, contextMeta, textRequest, preConsumedQuota, modelConfig, systemPromptReset)
	return nil
}

func getRequestBody(c *gin.Context, meta *meta.Meta, textRequest *model.GeneralOpenAIRequest, adaptor adaptor.Adaptor) (io.Reader, error) {
	if !config.EnforceIncludeUsage &&
		meta.APIType == apitype.OpenAI &&
		meta.OriginModelName == meta.ActualModelName &&
		meta.ChannelType != channeltype.Baichuan &&
		meta.ForcedSystemPrompt == "" {
		// no need to convert request for openai
		return c.Request.Body, nil
	}

	// get request body
	var requestBody io.Reader
	convertedRequest, err := adaptor.ConvertRequest(c, meta.Mode, textRequest)
	if err != nil {
		logger.Debugf(c.Request.Context(), "converted request failed: %s\n", err.Error())
		return nil, err
	}
	jsonData, err := json.Marshal(convertedRequest)
	if err != nil {
		logger.Debugf(c.Request.Context(), "converted request json_marshal_failed: %s\n", err.Error())
		return nil, err
	}
	logger.Debugf(c.Request.Context(), "converted request: \n%s", string(jsonData))
	requestBody = bytes.NewBuffer(jsonData)
	return requestBody, nil
}
