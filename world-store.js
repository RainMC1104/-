export const BLOCK_TYPES = ['grass', 'dirt', 'stone', 'wood', 'leaves', 'sand', 'water', 'lava'];
export const GAME_MODES = ['adventure', 'creative', 'spectator', 'survival'];
export const WORLD_STORAGE_KEY = 'blockland-worlds-v1';
export const FIXED_SURVIVAL_SEED = 2026;
export const WORLD_WIDTH = 10000;
export const WORLD_DEPTH = 1000;
export const CHUNK_SIZE = 16;
export const TERRAIN_VERSION = 2;

const isMode = mode => GAME_MODES.includes(mode);
const inBounds = (x, z) => x >= -WORLD_WIDTH / 2 && x < WORLD_WIDTH / 2 &&
  z >= -WORLD_DEPTH / 2 && z < WORLD_DEPTH / 2;

function hash(x, z, seed) {
  let value = Math.imul(x, 374761393) + Math.imul(z, 668265263) + Math.imul(seed, 1442695041);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function smooth(value) {
  return value * value * (3 - 2 * value);
}

function noise(x, z, seed, scale) {
  const scaledX = x * scale;
  const scaledZ = z * scale;
  const x0 = Math.floor(scaledX);
  const z0 = Math.floor(scaledZ);
  const tx = smooth(scaledX - x0);
  const tz = smooth(scaledZ - z0);
  const top = hash(x0, z0, seed) * (1 - tx) + hash(x0 + 1, z0, seed) * tx;
  const bottom = hash(x0, z0 + 1, seed) * (1 - tx) + hash(x0 + 1, z0 + 1, seed) * tx;
  return top * (1 - tz) + bottom * tz;
}

function getColumn(x, z, seed) {
  const region = noise(x, z, seed, 0.005);
  const biome = region < 0.2 ? 'desert' : region > 0.88 ? 'volcanic' :
    noise(x, z, seed + 31, 0.006) > 0.52 ? 'forest' : 'plains';
  const hills = noise(x, z, seed + 7, 0.012);
  const detail = noise(x, z, seed + 13, 0.045);
  let height = Math.round(3 + (hills - 0.5) * 10 + (detail - 0.5) * 3);
  let lake = false;
  let magmaPool = false;
  const lakeNoise = noise(x, z, seed + 71, 0.018);

  if (biome !== 'desert' && biome !== 'volcanic' &&
      lakeNoise > 0.79) {
    const lakeDepth = Math.max(0, Math.min(1, (noise(x, z, seed + 73, 0.045) - 0.35) * 2));
    height -= Math.round(2 + lakeDepth * 2);
    lake = height < 4;
  }
  if (biome === 'volcanic') {
    const pool = noise(x, z, seed + 97, 0.035);
    magmaPool = pool > 0.69;
    if (magmaPool) height -= Math.round(1 + Math.max(0, pool - 0.69) * 7);
  }

  height = Math.max(-1, height);
  const shore = biome !== 'desert' && biome !== 'volcanic' &&
    lakeNoise > 0.73 && lakeNoise <= 0.79 && height <= 5;
  return { biome, height, lake, magmaPool, shore };
}

export function getSurfaceHeight(x, z, seed = FIXED_SURVIVAL_SEED) {
  return getColumn(Math.floor(x), Math.floor(z), seed).height;
}

export function getTerrainColumn(x, z, seed = FIXED_SURVIVAL_SEED) {
  return getColumn(Math.floor(x), Math.floor(z), seed);
}

export function generateChunk(chunkX, chunkZ, seed) {
  const blocks = new Map();
  const startX = chunkX * CHUNK_SIZE;
  const startZ = chunkZ * CHUNK_SIZE;
  const endX = startX + CHUNK_SIZE;
  const endZ = startZ + CHUNK_SIZE;
  const add = (x, y, z, type) => {
    if (x >= startX && x < endX && z >= startZ && z < endZ && inBounds(x, z)) {
      const key = `${x},${y},${z}`;
      const existing = blocks.get(key);
      if (!existing || (type === 'wood' && existing.type === 'leaves')) {
        blocks.set(key, { x, y, z, type });
      }
    }
  };
  for (let x = startX; x < endX; x++) {
    for (let z = startZ; z < endZ; z++) {
      if (!inBounds(x, z)) continue;
      const column = getColumn(x, z, seed);
      for (let y = -4; y <= column.height; y++) {
        let type;
        if (y === column.height) {
          type = column.biome === 'desert' || column.shore ? 'sand' : 'grass';
        } else if (column.biome === 'desert' && y >= column.height - 3) {
          type = 'sand';
        } else {
          type = y >= column.height - 3 ? 'dirt' : 'stone';
        }
        add(x, y, z, type);
      }
      if (column.lake) {
        for (let y = column.height + 1; y <= 4; y++) add(x, y, z, 'water');
      } else if (column.magmaPool) {
        add(x, column.height + 1, z, 'lava');
      }
    }
  }

  for (let x = startX - 2; x < endX + 2; x++) {
    for (let z = startZ - 2; z < endZ + 2; z++) {
      if (hash(x, z, seed + 151) > 0.02) continue;
      const column = getColumn(x, z, seed);
      if (column.biome !== 'forest' || column.lake || column.height < 0) continue;
      const trunkHeight = 3 + Math.floor(hash(x, z, seed + 157) * 3);
      for (let y = 1; y <= trunkHeight; y++) add(x, column.height + y, z, 'wood');
      for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) {
        for (let dy = trunkHeight - 1; dy <= trunkHeight + 1; dy++) {
          const radius = Math.abs(dx) + Math.abs(dz) + Math.max(0, dy - trunkHeight);
          if (radius <= 3 && hash(x + dx, z + dz, seed + dy + 163) > 0.12) {
            add(x + dx, column.height + dy, z + dz, 'leaves');
          }
        }
      }
    }
  }
  return [...blocks.values()];
}

