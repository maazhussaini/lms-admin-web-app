/**
 * @file base-constraint.types.ts
 * @description Base constraint type definitions following PostgreSQL and TypeScript best practices.
 */

/**
 * PostgreSQL constraint action types
 */
export type ConstraintAction = 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'SET DEFAULT' | 'NO ACTION';

/**
 * PostgreSQL index types
 */
export type IndexType = 'BTREE' | 'HASH' | 'GIN' | 'GIST' | 'SPGIST' | 'BRIN';

/**
 * Base constraint interface with common properties
 */
export interface BaseConstraint {
  /** Target table name or '*' for universal constraints */
  table: string;
  /** PostgreSQL constraint name following naming conventions */
  constraintName: string;
  /** Human-readable description of the constraint purpose */
  description: string;
}

/**
 * Check constraint definition for data validation rules
 */
export interface CheckConstraint extends BaseConstraint {
  /** SQL condition expression for the check constraint */
  condition: string;
}

/**
 * Foreign key constraint definition for referential integrity
 */
export interface ForeignKeyConstraint extends BaseConstraint {
  /** Source column name */
  column: string;
  /** Referenced table name */
  referencedTable: string;
  /** Referenced column name */
  referencedColumn: string;
  /** Action on referenced record deletion */
  onDelete: ConstraintAction;
  /** Action on referenced record update */
  onUpdate: ConstraintAction;
  /** Whether the foreign key column allows NULL values */
  isNullable: boolean;
}

/**
 * Unique constraint definition for data uniqueness
 */
export interface UniqueConstraint extends BaseConstraint {
  /** Array of column names that form the unique constraint */
  columns: string[];
  /** Optional WHERE condition for partial unique constraints */
  condition?: string;
}

/**
 * Database index definition for query performance optimization
 */
export interface IndexConstraint extends BaseConstraint {
  /** Index name following PostgreSQL conventions */
  indexName: string;
  /** Array of column names included in the index */
  columns: string[];
  /** PostgreSQL index algorithm type */
  indexType: IndexType;
  /** Whether this is a unique index */
  isUnique: boolean;
  /** Whether this is a partial index with WHERE clause */
  isPartial?: boolean;
  /** WHERE condition for partial indexes */
  condition?: string;
}

/**
 * Enum constraint definition for enumerated value validation
 */
export interface EnumConstraint extends BaseConstraint {
  /** Column name that uses the enum */
  column: string;
  /** TypeScript enum name */
  enumName: string;
  /** Mapping of enum labels to numeric values */
  enumValues: Record<string, number>;
}

/**
 * Entity relationship mapping for documentation and validation
 */
export interface EntityRelationship {
  /** Entity/table name */
  entity: string;
  /** Array of foreign key relationships */
  foreignKeys: {
    /** Foreign key column name */
    column: string;
    /** Referenced entity/table name */
    referencedEntity: string;
    /** Referenced column name */
    referencedColumn: string;
    /** Whether the relationship is required (NOT NULL) */
    required: boolean;
    /** Whether to cascade deletes */
    cascadeDelete?: boolean;
    /** Description of the relationship */
    description: string;
  }[];
}

/**
 * Union type for all constraint types
 */
export type AnyConstraint = 
  | CheckConstraint 
  | ForeignKeyConstraint 
  | UniqueConstraint 
  | IndexConstraint 
  | EnumConstraint;

/**
 * Constraint metadata for database schema generation
 */
export interface ConstraintMetadata {
  /** Constraint category */
  type: 'CHECK' | 'FOREIGN_KEY' | 'UNIQUE' | 'INDEX' | 'ENUM';
  /** Priority for constraint application (lower = higher priority) */
  priority: number;
  /** Whether constraint is required for basic functionality */
  required: boolean;
  /** Database engine compatibility */
  compatibility: ('postgresql' | 'mysql' | 'sqlite')[];
}