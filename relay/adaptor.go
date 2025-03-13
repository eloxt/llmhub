package relay

import (
	"github.com/eloxt/llmhub/relay/adaptor"
	"github.com/eloxt/llmhub/relay/adaptor/openai"
	"github.com/eloxt/llmhub/relay/apitype"
)

func GetAdaptor(apiType int) adaptor.Adaptor {
	switch apiType {
	case apitype.OpenAI:
		return &openai.Adaptor{}
	}
	return nil
}
