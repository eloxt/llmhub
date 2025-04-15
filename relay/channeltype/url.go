package channeltype

var ChannelBaseURLs = []string{
	"",                          // 0
	"https://api.openai.com",    // 1
	"https://openrouter.ai/api", // 2
	"",                          // 3
	"",                          // 4
	"https://api.anthropic.com", // 5
	"https://generativelanguage.googleapis.com", // 6
	"",                           // 7
	"https://api.deepseek.com",   // 8
	"https://api.cloudflare.com", // 9
	"https://api.x.ai",           // 10
}

func init() {
	if len(ChannelBaseURLs) != Dummy {
		panic("channel base urls length not match")
	}
}
