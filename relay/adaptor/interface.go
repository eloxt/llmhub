package adaptor

import (
	"github.com/eloxt/llmhub/model"
	"github.com/eloxt/llmhub/relay/meta"
	relayModel "github.com/eloxt/llmhub/relay/model"
	"github.com/gin-gonic/gin"
	"io"
	"net/http"
)

type Adaptor interface {
	Init(meta *meta.Meta)
	GetRequestURL(meta *meta.Meta) (string, error)
	SetupRequestHeader(c *gin.Context, req *http.Request, meta *meta.Meta) error
	ConvertRequest(c *gin.Context, relayMode int, request *relayModel.GeneralOpenAIRequest) (any, error)
	//ConvertImageRequest(request *model.ImageRequest) (any, error)
	DoRequest(c *gin.Context, meta *meta.Meta, requestBody io.Reader) (*http.Response, error)
	DoResponse(c *gin.Context, resp *http.Response, meta *meta.Meta) (usage *relayModel.Usage, err *relayModel.ErrorWithStatusCode)
	FetchModelList(key string) ([]*model.Model, error)
	GetChannelName() string
}
