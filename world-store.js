export const BLOCK_TYPES = ['grass', 'dirt', 'stone', 'wood', 'leaves'];
export const GAME_MODES = ['adventure', 'creative', 'spectator', 'survival'];
export const WORLD_STORAGE_KEY = 'blockland-worlds-v1';
export const FIXED_SURVIVAL_SEED = 2026;

const isMode = mode => GAME_MODES.includes(mode);

function makeRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function terrainHeight(x, z, seed) {
  return Math.floor(1.4 + Math.sin(x * 0.22 + seed) * 1.5 +
    Math.cos(z * 0.21 + seed * 0.03) * 1.3 + Math.sin((x + z) * 0.13) * 0.9);
}

function generateBlocks(mode, seed) {
  const blocks = new Map();
  const add = (x, y, z, type) => {
    const key = `${x},${y},${z}`;
    if (!blocks.has(key)) blocks.set(key, { x, y, z, type });
  };
  if (mode === 'creative') {
    for (let x = -16; x <= 16; x++) for (let z = -16; z <= 16; z++) {
      add(x, 0, z, 'grass');
      add(x, -1, z, 'dirt');
      for (let y = -2; y >= -4; y--) add(x, y, z, 'stone');
    }
    return [...blocks.values()];
  }

  const random = makeRandom(seed);
  for (let x = -16; x <= 16; x++) {
    for (let z = -16; z <= 16; z++) {
      const distance = Math.hypot(x, z);
      if (distance > 16 || (distance > 12 && random() < (distance - 12) / 5)) continue;
      const top = terrainHeight(x, z, seed);
      for (let y = -3; y <= top; y++) {
        add(x, y, z, y === top ? 'grass' : y >= top - 2 ? 'dirt' : 'stone');
      }
      if (distance > 3 && top > 0 && random() < 0.075) {
        const trunkHeight = 3 + Math.floor(random() * 2);
        for (let y = 1; y <= trunkHeight; y++) add(x, top + y, z, 'wood');
        for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) {
          for (let dy = trunkHeight - 1; dy <= trunkHeight + 2; dy++) {
            const radius = Math.abs(dx) + Math.abs(dz) + Math.max(0, dy - trunkHeight);
            if (radius <= 3 && random() > 0.13) add(x + dx, top + dy, z + dz, 'leaves');
          }
        }
      }
    }
  }
  return [...blocks.values()];
}

export function createWorldRecord({ mode, name, id, createdAt = Date.now() }) {
  if (mode !== 'survival' && mode !== 'creative') throw new TypeError(`Unsupported initial world mode: ${mode}`);
  return {
    id,
    name,
    mode,
    seed: FIXED_SURVIVAL_SEED,
    createdAt,
    blocks: generateBlocks(mode, FIXED_SURVIVAL_SEED),
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
  }
  return worlds;
}

export function writeWorlds(worlds, storage = localStorage) {
  storage.setItem(WORLD_STORAGE_KEY, JSON.stringify(worlds));
}
