package billing

import (
	"github.com/eloxt/llmhub/common/logger"
	"github.com/eloxt/llmhub/model"
)

var channelModelConfig map[int]map[string]model.Config

func Init() {
	models, err := model.GetModelList()
	if err != nil {
		logger.FatalLog("failed to initialize model list: " + err.Error())
		return
	}

	channelModelConfig = make(map[int]map[string]model.Config)
	for _, _model := range models {
		if _, ok := channelModelConfig[_model.ChannelId]; !ok {
			channelModelConfig[_model.ChannelId] = make(map[string]model.Config)
		}
		channelModelConfig[_model.ChannelId][_model.Name] = _model.Config
	}
}

func GetChannelModelConfig(channelId int, modelId string) (model.Config, bool) {
	if channelModelConfig == nil {
		return model.Config{}, false
	}
	if _, ok := channelModelConfig[channelId]; !ok {
		return model.Config{}, false
	}
	if _, ok := channelModelConfig[channelId][modelId]; !ok {
		return model.Config{}, false
	}
	return channelModelConfig[channelId][modelId], true
}
