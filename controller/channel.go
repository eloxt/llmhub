package controller

import (
	"github.com/eloxt/llmhub/common/config"
	"github.com/eloxt/llmhub/common/result"
	"github.com/eloxt/llmhub/model"
	"github.com/eloxt/llmhub/relay"
	"github.com/eloxt/llmhub/relay/channeltype"
	"github.com/eloxt/llmhub/relay/meta"
	"github.com/gin-gonic/gin"
	"strconv"
	"strings"
	"time"
)

func GetAllChannels(c *gin.Context) {
	p, _ := strconv.Atoi(c.Query("p"))
	if p < 0 {
		p = 0
	}
	keyword := c.Query("keyword")
	var channels []*model.Channel
	var err error
	if len(keyword) > 0 {
		channels, err = model.SearchChannels(keyword)
	} else {
		channels, err = model.GetAllChannels(p*config.ItemsPerPage, config.ItemsPerPage, "limited")
	}
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	// add models to channel
	for i := range channels {
		models, err := model.GetModelByChannel(channels[i].Id)
		if err != nil {
			result.ReturnError(c, err)
			return
		}
		channels[i].Models = models
	}
	result.ReturnData(c, channels)
	return
}

func GetChannel(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	channel, err := model.GetChannelById(id, false)
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	models, err := model.GetModelByChannel(id)
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	channel.Models = models
	result.ReturnData(c, channel)
	return
}

func AddChannel(c *gin.Context) {
	channel := model.Channel{}
	err := c.ShouldBindJSON(&channel)
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	channel.CreatedTime = time.Now()
	keys := strings.Split(channel.Key, "\n")
	channels := make([]model.Channel, 0, len(keys))
	for _, key := range keys {
		if key == "" {
			continue
		}
		localChannel := channel
		localChannel.Key = key
		channels = append(channels, localChannel)
	}
	err = model.BatchInsertChannels(channels)
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	result.Return(c)
	return
}

func DeleteChannel(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	channel := model.Channel{Id: id}
	err := channel.Delete()
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	result.Return(c)
	return
}

func UpdateChannel(c *gin.Context) {
	channel := model.Channel{}
	err := c.ShouldBindJSON(&channel)
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	err = channel.Update()
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	result.ReturnData(c, channel)
	return
}

func UpdateChannelStatus(c *gin.Context) {
	channel := model.Channel{}
	err := c.ShouldBindJSON(&channel)
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	err = model.UpdateChannelStatusById(channel.Id, channel.Status)
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	result.Return(c)
	return
}

func FetchChannelModelList(c *gin.Context) {
	channelId := c.Query("channel_id")
	var channelType int
	var key string
	if channelId != "" {
		id, err := strconv.Atoi(channelId)
		if err != nil {
			result.ReturnError(c, err)
			return
		}
		channel, err := model.GetChannelById(id, true)
		if err != nil {
			result.ReturnError(c, err)
			return
		}
		channelType = channel.Type
		key = channel.Key
	} else {
		channelType_, err := strconv.Atoi(c.Query("channel_type"))
		if err != nil {
			result.ReturnError(c, err)
			return
		}
		channelType = channelType_
		key = c.Query("key")
	}
	apiType := channeltype.ToAPIType(channelType)
	adaptorInstance := relay.GetAdaptor(apiType)
	metaInstance := &meta.Meta{
		ChannelType: channelType,
	}
	if adaptorInstance == nil {
		result.ReturnMessage(c, "invalid api type")
		return
	}
	adaptorInstance.Init(metaInstance)
	list, err := adaptorInstance.FetchModelList(key)
	if err != nil {
		return
	}

	result.ReturnData(c, list)
}
