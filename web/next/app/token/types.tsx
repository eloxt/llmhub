export interface Token {
    id: number;
    user_id: string;
    key: string;
    status: number;
    name: string;
    created_time: number;
    accessed_time: number;
    remain_quota: number;
    unlimited_quota: boolean;
    used_quota: number;
} 