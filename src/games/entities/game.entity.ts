import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { FieldSchemaItem } from '../types/field-schema.types';

@Entity('games')
@Unique(['slug'])
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'jsonb' })
  fieldsSchema: FieldSchemaItem[];

  @Column({ type: 'varchar', length: 64 })
  defaultSortField: string;

  @Column({ type: 'varchar', length: 4 })
  defaultSortOrder: 'ASC' | 'DESC';

  @CreateDateColumn()
  createdAt: Date;
}
