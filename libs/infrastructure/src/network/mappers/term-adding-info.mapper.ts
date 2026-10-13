// import { TermAddingInfo, TermAddingInfoProps } from '../../entities/study/term-adding-info';
import {
    AdditionalTermInfoDto,
    CreateAdditionalTermInfoDto,
    UpdateAdditionalTermInfoDto,
    AddInfoTypeEnum,
} from '../api/generated/code';
import {AddInfoType, TermAddingInfo, TermAddingInfoProps} from "@rem-web/domain";
// import { AddInfoType } from '../../entities/enums';

export class TermAddingInfoMapper {
    public static toDomain(dto: AdditionalTermInfoDto, userUuid: string ): TermAddingInfo {
        return new TermAddingInfo({
            uuid: dto.id,
            userUuid: userUuid,
            textData: (dto.text_data as string) ?? null,
            addingTextData: (dto.adding_text_data as string) ?? null,
            dialectOrArea: (dto.dialect_or_area as string) ?? null,
            addInfoType: (dto.add_info_type as AddInfoType) ?? AddInfoType.USUAL_TERM,
            termUuid: dto.term_id,
            parentAddInfoUuid:
                dto.parent_add_info_id === 'null' || !dto.parent_add_info_id
                    ? ''
                    : (dto.parent_add_info_id as string),
            createdAt: new Date(dto.created_at),
            updatedAt: new Date(dto.updated_at),
        });
    }

    public static toCreateDto(entity: TermAddingInfo): CreateAdditionalTermInfoDto {
        return {
            id: entity.uuid,
            term_id: entity.termUuid,
            text_data: entity.textData ?? '',
            adding_text_data: entity.addingTextData ?? '',
            dialect_or_area: entity.dialectOrArea ?? '',
            add_info_type: entity.addInfoType as unknown as AddInfoTypeEnum,
            parent_add_info_id: entity.parentAddInfoUuid || 'null',
        };
    }

    public static toUpdateDto(data: Partial<TermAddingInfoProps>): UpdateAdditionalTermInfoDto {
        return {
            text_data: data.textData ?? '',
            adding_text_data: data.addingTextData ?? '',
            dialect_or_area: data.dialectOrArea ?? '',
            add_info_type: data.addInfoType as unknown as AddInfoTypeEnum,
            updated_at: (data.updatedAt ?? new Date()).toISOString(),
        };
    }
}