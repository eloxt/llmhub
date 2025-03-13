package middleware

import (
	"github.com/eloxt/llmhub/common/helper"
	"github.com/gin-gonic/gin"
)

func RequestId() func(c *gin.Context) {
	return func(c *gin.Context) {
		id := helper.GenRequestID()
		c.Set(helper.RequestIdKey, id)
		// TODO 这里为什么要复制 Context
		ctx := helper.SetRequestID(c.Request.Context(), id)
		c.Request = c.Request.WithContext(ctx)
		c.Header(helper.RequestIdKey, id)
		c.Next()
	}
}
