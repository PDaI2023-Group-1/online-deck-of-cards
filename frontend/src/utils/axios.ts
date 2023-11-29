import axios, { AxiosResponse } from 'axios';

interface ApiResponse<T> {
    data: T;
    status: number;
}

const axiosInstance = axios.create();
if (import.meta.env.VITE_ENV !== 'dev') {
    axiosInstance.defaults.baseURL = import.meta.env.VITE_API_URL;
} else {
    axiosInstance.defaults.baseURL = import.meta.env.VITE_DEV_API_URL;
}

const setAuthHeaders = (token: string | null): void => {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const request = async <T>(
    method: string,
    url: string,
    data: unknown | null,
): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<T> = await axiosInstance({
            method,
            url,
            data,
        });

        return { data: response.data, status: response.status };
    } catch (error) {
        console.error(error);

        if (axios.isAxiosError(error)) {
            return {
                data: error.response!.data as T,
                status: error.response!.status,
            };
        }
        throw new Error('Request failed');
    }
};
const get = <T>(url: string): Promise<ApiResponse<T>> =>
    request<T>('get', url, null);

const post = <T>(url: string, data: unknown): Promise<ApiResponse<T>> =>
    request<T>('post', url, data);

const put = <T>(url: string, data: unknown): Promise<ApiResponse<T>> =>
    request<T>('put', url, data);

const del = <T>(url: string): Promise<ApiResponse<T>> =>
    request<T>('delete', url, null);

export { setAuthHeaders, get, post, put, del };
