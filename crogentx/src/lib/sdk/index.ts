/**
 * CrogentX SDK - Main export
 */

export {
  CrogentXClient,
  createClient,
  type CrogentXConfig,
  type TransactionQuery,
  type SimulateTransactionParams,
  type DebugTransactionParams,
} from './crogentx-client';

// Re-export types for convenience
export type {
  X402Transaction,
  AIAgent,
  InstructionType,
  TransactionCategory,
} from '../cronos/types';
