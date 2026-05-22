import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { GamesModule } from '../games/games.module';
import { LeaderboardEntry } from './entities/leaderboard-entry.entity';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaderboardEntry]),
    GamesModule,
    AuthModule,
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
