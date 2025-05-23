package openai

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/eloxt/llmhub/common/client"
	"github.com/eloxt/llmhub/common/logger"
	"github.com/eloxt/llmhub/model"
	"github.com/eloxt/llmhub/relay/adaptor"
	"github.com/eloxt/llmhub/relay/channeltype"
	"github.com/eloxt/llmhub/relay/meta"
	relayModel "github.com/eloxt/llmhub/relay/model"
	"github.com/eloxt/llmhub/relay/relaymode"
	"github.com/gin-gonic/gin"
	"io"
	"net/http"
	"strconv"
	"strings"
)

type Adaptor struct {
	ChannelType int
}

func (a *Adaptor) Init(meta *meta.Meta) {
	a.ChannelType = meta.ChannelType
}

func (a *Adaptor) GetRequestURL(meta *meta.Meta) (string, error) {
	switch meta.ChannelType {
	//case channeltype.Azure:
	//	if meta.Mode == relaymode.ImagesGenerations {
	//		// https://learn.microsoft.com/en-us/azure/ai-services/openai/dall-e-quickstart?tabs=dalle3%2Ccommand-line&pivots=rest-api
	//		// https://{resource_name}.openai.azure.com/openai/deployments/dall-e-3/images/generations?api-version=2024-03-01-preview
	//		fullRequestURL := fmt.Sprintf("%s/openai/deployments/%s/images/generations?api-version=%s", meta.BaseURL, meta.ActualModelName, meta.Config.APIVersion)
	//		return fullRequestURL, nil
	//	}
	//
	//	// https://learn.microsoft.com/en-us/azure/cognitive-services/openai/chatgpt-quickstart?pivots=rest-api&tabs=command-line#rest-api
	//	requestURL := strings.Split(meta.RequestURLPath, "?")[0]
	//	requestURL = fmt.Sprintf("%s?api-version=%s", requestURL, meta.Config.APIVersion)
	//	task := strings.TrimPrefix(requestURL, "/v1/")
	//	model_ := meta.ActualModelName
	//	model_ = strings.Replace(model_, ".", "", -1)
	//	//https://github.com/songquanpeng/one-api/issues/1191
	//	// {your endpoint}/openai/deployments/{your azure_model}/chat/completions?api-version={api_version}
	//	requestURL = fmt.Sprintf("/openai/deployments/%s/%s", model_, task)
	//	return GetFullRequestURL(meta.BaseURL, requestURL, meta.ChannelType), nil
	//case channeltype.Minimax:
	//	return minimax.GetRequestURL(meta)
	//case channeltype.Doubao:
	//	return doubao.GetRequestURL(meta)
	//case channeltype.Novita:
	//	return novita.GetRequestURL(meta)
	//case channeltype.BaiduV2:
	//	return baiduv2.GetRequestURL(meta)
	//case channeltype.AliBailian:
	//	return alibailian.GetRequestURL(meta)
	//case channeltype.GeminiOpenAICompatible:
	//	return geminiv2.GetRequestURL(meta)
	default:
		return GetFullRequestURL(meta.BaseURL, meta.RequestURLPath, meta.ChannelType), nil
	}
}

func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Request, meta *meta.Meta) error {
	adaptor.SetupCommonRequestHeader(c, req, meta)
	if meta.ChannelType == channeltype.Azure {
		req.Header.Set("api-key", meta.APIKey)
		return nil
	}
	req.Header.Set("Authorization", "Bearer "+meta.APIKey)
	if meta.ChannelType == channeltype.OpenRouter {
		req.Header.Set("HTTP-Referer", "https://github.com/songquanpeng/one-api")
		req.Header.Set("X-Title", "One API")
	}
	return nil
}

func (a *Adaptor) ConvertRequest(c *gin.Context, relayMode int, request *relayModel.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	if request.Stream {
		// always return usage in stream mode
		if request.StreamOptions == nil {
			request.StreamOptions = &relayModel.StreamOptions{}
		}
		request.StreamOptions.IncludeUsage = true
	}
	return request, nil
}

//func (a *Adaptor) ConvertImageRequest(request *model.ImageRequest) (any, error) {
//	if request == nil {
//		return nil, errors.New("request is nil")
//	}
//	return request, nil
//}

