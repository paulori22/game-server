import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { SubmitEntryDto } from './dto/submit-entry.dto';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';

@Controller('games/:slug/leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Post()
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
