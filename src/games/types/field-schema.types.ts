export type FieldSchemaType = 'number' | 'string';

/** One field definition stored in Game.fieldsSchema (JSONB array). */
export interface FieldSchemaItem {
  name: string;
  type: FieldSchemaType;
  /** Optional hint when this field is used as primary leaderboard sort (planned use). */
  sortOrder?: 'ASC' | 'DESC';
  /** Lower bound for number fields. */
  min?: number;
  /** Upper bound for number fields. */
  max?: number;
  /** When true, value must be strictly greater than min. */
  exclusiveMin?: boolean;
  /** When true, value must be strictly less than max. */
  exclusiveMax?: boolean;
}
