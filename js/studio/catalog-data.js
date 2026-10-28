// Fan Quest cosmetic catalogue — the single source of truth for avatar items,
// blind boxes, daily missions, daily challenges and achievements.
//
// Run `node scripts/build-seed.mjs` after editing to regenerate
// supabase/migrations/*_fan_quest_seed.sql, then apply that migration.
//
// Adding an item: add a row below using an existing `shape` for its slot
// (see js/studio/avatar.js for the list of shapes each slot supports) and
// pick colours. Set `price` to sell it in the shop, `boxes` to put it in
// blind-box pools, or `starter: true` to give it to everyone for free.

export const RARITIES = ['Common', 'Rare', 'Epic', 'Legendary'];

export const SLOTS = [
  'species', 'hair', 'top', 'bottom', 'dress', 'outfit', 'shoes',
  'hat', 'glasses', 'jewelry', 'wings', 'bag', 'held',
  'background', 'frame', 'pose', 'effect',
];

// [id, slot, name, name_zh, rarity, price|null, starter, boxes[], art, sort]
const I = (id, slot, name, name_zh, rarity, price, starter, boxes, art) =>
  ({ id, slot, name, name_zh, rarity, price, starter, boxes, art });
const C = ['common', 'rare'];        // pools for common items
const R = ['common', 'rare', 'premium'];
const RP = ['rare', 'premium'];
const P = ['premium'];

