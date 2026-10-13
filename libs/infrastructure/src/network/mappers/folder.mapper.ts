import { Folder, SharedFolder} from '@rem-web/domain';
import {
    FolderDto,
    PersonalizeFolderDto,
    CreateFolderDto,
    CreateOnlyPersonalizePartFolderDto
} from '../api/generated/code/types.gen';
import {toNullableString} from "../utils/string.utils";

export class FolderMapper {
    public static toSharedDomain(dto: FolderDto): SharedFolder {
        return new SharedFolder({
            uuid: dto.id,
            name: dto.name,
            authorUuid: dto.author_id,
            rootFolderUuid: toNullableString(dto.root_folder_id),
            createdAt: new Date(dto.created_at),
            updatedAt: new Date(dto.updated_at),
        });
    }

    public static toPersonalDomain(dto: PersonalizeFolderDto): Folder {
        return new Folder({
            uuid: dto.id,
            userUuid: dto.user_id,
            name: dto.name,
            authorUuid: dto.author_id,
            rootFolderUuid: toNullableString(dto.root_folder_id),
            createdAt: new Date(dto.created_at),
            updatedAt: new Date(dto.updated_at),
            personalCreatedAt: new Date(dto.personal_created_at),
            personalUpdatedAt: new Date(dto.personal_updated_at),
        });
    }

    public static toCreateSharedDto(entity: SharedFolder): CreateFolderDto {
        return {
            id: entity.uuid,
            name: entity.name,
            root_folder_id: entity.rootFolderUuid ?? undefined,
        };
    }

    public static toLinkPersonalDto(sharedUuid: string, rootFolderUuid?: string | null): CreateOnlyPersonalizePartFolderDto {
        return {
            folder_id: sharedUuid,
            root_folder_id: rootFolderUuid ?? undefined,
        };
    }
}