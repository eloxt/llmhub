export interface Log {
    id: string
    user_id: string
    created_at: string
    type: string
    content: string
    user_name: string
    token_name: string
    model_name: string
    quota: number
    prompt_tokens: number
    completion_tokens: number
    cached_tokens: number
    channel_id: number
    request_id: string
    elapsed_time: number
    is_stream: boolean
}