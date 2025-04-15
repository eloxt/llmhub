package router

import (
	"github.com/eloxt/llmhub/controller"
	"github.com/eloxt/llmhub/middleware"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
)

func SetApiRouter(router *gin.Engine) {
	// TODO 所有涉及到model的操作，都要更新缓存
	apiRouter := router.Group("/api")
	apiRouter.Use(gzip.Gzip(gzip.DefaultCompression))
	apiRouter.Use(middleware.GlobalAPIRateLimit())
	{
		apiRouter.GET("/models", controller.HomeListModels)

		userRoute := apiRouter.Group("/user")
		{
			userRoute.POST("/login", middleware.CriticalRateLimit(), controller.Login)
			userRoute.GET("/logout", controller.Logout)
		}
		channelRoute := apiRouter.Group("/channel")
		channelRoute.Use(middleware.UserAuth())
		{
			channelRoute.GET("/", controller.GetAllChannels)
			channelRoute.GET("", controller.GetAllChannels)
			//channelRoute.GET("/models", controller.ListAllModels)
			channelRoute.GET("/:id", controller.GetChannel)
			//channelRoute.GET("/test", controller.TestChannels)
			//channelRoute.GET("/test/:id", controller.TestChannel)
			//channelRoute.GET("/update_balance", controller.UpdateAllChannelsBalance)
			//channelRoute.GET("/update_balance/:id", controller.UpdateChannelBalance)
			channelRoute.POST("/", controller.AddChannel)
			channelRoute.POST("", controller.AddChannel)
			channelRoute.PUT("/", controller.UpdateChannel)
			channelRoute.PUT("", controller.UpdateChannel)
			channelRoute.DELETE("/:id", controller.DeleteChannel)
			channelRoute.GET("/fetch-model", controller.FetchChannelModelList)
		}
		tokenRoute := apiRouter.Group("/token")
		tokenRoute.Use(middleware.UserAuth())
		{
			tokenRoute.GET("/", controller.GetAllTokens)
			tokenRoute.GET("", controller.GetAllTokens)
			tokenRoute.GET("/:id", controller.GetToken)
			tokenRoute.POST("/", controller.AddToken)
			tokenRoute.POST("", controller.AddToken)
			tokenRoute.PUT("/", controller.UpdateToken)
			tokenRoute.PUT("", controller.UpdateToken)
			tokenRoute.DELETE("/:id", controller.DeleteToken)
		}
		logRoute := apiRouter.Group("/log")
		logRoute.Use(middleware.UserAuth())
		{
			logRoute.GET("/", controller.GetAllLogs)
			logRoute.GET("", controller.GetAllLogs)
			logRoute.DELETE("/", controller.DeleteHistoryLogs)
			logRoute.DELETE("", controller.DeleteHistoryLogs)
		}
	}
}
