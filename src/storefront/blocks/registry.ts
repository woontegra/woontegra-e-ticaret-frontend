/**
 * Storefront blok registry — blok tipleri ve renderer'lar.
 * Blok props admin builder'dan gelir.
 */

export type BlockType = string;

export interface BlockProps<T extends BlockType = BlockType> {
  type: T;
  props: Record<string, unknown>;
}
