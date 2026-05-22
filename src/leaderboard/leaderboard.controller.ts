import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PublicApiKeyGuard } from '../auth/guards/public-api-key.guard';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { SubmitEntryDto } from './dto/submit-entry.dto';
import { LeaderboardService } from './leaderboard.service';

@Controller('games/:slug/leaderboard')
@UseGuards(PublicApiKeyGuard)
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Post()
  @Throttle({ leaderboardSubmit: { limit: 10, ttl: 60000 } })
  submit(@Param('slug') slug: string, @Body() dto: SubmitEntryDto) {
    return this.leaderboardService.submit(slug, dto);
  }

  @Get()
  findLeaderboard(
    @Param('slug') slug: string,
    @Query() query: LeaderboardQueryDto,
  ) {
    return this.leaderboardService.getLeaderboard(slug, query);
  }

  @Get(':playerName')
  findPlayerEntry(
    @Param('slug') slug: string,
    @Param('playerName') playerName: string,
  ) {
    return this.leaderboardService.getPlayerEntry(slug, playerName);
  }
}
