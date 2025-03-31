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
		//apiRouter.GET("/status", controller.GetStatus)
		//apiRouter.GET("/models", middleware.UserAuth(), controller.DashboardListModels)

		userRoute := apiRouter.Group("/user")
		{
			userRoute.POST("/login", middleware.CriticalRateLimit(), controller.Login)
			userRoute.GET("/logout", controller.Logout)

			selfRoute := userRoute.Group("/")
			selfRoute.Use(middleware.UserAuth())
			{
				//selfRoute.GET("/dashboard", controller.GetUserDashboard)
				//selfRoute.GET("/self", controller.GetSelf)
				//selfRoute.PUT("/self", controller.UpdateSelf)
				//selfRoute.DELETE("/self", controller.DeleteSelf)
				//selfRoute.GET("/token", controller.GenerateAccessToken)
				//selfRoute.GET("/available_models", controller.GetUserAvailableModels)
			}

			adminRoute := userRoute.Group("/")
			adminRoute.Use(middleware.AdminAuth())
			{
				//adminRoute.GET("/:id", controller.GetUser)
				//adminRoute.PUT("/", controller.UpdateUser)
				//adminRoute.DELETE("/:id", controller.DeleteUser)
			}
		}
		//optionRoute := apiRouter.Group("/option")
		//optionRoute.Use(middleware.RootAuth())
		//{
		//optionRoute.GET("/", controller.GetOptions)
		//optionRoute.PUT("/", controller.UpdateOption)
		//}
		channelRoute := apiRouter.Group("/channel")
		//channelRoute.Use(middleware.AdminAuth())
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
			//channelRoute.DELETE("/disabled", controller.DeleteDisabledChannel)
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
		logRoute.GET("/", middleware.AdminAuth(), controller.GetAllLogs)
		logRoute.GET("", middleware.AdminAuth(), controller.GetAllLogs)
		logRoute.DELETE("/", middleware.AdminAuth(), controller.DeleteHistoryLogs)
		logRoute.DELETE("", middleware.AdminAuth(), controller.DeleteHistoryLogs)
		logRoute.GET("/search", middleware.AdminAuth(), controller.SearchAllLogs)
		logRoute.GET("/self", middleware.UserAuth(), controller.GetUserLogs)
		logRoute.GET("/self/search", middleware.UserAuth(), controller.SearchUserLogs)
	}
}