export const ITEMS = [
  // ---------- species ----------
  I('sp_bunny', 'species', 'Bunny', '兔兔', 'Common', null, true, [], { shape: 'bunny', fur: '#fff3f7' }),
  I('sp_cat', 'species', 'Kitty', '猫猫', 'Common', null, true, [], { shape: 'cat', fur: '#ffe2c2' }),
  I('sp_bear', 'species', 'Bear', '小熊', 'Common', null, true, [], { shape: 'bear', fur: '#e9c3a0' }),
  I('sp_human', 'species', 'Human', '人类', 'Common', null, true, [], { shape: 'human', fur: '#ffe0cc' }),
  I('sp_fox', 'species', 'Fox', '狐狸', 'Common', 60, false, C, { shape: 'fox', fur: '#ffc08a' }),
  I('sp_panda', 'species', 'Panda', '熊猫', 'Rare', 120, false, R, { shape: 'panda', fur: '#ffffff' }),
  I('sp_frog', 'species', 'Froggy', '青蛙', 'Common', 60, false, C, { shape: 'frog', fur: '#bfeab0' }),
  I('sp_sheep', 'species', 'Lamb', '小羊', 'Rare', 150, false, R, { shape: 'sheep', fur: '#fffaf0' }),
  I('sp_penguin', 'species', 'Penguin', '企鹅', 'Rare', 150, false, R, { shape: 'penguin', fur: '#fff6ea' }),
  I('sp_chick', 'species', 'Chick', '小鸡', 'Common', 80, false, C, { shape: 'chick', fur: '#ffe98a' }),
  I('sp_unicorn', 'species', 'Unicorn', '独角兽', 'Epic', 400, false, RP, { shape: 'unicorn', fur: '#fdf2ff' }),
  I('sp_dragon', 'species', 'Star Dragon', '星辰小龙', 'Legendary', null, false, RP, { shape: 'dragon', fur: '#cfe4ff' }),

  // ---------- hair ----------
  I('hair_none', 'hair', 'No hair', '无发型', 'Common', null, true, [], { shape: 'none' }),
  I('hair_bob', 'hair', 'Bob', '波波头', 'Common', null, true, [], { shape: 'bob' }),
  I('hair_long', 'hair', 'Long & straight', '黑长直', 'Common', null, true, [], { shape: 'long' }),
  I('hair_spiky', 'hair', 'Short & spiky', '短碎发', 'Common', null, true, [], { shape: 'spiky' }),
  I('hair_twintails', 'hair', 'Twin tails', '双马尾', 'Common', 40, false, C, { shape: 'twintails' }),
  I('hair_bun', 'hair', 'Space buns', '丸子头', 'Common', 40, false, C, { shape: 'bun' }),
  I('hair_wavy', 'hair', 'Soft waves', '大波浪', 'Rare', 90, false, R, { shape: 'wavy' }),
  I('hair_ponytail', 'hair', 'High ponytail', '高马尾', 'Common', 40, false, C, { shape: 'ponytail' }),
  I('hair_pixie', 'hair', 'Pixie cut', '精灵短发', 'Rare', 90, false, R, { shape: 'pixie' }),
  I('hair_princess', 'hair', 'Princess curls', '公主卷', 'Epic', null, false, RP, { shape: 'princess' }),

  // ---------- tops ----------
  I('top_tee_pink', 'top', 'Pink tee', '粉色T恤', 'Common', null, true, [], { shape: 'tee', color: '#ffb8cf', accent: '#ff8fb1' }),
  I('top_tee_blue', 'top', 'Sky tee', '天蓝T恤', 'Common', null, true, [], { shape: 'tee', color: '#b5d4ff', accent: '#8ab8ff' }),
  I('top_hoodie_lav', 'top', 'Lavender hoodie', '薰衣草卫衣', 'Common', 50, false, C, { shape: 'hoodie', color: '#cbb6ff', accent: '#a98bf5' }),
  I('top_sailor', 'top', 'Sailor blouse', '水手服', 'Common', 60, false, C, { shape: 'sailor', color: '#ffffff', accent: '#6f8fe8' }),
  I('top_sweater_mint', 'top', 'Mint knit', '薄荷毛衣', 'Common', 50, false, C, { shape: 'sweater', color: '#bdf0d8', accent: '#86d9b2' }),
  I('top_stripes', 'top', 'Candy stripes tee', '糖果条纹T恤', 'Common', 45, false, C, { shape: 'tee', color: '#fff4c9', accent: '#ff9db8', pattern: 'stripes' }),
  I('top_heart_tee', 'top', 'Heart tee', '爱心T恤', 'Rare', 90, false, R, { shape: 'tee', color: '#ffffff', accent: '#ff6f9c', pattern: 'heart' }),
  I('top_jacket', 'top', 'Varsity jacket', '棒球外套', 'Rare', 120, false, R, { shape: 'jacket', color: '#5b6fd8', accent: '#ffffff' }),
  I('top_star_hoodie', 'top', 'Starry hoodie', '星星卫衣', 'Epic', null, false, RP, { shape: 'hoodie', color: '#3d3a78', accent: '#ffd76a', pattern: 'star' }),

  // ---------- bottoms ----------
  I('bot_skirt_pink', 'bottom', 'Pink skirt', '粉色短裙', 'Common', null, true, [], { shape: 'skirt', color: '#ff9fc0' }),
  I('bot_shorts', 'bottom', 'Denim shorts', '牛仔短裤', 'Common', null, true, [], { shape: 'shorts', color: '#8fb0e6' }),
  I('bot_pants', 'bottom', 'Comfy pants', '休闲长裤', 'Common', 40, false, C, { shape: 'pants', color: '#9b8fd8' }),
  I('bot_pleated', 'bottom', 'Pleated skirt', '百褶裙', 'Common', 50, false, C, { shape: 'pleated', color: '#6f8fe8' }),
  I('bot_dots', 'bottom', 'Polka skirt', '波点裙', 'Rare', 90, false, R, { shape: 'skirt', color: '#ffd1e0', pattern: 'dots' }),

  // ---------- dresses ----------
  I('dr_sundress', 'dress', 'Pastel sundress', '马卡龙连衣裙', 'Common', 70, false, C, { shape: 'sundress', color: '#ffd6e6', accent: '#ffffff' }),
  I('dr_sailor', 'dress', 'Sailor dress', '水手连衣裙', 'Rare', 130, false, R, { shape: 'sailor_dress', color: '#ffffff', accent: '#5b7be0' }),
  I('dr_puffy', 'dress', 'Frilly dress', '洛丽塔裙', 'Rare', 150, false, R, { shape: 'puffy', color: '#d8c5ff', accent: '#ffffff' }),
  I('dr_gown', 'dress', 'Moonlight gown', '月光礼服', 'Epic', null, false, RP, { shape: 'gown', color: '#9fb7ff', accent: '#fff6c9' }),
  I('dr_galaxy', 'dress', 'Galaxy gown', '银河礼服', 'Legendary', null, false, P, { shape: 'gown', color: '#2c2a6b', accent: '#ffd76a', pattern: 'star' }),

  // ---------- full outfits ----------
  I('of_idol', 'outfit', 'Idol stage outfit', '偶像打歌服', 'Rare', null, false, R, { shape: 'idol', color: '#ff7fa8', accent: '#ffe27a' }),
  I('of_magical', 'outfit', 'Magical girl', '魔法少女', 'Epic', null, false, RP, { shape: 'magical', color: '#ffb3d1', accent: '#ffffff' }),
  I('of_astronaut', 'outfit', 'Space suit', '宇航服', 'Epic', 350, false, RP, { shape: 'astronaut', color: '#f4f6ff', accent: '#ff9a62' }),
  I('of_prince', 'outfit', 'Little prince', '小王子', 'Epic', null, false, RP, { shape: 'prince', color: '#5068c8', accent: '#ffd76a' }),
  I('of_kimono', 'outfit', 'Sakura yukata', '樱花浴衣', 'Legendary', null, false, P, { shape: 'kimono', color: '#ffe3ee', accent: '#e85d8a' }),

  // ---------- shoes ----------
  I('sh_sneakers', 'shoes', 'White sneakers', '小白鞋', 'Common', null, true, [], { shape: 'sneakers', color: '#ffffff', accent: '#ff9fc0' }),
  I('sh_maryjane', 'shoes', 'Mary Janes', '玛丽珍鞋', 'Common', 40, false, C, { shape: 'maryjane', color: '#5a3d5c' }),
  I('sh_boots', 'shoes', 'Cozy boots', '雪地靴', 'Common', 45, false, C, { shape: 'boots', color: '#d9a77a' }),
  I('sh_slippers', 'shoes', 'Bunny slippers', '兔兔拖鞋', 'Rare', 80, false, R, { shape: 'slippers', color: '#fff0f5' }),
  I('sh_glass', 'shoes', 'Glass slippers', '水晶鞋', 'Epic', null, false, RP, { shape: 'maryjane', color: '#bfe8ff' }),

  // ---------- hats & hair accessories ----------
  I('hat_bow', 'hat', 'Big bow', '大蝴蝶结', 'Common', null, true, [], { shape: 'bow', color: '#ff8fb1' }),
  I('velvet_ribbon', 'hat', 'Velvet ribbon', '丝绒发带', 'Rare', null, false, R, { shape: 'bow', color: '#b0386b' }),
  I('hat_beret', 'hat', 'Artist beret', '贝雷帽', 'Common', 50, false, C, { shape: 'beret', color: '#e06c8c' }),
  I('hat_cap', 'hat', 'Baseball cap', '棒球帽', 'Common', 40, false, C, { shape: 'cap', color: '#7fa3f0' }),
  I('hat_beanie', 'hat', 'Knit beanie', '毛线帽', 'Common', 40, false, C, { shape: 'beanie', color: '#ffcf7a' }),
  I('hat_flowers', 'hat', 'Flower crown', '花环', 'Rare', 100, false, R, { shape: 'flowers', color: '#ffb3c7' }),
  I('hat_headphones', 'hat', 'Headphones', '头戴耳机', 'Rare', 110, false, R, { shape: 'headphones', color: '#cbb6ff' }),
  I('hat_witch', 'hat', 'Witch hat', '魔女帽', 'Rare', null, false, R, { shape: 'witch', color: '#4a3b7a' }),
  I('moonlight_crown', 'hat', 'Moonlight crown', '月光皇冠', 'Epic', null, false, RP, { shape: 'crown', color: '#ffd76a' }),
  I('hat_tiara', 'hat', 'Star tiara', '星星头冠', 'Epic', null, false, R, { shape: 'tiara', color: '#d6f0ff' }),
  I('hat_halo', 'hat', 'Halo', '天使光环', 'Legendary', null, false, P, { shape: 'halo', color: '#fff2a8' }),

  // ---------- glasses ----------
  I('gl_round', 'glasses', 'Round glasses', '圆框眼镜', 'Common', null, true, [], { shape: 'round', color: '#5a4a78' }),
  I('gl_square', 'glasses', 'Study glasses', '学霸眼镜', 'Common', 35, false, C, { shape: 'square', color: '#2b3480' }),
  I('gl_heart', 'glasses', 'Heart shades', '爱心墨镜', 'Rare', 90, false, R, { shape: 'heart', color: '#ff5f8f' }),
  I('gl_star', 'glasses', 'Star shades', '星星墨镜', 'Epic', null, false, R, { shape: 'star', color: '#ffc93c' }),

  // ---------- jewellery ----------
  I('pastel_star_pin', 'jewelry', 'Pastel star pin', '马卡龙星星胸针', 'Common', null, false, C, { shape: 'pin', color: '#ffd76a' }),
  I('jw_pearls', 'jewelry', 'Pearl necklace', '珍珠项链', 'Common', 50, false, C, { shape: 'pearls', color: '#fffaf2' }),
  I('jw_heart', 'jewelry', 'Heart pendant', '爱心吊坠', 'Rare', 100, false, R, { shape: 'pendant', color: '#ff6f9c' }),
  I('jw_bowtie', 'jewelry', 'Bow tie', '领结', 'Common', 35, false, C, { shape: 'bowtie', color: '#e85d8a' }),
  I('jw_choker', 'jewelry', 'Star choker', '星星颈链', 'Epic', null, false, RP, { shape: 'choker', color: '#8e76dc' }),

  // ---------- wings ----------
  I('wg_fairy', 'wings', 'Fairy wings', '精灵翅膀', 'Rare', 140, false, R, { shape: 'fairy', color: '#c9f1ff' }),
  I('wg_angel', 'wings', 'Angel wings', '天使翅膀', 'Epic', null, false, RP, { shape: 'angel', color: '#ffffff' }),
  I('wg_bat', 'wings', 'Bat wings', '小恶魔翅膀', 'Rare', null, false, R, { shape: 'bat', color: '#6d5a9e' }),
  I('wg_butterfly', 'wings', 'Butterfly wings', '蝴蝶翅膀', 'Epic', null, false, RP, { shape: 'butterfly', color: '#ffb36b', accent: '#ff7fa8' }),
  I('starlight_wings', 'wings', 'Starlight wings', '星光之翼', 'Legendary', null, false, RP, { shape: 'angel', color: '#fff2a8', pattern: 'star' }),

  // ---------- bags ----------
  I('bag_purse', 'bag', 'Heart purse', '爱心小包', 'Common', 45, false, C, { shape: 'purse', color: '#ff8fb1' }),
  I('bag_backpack', 'bag', 'Mini backpack', '迷你书包', 'Common', 45, false, C, { shape: 'backpack', color: '#9fc4ff' }),
  I('bag_tote', 'bag', 'Fan tote', '应援帆布袋', 'Rare', 90, false, R, { shape: 'tote', color: '#fff4dc', accent: '#8e76dc' }),
  I('bag_star', 'bag', 'Star pochette', '星星斜挎包', 'Epic', null, false, RP, { shape: 'purse', color: '#ffd76a', pattern: 'star' }),

  // ---------- held items ----------
  I('hd_lightstick', 'held', 'Glow lightstick', '应援棒', 'Common', null, true, [], { shape: 'lightstick', color: '#b9a5ee' }),
  I('hd_boba', 'held', 'Bubble tea', '珍珠奶茶', 'Common', 30, false, C, { shape: 'boba', color: '#e8c9a8' }),
  I('hd_balloon', 'held', 'Heart balloon', '爱心气球', 'Common', 40, false, C, { shape: 'balloon', color: '#ff7fa8' }),
  I('hd_flower', 'held', 'Tulip', '郁金香', 'Common', 30, false, C, { shape: 'flower', color: '#ff9fc0' }),
  I('hd_plush', 'held', 'Bunny plush', '兔兔玩偶', 'Rare', 100, false, R, { shape: 'plush', color: '#fff0f5' }),
  I('hd_wand', 'held', 'Star wand', '星星魔杖', 'Epic', null, false, RP, { shape: 'wand', color: '#ffd76a' }),
  I('hd_mic', 'held', 'Golden mic', '金色麦克风', 'Legendary', null, false, P, { shape: 'mic', color: '#ffd23f' }),

  // ---------- backgrounds ----------
  I('bg_sky', 'background', 'Pastel sky', '马卡龙天空', 'Common', null, true, [], { c1: '#ffe3ef', c2: '#e3dcff', deco: 'clouds' }),
  I('bg_mint', 'background', 'Mint dream', '薄荷梦境', 'Common', null, true, [], { c1: '#dff7ec', c2: '#fff6d8', deco: 'dots' }),
  I('bg_sakura', 'background', 'Sakura breeze', '樱花微风', 'Common', 50, false, C, { c1: '#ffe9f0', c2: '#ffd1e0', deco: 'sakura' }),
  I('bg_candy', 'background', 'Candy stripes', '糖果条纹', 'Common', 40, false, C, { c1: '#fff4c9', c2: '#ffd1e0', deco: 'stripes' }),
  I('bg_hearts', 'background', 'Heart wall', '爱心墙', 'Rare', 90, false, R, { c1: '#ffd6e6', c2: '#ffb8cf', deco: 'hearts' }),
  I('bg_night', 'background', 'Starry night', '星空夜', 'Rare', 120, false, R, { c1: '#2c2a6b', c2: '#6b5bb5', deco: 'stars' }),
  I('bg_stage', 'background', 'Concert stage', '演唱会舞台', 'Epic', null, false, RP, { c1: '#2a1f4f', c2: '#ff7fa8', deco: 'stage' }),
  I('bg_deepspace', 'background', 'Deep space', '深空', 'Legendary', null, false, P, { c1: '#0f1640', c2: '#4a3ba0', deco: 'galaxy' }),

  // ---------- frames ----------
  I('fr_none', 'frame', 'No frame', '无相框', 'Common', null, true, [], { shape: 'none' }),
  I('fr_round', 'frame', 'Sticker frame', '贴纸相框', 'Common', null, true, [], { shape: 'round', color: '#ffffff' }),
  I('fr_heart', 'frame', 'Heart frame', '爱心相框', 'Common', 40, false, C, { shape: 'heart', color: '#ff8fb1' }),
  I('fr_lace', 'frame', 'Lace frame', '蕾丝相框', 'Rare', 90, false, R, { shape: 'lace', color: '#ffffff' }),
  I('fr_star', 'frame', 'Star frame', '星星相框', 'Rare', null, false, R, { shape: 'star', color: '#ffd76a' }),
  I('fr_gold', 'frame', 'Golden frame', '金色相框', 'Epic', null, false, RP, { shape: 'gold', color: '#f6c343' }),
  I('fr_rainbow', 'frame', 'Rainbow frame', '彩虹相框', 'Legendary', null, false, P, { shape: 'rainbow', color: '#ff7fa8' }),

  // ---------- poses ----------
  I('ps_stand', 'pose', 'Stand', '站立', 'Common', null, true, [], { shape: 'stand' }),
  I('ps_wave', 'pose', 'Wave', '挥手', 'Common', null, true, [], { shape: 'wave' }),
  I('ps_hold', 'pose', 'Hold up', '举起', 'Common', null, true, [], { shape: 'hold' }),
  I('ps_cheer', 'pose', 'Cheer', '欢呼', 'Common', 40, false, C, { shape: 'cheer' }),
  I('ps_heart', 'pose', 'Finger heart', '比心', 'Rare', 90, false, R, { shape: 'heart' }),
  I('ps_hop', 'pose', 'Happy hop', '开心跳', 'Epic', null, false, RP, { shape: 'hop' }),

  // ---------- effects ----------
  I('fx_sparkles', 'effect', 'Sparkles', '闪闪', 'Common', null, true, [], { shape: 'sparkles', color: '#ffd76a' }),
  I('fx_hearts', 'effect', 'Floating hearts', '爱心泡泡', 'Common', 40, false, C, { shape: 'hearts', color: '#ff7fa8' }),
  I('fx_bubbles', 'effect', 'Bubbles', '泡泡', 'Common', 40, false, C, { shape: 'bubbles', color: '#9fd6ff' }),
  I('fx_confetti', 'effect', 'Confetti', '彩带', 'Rare', 90, false, R, { shape: 'confetti', color: '#ff9fc0' }),
  I('fx_snow', 'effect', 'Snowfall', '雪花', 'Rare', null, false, R, { shape: 'snow', color: '#ffffff' }),
  I('fx_aura', 'effect', 'Star aura', '星光光环', 'Epic', null, false, R, { shape: 'aura', color: '#ffe27a' }),
  I('fx_rainbow', 'effect', 'Rainbow trail', '彩虹拖尾', 'Legendary', null, false, P, { shape: 'rainbow', color: '#ff7fa8' }),
];

