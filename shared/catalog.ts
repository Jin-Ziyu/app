export type Item = {
  id: string;
  name: string;
  category: string;
  rarity: string;
  cost: number;
  color: string;
  shape?: string;
};
export const categories = [
  "Character",
  "Hair",
  "Top",
  "Bottom",
  "Dress",
  "Shoes",
  "Hat",
  "Glasses",
  "Jewellery",
  "Wings",
  "Bag",
  "Background",
  "Frame",
  "Pose",
  "Effect",
];
export const catalog: Item[] = [
  {
    id: "bunny",
    name: "Mochi bunny",
    category: "Character",
    rarity: "Starter",
    cost: 0,
    color: "#f5e9e5",
  },
  {
    id: "cat",
    name: "Peach kitten",
    category: "Character",
    rarity: "Rare",
    cost: 120,
    color: "#f4c4a6",
  },
  {
    id: "bear",
    name: "Honey bear",
    category: "Character",
    rarity: "Common",
    cost: 65,
    color: "#caa17f",
  },
  {
    id: "bob",
    name: "Cloud bob",
    category: "Hair",
    rarity: "Starter",
    cost: 0,
    color: "#a27869",
  },
  {
    id: "long",
    name: "Rose waves",
    category: "Hair",
    rarity: "Rare",
    cost: 90,
    color: "#dca4bd",
  },
  {
    id: "tee",
    name: "Milk tea tee",
    category: "Top",
    rarity: "Starter",
    cost: 0,
    color: "#a9c4aa",
  },
  {
    id: "sweater",
    name: "Strawberry knit",
    category: "Top",
    rarity: "Common",
    cost: 35,
    color: "#e7a6b5",
  },
  {
    id: "skirt",
    name: "Cloud skirt",
    category: "Bottom",
    rarity: "Starter",
    cost: 0,
    color: "#f0d4db",
  },
  {
    id: "shorts",
    name: "Sunday shorts",
    category: "Bottom",
    rarity: "Common",
    cost: 30,
    color: "#a6bbd6",
  },
  {
    id: "dress",
    name: "Moonflower dress",
    category: "Dress",
    rarity: "Rare",
    cost: 100,
    color: "#b4a9d1",
  },
  {
    id: "shoes",
    name: "Little slippers",
    category: "Shoes",
    rarity: "Starter",
    cost: 0,
    color: "#976b78",
  },
  {
    id: "boots",
    name: "Rainy day boots",
    category: "Shoes",
    rarity: "Common",
    cost: 35,
    color: "#d7ba75",
  },
  {
    id: "beret",
    name: "Berry beret",
    category: "Hat",
    rarity: "Common",
    cost: 45,
    color: "#ca7f98",
  },
  {
    id: "crown",
    name: "Starlight crown",
    category: "Hat",
    rarity: "Legendary",
    cost: 250,
    color: "#e3bc64",
  },
  {
    id: "glasses",
    name: "Book club specs",
    category: "Glasses",
    rarity: "Common",
    cost: 30,
    color: "#76647d",
  },
  {
    id: "necklace",
    name: "Heart pendant",
    category: "Jewellery",
    rarity: "Common",
    cost: 40,
    color: "#d3a451",
  },
  {
    id: "wings",
    name: "Daydream wings",
    category: "Wings",
    rarity: "Legendary",
    cost: 220,
    color: "#b7cbe1",
  },
  {
    id: "bag",
    name: "Tiny adventure bag",
    category: "Bag",
    rarity: "Common",
    cost: 40,
    color: "#bfa184",
  },
  {
    id: "garden",
    name: "Secret garden",
    category: "Background",
    rarity: "Starter",
    cost: 0,
    color: "#e3eddf",
  },
  {
    id: "sky",
    name: "Blue hour",
    category: "Background",
    rarity: "Rare",
    cost: 70,
    color: "#d6e5f6",
  },
  {
    id: "sunset",
    name: "Peach picnic",
    category: "Background",
    rarity: "Common",
    cost: 40,
    color: "#f4ddd1",
  },
  {
    id: "frame",
    name: "Petal frame",
    category: "Frame",
    rarity: "Rare",
    cost: 80,
    color: "#d7a1bd",
  },
  {
    id: "wave",
    name: "Hello pose",
    category: "Pose",
    rarity: "Starter",
    cost: 0,
    color: "#a9c4aa",
  },
  {
    id: "dance",
    name: "Happy dance",
    category: "Pose",
    rarity: "Rare",
    cost: 60,
    color: "#c4b1da",
  },
  {
    id: "sparkles",
    name: "Wishing stars",
    category: "Effect",
    rarity: "Legendary",
    cost: 180,
    color: "#dfbc68",
  },
];
export const boxes = [
  {
    id: "common",
    name: "Little Joy Box",
    label: "Common Box",
    cost: 50,
    odds: { Common: 85, Rare: 14, Legendary: 1 },
    color: "#e0ebdc",
  },
  {
    id: "rare",
    name: "Daydream Box",
    label: "Rare Box",
    cost: 100,
    odds: { Common: 40, Rare: 55, Legendary: 5 },
    color: "#e4dcee",
  },
  {
    id: "premium",
    name: "Starlight Box",
    label: "Premium Box",
    cost: 200,
    odds: { Common: 15, Rare: 65, Legendary: 20 },
    color: "#f3e6c8",
  },
];
export function defaultAvatar() {
  return {
    Character: "bunny",
    Hair: "bob",
    Top: "tee",
    Bottom: "skirt",
    Shoes: "shoes",
    Background: "garden",
    Pose: "wave",
    fur: "#f5e9e5",
    eye: "#514247",
    hairColor: "#a27869",
  };
}
export function initialState() {
  return {
    inventory: catalog.filter((i) => !i.cost).map((i) => i.id),
    avatar: defaultAvatar(),
    presets: [],
    settings: {
      theme: "light",
      accent: "#a45d78",
      background: "petals",
      density: "comfortable",
      font: 16,
      sidebar: true,
      sound: false,
      motion: true,
      widgets: ["daily", "games", "collection"],
    },
    daily: "",
    streak: 0,
    missions: {},
    stats: { games: 0, correct: 0, boxes: 0, wins: 0 },
    run: null,
    boxHistory: [],
  };
}
export const trivia = [
  {
    q: "What is a fandom?",
    options: [
      "A community of fans",
      "A music instrument",
      "A concert ticket",
      "A clothing brand",
    ],
    answer: 0,
  },
  {
    q: "What does an encore mean at a concert?",
    options: [
      "The opening act",
      "An extra performance",
      "A sound check",
      "A photo session",
    ],
    answer: 1,
  },
  {
    q: "Which item helps fans cheer together at K-pop concerts?",
    options: ["A bookmark", "A compass", "A lightstick", "A notebook"],
    answer: 2,
  },
  {
    q: "What is a photocard?",
    options: [
      "A collectible artist photo",
      "A passport",
      "A stage light",
      "A playlist",
    ],
    answer: 0,
  },
  {
    q: "What does a comeback usually refer to in K-pop?",
    options: [
      "A venue closing",
      "A new music release",
      "A fan leaving",
      "A ticket refund",
    ],
    answer: 1,
  },
  {
    q: "What is a bias in a fandom?",
    options: [
      "A tour date",
      "A dance style",
      "Your favourite member",
      "An album cover",
    ],
    answer: 2,
  },
  {
    q: "What is a fan chant?",
    options: ["A coordinated cheer", "A snack", "A hairstyle", "A camera"],
    answer: 0,
  },
  {
    q: "What is a setlist?",
    options: [
      "A seating plan",
      "The songs performed",
      "A ticket category",
      "A fan club",
    ],
    answer: 1,
  },
];
export function dailyGame(day: string) {
  return ["tap", "trivia", "memory"][
    Math.floor(Date.parse(day) / 86400000) % 3
  ];
}
export function achievementList(state: any) {
  return [
    {
      name: "First adventure",
      detail: "Finish a game",
      earned: state.stats.games > 0,
    },
    {
      name: "Fan scholar",
      detail: "Answer 5 trivia questions correctly",
      earned: state.stats.correct >= 5,
    },
    {
      name: "Little collector",
      detail: "Own 12 cosmetics",
      earned: state.inventory.length >= 12,
    },
    {
      name: "A lovely habit",
      detail: "Reach a 3-day streak",
      earned: state.streak >= 3,
    },
    {
      name: "Surprise seeker",
      detail: "Open a blind box",
      earned: state.stats.boxes > 0,
    },
    {
      name: "Perfect match",
      detail: "Win Memory Match",
      earned: state.stats.wins > 0,
    },
  ];
}
