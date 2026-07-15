/**
 * Reusable Memory module stub.
 * This folder is reserved for vector store indexes, short-term session context buffers,
 * and long-term business profile memory managers.
 */
export interface MemoryBuffer {
  userId: string;
  contextList: string[];
  addContext(text: string): void;
}