// Blind boxes. Odds are integer weights out of 100 for transparency.
export const BOXES = [
  { id: 'common', name: 'Common Box', name_zh: '普通盲盒', cost: 50, sort: 1,
    description: 'Everyday cuties from the starter collection.', description_zh: '日常可爱单品。',
    odds: { Common: 75, Rare: 20, Epic: 5 } },
  { id: 'rare', name: 'Rare Box', name_zh: '稀有盲盒', cost: 100, sort: 2,
    description: 'Better odds for Rare and Epic pieces, with a small Legendary chance.', description_zh: '更高几率获得稀有与史诗单品。',
    odds: { Common: 40, Rare: 45, Epic: 12, Legendary: 3 } },
  { id: 'premium', name: 'Premium Box', name_zh: '豪华盲盒', cost: 200, sort: 3,
    description: 'No Commons. Rare or better, with the best Legendary odds.', description_zh: '保底稀有，传说几率最高。',
    odds: { Rare: 55, Epic: 35, Legendary: 10 } },
];

// Points returned when a box rolls a rarity whose items you already own.
export const DUPLICATE_REFUND = { Common: 10, Rare: 20, Epic: 40, Legendary: 80 };

// Daily missions: progress = sum of today's events of `event`.
export const MISSIONS = [
  { id: 'm_login', title: 'Say hi! Claim your daily login', title_zh: '领取每日登录奖励', event: 'daily_login', target: 1, reward: 10 },
  { id: 'm_play2', title: 'Play any 2 mini-games', title_zh: '玩任意 2 局小游戏', event: 'game_finished', target: 2, reward: 15 },
  { id: 'm_play4', title: 'Play any 4 mini-games', title_zh: '玩任意 4 局小游戏', event: 'game_finished', target: 4, reward: 25 },
  { id: 'm_trivia3', title: 'Answer 3 trivia questions correctly', title_zh: '答对 3 道知识问答', event: 'trivia_correct', target: 3, reward: 15 },
  { id: 'm_tap', title: 'Finish a Quick Tap round', title_zh: '完成一局快速点击', event: 'quick_tap_finished', target: 1, reward: 10 },
  { id: 'm_memory', title: 'Clear a Memory Match board', title_zh: '完成一局记忆翻牌', event: 'memory_match_finished', target: 1, reward: 10 },
  { id: 'm_style', title: 'Save a new look for your avatar', title_zh: '保存一次头像造型', event: 'avatar_saved', target: 1, reward: 10 },
  { id: 'm_box', title: 'Open a blind box', title_zh: '开启一个盲盒', event: 'box_opened', target: 1, reward: 20 },
  { id: 'm_shop', title: 'Buy an item in the shop', title_zh: '在商店购买一件单品', event: 'item_bought', target: 1, reward: 15 },
  { id: 'm_challenge', title: "Complete today's Daily Challenge", title_zh: '完成今日挑战', event: 'challenge_done', target: 1, reward: 20 },
];

