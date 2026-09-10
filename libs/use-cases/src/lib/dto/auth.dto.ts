import {User} from "@rem-web/domain";

export interface LoginRequestDto {
    username: string;
    password?: string;
}

export interface AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: User;
}

// Константы команд для Worker
export const WORKER_COMMANDS = {
    AUTH_LOGIN: 'AUTH_LOGIN',
    AUTH_LOGOUT: 'AUTH_LOGOUT',
    SYNC_FULL: 'SYNC_FULL',
} as const;
