export type StatDimension = 
  | 'calculation' // 计算力
  | 'execution'   // 执行力
  | 'memory'      // 记忆力
  | 'attention'   // 注意力
  | 'visual'      // 视知觉
  | 'abstraction'; // 抽象力

export interface UserStats {
  calculation: number;
  execution: number;
  memory: number;
  attention: number;
  visual: number;
  abstraction: number;
  gamesPlayed: number;
  lastTrained: string | null; // ISO Date string
}

export interface GameDefinition {
  id: string;
  name: string;
  dimension: StatDimension;
  description: string;
  iconName: string;
  color: string;
}

export interface GameState {
  score: number;
  level: number; // Difficulty level 1-10
  timeLeft: number;
  isOver: boolean;
  questionCount: number;
  correctCount: number;
}

export interface GameEngineProps {
  definition: GameDefinition;
  onComplete: (score: number, accuracy: number, levelReached: number) => void;
  onExit: () => void;
}

// Specific Game Logic Interfaces
export interface QuestionResult {
  correct: boolean;
  scoreDelta?: number;
}
