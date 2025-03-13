package openai

import (
	"bytes"
	"encoding/json"
	"github.com/eloxt/llmhub/relay/model"
	"github.com/gin-gonic/gin"
	"io"
	"net/http"
)

func ImageHandler(c *gin.Context, resp *http.Response) (*model.ErrorWithStatusCode, *model.Usage) {
	var imageResponse ImageResponse
	responseBody, err := io.ReadAll(resp.Body)

	if err != nil {
		return ErrorWrapper(c, err, "read_response_body_failed", http.StatusInternalServerError), nil
	}
	err = resp.Body.Close()
	if err != nil {
		return ErrorWrapper(c, err, "close_response_body_failed", http.StatusInternalServerError), nil
	}
	err = json.Unmarshal(responseBody, &imageResponse)
	if err != nil {
		return ErrorWrapper(c, err, "unmarshal_response_body_failed", http.StatusInternalServerError), nil
	}

	resp.Body = io.NopCloser(bytes.NewBuffer(responseBody))

	for k, v := range resp.Header {
		c.Writer.Header().Set(k, v[0])
	}
	c.Writer.WriteHeader(resp.StatusCode)

	_, err = io.Copy(c.Writer, resp.Body)
	if err != nil {
		return ErrorWrapper(c, err, "copy_response_body_failed", http.StatusInternalServerError), nil
	}
	err = resp.Body.Close()
	if err != nil {
		return ErrorWrapper(c, err, "close_response_body_failed", http.StatusInternalServerError), nil
	}
	return nil, nil
}
