package openai

import (
	"fmt"
	"github.com/eloxt/llmhub/common/logger"
	"github.com/eloxt/llmhub/relay/model"
	"github.com/gin-gonic/gin"
)

func ErrorWrapper(c *gin.Context, err error, code string, statusCode int) *model.ErrorWithStatusCode {
	logger.Error(c, fmt.Sprintf("[%s]%+v", code, err))

	Error := model.Error{
		Message: err.Error(),
		Type:    "one_api_error",
		Code:    code,
	}
	return &model.ErrorWithStatusCode{
		Error:      Error,
		StatusCode: statusCode,
	}
}