func (a *Adaptor) DoRequest(c *gin.Context, meta *meta.Meta, requestBody io.Reader) (*http.Response, error) {
	return adaptor.DoRequestHelper(a, c, meta, requestBody)
}

func (a *Adaptor) DoResponse(c *gin.Context, resp *http.Response, meta *meta.Meta) (usage *relayModel.Usage, err *relayModel.ErrorWithStatusCode) {
	if meta.IsStream {
		var responseText string
		err, responseText, usage = StreamHandler(c, resp, meta.Mode)
		if usage == nil || usage.TotalTokens == 0 {
			usage = ResponseText2Usage(responseText, meta.ActualModelName, meta.PromptTokens)
		}
		if usage.TotalTokens != 0 && usage.PromptTokens == 0 { // some channels don't return prompt tokens & completion tokens
			usage.PromptTokens = meta.PromptTokens
			usage.CompletionTokens = usage.TotalTokens - meta.PromptTokens
		}
	} else {
		switch meta.Mode {
		case relaymode.ImagesGenerations:
			err, _ = ImageHandler(c, resp)
		default:
			err, usage = Handler(c, resp, meta.PromptTokens, meta.ActualModelName)
		}
	}
	return
}

func (a *Adaptor) FetchModelList(baseUrl string, key string) ([]*model.Model, error) {
	if baseUrl == "" {
		baseUrl = channeltype.ChannelBaseURLs[a.ChannelType]
	}
	baseUrl = strings.TrimSuffix(baseUrl, "/")
	requestURL := fmt.Sprintf("%s/v1/models", baseUrl)
	req, err := http.NewRequest(http.MethodGet, requestURL, nil)
	req.Header.Set("Authorization", key)
	if err != nil {
		logger.Warnf(nil, "fetch model list for OpenAI failed: %s", err.Error())
		return nil, err
	}
	response, err := client.HTTPClient.Do(req)
	if err != nil {
		logger.Warnf(nil, "fetch model list for OpenAI failed: %s", err.Error())
		return nil, err
	}
	if response == nil {
		logger.Warnf(nil, "fetch model list for OpenAI failed: response is nil")
		return nil, errors.New("response is nil")
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		logger.Warnf(nil, "fetch model list for OpenAI failed: %s", err.Error())
		return nil, err
	}
	_ = response.Body.Close()
	if response.StatusCode != http.StatusOK {
		logger.Warnf(nil, "fetch model list for OpenAI failed: %s", response.Status)
		return nil, errors.New("fetch model list failed")
	}
	var models *ModelListResponse
	err = json.Unmarshal(body, &models)
	if err != nil {
		logger.Warnf(nil, "fetch model list for OpenAI failed: %s", err.Error())
		return nil, err
	}
	var modelList []*model.Model
	id := 1
	for _, m := range models.Data {
		prompt, _ := strconv.ParseFloat(m.Pricing.Prompt, 64)
		completion, _ := strconv.ParseFloat(m.Pricing.Completion, 64)
		inputCacheRead, _ := strconv.ParseFloat(m.Pricing.InputCacheRead, 64)
		inputCacheWrite, _ := strconv.ParseFloat(m.Pricing.InputCacheWrite, 64)
		internalReasoning, _ := strconv.ParseFloat(m.Pricing.InternalReasoning, 64)
		webSearch, _ := strconv.ParseFloat(m.Pricing.WebSearch, 64)

		config := &model.Config{
			ContextLength:   m.ContextLength,
			Prompt:          prompt,
			Completion:      completion,
			InputCacheRead:  inputCacheRead,
			InputCacheWrite: inputCacheWrite,
			Reasoning:       internalReasoning,
			Additional:      webSearch,
			Tokenizer:       m.Architecture.Tokenizer,
		}
		respModel := &model.Model{
			Id:         id,
			Name:       m.ID,
			MappedName: m.ID,
			Enabled:    true,
			Config:     config,
		}
		id += 1
		modelList = append(modelList, respModel)
	}
	return modelList, nil
}

func (a *Adaptor) GetChannelName() string {
	return ""
}
