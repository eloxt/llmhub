package model

import (
	"context"
	"github.com/eloxt/llmhub/common"
	"github.com/eloxt/llmhub/common/logger"
	"gorm.io/gorm"
	"sort"
)

type Model struct {
	Id         int     `json:"id" gorm:"primary_key"`
	Name       string  `json:"name" gorm:"type:text"`
	MappedName string  `json:"mapped_name"`
	ChannelId  int     `json:"channel_id"`
	Enabled    bool    `json:"enabled"`
	Priority   *int64  `json:"priority" gorm:"bigint;default:0;index"`
	Config     *Config `json:"config" gorm:"serializer:json"`
}

type Config struct {
	ContextLength   int64   `json:"context_length"`
	Prompt          float64 `json:"prompt"`
	Completion      float64 `json:"completion"`
	InputCacheRead  float64 `json:"input_cache_read"`
	InputCacheWrite float64 `json:"input_cache_write,omitempty"`
	Reasoning       float64 `json:"reasoning,omitempty"`
	Additional      float64 `json:"additional,omitempty"`
	Tokenizer       string  `json:"tokenizer,omitempty"`
}

func GetRandomSatisfiedChannel(model string, ignoreFirstPriority bool) (*Channel, error) {
	ability := Model{}
	trueVal := "1"
	if common.UsingPostgreSQL {
		trueVal = "true"
	}

	var err error = nil
	var channelQuery *gorm.DB
	if ignoreFirstPriority {
		channelQuery = DB.Where("name = ? and enabled = "+trueVal, model)
	} else {
		maxPrioritySubQuery := DB.Model(&Model{}).Select("MAX(priority)").Where("name = ? and enabled = "+trueVal, model)
		channelQuery = DB.Where(" name = ? and enabled = "+trueVal+" and priority = (?)", model, maxPrioritySubQuery)
	}
	if common.UsingSQLite || common.UsingPostgreSQL {
		err = channelQuery.Order("RANDOM()").First(&ability).Error
	} else {
		err = channelQuery.Order("RAND()").First(&ability).Error
	}
	if err != nil {
		return nil, err
	}
	channel := Channel{}
	channel.Id = ability.ChannelId
	err = DB.First(&channel, "id = ?", ability.ChannelId).Error
	return &channel, err
}

func (channel *Channel) AddModels() error {
	models := channel.Models
	if len(models) == 0 {
		return nil
	}
	for _, _model := range models {
		_model.Enabled = channel.Status == ChannelStatusEnabled
	}
	return DB.Create(models).Error
}

func (channel *Channel) DeleteModels() error {
	return DB.Where("channel_id = ?", channel.Id).Delete(&Model{}).Error
}

// UpdateModels updates abilities of this channel.
// Make sure the channel is completed before calling this function.
func (channel *Channel) UpdateModels() error {
	// A quick and dirty way to update abilities
	// First delete all abilities of this channel
	err := channel.DeleteModels()
	if err != nil {
		return err
	}
	// Then add new abilities
	err = channel.AddModels()
	if err != nil {
		return err
	}
	return nil
}

func UpdateModelStatus(channelId int, status bool) error {
	return DB.Model(&Model{}).Where("channel_id = ?", channelId).Select("enabled").Update("enabled", status).Error
}

func GetGroupModels(ctx context.Context, group string) ([]string, error) {
	groupCol := "`group`"
	trueVal := "1"
	if common.UsingPostgreSQL {
		groupCol = `"group"`
		trueVal = "true"
	}
	var models []string
	err := DB.Model(&Model{}).Distinct("name").Where(groupCol+" = ? and enabled = "+trueVal, group).Pluck("model", &models).Error
	if err != nil {
		return nil, err
	}
	sort.Strings(models)
	return models, err
}

func GetModelNameList() ([]string, error) {
	var models []string
	trueVal := "1"
	if common.UsingPostgreSQL {
		trueVal = "true"
	}
	err := DB.Model(&Model{}).Distinct("mapped_name").Where("enabled = "+trueVal).Pluck("model", &models).Error
	if err != nil {
		return nil, err
	}
	sort.Strings(models)
	return models, err
}

func GetModelList() ([]*Model, error) {
	var models []*Model
	trueVal := "1"
	if common.UsingPostgreSQL {
		trueVal = "true"
	}
	err := DB.Model(&Model{}).Where("enabled = " + trueVal).Find(&models).Error
	if err != nil {
		return nil, err
	}
	return models, err
}

func GetModelMapping(channelId int) map[string]string {
	var models []Model
	err := DB.Where("channel_id = ?", channelId).Find(&models).Error
	if err != nil {
		logger.Warnf(nil, "failed to get model mapping: %v", err)
		return nil
	}
	mapping := make(map[string]string)
	for _, m := range models {
		if m.MappedName != "" {
			mapping[m.Name] = m.MappedName
		}
	}
	return mapping
}

func GetModelByChannel(channelId int) ([]*Model, error) {
	var models []*Model
	err := DB.Where("channel_id = ?", channelId).Find(&models).Error
	if err != nil {
		return nil, err
	}
	return models, err
}

func GetModelDetailList() ([]*Model, error) {
	var models []*Model
	err := DB.Order("mapped_name, channel_id").Where("enabled = true").Find(&models).Error
	if err != nil {
		return nil, err
	}
	return models, err
}
