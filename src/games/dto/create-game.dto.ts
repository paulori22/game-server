import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { FieldSchemaItemDto } from './field-schema-item.dto';

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase kebab-case (e.g. my-game)',
  })
  slug: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FieldSchemaItemDto)
  fieldsSchema: FieldSchemaItemDto[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  defaultSortField: string;

  @IsIn(['ASC', 'DESC'])
  defaultSortOrder: 'ASC' | 'DESC';
}
