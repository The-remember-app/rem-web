import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: 'http://localhost:10020/openapi.json', //./openapi.json', // или https://api.example.com/swagger/v1/swagger.json
    output: './libs/navigation/src/network/api/generated/code',
    plugins: [
        '@hey-api/typescript',
        '@hey-api/sdk',
        {
            name: '@hey-api/client-fetch',
            runtimeConfigPath: './libs/navigation/src/network/api/generated/hey-api.ts',
        },
    ],
});