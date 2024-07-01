import { IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateScoreDto {
  @IsString()
  @MinLength(3, { message: 'playerName must have at least 3 characters.' })
  @IsNotEmpty()
  playerName: string;

  @IsInt()
  score: number;
}
