// libs/infrastructure/src/mappers/module.mapper.ts

import { Module, SharedModule, ModuleProps } from '@rem-web/domain';
import {
    ModuleDto,
    PersonalizeModuleDto,
    CreateModuleDto,
    CreateOnlyPersonalizePartModuleDto
} from '../api/generated/code';
import { toNullableString } from '../utils/string.utils';

export class ModuleMapper {
    public static toSharedDomain(dto: ModuleDto): SharedModule {
        return new SharedModule({
            uuid: dto.id,
            name: dto.name,
            description: toNullableString(dto.description),
            rootFolderUuid: toNullableString(dto.root_folder_id) ?? '',
            createdAt: new Date(dto.created_at),
            updatedAt: new Date(dto.updated_at),
        });
    }

    public static toPersonalDomain(dto: PersonalizeModuleDto): Module {
        return new Module({
            uuid: dto.id,
            userUuid: dto.user_id,
            name: dto.name,
            description: toNullableString(dto.description),
            rootFolderUuid: toNullableString(dto.root_folder_id) ?? '',
            isReverseDefinitionWrite: dto.is_reverse_definition_write,
            standardAndReverseWrite: dto.standard_and_reverse_write,
            isReverseDefinitionChoice: dto.is_reverse_definition_choice,
            standardAndReverseChoice: dto.standard_and_reverse_choice,
            maxIterationLen: dto.max_iteration_len,
            minIterationLen: dto.min_iteration_len,
            minWatchCount: dto.min_watch_count,
            knownTermPart: dto.known_term_part,
            choicesCount: dto.choices_count,
            isLearnt: dto.is_learnt,
            createdAt: new Date(dto.created_at),
            updatedAt: new Date(dto.updated_at),
            personalCreatedAt: new Date(dto.personal_created_at),
            personalUpdatedAt: new Date(dto.personal_updated_at),
        });
    }

    public static toCreateSharedDto(entity: SharedModule): CreateModuleDto {
        return {
            id: entity.uuid,
            name: entity.name,
            description: entity.description ?? undefined,
            root_folder_id: entity.rootFolderUuid || undefined,
        };
    }

    public static toLinkPersonalDto(
        sharedUuid: string,
        rootFolderUuid?: string | null,
        props?: Partial<ModuleProps>
    ): CreateOnlyPersonalizePartModuleDto {
        return {
            module_id: sharedUuid,
            root_folder_id: rootFolderUuid ?? undefined,
            is_reverse_definition_write: props?.isReverseDefinitionWrite,
            standard_and_reverse_write: props?.standardAndReverseWrite,
            is_reverse_definition_choice: props?.isReverseDefinitionChoice,
            standard_and_reverse_choice: props?.standardAndReverseChoice,
            max_iteration_len: props?.maxIterationLen,
            min_iteration_len: props?.minIterationLen,
            min_watch_count: props?.minWatchCount,
            known_term_part: props?.knownTermPart,
            choices_count: props?.choicesCount,
            is_learnt: props?.isLearnt,
        };
    }
}