// Rotating daily challenge (one per day for everyone).
// metric: score (>= target), moves (<= target), correct (>= target)
export const CHALLENGES = [
  { id: 'ch_tap_30', game: 'quick_tap', difficulty: 'normal', metric: 'score', target: 30, reward: 30, title: 'Score 30+ in Quick Tap (Normal or harder)', title_zh: '快速点击（普通及以上）得分 30+' },
  { id: 'ch_mem_14', game: 'memory_match', difficulty: 'normal', metric: 'moves', target: 14, reward: 30, title: 'Clear Memory Match (Normal or harder) in 14 moves or fewer', title_zh: '记忆翻牌（普通及以上）14 步内完成' },
  { id: 'ch_triv_4', game: 'trivia', difficulty: 'easy', metric: 'correct', target: 4, reward: 30, title: 'Get 4 of 5 trivia questions right in one round', title_zh: '一轮问答答对 4 题以上' },
  { id: 'ch_tap_hard', game: 'quick_tap', difficulty: 'hard', metric: 'score', target: 20, reward: 35, title: 'Score 20+ in Quick Tap on Hard', title_zh: '快速点击（困难）得分 20+' },
  { id: 'ch_mem_easy', game: 'memory_match', difficulty: 'easy', metric: 'moves', target: 9, reward: 25, title: 'Clear Memory Match in 9 moves or fewer', title_zh: '记忆翻牌 9 步内完成' },
  { id: 'ch_triv_5', game: 'trivia', difficulty: 'easy', metric: 'correct', target: 5, reward: 40, title: 'Perfect trivia round: 5 of 5', title_zh: '问答全对 5/5' },
];

