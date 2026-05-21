export type FieldSchemaType = 'number' | 'string';

/** One field definition stored in Game.fieldsSchema (JSONB array). */
export interface FieldSchemaItem {
  name: string;
  type: FieldSchemaType;
  /** Optional hint when this field is used as primary leaderboard sort (planned use). */
  sortOrder?: 'ASC' | 'DESC';
}
