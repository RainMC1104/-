export const ITEM_CATALOG = {
  grass: { label: '草ブロック', block: true },
  tall_grass: { label: '草', block: true, plant: true },
  dirt: { label: '土', block: true },
  stone: { label: '石', block: true },
  wood: { label: '原木', block: true },
  planks: { label: '板材', block: true },
  leaves: { label: '葉', block: true },
  sand: { label: '砂', block: true },
  water: { label: '水', block: true, fluid: true },
  lava: { label: 'マグマ', block: true, fluid: true },
  coal_ore: { label: '石炭鉱石', block: true, ore: true },
  iron_ore: { label: '鉄鉱石', block: true, ore: true },
  gold_ore: { label: '金鉱石', block: true, ore: true },
  diamond_ore: { label: 'ダイヤモンド鉱石', block: true, ore: true },
  crafting_table: { label: '作業台', block: true },
  furnace: { label: 'かまど', block: true },
  chest: { label: 'チェスト', block: true },
  stick: { label: '棒' },
  coal: { label: '石炭' },
  raw_iron: { label: '鉄の原石' },
  raw_gold: { label: '金の原石' },
  charcoal: { label: '木炭' },
  diamond: { label: 'ダイヤモンド' },
  iron_ingot: { label: '鉄インゴット' },
  gold_ingot: { label: '金インゴット' },
  torch: { label: 'たいまつ' },
  iron_sword: { label: '鉄の剣', tool: true },
  iron_pickaxe: { label: '鉄のツルハシ', tool: true },
  iron_axe: { label: '鉄の斧', tool: true },
  wooden_sword: { label: '木の剣', tool: true },
  wooden_pickaxe: { label: '木のツルハシ', tool: true },
  wooden_axe: { label: '木の斧', tool: true },
  wooden_shovel: { label: '木のシャベル', tool: true },
  stone_sword: { label: '石の剣', tool: true },
  stone_pickaxe: { label: '石のツルハシ', tool: true },
  stone_axe: { label: '石の斧', tool: true },
  stone_shovel: { label: '石のシャベル', tool: true },
  iron_shovel: { label: '鉄のシャベル', tool: true },
  iron_hoe: { label: '鉄のクワ', tool: true }
};

const recipe = (id, label, ingredients, count = 1, station = 2, pattern = null) => ({
  id,
  label,
  ingredients,
  output: { id, count },
  station,
  pattern
});

export const CRAFTING_RECIPES = [
  recipe('planks', '板材 ×4', { wood: 1 }, 4, 2, ['wood']),
  recipe('stick', '棒 ×4', { planks: 2 }, 4, 2, ['planks', null, 'planks']),
  recipe('crafting_table', '作業台', { planks: 4 }, 1, 2, ['planks', 'planks', 'planks', 'planks']),
  recipe('chest', 'チェスト', { planks: 8 }, 1, 3, ['planks', 'planks', 'planks', 'planks', null, 'planks', 'planks', 'planks', 'planks']),
  recipe('furnace', 'かまど', { stone: 8 }, 1, 3, ['stone', 'stone', 'stone', 'stone', null, 'stone', 'stone', 'stone', 'stone']),
  recipe('torch', 'たいまつ ×4', { coal: 1, stick: 1 }, 4, 2, ['coal', null, 'stick']),
  recipe('torch', 'たいまつ ×4（木炭）', { charcoal: 1, stick: 1 }, 4, 2, ['charcoal', null, 'stick']),
  recipe('wooden_sword', '木の剣', { planks: 2, stick: 1 }, 1, 3, [null, 'planks', null, null, 'planks', null, null, 'stick']),
  recipe('wooden_pickaxe', '木のツルハシ', { planks: 3, stick: 2 }, 1, 3, ['planks', 'planks', 'planks', null, 'stick', null, null, 'stick']),
  recipe('wooden_axe', '木の斧', { planks: 3, stick: 2 }, 1, 3, ['planks', 'planks', null, 'planks', 'stick', null, null, 'stick']),
  recipe('wooden_shovel', '木のシャベル', { planks: 1, stick: 2 }, 1, 3, [null, 'planks', null, null, 'stick', null, null, 'stick']),
  recipe('stone_sword', '石の剣', { stone: 2, stick: 1 }, 1, 3, [null, 'stone', null, null, 'stone', null, null, 'stick']),
  recipe('stone_pickaxe', '石のツルハシ', { stone: 3, stick: 2 }, 1, 3, ['stone', 'stone', 'stone', null, 'stick', null, null, 'stick']),
  recipe('stone_axe', '石の斧', { stone: 3, stick: 2 }, 1, 3, ['stone', 'stone', null, 'stone', 'stick', null, null, 'stick']),
  recipe('stone_shovel', '石のシャベル', { stone: 1, stick: 2 }, 1, 3, [null, 'stone', null, null, 'stick', null, null, 'stick']),
  recipe('iron_sword', '鉄の剣', { iron_ingot: 2, stick: 1 }, 1, 3, [null, 'iron_ingot', null, null, 'iron_ingot', null, null, 'stick']),
  recipe('iron_pickaxe', '鉄のツルハシ', { iron_ingot: 3, stick: 2 }, 1, 3, ['iron_ingot', 'iron_ingot', 'iron_ingot', null, 'stick', null, null, 'stick']),
  recipe('iron_axe', '鉄の斧', { iron_ingot: 3, stick: 2 }, 1, 3, ['iron_ingot', 'iron_ingot', null, 'iron_ingot', 'stick', null, null, 'stick']),
  recipe('iron_shovel', '鉄のシャベル', { iron_ingot: 1, stick: 2 }, 1, 3, [null, 'iron_ingot', null, null, 'stick', null, null, 'stick']),
  recipe('iron_hoe', '鉄のクワ', { iron_ingot: 2, stick: 2 }, 1, 3, ['iron_ingot', 'iron_ingot', null, null, 'stick', null, null, 'stick'])
].map((entry, index) => ({ ...entry, key: `${entry.id}-${index}` }));

export const SMELTING_RECIPES = [
  recipe('iron_ingot', '鉄インゴット', { raw_iron: 1 }, 1, 2, ['raw_iron']),
  recipe('gold_ingot', '金インゴット', { raw_gold: 1 }, 1, 2, ['raw_gold']),
  recipe('charcoal', '木炭', { wood: 1 }, 1, 2, ['wood'])
].map((entry, index) => ({ ...entry, key: `smelt-${entry.id}-${index}`, fuel: ['coal', 'charcoal', 'planks', 'wood'] }));

export function getRecipeAvailability(recipeEntry, countItem, craftingSize) {
  if (recipeEntry.station > craftingSize) return { available: false, reason: '作業台が必要' };
  for (const [id, count] of Object.entries(recipeEntry.ingredients)) {
    if (countItem(id) < count) return { available: false, reason: '材料不足' };
  }
  return { available: true, reason: '' };
}
