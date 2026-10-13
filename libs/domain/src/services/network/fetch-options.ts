// domain/src/services/network/fetch-options.ts
export interface FetchOptions {
    limit?: number;
    offset?: number;
    updatedAfter?: Date | string;
    authorOnly?: boolean;
    includeEntities?: string[];
}