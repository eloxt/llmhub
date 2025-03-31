export interface Channel {
    id: string;
    type: number;
    key: string;
    status: number;
    name: string;
    created_time: string;
    testTime: string;
    baseUrl: string;
    usedQuota: number;
    priority: number;
    config: string;
    systemPrompt: string;
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
