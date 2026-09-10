import type { CreateClientConfig } from './code/client.gen';


export const createClientConfig: CreateClientConfig = (config) => {
    return {
        ...config,
        baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://dev-rem.xorze.keenetic.pro',

        headers: {
            'Accept': 'application/json',
            ...config?.headers,
        },

        // onRequest: async (options) => {
        //     if (currentAccessToken) {
        //         // Универсальная установка заголовка
        //         if (options.headers instanceof Headers) {
        //             options.headers.set('Authorization', `Bearer ${currentAccessToken}`);
        //         } else if (options.headers) {
        //             (options.headers as Record<string, string>)['Authorization'] = `Bearer ${currentAccessToken}`;
        //         } else {
        //             options.headers = {
        //                 Authorization: `Bearer ${currentAccessToken}`,
        //             };
        //         }
        //     }
        //
        //     console.log(`[Network Outgoing] ${options.method?.toUpperCase()} ${options.url}`);
        //
        //     return options;
        // },
        //
        // onResponse: async (response) => {
        //     if (!response.ok) {
        //         console.error(`[Network Error] ${response.status} ${response.statusText} on ${response.url}`);
        //     }
        //     return response;
        // },
    };
};