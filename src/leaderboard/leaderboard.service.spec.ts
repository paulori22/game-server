import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardEntry } from './entities/leaderboard-entry.entity';
import { GamesService } from '../games/games.service';
import { Game } from '../games/entities/game.entity';

describe('LeaderboardService numeric constraints', () => {
  let service: LeaderboardService;

  const gameWithConstraints = {
    id: 'game-1',
    slug: 'test-game',
    name: 'Test Game',
    fieldsSchema: [
      { name: 'time', type: 'number', min: 0, exclusiveMin: true },
      { name: 'deaths', type: 'number', min: 0 },
    ],
    defaultSortField: 'time',
    defaultSortOrder: 'ASC',
  } as Game;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        {
          provide: getRepositoryToken(LeaderboardEntry),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: GamesService,
          useValue: {
            findBySlug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
  });

  const validate = (data: Record<string, unknown>) =>
    (
      service as unknown as {
        coerceAndValidateEntryData: (
          game: Game,
          data: Record<string, unknown>,
        ) => Record<string, string | number>;
      }
    ).coerceAndValidateEntryData(gameWithConstraints, data);

  it('accepts valid time and deaths values', () => {
    expect(validate({ time: 1, deaths: 0 })).toEqual({ time: 1, deaths: 0 });
  });

  it('rejects time equal to zero', () => {
    expect(() => validate({ time: 0, deaths: 0 })).toThrow(BadRequestException);
    expect(() => validate({ time: 0, deaths: 0 })).toThrow(
      'Field "time" must be greater than 0.',
    );
  });

  it('rejects negative time', () => {
    expect(() => validate({ time: -1, deaths: 0 })).toThrow(BadRequestException);
    expect(() => validate({ time: -1, deaths: 0 })).toThrow(
      'Field "time" must be greater than 0.',
    );
  });

  it('rejects negative deaths', () => {
    expect(() => validate({ time: 10, deaths: -1 })).toThrow(
      BadRequestException,
    );
    expect(() => validate({ time: 10, deaths: -1 })).toThrow(
      'Field "deaths" must be greater than or equal to 0.',
    );
  });
});
