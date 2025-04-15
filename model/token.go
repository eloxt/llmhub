package model

import (
	"errors"
	"fmt"
	"github.com/eloxt/llmhub/common"
	"github.com/eloxt/llmhub/common/config"
	"github.com/eloxt/llmhub/common/logger"
	"time"

	"gorm.io/gorm"
)

const (
	TokenStatusEnabled   = 1 // don't use 0, 0 is the default value!
	TokenStatusDisabled  = 2 // also don't use 0
	TokenStatusExpired   = 3
	TokenStatusExhausted = 4
)

type Token struct {
	Id             int        `json:"id"`
	UserId         int        `json:"user_id"`
	Key            string     `json:"key" gorm:"type:char(48);uniqueIndex"`
	Status         int        `json:"status" gorm:"default:1"`
	Name           string     `json:"name" gorm:"index" `
	CreatedTime    time.Time  `json:"created_time"`
	AccessedTime   time.Time  `json:"accessed_time"`
	ExpiredTime    *time.Time `json:"expired_time"` // null means never expired
	RemainQuota    float64    `json:"remain_quota" gorm:"default:0"`
	UnlimitedQuota bool       `json:"unlimited_quota" gorm:"default:false"`
	UsedQuota      float64    `json:"used_quota" gorm:"default:0"`
}

func GetAllUserTokens(userId int, startIdx int, num int, keyword string) ([]*Token, int64, error) {
	var tokens []*Token
	var err error
	var total int64
	query := DB.Where("user_id = ?", userId)
	if keyword != "" {
		query = query.Where("name LIKE ?", keyword+"%")
	}

	err = query.Model(&Token{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	err = query.Limit(num).Offset(startIdx).Find(&tokens).Error
	return tokens, total, err
}

func SearchUserTokens(userId int, keyword string) (tokens []*Token, err error) {
	err = DB.Where("user_id = ?", userId).Where("name LIKE ?", keyword+"%").Find(&tokens).Error
	return tokens, err
}

func ValidateUserToken(key string) (token *Token, err error) {
	if key == "" {
		return nil, errors.New("未提供令牌")
	}
	token, err = CacheGetTokenByKey(key)
	if err != nil {
		logger.SysError("CacheGetTokenByKey failed: " + err.Error())
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("无效的令牌")
		}
		return nil, errors.New("令牌验证失败")
	}
	if token.Status == TokenStatusExhausted {
		return nil, fmt.Errorf("令牌 %s（#%d）额度已用尽", token.Name, token.Id)
	} else if token.Status == TokenStatusExpired {
		return nil, errors.New("该令牌已过期")
	}
	if token.Status != TokenStatusEnabled {
		return nil, errors.New("该令牌状态不可用")
	}
	if token.ExpiredTime != nil && token.ExpiredTime.Before(time.Now()) {
		if !common.RedisEnabled {
			token.Status = TokenStatusExpired
			err := token.SelectUpdate()
			if err != nil {
				logger.SysError("failed to update token status" + err.Error())
			}
		}
		return nil, errors.New("该令牌已过期")
	}
	if !token.UnlimitedQuota && token.RemainQuota <= 0 {
		if !common.RedisEnabled {
			// in this case, we can make sure the token is exhausted
			token.Status = TokenStatusExhausted
			err := token.SelectUpdate()
			if err != nil {
				logger.SysError("failed to update token status" + err.Error())
			}
		}
		return nil, errors.New("该令牌额度已用尽")
	}
	return token, nil
}

func GetTokenByIds(id int, userId int) (*Token, error) {
	if id == 0 || userId == 0 {
		return nil, errors.New("id 或 userId 为空！")
	}
	token := Token{Id: id, UserId: userId}
	var err error = nil
	err = DB.First(&token, "id = ? and user_id = ?", id, userId).Error
	return &token, err
}

func GetTokenById(id int) (*Token, error) {
	if id == 0 {
		return nil, errors.New("id 为空！")
	}
	token := Token{Id: id}
	var err error = nil
	err = DB.First(&token, "id = ?", id).Error
	return &token, err
}

func (t *Token) Insert() error {
	var err error
	err = DB.Create(t).Error
	return err
}

// Update Make sure your token's fields is completed, because this will update non-zero values
func (t *Token) Update() error {
	var err error
	err = DB.Model(t).Select("name", "status", "expired_time", "remain_quota", "unlimited_quota", "models", "subnet").Updates(t).Error
	return err
}

func (t *Token) SelectUpdate() error {
	// This can update zero values
	return DB.Model(t).Select("accessed_time", "status").Updates(t).Error
}

func (t *Token) Delete() error {
	var err error
	err = DB.Delete(t).Error
	return err
}

func DeleteTokenById(id int, userId int) (err error) {
	// Why we need userId here? In case user want to delete other's token.
	if id == 0 || userId == 0 {
		return errors.New("id 或 userId 为空！")
	}
	token := Token{Id: id, UserId: userId}
	err = DB.Where(token).First(&token).Error
	if err != nil {
		return err
	}
	return token.Delete()
}

func IncreaseTokenQuota(id int, quota float64) (err error) {
	if quota < 0 {
		return errors.New("quota 不能为负数！")
	}
	if config.BatchUpdateEnabled {
		addNewRecord(BatchUpdateTypeTokenQuota, id, quota)
		return nil
	}
	return increaseTokenQuota(id, quota)
}

func increaseTokenQuota(id int, quota float64) (err error) {
	err = DB.Model(&Token{}).Where("id = ?", id).Updates(
		map[string]interface{}{
			"remain_quota":  gorm.Expr("remain_quota + ?", quota),
			"used_quota":    gorm.Expr("used_quota - ?", quota),
			"accessed_time": time.Now(),
		},
	).Error
	return err
}

func DecreaseTokenQuota(id int, quota float64) (err error) {
	if quota < 0 {
		return errors.New("quota 不能为负数！")
	}
	if config.BatchUpdateEnabled {
		addNewRecord(BatchUpdateTypeTokenQuota, id, -quota)
		return nil
	}
	return decreaseTokenQuota(id, quota)
}

func decreaseTokenQuota(id int, quota float64) (err error) {
	err = DB.Model(&Token{}).Where("id = ?", id).Updates(
		map[string]interface{}{
			"remain_quota":  gorm.Expr("remain_quota - ?", quota),
			"used_quota":    gorm.Expr("used_quota + ?", quota),
			"accessed_time": time.Now(),
		},
	).Error
	return err
}

func PostConsumeTokenQuota(tokenId int, quota float64) (err error) {
	if quota > 0 {
		err = DecreaseTokenQuota(tokenId, quota)
	} else {
		err = IncreaseTokenQuota(tokenId, -quota)
	}
	if err != nil {
		return err
	}
	return nil
}
