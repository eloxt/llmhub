package controller

import (
	"fmt"
	"github.com/eloxt/llmhub/common/config"
	"github.com/eloxt/llmhub/common/ctxkey"
	"github.com/eloxt/llmhub/common/random"
	"github.com/eloxt/llmhub/common/result"
	"github.com/eloxt/llmhub/model"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
	"time"
)

func GetAllTokens(c *gin.Context) {
	userId := c.GetInt(ctxkey.Id)
	p, _ := strconv.Atoi(c.Query("p"))
	if p < 0 {
		p = 0
	}

	order := c.Query("order")
	tokens, err := model.GetAllUserTokens(userId, p*config.ItemsPerPage, config.ItemsPerPage, order)

	if err != nil {
		result.ReturnError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    tokens,
	})
	return
}

func GetToken(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	userId := c.GetInt(ctxkey.Id)
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	token, err := model.GetTokenByIds(id, userId)
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    token,
	})
	return
}

func validateToken(token model.Token) error {
	if len(token.Name) > 30 {
		return fmt.Errorf("令牌名称过长")
	}
	return nil
}

func AddToken(c *gin.Context) {
	token := model.Token{}
	err := c.ShouldBindJSON(&token)
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	err = validateToken(token)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": fmt.Sprintf("参数错误：%s", err.Error()),
		})
		return
	}

	cleanToken := model.Token{
		UserId:         c.GetInt(ctxkey.Id),
		Name:           token.Name,
		Key:            random.GenerateKey(),
		CreatedTime:    time.Now(),
		AccessedTime:   time.Now(),
		ExpiredTime:    token.ExpiredTime,
		RemainQuota:    token.RemainQuota,
		UnlimitedQuota: token.UnlimitedQuota,
	}
	err = cleanToken.Insert()
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    cleanToken,
	})
	return
}

func DeleteToken(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	userId := c.GetInt(ctxkey.Id)
	err := model.DeleteTokenById(id, userId)
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	result.Return(c)
	return
}

func UpdateToken(c *gin.Context) {
	userId := c.GetInt(ctxkey.Id)
	token := model.Token{}
	err := c.ShouldBindJSON(&token)
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	err = validateToken(token)
	if err != nil {
		result.ReturnMessage(c, fmt.Sprintf("参数错误：%s", err.Error()))
		return
	}
	cleanToken, err := model.GetTokenByIds(token.Id, userId)
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	if token.Status == model.TokenStatusEnabled {
		if cleanToken.Status == model.TokenStatusExpired && cleanToken.ExpiredTime.Before(time.Now()) && cleanToken.ExpiredTime != nil {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "令牌已过期，无法启用，请先修改令牌过期时间，或者设置为永不过期",
			})
			return
		}
		if cleanToken.Status == model.TokenStatusExhausted && cleanToken.RemainQuota <= 0 && !cleanToken.UnlimitedQuota {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "令牌可用额度已用尽，无法启用，请先修改令牌剩余额度，或者设置为无限额度",
			})
			return
		}
	}
	cleanToken.Name = token.Name
	cleanToken.ExpiredTime = token.ExpiredTime
	cleanToken.RemainQuota = token.RemainQuota
	cleanToken.UnlimitedQuota = token.UnlimitedQuota
	cleanToken.Status = token.Status
	err = cleanToken.Update()
	if err != nil {
		result.ReturnError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    cleanToken,
	})
	return
}
