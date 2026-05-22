import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminApiKeyGuard } from '../auth/guards/admin-api-key.guard';
import { PublicApiKeyGuard } from '../auth/guards/public-api-key.guard';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GamesService } from './games.service';

@Controller('games')
@UseGuards(PublicApiKeyGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @UseGuards(AdminApiKeyGuard)
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
  @UseGuards(AdminApiKeyGuard)
  update(@Param('slug') slug: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.update(slug, updateGameDto);
  }
}
