import { toast } from "sonner";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  page?: number;
  total?: number;
};

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: HeadersInit;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
};

export async function fetchApi<T>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    showSuccessToast = false,
    showErrorToast = true,
  } = options;

  try {
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      // if 401, redirect to login
      if (response.status === 401) {
        window.location.href = "/login";
      }
      const errorMessage = `Network error: ${response.statusText}`;
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      return {
        success: false,
        message: errorMessage,
        data: null as unknown as T,
      };
    }

    const data = await response.json() as ApiResponse<T>;

    if (!data.success && showErrorToast) {
      toast.error(data.message);
    }

    if (data.success && showSuccessToast) {
      toast.success(data.message || "Operation completed successfully");
    }

    return data;
  } catch (error) {
    console.error(`API error for ${url}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    if (showErrorToast) {
      toast.error(errorMessage);
    }
    
    return {
      success: false,
      message: errorMessage,
      data: null as unknown as T,
    };
  }
} 