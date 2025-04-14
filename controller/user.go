package controller

import (
	"encoding/json"
	"github.com/eloxt/llmhub/common/result"
	"github.com/eloxt/llmhub/model"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Token    string `json:"token"`
}

func Login(c *gin.Context) {
	var loginRequest LoginRequest
	err := json.NewDecoder(c.Request.Body).Decode(&loginRequest)
	if err != nil {
		result.ReturnMessage(c, "invalid_parameter")
		return
	}
	username := loginRequest.Username
	password := loginRequest.Password
	token := loginRequest.Token
	if (username == "" || password == "") && token == "" {
		result.ReturnMessage(c, "invalid_parameter")
		return
	}

	var user model.User
	if token != "" {
		token = strings.TrimPrefix(token, "sk-")
		parts := strings.Split(token, "-")
		token = parts[0]
		key, err := model.CacheGetTokenByKey(token)
		if err != nil {
			result.ReturnError(c, err)
			return
		}
		if key == nil {
			result.ReturnMessage(c, "无效的 Token")
			return
		}
		user = model.User{
			Username: key.Name,
			Status:   model.UserStatusEnabled,
		}
	} else {
		user = model.User{
			Username: username,
			Password: password,
		}
		err = user.ValidateAndFill()
		if err != nil {
			c.JSON(http.StatusOK, gin.H{
				"message": err.Error(),
				"success": false,
			})
			return
		}
	}
	SetupLogin(&user, c)
}

// setup session & cookies and then return user info
func SetupLogin(user *model.User, c *gin.Context) {
	session := sessions.Default(c)
	session.Set("id", user.Id)
	session.Set("username", user.Username)
	session.Set("status", user.Status)
	err := session.Save()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"message": "无法保存会话信息，请重试",
			"success": false,
		})
		return
	}
	cleanUser := model.User{
		Id:          user.Id,
		Username:    user.Username,
		DisplayName: user.DisplayName,
		Role:        user.Role,
		Status:      user.Status,
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "",
		"success": true,
		"data":    cleanUser,
	})
}

func Logout(c *gin.Context) {
	session := sessions.Default(c)
	session.Clear()
	err := session.Save()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"message": err.Error(),
			"success": false,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "",
		"success": true,
	})
}
