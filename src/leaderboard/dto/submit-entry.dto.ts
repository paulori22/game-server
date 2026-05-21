import {
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SubmitEntryDto {
  @IsString()
  @MinLength(3, { message: 'playerName must have at least 3 characters.' })
  @MaxLength(100)
  @IsNotEmpty()
  playerName: string;

  /** Dynamic fields validated in LeaderboardService against the game's fieldsSchema */
  @IsObject()
  @IsNotEmpty()
  data: Record<string, unknown>;
}
