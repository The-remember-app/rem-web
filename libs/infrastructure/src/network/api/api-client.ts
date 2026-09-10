import { client } from './generated/code/client.gen';

// Хранилище токена в памяти Worker-потока
let currentAccessToken: string | null = null;

export const setGlobalAccessToken = (token: string | null): void => {
    currentAccessToken = token;
};

export const getGlobalAccessToken = (): string => {
    return currentAccessToken ?? "";
};

// 1. Устанавливаем базовую конфигурацию
client.setConfig({
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://dev-rem.xorze.keenetic.pro',
    headers: {
        'Accept': 'application/json',
    },
});

// 2. Регистрируем перехватчик ЗАПРОСОВ (Request Interceptor)
client.interceptors.request.use((request) => {
    if (currentAccessToken) {
        // В hey-api 'request.headers' — это полноценный экземпляр Web Headers
        request.headers.set('Authorization', `Bearer ${currentAccessToken}`);
    }

    console.log(`[Network Outgoing] ${request.method?.toUpperCase()} ${request.url}`);
    return request;
});

// 3. Регистрируем перехватчик ОТВЕТОВ (Response Interceptor)
client.interceptors.response.use((response) => {
    if (!response.ok) {
        console.error(`[Network Error] ${response.status} ${response.statusText} on ${response.url}`);
    }
    return response;
});