// Achievements: metric is evaluated server-side (see fq_private.metric).
export const ACHIEVEMENTS = [
  { id: 'a_first_login', icon: 'flower', metric: 'logins', target: 1, reward: 10, title: 'Hello, Fan Quest!', title_zh: '你好，Fan Quest', description: 'Claim your first daily login.', description_zh: '首次领取每日登录。' },
  { id: 'a_streak3', icon: 'flame', metric: 'best_streak', target: 3, reward: 20, title: 'Warming up', title_zh: '渐入佳境', description: 'Reach a 3-day login streak.', description_zh: '连续登录 3 天。' },
  { id: 'a_streak7', icon: 'medal', metric: 'best_streak', target: 7, reward: 50, title: 'Week-long fan', title_zh: '一周铁粉', description: 'Reach a 7-day login streak.', description_zh: '连续登录 7 天。' },
  { id: 'a_games10', icon: 'gamepad', metric: 'games_played', target: 10, reward: 25, title: 'Game time', title_zh: '游戏时间', description: 'Finish 10 mini-games.', description_zh: '完成 10 局小游戏。' },
  { id: 'a_games50', icon: 'joystick', metric: 'games_played', target: 50, reward: 80, title: 'Arcade regular', title_zh: '游戏达人', description: 'Finish 50 mini-games.', description_zh: '完成 50 局小游戏。' },
  { id: 'a_trivia20', icon: 'bulb', metric: 'trivia_correct', target: 20, reward: 40, title: 'Big brain', title_zh: '知识满分', description: 'Answer 20 trivia questions correctly.', description_zh: '累计答对 20 题。' },
  { id: 'a_box1', icon: 'gift', metric: 'boxes_opened', target: 1, reward: 10, title: 'Surprise!', title_zh: '惊喜！', description: 'Open your first blind box.', description_zh: '开启第一个盲盒。' },
  { id: 'a_box10', icon: 'box', metric: 'boxes_opened', target: 10, reward: 60, title: 'Box collector', title_zh: '盲盒收藏家', description: 'Open 10 blind boxes.', description_zh: '开启 10 个盲盒。' },
  { id: 'a_items10', icon: 'shirt', metric: 'items_owned', target: 10, reward: 30, title: 'Wardrobe starter', title_zh: '衣橱初成', description: 'Own 10 non-starter items.', description_zh: '拥有 10 件非初始单品。' },
  { id: 'a_items30', icon: 'hanger', metric: 'items_owned', target: 30, reward: 100, title: 'Fashion icon', title_zh: '时尚达人', description: 'Own 30 non-starter items.', description_zh: '拥有 30 件非初始单品。' },
  { id: 'a_legendary', icon: 'star', metric: 'legendary_owned', target: 1, reward: 50, title: 'Legend!', title_zh: '传说降临', description: 'Own a Legendary item.', description_zh: '获得一件传说单品。' },
  { id: 'a_missions10', icon: 'scroll', metric: 'missions_claimed', target: 10, reward: 40, title: 'Mission accomplished', title_zh: '任务达人', description: 'Claim 10 daily missions.', description_zh: '领取 10 次每日任务奖励。' },
  { id: 'a_looks3', icon: 'camera', metric: 'looks_saved', target: 3, reward: 15, title: 'Lookbook', title_zh: '造型册', description: 'Save 3 outfits to your lookbook.', description_zh: '在造型册保存 3 套造型。' },
  { id: 'a_points1000', icon: 'gem', metric: 'points_earned', target: 1000, reward: 100, title: 'Point millionaire', title_zh: '积分大户', description: 'Earn 1,000 Fan Points in total.', description_zh: '累计获得 1000 积分。' },
];

