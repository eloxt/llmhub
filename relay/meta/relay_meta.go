package meta

import (
	"github.com/eloxt/llmhub/common/ctxkey"
	"github.com/eloxt/llmhub/model"
	"github.com/eloxt/llmhub/relay/channeltype"
	"github.com/eloxt/llmhub/relay/relaymode"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type Meta struct {
	Mode         int
	ChannelType  int
	ChannelId    int
	TokenId      int
	TokenName    string
	UserId       int
	Group        string
	ModelMapping map[string]string
	// BaseURL is the proxy url set in the channel config
	BaseURL  string
	APIKey   string
	APIType  int
	Config   model.ChannelConfig
	IsStream bool
	// OriginModelName is the model name from the raw user request
	OriginModelName string
	// ActualModelName is the model name after mapping
	ActualModelName    string
	RequestURLPath     string
	PromptTokens       int // only for DoResponse
	ForcedSystemPrompt string
	StartTime          time.Time
}

func GetByContext(c *gin.Context) *Meta {
	meta := Meta{
		Mode:               relaymode.GetByPath(c.Request.URL.Path),
		ChannelType:        c.GetInt(ctxkey.Channel),
		ChannelId:          c.GetInt(ctxkey.ChannelId),
		TokenId:            c.GetInt(ctxkey.TokenId),
		TokenName:          c.GetString(ctxkey.TokenName),
		UserId:             c.GetInt(ctxkey.Id),
		Group:              c.GetString(ctxkey.Group),
		ModelMapping:       c.GetStringMapString(ctxkey.ModelMapping),
		OriginModelName:    c.GetString(ctxkey.RequestModel),
		BaseURL:            c.GetString(ctxkey.BaseURL),
		APIKey:             strings.TrimPrefix(c.Request.Header.Get("Authorization"), "Bearer "),
		RequestURLPath:     c.Request.URL.String(),
		ForcedSystemPrompt: c.GetString(ctxkey.SystemPrompt),
		StartTime:          time.Now(),
	}
	cfg, ok := c.Get(ctxkey.Config)
	if ok {
		meta.Config = cfg.(model.ChannelConfig)
	}
	if meta.BaseURL == "" {
		meta.BaseURL = channeltype.ChannelBaseURLs[meta.ChannelType]
	}
	meta.APIType = channeltype.ToAPIType(meta.ChannelType)
	return &meta
}
