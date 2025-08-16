import { Block, Slab } from "../types";

const BLOCKS_KEY = "stone_factory_blocks";
const SLABS_KEY = "stone_factory_slabs";

// Block storage functions
export const saveBlocks = (blocks: Block[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
  }
};

export const loadBlocks = (): Block[] => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(BLOCKS_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  return [];
};

export const saveBlock = (block: Block): void => {
  const blocks = loadBlocks();
  const existingIndex = blocks.findIndex((b) => b.id === block.id);

  if (existingIndex >= 0) {
    blocks[existingIndex] = block;
  } else {
    blocks.push(block);
  }

  saveBlocks(blocks);
};

// Slab storage functions
export const saveSlabs = (slabs: Slab[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(SLABS_KEY, JSON.stringify(slabs));
  }
};

export const loadSlabs = (): Slab[] => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(SLABS_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  return [];
};

export const saveSlab = (slab: Slab): void => {
  const slabs = loadSlabs();
  const existingIndex = slabs.findIndex((s) => s.id === slab.id);

  if (existingIndex >= 0) {
    slabs[existingIndex] = slab;
  } else {
    slabs.push(slab);
  }

  saveSlabs(slabs);
};

export const getSlabsByBlockId = (blockId: string): Slab[] => {
  const slabs = loadSlabs();
  return slabs.filter((slab) => slab.blockId === blockId);
};

export const deleteBlock = (blockId: string): void => {
  const blocks = loadBlocks().filter((b) => b.id !== blockId);
  const slabs = loadSlabs().filter((s) => s.blockId !== blockId);

  saveBlocks(blocks);
  saveSlabs(slabs);
};

export const deleteSlab = (slabId: string): void => {
  const slabs = loadSlabs().filter((s) => s.id !== slabId);
  saveSlabs(slabs);
};
