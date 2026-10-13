// import { Sentence, SentenceProps } from '../../entities/study/sentence';
import {
    SentenceDto,
    CreateSentenceDto,
    UpdateSentenceDto,
} from '../api/generated/code';
import {Sentence, SentenceProps} from "@rem-web/domain";

export class SentenceMapper {
    public static toDomain(dto: SentenceDto, userUuid: string ): Sentence {
        return new Sentence({
            uuid: dto.id,
            userUuid: userUuid,
            sentence: dto.sentence,
            translate: dto.translate,
            termUuid: dto.term_id,
            createdAt: new Date(dto.created_at),
            updatedAt: new Date(dto.updated_at),
        });
    }

    public static toCreateDto(entity: Sentence): CreateSentenceDto {
        return {
            id: entity.uuid,
            sentence: entity.sentence ?? '',
            translate: entity.translate ?? '',
        };
    }

    public static toUpdateDto(data: Partial<SentenceProps>): UpdateSentenceDto {
        return {
            sentence: data.sentence ?? '',
            translate: data.translate ?? '',
            updated_at: (data.updatedAt ?? new Date()).toISOString(),
        };
    }
}