package main

import (
	"embed"
	"github.com/eloxt/llmhub/common"
	"github.com/eloxt/llmhub/common/client"
	"github.com/eloxt/llmhub/common/config"
	"github.com/eloxt/llmhub/common/logger"
	"github.com/eloxt/llmhub/middleware"
	"github.com/eloxt/llmhub/model"
	"github.com/eloxt/llmhub/relay/adaptor/openai"
	"github.com/eloxt/llmhub/relay/billing"
	"github.com/eloxt/llmhub/router"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"os"
	"strconv"
)

//go:embed web/build/*
var buildFS embed.FS

func main() {
	common.Init()
	logger.SetupLogger()
	logger.SysLogf("LLMHub %s started", common.Version)

	if os.Getenv("GIN_MODE") != gin.DebugMode {
		gin.SetMode(gin.ReleaseMode)
	}
	if config.DebugEnabled {
		logger.SysLog("running in debug mode")
	}

	// Initialize SQL Database
	model.InitDB()
	model.InitLogDB()

	var err error
	err = model.CreateRootAccountIfNeed()
	if err != nil {
		logger.FatalLog("database init error: " + err.Error())
	}
	defer func() {
		err := model.CloseDB()
		if err != nil {
			logger.FatalLog("failed to close database: " + err.Error())
		}
	}()

	// Initialize Redis
	err = common.InitRedisClient()
	if err != nil {
		logger.FatalLog("failed to initialize Redis: " + err.Error())
	}

	openai.InitTokenEncoders()
	client.Init()
	billing.Init()

	// Initialize HTTP server
	server := gin.New()
	server.Use(gin.Recovery())
	server.Use(middleware.RequestId())
	//server.Use(middleware.Language())
	middleware.SetUpLogger(server)
	// Initialize session store
	store := cookie.NewStore([]byte(config.SessionSecret))
	server.Use(sessions.Sessions("session", store))
	// Start HTTP server
	router.SetRouter(server, buildFS)
	var port = os.Getenv("PORT")
	if port == "" {
		port = strconv.Itoa(*common.Port)
	}
	logger.SysLogf("server started on http://localhost:%s", port)
	err = server.Run(":" + port)
	if err != nil {
		logger.FatalLog("failed to start HTTP server: " + err.Error())
	}
}
