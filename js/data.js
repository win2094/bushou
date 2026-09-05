/**
 * Puzzle catalog and virtual keyboard layout.
 * Game content lives here so logic and UI stay independent of the word list.
 */
export const MAX_GUESSES = 5;
export const SLOTS_PER_GUESS = 5;

export const KEYBOARD_ROWS = [
  ["人", "口", "木", "水", "火", "土"],
  ["日", "月", "金", "心", "手", "目"],
  ["女", "子", "山", "石", "田", "禾"],
  ["竹", "車", "門", "馬", "雨", "耳"],
  ["宀", "亻", "氵", "刂", "阝", "辶"],
  ["力", "十", "工", "言", "干", "斤"],
];

/** @typedef {{ id: string, char: string, parts: string[], hint: string }} Puzzle */

/** @type {Puzzle[]} */
export const PUZZLES = [
  { id: "lin", char: "林", parts: ["木", "木"], hint: "兩棵樹並立" },
  { id: "sen", char: "森", parts: ["木", "木", "木"], hint: "三木成林" },
  { id: "xiu", char: "休", parts: ["人", "木"], hint: "人靠在樹旁" },
  { id: "hao", char: "好", parts: ["女", "子"], hint: "女子與孩子" },
  { id: "ming", char: "明", parts: ["日", "月"], hint: "日月同輝" },
  { id: "pin", char: "品", parts: ["口", "口", "口"], hint: "三個口" },
  { id: "yan", char: "炎", parts: ["火", "火"], hint: "火上再加火" },
  { id: "yan3", char: "焱", parts: ["火", "火", "火"], hint: "三把火" },
  { id: "an", char: "安", parts: ["宀", "女"], hint: "屋簷下有女" },
  { id: "xiang", char: "想", parts: ["木", "目", "心"], hint: "相在心上" },
  { id: "si", char: "思", parts: ["田", "心"], hint: "田在心上" },
  { id: "kan", char: "看", parts: ["手", "目"], hint: "手搭在目上" },
  { id: "qiu", char: "秋", parts: ["禾", "火"], hint: "禾旁有火" },
  { id: "he", char: "和", parts: ["禾", "口"], hint: "禾旁一口" },
  { id: "shan", char: "閃", parts: ["門", "人"], hint: "門裡有人" },
  { id: "wen", char: "問", parts: ["門", "口"], hint: "門口發問" },
  { id: "jian", char: "間", parts: ["門", "日"], hint: "門中有日" },
  { id: "lv", char: "呂", parts: ["口", "口"], hint: "兩口相連" },
  { id: "peng", char: "朋", parts: ["月", "月"], hint: "兩個月" },
  { id: "cong", char: "从", parts: ["人", "人"], hint: "兩人並立" },
  { id: "zhong", char: "众", parts: ["人", "人", "人"], hint: "三人為眾" },
  { id: "lei", char: "磊", parts: ["石", "石", "石"], hint: "三塊石" },
  { id: "xin", char: "鑫", parts: ["金", "金", "金"], hint: "三個金" },
  { id: "miao", char: "淼", parts: ["水", "水", "水"], hint: "三個水" },
  { id: "ma", char: "嗎", parts: ["口", "馬"], hint: "口旁馬" },
  { id: "lei2", char: "雷", parts: ["雨", "田"], hint: "雨在田上" },
  { id: "li", char: "利", parts: ["禾", "刂"], hint: "禾旁立刀" },
  { id: "xing", char: "杏", parts: ["木", "口"], hint: "木下一口" },
  { id: "dai", char: "呆", parts: ["口", "木"], hint: "口下有木" },
  { id: "tu", char: "吐", parts: ["口", "土"], hint: "口旁土" },
  { id: "gui", char: "圭", parts: ["土", "土"], hint: "兩土相疊" },
  { id: "zuo", char: "坐", parts: ["人", "人", "土"], hint: "兩人坐於土" },
  { id: "xian", char: "仙", parts: ["亻", "山"], hint: "人旁山" },
  { id: "huo", char: "伙", parts: ["亻", "火"], hint: "人旁火" },
  { id: "men", char: "們", parts: ["亻", "門"], hint: "人旁門" },
  { id: "mu", char: "沐", parts: ["氵", "木"], hint: "水旁木" },
  { id: "lin2", char: "淋", parts: ["氵", "木", "木"], hint: "水旁林" },
  { id: "gui2", char: "炅", parts: ["日", "火"], hint: "日下火" },
  { id: "chang", char: "昌", parts: ["日", "日"], hint: "兩日相疊" },
  { id: "jing", char: "晶", parts: ["日", "日", "日"], hint: "三日為晶" },
  { id: "xiang2", char: "相", parts: ["木", "目"], hint: "木旁目" },
  { id: "fen", char: "焚", parts: ["木", "木", "火"], hint: "林下有火" },
  { id: "zao", char: "灶", parts: ["火", "土"], hint: "火旁土" },
  { id: "nan", char: "男", parts: ["田", "力"], hint: "田裡出力" },
  { id: "hong", char: "轟", parts: ["車", "車", "車"], hint: "三車並行" },
  { id: "chuang", char: "闖", parts: ["門", "馬"], hint: "門中有馬" },
  { id: "wen2", char: "聞", parts: ["門", "耳"], hint: "門中有耳" },
  { id: "xin3", char: "信", parts: ["人", "言"], hint: "人旁有言" },
  { id: "zao2", char: "早", parts: ["日", "十"], hint: "日上十" },
  { id: "han", char: "旱", parts: ["日", "干"], hint: "日下干" },
  { id: "gong", char: "功", parts: ["工", "力"], hint: "工旁力" },
  { id: "jiang", char: "江", parts: ["氵", "工"], hint: "水旁工" },
  { id: "jin", char: "近", parts: ["辶", "斤"], hint: "走之旁" },
];