function randomSeed() {
  if (globalThis.crypto?.getRandomValues) {
    const value = new Uint32Array(1);
    globalThis.crypto.getRandomValues(value);
    return value[0] & 0x7fffffff;
  }
  return Math.floor(Math.random() * 0x80000000);
}

export function createWorldRecord({ mode, name, id, createdAt = Date.now() }) {
  if (mode !== 'survival' && mode !== 'creative') throw new TypeError(`Unsupported initial world mode: ${mode}`);
  return {
    id,
    name,
    mode,
    seed: randomSeed(),
    createdAt,
    terrainVersion: TERRAIN_VERSION,
    blocks: [],
    blockEdits: [],
    player: null,
    hotbar: null,
    inventory: null,
    collected: 0
  };
}

export function readWorlds(storage = localStorage) {
  const raw = storage.getItem(WORLD_STORAGE_KEY);
  if (!raw) return [];
  const worlds = JSON.parse(raw);
  if (!Array.isArray(worlds)) throw new TypeError('Saved worlds must be an array');
  for (const world of worlds) {
    if (!world || typeof world.id !== 'string' || typeof world.name !== 'string' ||
        !isMode(world.mode) || !Number.isInteger(world.seed) ||
        !Number.isFinite(world.createdAt) || !Array.isArray(world.blocks)) {
      throw new TypeError('A saved world has an invalid format');
    }
    for (const block of world.blocks) {
      if (!block || !Number.isInteger(block.x) || !Number.isInteger(block.y) ||
          !Number.isInteger(block.z) || !BLOCK_TYPES.includes(block.type)) {
        throw new TypeError(`World "${world.name}" contains an invalid block`);
      }
    }
    if (world.blockEdits !== undefined) {
      if (!Array.isArray(world.blockEdits)) throw new TypeError(`World "${world.name}" has invalid block edits`);
      for (const edit of world.blockEdits) {
        if (!edit || !Number.isInteger(edit.x) || !Number.isInteger(edit.y) ||
            !Number.isInteger(edit.z) || (edit.type !== null && !BLOCK_TYPES.includes(edit.type))) {
          throw new TypeError(`World "${world.name}" contains an invalid block edit`);
        }
      }
    }
  }
  return worlds;
}

export function writeWorlds(worlds, storage = localStorage) {
  storage.setItem(WORLD_STORAGE_KEY, JSON.stringify(worlds));
}
