import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class FieldSchemaItemDto {
  @IsString()
  @MaxLength(64)
  @Matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
    message:
      'name must start with letter or underscore and contain only alphanumeric and underscore.',
  })
  name: string;

  @IsIn(['number', 'string'])
  type: 'number' | 'string';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
