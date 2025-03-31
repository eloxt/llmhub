package result

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type Base struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Total   int64  `json:"total,omitempty"`
	Page    int    `json:"page,omitempty"`
	Data    any    `json:"data"`
}

func Return(c *gin.Context) {
	c.JSON(http.StatusOK, Base{
		Success: true,
		Message: "",
	})
}

func ReturnError(c *gin.Context, err error) {
	c.JSON(http.StatusOK, Base{
		Success: false,
		Message: err.Error(),
		Data:    nil,
	})
}

func ReturnMessage(c *gin.Context, message string) {
	c.JSON(http.StatusOK, Base{
		Success: false,
		Message: message,
		Data:    nil,
	})
}

func ReturnData(c *gin.Context, data any) {
	c.JSON(http.StatusOK, Base{
		Success: true,
		Message: "",
		Data:    data,
	})
}

func ReturnPage(c *gin.Context, page int, total int64, data any) {
	c.JSON(http.StatusOK, Base{
		Success: true,
		Message: "",
		Total:   total,
		Page:    page,
		Data:    data,
	})
}
