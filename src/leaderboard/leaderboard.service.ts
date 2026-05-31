import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderboardEntry } from './entities/leaderboard-entry.entity';
import { GamesService } from '../games/games.service';
import { SubmitEntryDto } from './dto/submit-entry.dto';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { Game } from '../games/entities/game.entity';
import { FieldSchemaItem } from '../games/types/field-schema.types';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(LeaderboardEntry)
    private readonly entryRepository: Repository<LeaderboardEntry>,
    private readonly gamesService: GamesService,
  ) {}

  private coerceAndValidateEntryData(
    game: Game,
    data: Record<string, unknown>,
  ): Record<string, string | number> {
    const schema = game.fieldsSchema as FieldSchemaItem[];
    const allowed = new Set(schema.map((f) => f.name));

    const inputKeys = Object.keys(data ?? {});
    for (const key of inputKeys) {
      if (!allowed.has(key)) {
        throw new BadRequestException(`Unknown leaderboard field "${key}".`);
      }
    }

    const result: Record<string, string | number> = {};

    for (const field of schema) {
      const raw = data[field.name];
      if (raw === undefined || raw === null) {
        throw new BadRequestException(
          `Missing required field "${field.name}".`,
        );
      }

      if (field.type === 'number') {
        let n: number;
        if (typeof raw === 'number') {
          n = raw;
        } else if (typeof raw === 'string') {
          n = Number(raw);
        } else {
          throw new BadRequestException(
            `Field "${field.name}" must be a number.`,
          );
        }
        if (Number.isNaN(n)) {
          throw new BadRequestException(
            `Field "${field.name}" is not a valid number.`,
          );
        }
        if (field.min !== undefined) {
          const belowMin = field.exclusiveMin ? n <= field.min : n < field.min;
          if (belowMin) {
            throw new BadRequestException(
              field.exclusiveMin
                ? `Field "${field.name}" must be greater than ${field.min}.`
                : `Field "${field.name}" must be greater than or equal to ${field.min}.`,
            );
          }
        }
        if (field.max !== undefined) {
          const aboveMax = field.exclusiveMax ? n >= field.max : n > field.max;
          if (aboveMax) {
            throw new BadRequestException(
              field.exclusiveMax
                ? `Field "${field.name}" must be less than ${field.max}.`
                : `Field "${field.name}" must be less than or equal to ${field.max}.`,
            );
          }
        }
        result[field.name] = n;
      } else if (field.type === 'string') {
        if (typeof raw !== 'string') {
          throw new BadRequestException(
            `Field "${field.name}" must be a string.`,
          );
        }
        result[field.name] = raw;
      }
    }

    return result;
  }

  private assertSortAllowed(game: Game, sortBy: string): FieldSchemaItem {
    const def = (game.fieldsSchema as FieldSchemaItem[]).find(
      (f) => f.name === sortBy,
    );
    if (!def) {
      const names = game.fieldsSchema.map((f) => f.name).join(', ');
      throw new BadRequestException(
        `Cannot sort by "${sortBy}". Choose one of: ${names}.`,
      );
    }
    return def;
  }

  async submit(slug: string, dto: SubmitEntryDto): Promise<LeaderboardEntry> {
    const game = await this.gamesService.findBySlug(slug);
    const normalized = this.coerceAndValidateEntryData(game, dto.data);

    let entry = await this.entryRepository.findOne({
      where: {
        playerName: dto.playerName,
        game: { id: game.id },
      },
    });

    if (entry) {
      throw new ConflictException(
        `Leaderboard entry for player "${dto.playerName}" in "${slug}" already exists.`,
      );
    }

    entry = this.entryRepository.create({
      game,
      playerName: dto.playerName,
      data: normalized,
    });

    return this.entryRepository.save(entry);
  }

  async getLeaderboard(slug: string, query: LeaderboardQueryDto) {
    const game = await this.gamesService.findBySlug(slug);
    const sortBy = query.sortBy ?? game.defaultSortField;
    const orderRaw = query.order ?? game.defaultSortOrder;
    const order: 'DESC' | 'ASC' = orderRaw === 'DESC' ? 'DESC' : 'ASC';
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = Math.max(query.offset ?? 0, 0);

    const sortDef = this.assertSortAllowed(game, sortBy);

    const qbWhere = () =>
      this.entryRepository
        .createQueryBuilder('entry')
        .where('entry.game_id = :gameId', { gameId: game.id });

    const total = await qbWhere().getCount();

    let qb = qbWhere();

    if (sortDef.type === 'number') {
      qb = qb
        .orderBy(`(entry.data->>'${sortDef.name}')::double precision`, order)
        .addOrderBy('entry.updatedAt', 'DESC');
    } else {
      qb = qb
        .orderBy(`entry.data->>'${sortDef.name}'`, order)
        .addOrderBy('entry.updatedAt', 'DESC');
    }

    const items = await qb.skip(offset).take(limit).getMany();

    return {
      sortBy,
      order,
      limit,
      offset,
      total,
      items,
    };
  }

  async getPlayerEntry(
    slug: string,
    playerName: string,
  ): Promise<LeaderboardEntry> {
    const game = await this.gamesService.findBySlug(slug);

    const entry = await this.entryRepository.findOne({
      where: { game: { id: game.id }, playerName },
    });

    if (!entry) {
      throw new NotFoundException(
        `No leaderboard entry for player "${playerName}" in "${slug}".`,
      );
    }

    return entry;
  }
}