// Trivia pool. answer = index into choices. Stored server-side only.
// level: easy | normal | hard
export const TRIVIA = [
  ['easy', 'Which colour do you get by mixing pink and blue paint?', '粉色和蓝色颜料混合会得到什么颜色？', ['Purple', 'Green', 'Orange', 'Yellow'], ['紫色', '绿色', '橙色', '黄色'], 0],
  ['easy', 'What does a blind box guarantee?', '盲盒保证什么？', ['A specific rare item', 'A random item from the listed pool', 'Unlimited points', 'A refund'], ['指定的稀有物品', '列出奖池中的随机物品', '无限积分', '退款'], 1],
  ['easy', 'How many days are in a week?', '一周有几天？', ['5', '6', '7', '8'], ['5', '6', '7', '8'], 2],
  ['easy', 'Which of these is the safest password habit?', '以下哪种密码习惯最安全？', ['Reuse one password', 'Use a unique strong password', 'Share it with friends', 'Write it on your screen'], ['所有账号同一个密码', '每个账号用独立强密码', '分享给朋友', '写在屏幕上'], 1],
  ['easy', 'Fans waving glowing sticks at a concert are holding…', '演唱会上粉丝挥舞的发光棒叫什么？', ['Lightsticks', 'Chopsticks', 'Drumsticks', 'Glue sticks'], ['应援棒', '筷子', '鼓槌', '胶棒'], 0],
  ['easy', 'Which animal is known for long ears and hopping?', '哪种动物以长耳朵和蹦跳著称？', ['Cat', 'Bunny', 'Frog', 'Bear'], ['猫', '兔子', '青蛙', '熊'], 1],
  ['easy', 'A "comeback" in K-pop usually means…', 'K-pop 中的 "回归" 通常指什么？', ['A group releases new music', 'A concert is cancelled', 'An idol retires', 'A fan club closes'], ['团体发布新作品', '演唱会取消', '偶像退役', '粉丝团解散'], 0],
  ['easy', 'What does "OT" stand for when fans talk about a full group?', '粉丝说 "OT" 指整个团体时，它代表什么？', ['Overtime', 'One True', 'Original / all members together', 'Online Ticket'], ['加班', '唯一真爱', '全员到齐', '线上票务'], 2],
  ['easy', 'How many sides does a hexagon have?', '六边形有几条边？', ['5', '6', '7', '8'], ['5', '6', '7', '8'], 1],
  ['easy', 'Which planet is known as the Red Planet?', '哪颗行星被称为红色星球？', ['Venus', 'Jupiter', 'Mars', 'Saturn'], ['金星', '木星', '火星', '土星'], 2],
  ['normal', 'In a gacha game, what is "pity"?', '抽卡游戏中的 "保底" 是什么？', ['A guaranteed reward after many pulls', 'A free daily item', 'A refund system', 'A chat feature'], ['抽满一定次数必得奖励', '每日免费物品', '退款机制', '聊天功能'], 0],
  ['normal', 'What is a "bias" in K-pop fandom?', 'K-pop 饭圈里的 "本命" 指什么？', ['Your favourite member', 'A rival group', 'A music chart', 'A dance move'], ['最喜欢的成员', '竞争团体', '音乐榜单', '舞蹈动作'], 0],
  ['normal', 'What does "POB" stand for when buying albums?', '买专辑时的 "POB" 指什么？', ['Pre-order benefit', 'Photo of band', 'Point of buying', 'Post office box'], ['预购特典', '乐队照片', '购买点', '邮政信箱'], 0],
  ['normal', 'Which shape has every point the same distance from its centre?', '哪种图形上每一点到中心距离都相等？', ['Square', 'Triangle', 'Circle', 'Oval'], ['正方形', '三角形', '圆形', '椭圆'], 2],
  ['normal', 'How many minutes is a classic Pomodoro focus session?', '经典番茄钟专注一次多少分钟？', ['15', '25', '45', '60'], ['15', '25', '45', '60'], 1],
  ['normal', 'What is the chemical symbol for gold?', '金的化学符号是什么？', ['Go', 'Gd', 'Au', 'Ag'], ['Go', 'Gd', 'Au', 'Ag'], 2],
  ['normal', 'Which language is mainly used to style web pages?', '主要用来给网页设置样式的语言是？', ['HTML', 'CSS', 'SQL', 'Python'], ['HTML', 'CSS', 'SQL', 'Python'], 1],
  ['normal', 'A "photocard" is usually found…', '"小卡" 通常出现在哪里？', ['Inside albums', 'In train stations', 'On concert stages', 'In cookbooks'], ['专辑里', '火车站', '舞台上', '食谱里'], 0],
  ['normal', 'Which city hosts Singapore\'s National Stadium?', '新加坡国家体育场位于哪个城市？', ['Kuala Lumpur', 'Singapore', 'Bangkok', 'Jakarta'], ['吉隆坡', '新加坡', '曼谷', '雅加达'], 1],
  ['normal', 'What does "SLAM" stand for in robotics?', '机器人学中的 SLAM 指什么？', ['Simultaneous Localization and Mapping', 'Smart Laser Arm Motor', 'Sensor Logic and Motion', 'Single Lidar Area Map'], ['同时定位与建图', '智能激光臂电机', '传感器逻辑与运动', '单激光雷达区域图'], 0],
  ['hard', 'How many bits are in one byte?', '一个字节有多少位？', ['4', '8', '16', '32'], ['4', '8', '16', '32'], 1],
  ['hard', 'Which sorting algorithm has average O(n log n) time and uses a pivot?', '哪种排序算法平均 O(n log n) 且使用基准元素？', ['Bubble sort', 'Quicksort', 'Insertion sort', 'Selection sort'], ['冒泡排序', '快速排序', '插入排序', '选择排序'], 1],
  ['hard', 'In a PID controller, what does the "I" term respond to?', 'PID 控制器中 I 项响应什么？', ['Current error', 'Accumulated past error', 'Rate of change of error', 'Setpoint only'], ['当前误差', '累积误差', '误差变化率', '仅设定值'], 1],
  ['hard', 'What is 15% of 240?', '240 的 15% 是多少？', ['24', '30', '36', '40'], ['24', '30', '36', '40'], 2],
  ['hard', 'Which gas makes up most of Earth\'s atmosphere?', '地球大气中含量最多的气体是？', ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Argon'], ['氧气', '二氧化碳', '氮气', '氩气'], 2],
  ['hard', 'What is the binary representation of the number 10?', '数字 10 的二进制表示是？', ['1010', '1001', '1100', '0110'], ['1010', '1001', '1100', '0110'], 0],
];
