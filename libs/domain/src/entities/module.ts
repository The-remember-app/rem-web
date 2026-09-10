import { FolderOrModule } from './enums';
// import { Term } from './term';

// export interface LearnProgress {
//     writeSuccessCount: number;
//     chooseSuccessCount: number;
//     watchedCount: number;
//     totalCount: number;
// }

export interface ModuleProps {
    uuid: string;
    userUuid: string;
    name: string;
    description?: string | null;
    rootFolderUuid: string;
    isReverseDefinitionWrite: boolean;
    standardAndReverseWrite: boolean;
    isReverseDefinitionChoice: boolean;
    standardAndReverseChoice: boolean;
    maxIterationLen: number;
    minIterationLen: number;
    minWatchCount: number;
    knownTermPart: number;
    choicesCount: number;
    isLearnt: boolean;
    createdAt: Date;
    updatedAt: Date;
    personalCreatedAt: Date;
    personalUpdatedAt: Date;
}

export class Module implements FolderOrModule, ModuleProps {
    uuid: string;
    userUuid: string;
    name: string;
    description?: string | null;
    rootFolderUuid: string;
    isReverseDefinitionWrite: boolean;
    standardAndReverseWrite: boolean;
    isReverseDefinitionChoice: boolean;
    standardAndReverseChoice: boolean;
    maxIterationLen: number;
    minIterationLen: number;
    minWatchCount: number;
    knownTermPart: number;
    choicesCount: number;
    isLearnt: boolean;
    createdAt: Date;
    updatedAt: Date;
    personalCreatedAt: Date;
    personalUpdatedAt: Date;

    constructor(props: ModuleProps) {
        this.uuid = props.uuid;
        this.userUuid = props.userUuid;
        this.name = props.name;
        this.description = props.description ?? null;
        this.rootFolderUuid = props.rootFolderUuid;
        this.isReverseDefinitionWrite = props.isReverseDefinitionWrite;
        this.standardAndReverseWrite = props.standardAndReverseWrite;
        this.isReverseDefinitionChoice = props.isReverseDefinitionChoice;
        this.standardAndReverseChoice = props.standardAndReverseChoice;
        this.maxIterationLen = props.maxIterationLen ?? 10;
        this.minIterationLen = props.minIterationLen ?? 4;
        this.minWatchCount = props.minWatchCount ?? 5;
        this.knownTermPart = props.knownTermPart ?? 30;
        this.choicesCount = props.choicesCount ?? 4;
        this.isLearnt = props.isLearnt ?? false;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.personalCreatedAt = props.personalCreatedAt;
        this.personalUpdatedAt = props.personalUpdatedAt;
    }

    /**
     * Чистая доменная логика расчета прогресса модуля по его терминам
     */
    // public calculateProgress(terms: Term[]): LearnProgress {
    //     if (this.isLearnt) {
    //         const count = terms.length;
    //         return {
    //             writeSuccessCount: count,
    //             chooseSuccessCount: count,
    //             watchedCount: count,
    //             totalCount: count,
    //         };
    //     }
    //
    //     const writeSuccessCount = terms.filter(
    //         (t) => t.writeErrorCounter <= 0 && t.watchCount !== 0
    //     ).length;
    //
    //     const chooseSuccessCount = terms.filter(
    //         (t) => t.chooseErrorCounter <= 0 && t.watchCount !== 0
    //     ).length;
    //
    //     const watchedCount = terms.filter((t) => t.watchCount > 0).length;
    //
    //     return {
    //         writeSuccessCount,
    //         chooseSuccessCount,
    //         watchedCount,
    //         totalCount: terms.length,
    //     };
    // }
}