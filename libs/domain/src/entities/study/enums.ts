export enum AddInfoType {
    USUAL_TERM = 'usual_term',
    OTHER_FORM = 'other_form',
    HELP_PHRASE_WITH_WORD = 'help_phrase_with_word',
    HELP_PHRASE_WITHOUT_WORD = 'help_phrase_without_word',
    ABBREVIATION = 'abbreviation',
    COMPOSITE_WORD = 'composite_word',
    SOUND = 'sound',
    TRANSCRIPTION = 'transcription',
}

export enum WatchLearnType {
    CHOICE = 'choice',
    REVERSE_CHOICE = 'reverse_choice',
    WRITE = 'write',
    REVERSE_WRITE = 'reverse_write',
}

export interface FolderOrModule {
    uuid: string;
    userUuid: string;
    rootFolderUuid: string|null;
    name: string;
}

export interface LearnWriteEntity {
    // termUuid: string;
    // targetWrite: string;
}