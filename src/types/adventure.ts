export type GenreKey = 'mystery' | 'scifi' | 'fantasy';

export interface GenreDefinition {
  id: GenreKey;
  name: string;
  nameEnglish: string;
  tagline: string;
  era: string;
  icon: string;
  description: string;
  keyThemes: string[];
  themeColor: string;
  badgeBg: string;
  borderColor: string;
  accentGlow: string;
  sampleOpening: string;
}

export interface ChapterOption {
  id: number;
  title: string;
  description: string;
  category?: string;
}

export interface ChapterTurn {
  id: string;
  genre: GenreKey;
  genreName: string;
  chapterNumber: number;
  chapterTitle: string;
  narrativeParagraphs: string[];
  rawMarkdown: string;
  location: string;
  inventoryAndStatus: string[];
  currentObjective: string;
  options: ChapterOption[];
  playerHealth: number;
  actionTaken?: string;
  timelineBranchId?: string;
  timestamp: number;
  fateRoll?: {
    d20: number;
    description: string;
  };
}

export interface MultiverseBranchNode {
  id: string;
  chapterNumber: number;
  title: string;
  actionTaken: string;
  timestamp: number;
  health: number;
  location: string;
  branchId: string;
}

export interface SaveSlot {
  id: string;
  savedAt: string;
  genre: GenreKey;
  currentChapterNumber: number;
  chapterTitle: string;
  historyLength: number;
  history: ChapterTurn[];
}
