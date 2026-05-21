import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { FieldSchemaItemDto } from './dto/field-schema-item.dto';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  /** Ensures defaults and schema integrity for create/update payloads. */
  private assertFieldsSchemaCoherence(
    fieldsSchema: FieldSchemaItemDto[],
    defaultSortField: string,
    context: string,
  ): void {
    const names = fieldsSchema.map((f) => f.name);
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      throw new BadRequestException(
        `${context}: duplicate field names in fieldsSchema.`,
      );
    }
    const defaultHit = fieldsSchema.find((f) => f.name === defaultSortField);
    if (!defaultHit) {
      throw new BadRequestException(
        `${context}: defaultSortField must refer to one of the fieldsSchema names.`,
      );
    }
    if (
      fieldsSchema.some(
        (f) => !f.name?.length || (f.type !== 'number' && f.type !== 'string'),
      )
    ) {
      throw new BadRequestException(`${context}: invalid fieldsSchema entry.`);
    }
  }

  async create(createGameDto: CreateGameDto): Promise<Game> {
    this.assertFieldsSchemaCoherence(
      createGameDto.fieldsSchema,
      createGameDto.defaultSortField,
      'Creating game',
    );

    const existing = await this.gameRepository.findOne({
      where: { slug: createGameDto.slug },
    });
    if (existing) {
      throw new ConflictException(
        `A game with slug "${createGameDto.slug}" already exists.`,
      );
    }

    const game = this.gameRepository.create({
      slug: createGameDto.slug,
      name: createGameDto.name,
      fieldsSchema: createGameDto.fieldsSchema,
      defaultSortField: createGameDto.defaultSortField,
      defaultSortOrder: createGameDto.defaultSortOrder,
    });
    return this.gameRepository.save(game);
  }

  findAll(): Promise<Game[]> {
    return this.gameRepository.find({ order: { name: 'ASC' } });
  }

  async findBySlug(slug: string): Promise<Game> {
    const game = await this.gameRepository.findOne({ where: { slug } });
    if (!game) {
      throw new NotFoundException(`Game with slug "${slug}" not found.`);
    }
    return game;
  }

  async update(slug: string, updateGameDto: UpdateGameDto): Promise<Game> {
    const game = await this.findBySlug(slug);

    const mergedSchema = updateGameDto.fieldsSchema ?? game.fieldsSchema;
    const mergedDefaultSortField =
      updateGameDto.defaultSortField ?? game.defaultSortField;

    if (updateGameDto.fieldsSchema || updateGameDto.defaultSortField !== undefined) {
      this.assertFieldsSchemaCoherence(
        mergedSchema,
        mergedDefaultSortField,
        'Updating game',
      );
    }

    const nextSlug = updateGameDto.slug ?? slug;
    if (nextSlug !== slug) {
      const taken = await this.gameRepository.findOne({
        where: { slug: nextSlug },
      });
      if (taken && taken.id !== game.id) {
        throw new ConflictException(
          `A game with slug "${nextSlug}" already exists.`,
        );
      }
    }

    Object.assign(game, {
      ...(updateGameDto.slug !== undefined && { slug: updateGameDto.slug }),
      ...(updateGameDto.name !== undefined && { name: updateGameDto.name }),
      ...(updateGameDto.fieldsSchema !== undefined && {
        fieldsSchema: updateGameDto.fieldsSchema,
      }),
      ...(updateGameDto.defaultSortField !== undefined && {
        defaultSortField: updateGameDto.defaultSortField,
      }),
      ...(updateGameDto.defaultSortOrder !== undefined && {
        defaultSortOrder: updateGameDto.defaultSortOrder,
      }),
    });

    return this.gameRepository.save(game);
  }
}
