package controller

import (
	"context"
	"errors"
	"fmt"
	"github.com/eloxt/llmhub/common"
	"github.com/eloxt/llmhub/common/config"
	"github.com/eloxt/llmhub/common/helper"
	"github.com/eloxt/llmhub/common/logger"
	"github.com/eloxt/llmhub/model"
	"github.com/eloxt/llmhub/relay/adaptor/openai"
	"github.com/eloxt/llmhub/relay/meta"
	relaymodel "github.com/eloxt/llmhub/relay/model"
	"github.com/eloxt/llmhub/relay/relaymode"

	"github.com/gin-gonic/gin"
	"math"
	"net/http"
)

func getAndValidateTextRequest(c *gin.Context, relayMode int) (*relaymodel.GeneralOpenAIRequest, error) {
	textRequest := &relaymodel.GeneralOpenAIRequest{}
	err := common.UnmarshalBodyReusable(c, textRequest)
	if err != nil {
		return nil, err
	}
	if relayMode == relaymode.Moderations && textRequest.Model == "" {
		textRequest.Model = "text-moderation-latest"
	}
	if relayMode == relaymode.Embeddings && textRequest.Model == "" {
		textRequest.Model = c.Param("model")
	}
	err = validateTextRequest(textRequest, relayMode)
	if err != nil {
		return nil, err
	}
	return textRequest, nil
}

func getPromptTokens(textRequest *relaymodel.GeneralOpenAIRequest, relayMode int) int {
	switch relayMode {
	case relaymode.ChatCompletions:
		return openai.CountTokenMessages(textRequest.Messages, textRequest.Model)
	case relaymode.Completions:
		return openai.CountTokenInput(textRequest.Prompt, textRequest.Model)
	case relaymode.Moderations:
		return openai.CountTokenInput(textRequest.Input, textRequest.Model)
	}
	return 0
}

func getPreConsumedQuota(textRequest *relaymodel.GeneralOpenAIRequest, promptTokens int, inputPrice float64) float64 {
	preConsumedPrice := config.PreConsumedQuota + float64(promptTokens)*inputPrice
	if textRequest.MaxTokens != 0 {
		preConsumedPrice += float64(textRequest.MaxTokens) * inputPrice
	}
	return preConsumedPrice
}

func returnPreConsumedQuota(ctx context.Context, preConsumedQuota float64, tokenId int) {
	if preConsumedQuota != 0 {
		go func(ctx context.Context) {
			// return pre-consumed quota
			err := model.PostConsumeTokenQuota(tokenId, -preConsumedQuota)
			if err != nil {
				logger.Error(ctx, "error return pre-consumed quota: "+err.Error())
			}
		}(ctx)
	}
}

func postConsumeQuota(ctx context.Context, usage *relaymodel.Usage, meta *meta.Meta, textRequest *relaymodel.GeneralOpenAIRequest, modelConfig model.Config, systemPromptReset bool) {
	if usage == nil {
		logger.Error(ctx, "usage is nil, which is unexpected")
		return
	}
	promptPrice := modelConfig.Prompt
	cachePrice := modelConfig.InputCacheRead
	completionPrice := modelConfig.Completion
	promptTokens := usage.PromptTokens
	completionTokens := usage.CompletionTokens

	var quota float64
	if usage.PromptTokensDetails != nil && usage.PromptTokensDetails.CachedTokens > 0 {
		missToken := promptTokens - usage.PromptTokensDetails.CachedTokens
		quota = float64(missToken)*promptPrice + float64(usage.PromptTokensDetails.CachedTokens)*cachePrice + float64(completionTokens)*completionPrice
	} else {
		quota = float64(promptTokens)*promptPrice + float64(completionTokens)*completionPrice
	}

	err := model.PostConsumeTokenQuota(meta.TokenId, quota)
	if err != nil {
		logger.Error(ctx, "error consuming token remain quota: "+err.Error())
	}
	err = model.CacheUpdateUserQuota(ctx, meta.UserId)
	if err != nil {
		logger.Error(ctx, "error update user quota cache: "+err.Error())
	}
	logContent := fmt.Sprintf("Prompt: %.2f, Cached: %.2f, Completion: %.2f", promptPrice*common.Million, cachePrice*common.Million, completionPrice*common.Million)
	model.RecordConsumeLog(ctx, &model.Log{
		UserId:            meta.UserId,
		ChannelId:         meta.ChannelId,
		PromptTokens:      promptTokens,
		CompletionTokens:  completionTokens,
		ModelName:         textRequest.Model,
		TokenName:         meta.TokenName,
		Quota:             quota,
		Content:           logContent,
		IsStream:          meta.IsStream,
		ElapsedTime:       helper.CalcElapsedTime(meta.StartTime),
		SystemPromptReset: systemPromptReset,
	})
	model.UpdateUserUsedQuotaAndRequestCount(meta.UserId, quota)
	model.UpdateChannelUsedQuota(meta.ChannelId, quota)
}

func getMappedModelName(modelName string, mapping map[string]string) (string, bool) {
	if mapping == nil {
		return modelName, false
	}
	mappedModelName := mapping[modelName]
	if mappedModelName != "" {
		return mappedModelName, true
	}
	return modelName, false
}

func isErrorHappened(meta *meta.Meta, resp *http.Response) bool {
	if resp == nil {
		return true
	}
	if resp.StatusCode != http.StatusOK &&
		// replicate return 201 to create a task
		resp.StatusCode != http.StatusCreated {
		return true
	}
	return false
}

func setSystemPrompt(ctx context.Context, request *relaymodel.GeneralOpenAIRequest, prompt string) (reset bool) {
	//if prompt == "" {
	//	return false
	//}
	//if len(request.Messages) == 0 {
	//	return false
	//}
	//if request.Messages[0].Role == role.System {
	//	request.Messages[0].Content = prompt
	//	logger.Infof(ctx, "rewrite system prompt")
	//	return true
	//}
	//request.Messages = append([]relaymodel.Message{{
	//	Role:    role.System,
	//	Content: prompt,
	//}}, request.Messages...)
	//logger.Infof(ctx, "add system prompt")
	return true
}

func validateTextRequest(textRequest *relaymodel.GeneralOpenAIRequest, relayMode int) error {
	if textRequest.MaxTokens < 0 || textRequest.MaxTokens > math.MaxInt32/2 {
		return errors.New("max_tokens is invalid")
	}
	if textRequest.Model == "" {
		return errors.New("model is required")
	}
	switch relayMode {
	case relaymode.Completions:
		if textRequest.Prompt == "" {
			return errors.New("field prompt is required")
		}
	case relaymode.ChatCompletions:
		if textRequest.Messages == nil || len(textRequest.Messages) == 0 {
			return errors.New("field messages is required")
		}
	case relaymode.Embeddings:
	case relaymode.Moderations:
		if textRequest.Input == "" {
			return errors.New("field input is required")
		}
	case relaymode.Edits:
		if textRequest.Instruction == "" {
			return errors.New("field instruction is required")
		}
	}
	return nil
}
