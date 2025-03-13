package model

import (
	"context"
	"github.com/eloxt/llmhub/common"
	"github.com/eloxt/llmhub/common/utils"
	"sort"
	"strings"

	"gorm.io/gorm"
)

type Model struct {
	Name      string `json:"name" gorm:"primaryKey;autoIncrement:false"`
	ChannelId int    `json:"channel_id" gorm:"primaryKey;autoIncrement:false;index"`
	Enabled   bool   `json:"enabled"`
	Priority  *int64 `json:"priority" gorm:"bigint;default:0;index"`
	Config    Config `json:"config" gorm:"serializer:json"`
}

type Config struct {
	MaxTokens                       int64   `json:"max_tokens"`
	MaxInputTokens                  int64   `json:"max_input_tokens"`
	MaxOutputTokens                 int64   `json:"max_output_tokens"`
	InputCostPerToken               float64 `json:"input_cost_per_token"`
	OutputCostPerToken              float64 `json:"output_cost_per_token"`
	CacheReadInputTokenCost         float64 `json:"cache_read_input_token_cost"`
	Mode                            string  `json:"mode"`
	SupportsFunctionCalling         bool    `json:"supports_function_calling"`
	SupportsParallelFunctionCalling bool    `json:"supports_parallel_function_calling"`
	SupportsVision                  bool    `json:"supports_vision"`
	SupportsAudioInput              bool    `json:"supports_audio_input"`
	SupportsAudioOutput             bool    `json:"supports_audio_output"`
	SupportsPromptCaching           bool    `json:"supports_prompt_caching"`
	SupportsResponseSchema          bool    `json:"supports_response_schema"`
	SupportsSystemMessages          bool    `json:"supports_system_messages"`
	DeprecationDate                 string  `json:"deprecation_date"`
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

func (channel *Channel) AddAbilities() error {
	models_ := strings.Split(channel.Models, ",")
	models_ = utils.DeDuplication(models_)
	//groups_ := strings.Split(channel.Group, ",")
	abilities := make([]Model, 0, len(models_))
	//for _, model := range models_ {
	//	for _, group := range groups_ {
	//		ability := Model{
	//			Name:      model,
	//			ChannelId: channel.Id,
	//			Enabled:   channel.Status == ChannelStatusEnabled,
	//			Priority:  channel.Priority,
	//		}
	//		abilities = append(abilities, ability)
	//	}
	//}
	return DB.Create(&abilities).Error
}

func (channel *Channel) DeleteAbilities() error {
	return DB.Where("channel_id = ?", channel.Id).Delete(&Model{}).Error
}

// UpdateAbilities updates abilities of this channel.
// Make sure the channel is completed before calling this function.
func (channel *Channel) UpdateAbilities() error {
	// A quick and dirty way to update abilities
	// First delete all abilities of this channel
	err := channel.DeleteAbilities()
	if err != nil {
		return err
	}
	// Then add new abilities
	err = channel.AddAbilities()
	if err != nil {
		return err
	}
	return nil
}

func UpdateAbilityStatus(channelId int, status bool) error {
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
	err := DB.Model(&Model{}).Distinct("name").Where("enabled = "+trueVal).Pluck("model", &models).Error
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
