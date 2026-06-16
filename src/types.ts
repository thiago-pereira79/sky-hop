export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAMEOVER = 'GAMEOVER',
  LEVEL_SELECTION = 'LEVEL_SELECTION',
  VICTORY = 'VICTORY'
}

export interface Level {
  id: number;
  name: string;
  world: number;
  worldName: string;
  theme: 'day' | 'sunset' | 'night' | 'storm';
  targetScore: number;
  speed: number;
  centerGap: number;
  spawnDistance: number;
  star1Coins: number;
  star2Coins: number;
  star3Coins: number;
  mechanic?: 'normal' | 'fast' | 'moving' | 'wind';
}

export interface Bird {
  y: number;
  vy: number;
  radius: number;
  targetAngle: number;
  currentAngle: number;
  wingFrame: number;
  wingTimer: number;
}

export interface Obstacle {
  x: number;
  width: number;
  topHeight: number;
  bottomHeight: number;
  passed: boolean;
  speed: number;
  centerGap: number;
  coin?: {
    y: number;
    collected: boolean;
    radius: number;
  };
  originalTopHeight?: number;
  wavePhase?: number;
}

export interface Cloud {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'feather' | 'sparkle' | 'ring' | 'score';
  text?: string;
}

export interface GameStats {
  score: number;
  highScore: number;
}
