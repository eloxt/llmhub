package controller

import (
	"fmt"
	"github.com/eloxt/llmhub/common/ctxkey"
	"github.com/eloxt/llmhub/common/result"
	"github.com/eloxt/llmhub/model"
	relaymodel "github.com/eloxt/llmhub/relay/model"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

// OpenAIModels https://platform.openai.com/docs/api-reference/models/list
type OpenAIModels struct {
	Id      string `json:"id"`
	Object  string `json:"object"`
	Created int    `json:"created"`
	OwnedBy string `json:"owned_by"`
}

var modelsMap map[string]OpenAIModels

func init() {
	// TODO: load models from config https://raw.githubusercontent.com/BerriAI/litellm/refs/heads/main/model_prices_and_context_window.json
}

func ListModels(c *gin.Context) {
	var availableModels []string
	if c.GetString(ctxkey.AvailableModels) != "" {
		availableModels = strings.Split(c.GetString(ctxkey.AvailableModels), ",")
	} else {
		availableModels, _ = model.CacheGetModelList()
	}
	availableOpenAIModels := make([]OpenAIModels, 0)
	for _, modelName := range availableModels {
		availableOpenAIModels = append(availableOpenAIModels, OpenAIModels{
			Id:      modelName,
			Object:  "model",
			Created: 1626777600,
			OwnedBy: "custom",
		})
	}
	c.JSON(200, gin.H{
		"object": "list",
		"data":   availableOpenAIModels,
	})
}

func RetrieveModel(c *gin.Context) {
	modelId := c.Param("model")
	if model, ok := modelsMap[modelId]; ok {
		c.JSON(200, model)
	} else {
		Error := relaymodel.Error{
			Message: fmt.Sprintf("The model '%s' does not exist", modelId),
			Type:    "invalid_request_error",
			Param:   "model",
			Code:    "model_not_found",
		}
		c.JSON(200, gin.H{
			"error": Error,
		})
	}
}

func HomeListModels(c *gin.Context) {
	list, err := model.GetModelDetailList()
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    list,
	})
	return
}
