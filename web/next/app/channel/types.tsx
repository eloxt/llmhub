export interface Channel {
    id: number | undefined;
    type: number;
    key: string;
    status: number;
    name: string;
    created_time: string;
    test_time: string;
    base_url: string;
    used_quota: number;
    priority: number;
    config: string;
    system_prompt: string;
    models: Model[];
}

export interface Model {
    id: number;
    name: string;
    mapped_name: string;
    channel_id: number;
    enabled: boolean;
    priority: number;
    config: ModelConfig;
}

export interface ModelConfig {
    context_length: number;
    prompt: number;
    completion: number;
    input_cache_read: number;
    input_cache_write: number;
    reasoning: number;
    additional: number;
    tokenizer: string;
}

export const ChannelType: { [key: number]: string } = {
    1: "OpenAI",
    2: "OpenRouter",
    3: "OpenAI Compatible",
    4: "Azure",
    5: "Anthropic",
    6: "Gemini",
    7: "Ollama",
    8: "DeepSeek",
    9: "Cloudflare",
    10: "xAI"
}