import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const myAppSchema = appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'users',
            columns: [
                { name: 'username', type: 'string' },
                { name: 'email', type: 'string' },
                { name: 'name', type: 'string' },
                { name: 'surname', type: 'string' },
                { name: 'active', type: 'boolean' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'folders',
            columns: [
                { name: 'user_uuid', type: 'string', isIndexed: true },
                { name: 'name', type: 'string' },
                { name: 'root_folder_uuid', type: 'string', isOptional: true, isIndexed: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'modules',
            columns: [
                { name: 'user_uuid', type: 'string', isIndexed: true },
                { name: 'name', type: 'string' },
                { name: 'description', type: 'string', isOptional: true },
                { name: 'root_folder_uuid', type: 'string', isOptional: true, isIndexed: true },
                { name: 'is_learnt', type: 'boolean' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'terms',
            columns: [
                { name: 'user_uuid', type: 'string', isIndexed: true },
                { name: 'module_uuid', type: 'string', isIndexed: true },
                { name: 'term', type: 'string' },
                { name: 'definition', type: 'string' },
                { name: 'choose_error_counter', type: 'number' },
                { name: 'write_error_counter', type: 'number' },
                { name: 'choice_neg_error_counter', type: 'number' },
                { name: 'watch_count', type: 'number' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'sentences',
            columns: [
                { name: 'user_uuid', type: 'string', isIndexed: true },
                { name: 'term_uuid', type: 'string', isIndexed: true },
                { name: 'text', type: 'string' },
                { name: 'translation', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'term_adding_infos',
            columns: [
                { name: 'user_uuid', type: 'string', isIndexed: true },
                { name: 'term_uuid', type: 'string', isIndexed: true },
                { name: 'info_key', type: 'string' },
                { name: 'info_value', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'learn_term_datetime_marks',
            columns: [
                { name: 'user_uuid', type: 'string', isIndexed: true },
                { name: 'term_uuid', type: 'string', isIndexed: true },
                { name: 'learned_at', type: 'number' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
    ],
});