import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.gamesService.findBySlug(slug);
  }

  @Patch(':slug')
  update(@Param('slug') slug: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.update(slug, updateGameDto);
  }
}
