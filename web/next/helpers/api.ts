interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: HeadersInit;
    data?: any;
    timeout?: number;
}

interface ResponseData<T = any> {
    code: number;
    data: T;
    message: string;
}

/**
 * 通用请求方法
 * @param url 请求地址
 * @param options 请求配置
 * @returns Promise
 */
export async function request<T = any>(
    url: string,
    options: RequestOptions = {}
): Promise<ResponseData<T>> {
    const {
        method = 'GET',
        headers = {},
        data,
        timeout = 10000
    } = options;

    // 统一处理请求头
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...headers
    };

    // 处理请求超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            method,
            headers: defaultHeaders,
            body: data ? JSON.stringify(data) : undefined,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;

    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('请求超时');
        }
        throw error;
    }
}