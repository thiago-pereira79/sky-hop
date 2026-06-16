import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Trophy, Sparkles, Gamepad2, Award, Zap, Coins, Smartphone, Lock, Star, ArrowLeft, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { GameState, Bird, Obstacle, Cloud, Particle, Level } from '../types';
import { 
  initAudio, 
  getSoundEnabled, 
  setSoundEnabled, 
  playCoinSound, 
  playFlapSound, 
  playGameOverSound, 
  playVictorySound 
} from '../utils/audio';

// Design Constants
const V_WIDTH = 480;  // Virtual game width
const V_HEIGHT = 640; // Virtual game height
const TARGET_FRAME_MS = 1000 / 60;
const MAX_DELTA_SCALE = 2;
const WING_OFFSETS_Y = [3, 0, -3, 0];
const PIPE_HIGHLIGHT = '#34d399';
const PIPE_COLOR = '#10b981';
const PIPE_SHADE = '#047857';
const MOVING_OBSTACLE_WAVE_SPEED = 0.03;
const WIND_OBSTACLE_WAVE_SPEED = 0.045;
const MOVING_OBSTACLE_AMPLITUDE = 30;
const WIND_OBSTACLE_AMPLITUDE = 45;

interface SkyGradientInfo {
  top: string;
  bottom: string;
  clouds: string;
  accent: string;
  label: string;
}

interface RankInfo {
  name: string;
  badge: string;
  colorClass: string;
  nextThreshold: number | null;
  prevThreshold: number;
}

// Custom rank calculation according to prompt requirements
// 0 to 5 points: Iniciante
// 6 to 15 points: Treinando
// 16 to 30 points: Ágil
// 31 to 50 points: Mestre do Voo
// 51+ points: Lenda dos Céus
export function getRank(score: number): RankInfo {
  if (score >= 51) {
    return {
      name: 'Lenda dos Céus',
      badge: '👑 Lenda dos Céus',
      colorClass: 'text-indigo-400 bg-indigo-950/80 border-indigo-500/30',
      nextThreshold: null,
      prevThreshold: 51,
    };
  } else if (score >= 31) {
    return {
      name: 'Mestre do Voo',
      badge: '⚡ Mestre do Voo',
      colorClass: 'text-amber-400 bg-amber-950/80 border-amber-500/30',
      nextThreshold: 51,
      prevThreshold: 31,
    };
  } else if (score >= 16) {
    return {
      name: 'Ágil',
      badge: '✨ Ágil',
      colorClass: 'text-cyan-400 bg-cyan-950/80 border-cyan-500/30',
      nextThreshold: 31,
      prevThreshold: 16,
    };
  } else if (score >= 6) {
    return {
      name: 'Treinando',
      badge: '🎯 Treinando',
      colorClass: 'text-yellow-400 bg-yellow-950/80 border-yellow-500/30',
      nextThreshold: 16,
      prevThreshold: 6,
    };
  } else {
    return {
      name: 'Iniciante',
      badge: '🌱 Iniciante',
      colorClass: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30',
      nextThreshold: 6,
      prevThreshold: 0,
    };
  }
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Primeiro Voo",
    world: 1,
    worldName: "Céu Claro",
    theme: "day",
    targetScore: 8,
    speed: 2.3,
    centerGap: 160,
    spawnDistance: 235,
    star1Coins: 2,
    star2Coins: 4,
    star3Coins: 6,
    mechanic: 'normal'
  },
  {
    id: 2,
    name: "Nuvens Calmas",
    world: 1,
    worldName: "Céu Claro",
    theme: "day",
    targetScore: 10,
    speed: 2.5,
    centerGap: 155,
    spawnDistance: 225,
    star1Coins: 3,
    star2Coins: 5,
    star3Coins: 7,
    mechanic: 'normal'
  },
  {
    id: 3,
    name: "Zênite Azul",
    world: 1,
    worldName: "Céu Claro",
    theme: "day",
    targetScore: 10,
    speed: 2.7,
    centerGap: 150,
    spawnDistance: 220,
    star1Coins: 3,
    star2Coins: 5,
    star3Coins: 7,
    mechanic: 'normal'
  },
  {
    id: 4,
    name: "Brisa de Outono",
    world: 2,
    worldName: "Pôr do Sol",
    theme: "sunset",
    targetScore: 12,
    speed: 3.0,
    centerGap: 142,
    spawnDistance: 215,
    star1Coins: 4,
    star2Coins: 6,
    star3Coins: 8,
    mechanic: 'normal'
  },
  {
    id: 5,
    name: "Horizonte Quente",
    world: 2,
    worldName: "Pôr do Sol",
    theme: "sunset",
    targetScore: 12,
    speed: 3.2,
    centerGap: 138,
    spawnDistance: 210,
    star1Coins: 4,
    star2Coins: 6,
    star3Coins: 8,
    mechanic: 'normal'
  },
  {
    id: 6,
    name: "Último Suspiro",
    world: 2,
    worldName: "Pôr do Sol",
    theme: "sunset",
    targetScore: 13,
    speed: 3.4,
    centerGap: 134,
    spawnDistance: 200,
    star1Coins: 4,
    star2Coins: 7,
    star3Coins: 9,
    mechanic: 'normal'
  },
  {
    id: 7,
    name: "Silêncio Astral",
    world: 3,
    worldName: "Noite Estrelada",
    theme: "night",
    targetScore: 14,
    speed: 3.6,
    centerGap: 130,
    spawnDistance: 195,
    star1Coins: 5,
    star2Coins: 8,
    star3Coins: 10,
    mechanic: 'moving'
  },
  {
    id: 8,
    name: "Constelações",
    world: 3,
    worldName: "Noite Estrelada",
    theme: "night",
    targetScore: 14,
    speed: 3.8,
    centerGap: 126,
    spawnDistance: 190,
    star1Coins: 5,
    star2Coins: 8,
    star3Coins: 10,
    mechanic: 'moving'
  },
  {
    id: 9,
    name: "Nebulosa Escura",
    world: 3,
    worldName: "Noite Estrelada",
    theme: "night",
    targetScore: 15,
    speed: 4.0,
    centerGap: 122,
    spawnDistance: 185,
    star1Coins: 5,
    star2Coins: 9,
    star3Coins: 11,
    mechanic: 'moving'
  },
  {
    id: 10,
    name: "Brisa Elétrica",
    world: 4,
    worldName: "Tempestade",
    theme: "storm",
    targetScore: 15,
    speed: 4.2,
    centerGap: 118,
    spawnDistance: 180,
    star1Coins: 6,
    star2Coins: 10,
    star3Coins: 12,
    mechanic: 'wind'
  },
  {
    id: 11,
    name: "Trovão de Neon",
    world: 4,
    worldName: "Tempestade",
    theme: "storm",
    targetScore: 16,
    speed: 4.4,
    centerGap: 115,
    spawnDistance: 175,
    star1Coins: 6,
    star2Coins: 11,
    star3Coins: 13,
    mechanic: 'wind'
  },
  {
    id: 12,
    name: "Centro do Furacão",
    world: 4,
    worldName: "Tempestade",
    theme: "storm",
    targetScore: 18,
    speed: 4.6,
    centerGap: 110,
    spawnDistance: 170,
    star1Coins: 7,
    star2Coins: 11,
    star3Coins: 14,
    mechanic: 'wind'
  }
];

const LEVEL_BY_ID = new Map<number, Level>(LEVELS.map(level => [level.id, level]));

const THEME_GRADIENTS: Record<Level['theme'], SkyGradientInfo> = {
  day: {
    top: '#38bdf8',
    bottom: '#0ea5e9',
    clouds: '#f1f5f9',
    accent: '#bae6fd',
    label: 'Amanhecer Celeste'
  },
  sunset: {
    top: '#ff7e5f',
    bottom: '#feb47b',
    clouds: '#fef3c7',
    accent: '#fde047',
    label: 'Crepúsculo Dourado'
  },
  night: {
    top: '#1e1b4b',
    bottom: '#2e1065',
    clouds: '#cbd5e1',
    accent: '#818cf8',
    label: 'Noite Cósmica'
  },
  storm: {
    top: '#0f172a',
    bottom: '#311042',
    clouds: '#94a3b8',
    accent: '#c084fc',
    label: 'Tempestade Elétrica'
  }
};

const ENDLESS_AGILE_GRADIENT: SkyGradientInfo = {
  top: '#4c1d95',
  bottom: '#2563eb',
  clouds: '#cbd5e1',
  accent: '#e9d5ff',
  label: 'Noite Cósmica'
};

const ENDLESS_MASTER_GRADIENT: SkyGradientInfo = {
  top: '#311042',
  bottom: '#7c107c',
  clouds: '#e2e8f0',
  accent: '#f5d0fe',
  label: 'Sinfonia Violeta'
};

const ENDLESS_LEGEND_GRADIENT: SkyGradientInfo = {
  top: '#0b0f19',
  bottom: '#4f46e5',
  clouds: '#94a3b8',
  accent: '#a5b4fc',
  label: 'Limiar do Espaço'
};

function getSkyGradients(scoreOrTheme: number | Level['theme']): SkyGradientInfo {
  if (typeof scoreOrTheme === 'string') {
    return THEME_GRADIENTS[scoreOrTheme];
  }

  if (scoreOrTheme < 6) return THEME_GRADIENTS.day;
  if (scoreOrTheme < 16) return THEME_GRADIENTS.sunset;
  if (scoreOrTheme < 31) return ENDLESS_AGILE_GRADIENT;
  if (scoreOrTheme < 51) return ENDLESS_MASTER_GRADIENT;
  return ENDLESS_LEGEND_GRADIENT;
}

export default function SkyHopGame() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [coinsCount, setCoinsCount] = useState<number>(0);
  const [isOrientationBlocked, setIsOrientationBlocked] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [windowSize, setWindowSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 480,
    height: typeof window !== 'undefined' ? window.innerHeight : 640,
  });

  // Active level campaign attributes
  const [gameMode, setGameMode] = useState<'endless' | 'campaign'>('campaign');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]);
  const [completedStars, setCompletedStars] = useState<Record<number, number>>({});
  const [levelCoinsCollected, setLevelCoinsCollected] = useState<number>(0);
  const [showMobileHowToPlay, setShowMobileHowToPlay] = useState<boolean>(false);

  // Refs for safe synchronous access inside game loop
  const highScoreRef = useRef<number>(0);
  const gameModeRef = useRef<'endless' | 'campaign'>('campaign');
  const currentLevelIdRef = useRef<number>(1);
  const levelCoinsCollectedRef = useRef<number>(0);

  // Sync refs
  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);
  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);

  useEffect(() => {
    currentLevelIdRef.current = currentLevelId;
  }, [currentLevelId]);

  useEffect(() => {
    levelCoinsCollectedRef.current = levelCoinsCollected;
  }, [levelCoinsCollected]);

  // Refs for animation loop & input handling
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const gameStateRef = useRef<GameState>(GameState.START);
  const scoreRef = useRef<number>(0);

  // Orientation blocked tracking
  const isOrientationBlockedRef = useRef<boolean>(false);
  const previousGameStateRef = useRef<GameState>(GameState.START);

  useEffect(() => {
    let resizeFrame: number | null = null;

    const updateLayout = () => {
      if (typeof window !== 'undefined') {
        const isLandscape = window.innerWidth > window.innerHeight;
        
        // Detect touch devices: touch event support, coarse pointer, or navigator touches
        const isTouch = window.matchMedia('(pointer: coarse)').matches || 
                        ('ontouchstart' in window) || 
                        (navigator.maxTouchPoints > 0);
                        
        // Ensure even the largest tablets (like the iPad Pro 12.9" with 1366x1024 landscape res) are covered
        const isTabletOrMobileSize = window.innerWidth <= 1370 || window.innerHeight <= 1035;
        
        // Only block if on a touch device, in landscape mode, of mobile/tablet dimensions
        const shouldBlock = isLandscape && isTouch && isTabletOrMobileSize;
        
        if (shouldBlock) {
          if (!isOrientationBlockedRef.current) {
            // First transition into blocked state: capture prior state
            previousGameStateRef.current = gameStateRef.current;
            if (gameStateRef.current === GameState.PLAYING) {
              setGameState(GameState.PAUSED);
            }
          }
          setIsOrientationBlocked(true);
          isOrientationBlockedRef.current = true;
        } else {
          if (isOrientationBlockedRef.current) {
            // Resuming from blocked state: restore prior state safely
            const targetState = previousGameStateRef.current;
            if (targetState === GameState.PLAYING) {
              // Return in a safe PAUSED state so player doesn't immediately crash
              setGameState(GameState.PAUSED);
            } else {
              setGameState(targetState);
            }
          }
          setIsOrientationBlocked(false);
          isOrientationBlockedRef.current = false;
        }

        setWindowSize(prev => (
          prev.width === window.innerWidth && prev.height === window.innerHeight
            ? prev
          : { width: window.innerWidth, height: window.innerHeight }
        ));
      }
    };

    const handleResize = () => {
      if (resizeFrame !== null) {
        cancelAnimationFrame(resizeFrame);
      }
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = null;
        updateLayout();
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    updateLayout();

    return () => {
      if (resizeFrame !== null) {
        cancelAnimationFrame(resizeFrame);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  
  // Physics & Game entities (stored in refs to avoid React re-render lag)
  const birdRef = useRef<Bird>({
    y: V_HEIGHT / 2,
    vy: 0,
    radius: 17, // Collision radius
    targetAngle: 0,
    currentAngle: 0,
    wingFrame: 0,
    wingTimer: 0,
  });
  
  const obstaclesRef = useRef<Obstacle[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  // Game Loop physics variables
  const gravity = 0.32;
  const jumpForce = -6.2;
  const maxFallSpeed = 9.0;
  
  // Track continuous frame count for rendering details
  const tickerRef = useRef<number>(0);

  // Sync state with refs for fast access in animation loop and play corresponding sound effects
  useEffect(() => {
    gameStateRef.current = gameState;
    if (gameState === GameState.GAMEOVER) {
      playGameOverSound();
    } else if (gameState === GameState.VICTORY) {
      playVictorySound();
    }
  }, [gameState]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Load high scores and coin collections
  useEffect(() => {
    // Score counters and coins are kept in memory for the current session, clean on entry
    setHighScore(0);
    setCoinsCount(0);

    const savedUnlocked = localStorage.getItem('skyhop_campaign_unlocked');
    if (savedUnlocked) {
      try {
        setUnlockedLevels(JSON.parse(savedUnlocked));
      } catch (e) {
        setUnlockedLevels([1]);
      }
    }

    const savedStars = localStorage.getItem('skyhop_campaign_stars');
    if (savedStars) {
      try {
        setCompletedStars(JSON.parse(savedStars));
      } catch (e) {
        setCompletedStars({});
      }
    }

    setSoundEnabledState(getSoundEnabled());
    
    // Seed initial clouds
    const initialClouds: Cloud[] = [];
    for (let i = 0; i < 5; i++) {
      initialClouds.push({
        x: Math.random() * V_WIDTH,
        y: Math.random() * (V_HEIGHT * 0.4) + 20,
        size: Math.random() * 40 + 30,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.4 + 0.2,
      });
    }
    cloudsRef.current = initialClouds;
  }, []);

  // Helper to trigger confetti or star burst on scoring
  const spawnScoreStars = (x: number, y: number) => {
    // Sparkle ring
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = Math.random() * 2 + 3;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 4 + 3,
        color: `hsl(${Math.random() * 40 + 45}, 100%, 60%)`, // Golden star colors
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 20 + 20,
        type: 'sparkle',
      });
    }
    
    // Floating text indicator
    particlesRef.current.push({
      x: birdRef.current.radius * 2,
      y: birdRef.current.y - birdRef.current.radius * 2,
      vx: 0,
      vy: -1.2,
      radius: 0,
      color: '#fbbf24',
      alpha: 1,
      life: 0,
      maxLife: 35,
      type: 'score',
      text: '+1'
    });
  };

  // Helper to spawn wings/feathers dust on jumping
  const spawnJumpDust = (x: number, y: number) => {
    const count = 4;
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: x - 5,
        y: y + 2,
        vx: -Math.random() * 1.5 - 0.5,
        vy: Math.random() * 2 - 1,
        radius: Math.random() * 3 + 2,
        color: '#f8fafc', // Soft white feathers
        alpha: 0.8,
        life: 0,
        maxLife: Math.random() * 15 + 15,
        type: 'feather',
      });
    }
  };

  // Trigger Bird Jump
  const handleJump = (e?: React.MouseEvent | React.TouchEvent | KeyboardEvent) => {
    if (isOrientationBlocked) return;
    if (e) {
      // Prevent browser default behaviors
      if (e.type === 'keydown') {
        const keyEvent = e as KeyboardEvent;
        // Ignore space when typing or focusing buttons
        if (keyEvent.code !== 'Space') return;
        keyEvent.preventDefault();
      } else {
        e.preventDefault();
      }
    }

    if (gameStateRef.current === GameState.START) {
      initAudio();
      setGameState(GameState.PLAYING);
      birdRef.current.vy = jumpForce;
      spawnJumpDust(60 + birdRef.current.radius, birdRef.current.y);
      playFlapSound();
    } else if (gameStateRef.current === GameState.PLAYING) {
      birdRef.current.vy = jumpForce;
      birdRef.current.targetAngle = -0.4; // Tilt upwards
      spawnJumpDust(60 + birdRef.current.radius, birdRef.current.y);
      playFlapSound();
    } else if (gameStateRef.current === GameState.GAMEOVER) {
      initAudio();
      // Allow keyboard spaces to restart readily
      resetGame();
    }
  };

  // Dedicated Unified Pointer Down handler to prevent multiple triggers
  const handleContainerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isOrientationBlocked) return;
    // If the click happened on menu content or overlay button, bypass jump
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('#hud-pause-btn') || 
      target.closest('#start-menu-overlay-panel') || 
      target.closest('#gameover-menu-overlay-panel') || 
      target.closest('#paused-menu-overlay-panel')
    ) {
      return; 
    }
    
    e.preventDefault();
    handleJump();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOrientationBlocked) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleJump(e);
      } else if (e.code === 'KeyP' || e.code === 'Keyp') {
        e.preventDefault();
        togglePause();
      } else if (e.code === 'KeyD' || e.code === 'Keyd') {
        e.preventDefault();
        const allUnlocked = Array.from({ length: 12 }, (_, i) => i + 1);
        setUnlockedLevels(allUnlocked);
        localStorage.setItem('skyhop_campaign_unlocked', JSON.stringify(allUnlocked));
        
        // Spawn quick points confetti
        particlesRef.current.push({
          x: V_WIDTH / 2,
          y: V_HEIGHT / 2,
          vx: 0,
          vy: -1.2,
          radius: 0,
          color: '#10b981',
          alpha: 1,
          life: 0,
          maxLife: 35,
          type: 'score',
          text: 'DEBUG UNLOCKED!'
        });
      } else if (e.code === 'Enter') {
        e.preventDefault();
        if (gameStateRef.current === GameState.GAMEOVER) {
          resetGame();
        } else if (gameStateRef.current === GameState.START) {
          setGameState(GameState.PLAYING);
          resetGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOrientationBlocked]);

  const togglePause = () => {
    if (gameStateRef.current === GameState.PLAYING) {
      setGameState(GameState.PAUSED);
    } else if (gameStateRef.current === GameState.PAUSED) {
      setGameState(GameState.PLAYING);
    }
  };

  // Reset Game entities and state
  const resetGame = () => {
    birdRef.current = {
      y: V_HEIGHT / 2,
      vy: 0,
      radius: 17,
      targetAngle: 0,
      currentAngle: 0,
      wingFrame: 0,
      wingTimer: 0,
    };
    obstaclesRef.current = [];
    particlesRef.current = [];
    levelCoinsCollectedRef.current = 0;
    setLevelCoinsCollected(0);
    setScore(0);
    setCoinsCount(0);
    setGameState(GameState.PLAYING);
  };


  // Engine loop using requestAnimationFrame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastFrameTime: number | null = null;
    let cachedSkyKey = '';
    let cachedSkyGradient: CanvasGradient | null = null;
    let cachedSunAccent = '';
    let cachedSunGradient: CanvasGradient | null = null;

    const endWithGameOver = () => {
      if (gameStateRef.current === GameState.GAMEOVER) return;
      gameStateRef.current = GameState.GAMEOVER;
      setGameState(GameState.GAMEOVER);
      triggerGameOver();
    };

    const completeLevelRun = () => {
      if (gameStateRef.current === GameState.VICTORY) return;
      gameStateRef.current = GameState.VICTORY;
      setGameState(GameState.VICTORY);
    };

    const gameLoop = (timestamp: number) => {
      const rawDeltaMs = lastFrameTime === null ? TARGET_FRAME_MS : timestamp - lastFrameTime;
      lastFrameTime = timestamp;
      const deltaScale = Math.min(MAX_DELTA_SCALE, Math.max(0.25, rawDeltaMs / TARGET_FRAME_MS));
      const isBlocked = isOrientationBlockedRef.current;
      const particles = particlesRef.current;
      if (!isBlocked) {
        tickerRef.current += deltaScale;
      }
      const state = gameStateRef.current;
      const currentScore = scoreRef.current;
      const activeLevel = gameModeRef.current === 'campaign'
        ? LEVEL_BY_ID.get(currentLevelIdRef.current)
        : undefined;

      // 1. CHRONOS UPDATES (Physics & Movement)
      if (!isBlocked) {
        // Update Background Clouds (Even when paused or start screen to maintain aesthetic flow!)
        const clouds = cloudsRef.current;
        for (let i = 0; i < clouds.length; i++) {
          const cloud = clouds[i];
          cloud.x -= cloud.speed * deltaScale;
          if (cloud.x + cloud.size < 0) {
            cloud.x = V_WIDTH + Math.random() * 50;
            cloud.y = Math.random() * (V_HEIGHT * 0.4) + 20;
            cloud.size = Math.random() * 40 + 30;
            cloud.speed = Math.random() * 0.3 + 0.1;
          }
        }

        if (state === GameState.START) {
          // Idle bobbing bird animation using Sine wave
          birdRef.current.y = V_HEIGHT / 2 + Math.sin(tickerRef.current * 0.08) * 15;
          birdRef.current.currentAngle = Math.sin(tickerRef.current * 0.05) * 0.15;
          birdRef.current.wingTimer += deltaScale;
          if (birdRef.current.wingTimer > 6) {
            birdRef.current.wingFrame = (birdRef.current.wingFrame + 1) % 4;
            birdRef.current.wingTimer = 0;
          }
        }

        if (state === GameState.PLAYING) {
          // Apply Bird Gravity
          const bird = birdRef.current;
          bird.vy += gravity * deltaScale;
          if (bird.vy > maxFallSpeed) bird.vy = maxFallSpeed;
          bird.y += bird.vy * deltaScale;

          // Wing flapping frequency increases in proportion to jump/gravity changes
          bird.wingTimer += deltaScale;
          const speedFactor = bird.vy < 0 ? 3 : 7; // Flap faster climbing up
          if (bird.wingTimer > speedFactor) {
            bird.wingFrame = (bird.wingFrame + 1) % 4;
            bird.wingTimer = 0;
          }

          // Adjust Tilt Angle smoothly based on vertical velocity
          bird.targetAngle = Math.min(Math.max(bird.vy * 0.08, -0.4), 0.7);
          bird.currentAngle += (bird.targetAngle - bird.currentAngle) * Math.min(1, 0.12 * deltaScale);

          // Top or bottom borders collision check
          if (bird.y - bird.radius < 0) {
            // Ceil collision - trigger game over
            endWithGameOver();
            requestRef.current = requestAnimationFrame(gameLoop);
            return;
          } else if (bird.y + bird.radius > V_HEIGHT - 35) { // 35px ground buffer
            bird.y = V_HEIGHT - 35 - bird.radius;
            endWithGameOver();
            requestRef.current = requestAnimationFrame(gameLoop);
            return;
          }

          // Difficulty variables scaled harmoniously by score thresholds or levels
          let currentSpeed = 2.4;
          let currentGap = 150;
          let obstacleSpawnDistance = 220;

          if (gameModeRef.current === 'campaign' && activeLevel) {
            currentSpeed = activeLevel.speed;
            currentGap = activeLevel.centerGap;
            obstacleSpawnDistance = activeLevel.spawnDistance;
          } else {
            if (currentScore >= 51) {
              currentSpeed = 4.3;
              currentGap = 118;
              obstacleSpawnDistance = 175;
            } else if (currentScore >= 31) {
              currentSpeed = 3.8;
              currentGap = 126;
              obstacleSpawnDistance = 185;
            } else if (currentScore >= 16) {
              currentSpeed = 3.3;
              currentGap = 135;
              obstacleSpawnDistance = 195;
            } else if (currentScore >= 6) {
              currentSpeed = 2.8;
              currentGap = 142;
              obstacleSpawnDistance = 210;
            } else {
              currentSpeed = 2.4;
              currentGap = 150;
              obstacleSpawnDistance = 220;
            }
          }

          // Wind draft trail generator for Sturm level
          if (gameModeRef.current === 'campaign' && activeLevel?.mechanic === 'wind' && Math.random() < 0.12 * deltaScale) {
            particlesRef.current.push({
              x: V_WIDTH + 10,
              y: Math.random() * V_HEIGHT,
              vx: -Math.random() * 4 - 4, // blows left
              vy: (Math.random() - 0.5) * 0.4,
              radius: Math.random() * 1.5 + 0.5,
              color: 'rgba(255, 255, 255, 0.45)',
              alpha: 0.6,
              life: 0,
              maxLife: 65,
              type: 'feather'
            });
          }

          // Manage Obstacles
          const obstacles = obstaclesRef.current;
          
          // Spawn standard distance-based obstacles
          let shouldSpawn = false;
          if (obstacles.length === 0) {
            shouldSpawn = true;
          } else {
            const lastObstacle = obstacles[obstacles.length - 1];
            if (lastObstacle.x < V_WIDTH - obstacleSpawnDistance) {
              shouldSpawn = true;
            }
          }

          if (shouldSpawn) {
            const minHeight = 60;
            const maxHeight = V_HEIGHT - currentGap - 100;
            const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
            const bottomHeight = V_HEIGHT - currentGap - topHeight - 35; // ground factor
            const hasVerticalMotion = gameModeRef.current === 'campaign' && (activeLevel?.mechanic === 'moving' || activeLevel?.mechanic === 'wind');
            const waveSpeed = activeLevel?.mechanic === 'wind' ? WIND_OBSTACLE_WAVE_SPEED : MOVING_OBSTACLE_WAVE_SPEED;

            // 70% probability of a coin spawning perfectly inside the gap of the obstacles
            const hasCoin = Math.random() < 0.70;
            const coin = hasCoin ? {
              y: topHeight + currentGap / 2,
              collected: false,
              radius: 10,
            } : undefined;

            obstacles.push({
              x: V_WIDTH,
              width: 60,
              topHeight,
              bottomHeight,
              passed: false,
              speed: currentSpeed,
              centerGap: currentGap,
              coin,
              originalTopHeight: topHeight, // Preserve original for moving oscillation math
              wavePhase: hasVerticalMotion ? -tickerRef.current * waveSpeed : 0,
            });
          }

          // Move Obstacles and check collisions
          for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            obs.x -= obs.speed * deltaScale;

            // Handle vertical moving gap oscillation if mechanic is moving or wind!
            if (gameModeRef.current === 'campaign' && activeLevel && (activeLevel.mechanic === 'moving' || activeLevel.mechanic === 'wind')) {
              if (obs.originalTopHeight === undefined) {
                obs.originalTopHeight = obs.topHeight;
              }

              const origHeight = obs.originalTopHeight;
              const speedMultiplier = activeLevel.mechanic === 'wind' ? WIND_OBSTACLE_WAVE_SPEED : MOVING_OBSTACLE_WAVE_SPEED;
              const amplitude = activeLevel.mechanic === 'wind' ? WIND_OBSTACLE_AMPLITUDE : MOVING_OBSTACLE_AMPLITUDE;

              if (obs.wavePhase === undefined) {
                const currentOffset = Math.max(-amplitude, Math.min(amplitude, obs.topHeight - origHeight));
                obs.wavePhase = Math.asin(currentOffset / amplitude) - tickerRef.current * speedMultiplier;
              }

              const oscillation = Math.sin(tickerRef.current * speedMultiplier + obs.wavePhase) * amplitude;
              
              obs.topHeight = Math.max(40, Math.min(V_HEIGHT - obs.centerGap - 80, origHeight + oscillation));
              obs.bottomHeight = V_HEIGHT - obs.centerGap - obs.topHeight - 35;
              
              // Also update coin position to float perfectly in the center of the moving gap!
              if (obs.coin) {
                obs.coin.y = obs.topHeight + obs.centerGap / 2;
              }
            }

            // Remove off-screen obstacles
            if (obs.x + obs.width < 0) {
              obstacles.splice(i, 1);
              continue;
            }

            // Check passing (Increment score!)
            if (!obs.passed && obs.x + obs.width / 2 < 60) {
              obs.passed = true;
              const newScore = scoreRef.current + 1;
              scoreRef.current = newScore;
              setScore(newScore);
              
              // Spawn dynamic point sparkles
              spawnScoreStars(obs.x + obs.width / 2, obs.topHeight + obs.centerGap / 2);

              // Check if Level goal is complete!
              if (gameModeRef.current === 'campaign' && activeLevel && newScore >= activeLevel.targetScore) {
                completeLevelRun();
                
                // Evaluate stars
                const collectedInRun = levelCoinsCollectedRef.current;
                let earnedStars = 0;
                if (collectedInRun >= activeLevel.star3Coins) earnedStars = 3;
                else if (collectedInRun >= activeLevel.star2Coins) earnedStars = 2;
                else if (collectedInRun >= activeLevel.star1Coins) earnedStars = 1;
                else earnedStars = 0;

                setCompletedStars(prev => {
                  const updatedResult = { ...prev, [activeLevel.id]: Math.max(prev[activeLevel.id] || 0, earnedStars) };
                  localStorage.setItem('skyhop_campaign_stars', JSON.stringify(updatedResult));
                  return updatedResult;
                });

                if (activeLevel.id < 12) {
                  const nextId = activeLevel.id + 1;
                  setUnlockedLevels(prev => {
                    if (!prev.includes(nextId)) {
                      const updatedResult = [...prev, nextId];
                      localStorage.setItem('skyhop_campaign_unlocked', JSON.stringify(updatedResult));
                      return updatedResult;
                    }
                    return prev;
                  });
                }
                requestRef.current = requestAnimationFrame(gameLoop);
                return;
              }
            }

            // Coin collection detection
            if (obs.coin && !obs.coin.collected) {
              const coinX = obs.x + obs.width / 2;
              const coinY = obs.coin.y;
              
              const dx = 60 - coinX;
              const dy = bird.y - coinY;
              const rSum = bird.radius + obs.coin.radius;
              
              if (dx * dx + dy * dy < rSum * rSum) {
                obs.coin.collected = true;
                playCoinSound();
                
                // Increment coins count safely
                setCoinsCount(prev => prev + 1);

                // Track run level score
                if (gameModeRef.current === 'campaign') {
                  levelCoinsCollectedRef.current += 1;
                  setLevelCoinsCollected(levelCoinsCollectedRef.current);
                }

                // Play gold sparkles
                for (let c = 0; c < 8; c++) {
                  const angle = Math.random() * Math.PI * 2;
                  const speed = Math.random() * 1.5 + 2;
                  particlesRef.current.push({
                    x: coinX,
                    y: coinY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius: Math.random() * 2 + 2.5,
                    color: '#fbbf24', // Yellow gold
                    alpha: 1,
                    life: 0,
                    maxLife: 20,
                    type: 'sparkle',
                  });
                }

                // Show quick +💰 coin popup
                particlesRef.current.push({
                  x: coinX,
                  y: coinY - 15,
                  vx: 0,
                  vy: -1.4,
                  radius: 0,
                  color: '#facc15',
                  alpha: 1,
                  life: 0,
                  maxLife: 28,
                  type: 'score',
                  text: '+💰'
                });
              }
            }

            // Precise hitbox testing (Circle vs AABB boxes)
            // To make user experience spectacular and fair, we shrink collision radius down by 15%
            const hitRadius = bird.radius * 0.85;
            const birdX = 60;
            
            // Collision with Top Pillar
            const inXRange = birdX + hitRadius > obs.x && birdX - hitRadius < obs.x + obs.width;
            const hitTop = inXRange && bird.y - hitRadius < obs.topHeight;
            // Collision with Bottom Pillar
            const hitBottom = inXRange && bird.y + hitRadius > V_HEIGHT - obs.bottomHeight - 35;

            if (hitTop || hitBottom) {
              // Trigger crash visual shockwave
              for (let p = 0; p < 18; p++) {
                particlesRef.current.push({
                  x: birdX,
                  y: bird.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  radius: Math.random() * 5 + 2,
                  color: '#ef4444', // Red fire burst
                  alpha: 1,
                  life: 0,
                  maxLife: 30,
                  type: 'ring'
                });
              }

              endWithGameOver();
              requestRef.current = requestAnimationFrame(gameLoop);
              return;
            }
          }
        }

        // Update Particles life & move
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life += deltaScale;
          
          if (p.life >= p.maxLife) {
            particles.splice(i, 1);
            continue;
          }

          p.x += p.vx * deltaScale;
          p.y += p.vy * deltaScale;
          
          // Custom physics actions per particle type
          if (p.type === 'feather') {
            p.vy += 0.05 * deltaScale; // float downwards slightly
          }
          
          p.alpha = 1 - (p.life / p.maxLife);
        }
      }

      // 2. RENDER PIPELINE (No drawing lag, HTML5 2D contexts)
      ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

      // A. Sky Gradient Background
      const levelTheme = gameModeRef.current === 'campaign' 
        ? (activeLevel?.theme ?? 'day')
        : currentScore;
      const grads = getSkyGradients(levelTheme);
      const skyKey = `${grads.top}:${grads.bottom}`;
      if (cachedSkyKey !== skyKey || !cachedSkyGradient) {
        cachedSkyGradient = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
        cachedSkyGradient.addColorStop(0, grads.top);
        cachedSkyGradient.addColorStop(1, grads.bottom);
        cachedSkyKey = skyKey;
      }
      ctx.fillStyle = cachedSkyGradient;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

      // B. Sun / Celestial sphere accent
      ctx.beginPath();
      ctx.arc(V_WIDTH - 80, 80, 45, 0, Math.PI * 2);
      if (cachedSunAccent !== grads.accent || !cachedSunGradient) {
        cachedSunGradient = ctx.createRadialGradient(V_WIDTH - 80, 80, 5, V_WIDTH - 80, 80, 45);
        cachedSunGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        cachedSunGradient.addColorStop(0.3, grads.accent + '66');
        cachedSunGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        cachedSunAccent = grads.accent;
      }
      ctx.fillStyle = cachedSunGradient;
      ctx.fill();

      // C. Render Clouds
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < cloudsRef.current.length; i++) {
        const cloud = cloudsRef.current[i];
        ctx.globalAlpha = cloud.opacity;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.5, cloud.y - cloud.size * 0.25, cloud.size * 0.8, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size, cloud.y, cloud.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // D. Draw Obstacles (Pillars with styling and caps)
      for (let i = 0; i < obstaclesRef.current.length; i++) {
        const obs = obstaclesRef.current[i];
        // 1. Top Obstacle Rect
        const pipeGrad = ctx.createLinearGradient(obs.x, 0, obs.x + obs.width, 0);
        pipeGrad.addColorStop(0, PIPE_HIGHLIGHT);
        pipeGrad.addColorStop(0.25, PIPE_COLOR);
        pipeGrad.addColorStop(0.8, PIPE_SHADE);
        
        ctx.fillStyle = pipeGrad;
        ctx.fillRect(obs.x, 0, obs.width, obs.topHeight - 14);

        // Rounded glowing header Cap for Top Pillar
        ctx.fillStyle = pipeGrad;
        ctx.beginPath();
        ctx.roundRect(obs.x - 3, obs.topHeight - 14, obs.width + 6, 14, 4);
        ctx.fill();
        ctx.strokeStyle = '#022c22';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 2. Bottom Obstacle Rect (Height offsets standard ground height 35)
        const botY = V_HEIGHT - obs.bottomHeight - 35;
        const botHeightActual = obs.bottomHeight;
        
        ctx.fillStyle = pipeGrad;
        ctx.fillRect(obs.x, botY + 14, obs.width, botHeightActual - 14);

        // Header Cap for Bottom Pillar
        ctx.fillStyle = pipeGrad;
        ctx.beginPath();
        ctx.roundRect(obs.x - 3, botY, obs.width + 6, 14, 4);
        ctx.fill();
        ctx.stroke();

        // 3. Draw Coin if present
        if (obs.coin && !obs.coin.collected) {
          const coinX = obs.x + obs.width / 2;
          ctx.save();
          ctx.translate(coinX, obs.coin.y);
          
          // Outer Gold Glow effect on Canvas
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 10;

          // Spin scaling animation using Sine
          const renderScale = Math.abs(Math.sin(tickerRef.current * 0.08));
          ctx.scale(renderScale, 1.0);

          // Golden circle
          ctx.beginPath();
          ctx.arc(0, 0, obs.coin.radius, 0, Math.PI * 2);
          const coinGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, obs.coin.radius);
          coinGrad.addColorStop(0, '#fffbeb');
          coinGrad.addColorStop(0.4, '#facc15');
          coinGrad.addColorStop(1, '#ca8a04');
          ctx.fillStyle = coinGrad;
          ctx.fill();
          
          // Copper board outline
          ctx.strokeStyle = '#854d0e';
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // Symmetrically shiny star light
          ctx.beginPath();
          ctx.arc(0, 0, obs.coin.radius * 0.4, 0, Math.PI * 2);
          ctx.strokeStyle = '#854d0e';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.restore();
        }
      }

      // E. Draw General Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.save();
        ctx.globalAlpha = p.alpha;
        
        if (p.type === 'feather') {
          // Draw floating feather shape
          ctx.translate(p.x, p.y);
          ctx.rotate(p.life * 0.05);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius * 2, p.radius * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'sparkle') {
          // Draw dazzling stars
          ctx.translate(p.x, p.y);
          ctx.rotate(tickerRef.current * 0.1);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'ring') {
          // Expanding burst rings
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.life * 1.5, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.type === 'score' && p.text) {
          // Popups
          ctx.fillStyle = p.color;
          ctx.font = 'bold 22px "Inter", sans-serif';
          ctx.shadowColor = 'rgba(0,0,0,0.4)';
          ctx.shadowBlur = 4;
          ctx.fillText(p.text, p.x, p.y);
        }
        
        ctx.restore();
      }

      // F. Draw Sky-Ground Floor & Top Limit Lines
      // Render ground parallax details
      const groundY = V_HEIGHT - 35;
      ctx.fillStyle = '#1e293b'; // Nice solid dark slate blue ground (no dark gradient)
      ctx.fillRect(0, groundY, V_WIDTH, 35);

      // Render glowing green moss/grass top layer
      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, groundY, V_WIDTH, 5);

      // G. Draw Flappy Bird (Our mascot: "Hop")
      const bird = birdRef.current;
      ctx.save();
      ctx.translate(60, bird.y); // Set Bird standard horizontal index to 60px
      ctx.rotate(bird.currentAngle);

      // Body Glow / Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      // 1. Cute Yellowish-Orange Round Mascot Body
      const bodyGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, bird.radius);
      bodyGrad.addColorStop(0, '#fef08a'); // luminous sunny yellow
      bodyGrad.addColorStop(0.8, '#f59e0b'); // gold orange base
      bodyGrad.addColorStop(1, '#d97706'); // warm brown shadows
      
      ctx.beginPath();
      ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Clear shadows for secondary elements
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // 2. Large Animated Fluttering Wing
      // Wing size and angle cycles based on wing wings frame index to give natural feather flutter!
      const wingFrameOffsetY = WING_OFFSETS_Y[bird.wingFrame];
      const wingGrad = ctx.createLinearGradient(-16, -4 + wingFrameOffsetY, 0, 4 + wingFrameOffsetY);
      wingGrad.addColorStop(0, '#fef08a');
      wingGrad.addColorStop(1, '#ea580c');

      ctx.save();
      ctx.translate(-5, 0 + wingFrameOffsetY);
      // Wing flaps angle
      const wingAngle = bird.vy < 0 ? -0.5 : 0.2;
      ctx.rotate(wingAngle);
      ctx.fillStyle = wingGrad;
      ctx.beginPath();
      ctx.ellipse(-6, 0, 10, 7, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 3. Orange Beak
      const beakGrad = ctx.createLinearGradient(12, -4, 22, 2);
      beakGrad.addColorStop(0, '#f97316');
      beakGrad.addColorStop(1, '#ea580c');
      ctx.fillStyle = beakGrad;
      ctx.beginPath();
      ctx.moveTo(bird.radius - 3, -4);
      ctx.lineTo(bird.radius + 8, 1);
      ctx.lineTo(bird.radius - 3, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4. BIG Round Expressive Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(6, -5, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pupil with shiny light highlight
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(7, -5, 3.0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(8.2, -6.2, 1.0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Loop request
      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const triggerGameOver = () => {
    // Check if score overrides Session High Score and store in memory
    const finalScore = scoreRef.current;
    if (finalScore > highScoreRef.current) {
      setHighScore(finalScore);
    }
  };

  // Dynamic scaling and responsive layout calculation
  const isDesktop = windowSize.width >= 1024; // Alignment with standard desktop breakpoint (>= 1024px, e.g. lg)
  const isMobilePortrait = !isDesktop && windowSize.width <= 480 && windowSize.height > windowSize.width;
  const isTabletPortrait = !isDesktop && windowSize.width > 480 && windowSize.height > windowSize.width;
  const isVeryShortPortrait = !isDesktop && windowSize.height <= 430 && windowSize.height > windowSize.width;
  const isVeryShortLandscape = !isDesktop && windowSize.height <= 430 && windowSize.width > windowSize.height;

  // Let's compute safety height budget for mobile portrait dynamically to maintain responsiveness without scroll
  const mobilePortraitPaddingTop = isMobilePortrait ? (isVeryShortPortrait ? 4 : Math.max(20, Math.min(36, windowSize.height * 0.04))) : 0;
  const mobilePortraitGap = isMobilePortrait ? (isVeryShortPortrait ? 4 : Math.max(14, Math.min(26, windowSize.height * 0.03))) : 0;

  // Let's compute safety height budget for tablet portrait dynamically to maintain breathing room and prevent scroll
  const tabletPortraitPaddingTop = isTabletPortrait ? Math.max(24, Math.min(44, windowSize.height * 0.05)) : 0;
  const tabletPortraitGap = isTabletPortrait ? Math.max(16, Math.min(32, windowSize.height * 0.04)) : 0;

  const titleHeightBudget = isDesktop 
    ? 0 
    : isMobilePortrait
      ? (isVeryShortPortrait ? 0 : (mobilePortraitPaddingTop + 32 + mobilePortraitGap))
      : isTabletPortrait
        ? (tabletPortraitPaddingTop + 36 + tabletPortraitGap)
        : (windowSize.height < 520 ? 32 : (windowSize.height < 620 ? 44 : 56));

  const containerHeightSafety = isDesktop 
    ? 36 
    : isMobilePortrait
      ? (isVeryShortPortrait ? 8 : 16)
      : isTabletPortrait
        ? 24
        : (windowSize.height < 520 ? 8 : 14); 

  const availableContentHeight = windowSize.height - titleHeightBudget - containerHeightSafety;
  
  // Cap max-width at 650px on desktop (allowing the game board to be significantly more imposing), and 390px on mobile/tablets.
  const maxWidthCap = isDesktop ? 650 : 390;
  // Aspect ratio is 3:4. Thus, maxWidth = availableContentHeight * 0.75;
  const computedMaxWidth = Math.max(260, Math.min(maxWidthCap, availableContentHeight * 0.75));
  const isCompact = computedMaxWidth < 340;

  const activeLevelForUi = LEVEL_BY_ID.get(currentLevelId);
  const currentRankInfo = getRank(score);

  return (
    <div className="relative flex flex-col lg:flex-row items-center justify-start lg:justify-between h-full min-h-0 w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 lg:px-12 xl:px-20 py-2 select-none overflow-hidden gap-6 lg:gap-14 pt-1 sm:pt-2 lg:pt-0">
      
      {/* 4. OVERLAID BLOCKED SCREEN FOR LANDSCAPE TOUCH DEVICES */}
      {isOrientationBlocked && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-center items-center px-6 text-center select-none animate-fade-in text-white">
          <div className={`relative rounded-3xl bg-slate-900 border-2 border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.15)] w-full mx-auto flex flex-col items-center ${
            isVeryShortLandscape ? 'p-4 gap-3 max-w-xs' : 'p-8 gap-6 max-w-sm'
          }`}>
            
            {/* Visual Rotating Smartphone Icon */}
            <div className={`relative flex items-center justify-center ${isVeryShortLandscape ? 'w-14 h-14' : 'w-20 h-20'}`}>
              <div className="absolute inset-0 rounded-full bg-yellow-500/10 animate-ping"></div>
              <div className="relative text-yellow-500 animate-[spin_4s_ease-in-out_infinite]">
                <Smartphone size={isVeryShortLandscape ? 32 : 46} className="transform rotate-0" />
              </div>
            </div>

            <div className={isVeryShortLandscape ? 'space-y-1.5' : 'space-y-3'}>
              <h2 className={`${isVeryShortLandscape ? 'text-lg' : 'text-2xl'} font-black tracking-tight flex items-center justify-center gap-2`}>
                <span>Gire seu dispositivo</span>
              </h2>
              <p className={`text-slate-200 font-semibold max-w-[280px] leading-relaxed mx-auto ${isVeryShortLandscape ? 'text-[11px]' : 'text-xs sm:text-sm'}`}>
                Este jogo foi pensado para uma experiência mais fluida no modo vertical.
              </p>
              <p className={`text-slate-400 font-medium max-w-[260px] leading-relaxed mx-auto ${isVeryShortLandscape ? 'text-[10px]' : 'text-[11px]'}`}>
                Volte para a posição vertical para continuar jogando.
              </p>
            </div>

            {/* Aesthetic layout helper lines */}
            <div className={`w-full bg-slate-950/60 rounded-xl border border-white/5 text-teal-400 font-bold uppercase tracking-wider ${isVeryShortLandscape ? 'p-2 text-[9px]' : 'p-3.5 text-[10px]'}`}>
              📱 Otimizado para telas verticais
            </div>
          </div>
        </div>
      )}
      
      {/* COLUMN 1: DESKTOP SIDEBAR PANEL (LIGHT THEME ADAPTED AND HIGH CONTRAST) */}
      <div className="hidden lg:flex flex-col items-start gap-5 max-w-[325px] w-full text-left text-slate-850 select-none self-center flex-shrink-0 animate-fade-in">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight flex items-center gap-2 drop-shadow-md text-slate-800 leading-none">
            <span className="text-blue-500">Sky</span>
            <span className="text-yellow-500 relative flex items-center">
              Hop
              <span className="absolute -top-1 -right-4 inline-flex h-2.5 w-3 rounded-full bg-orange-400 animate-ping"></span>
            </span>
          </h1>
          <p className="text-slate-650 text-sm font-semibold leading-relaxed mt-3 max-w-[290px]">
             Voe alto pelos céus, desvie dos obstáculos e domine o ritmo do voo.
          </p>
        </div>

        {/* Detailed Keyboard/Manual help guide */}
        <div className="w-full bg-white/90 backdrop-blur-md border border-slate-200 p-5 rounded-2xl shadow-md flex flex-col gap-3">
          <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Gamepad2 size={14} className="text-blue-500 animate-pulse" />
            <span>Como jogar</span>
          </h3>
          <ul className="space-y-2.5 text-slate-600 text-xs font-medium font-sans">
            <li className="flex items-start gap-1.5 leading-snug">
              <span className="text-blue-500 font-bold mt-0.5">•</span>
              <span>Pressione <strong className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[10px] border border-slate-200">Espaço</strong> ou clique para subir.</span>
            </li>
            <li className="flex items-start gap-1.5 leading-snug">
              <span className="text-blue-500 font-bold mt-0.5">•</span>
              <span>Pressione <strong className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[10px] border border-slate-200">P</strong> para pausar o voo.</span>
            </li>
            <li className="flex items-start gap-1.5 leading-snug">
              <span className="text-blue-500 font-bold mt-0.5">•</span>
              <span>Desvie dos obstáculos e tente alcançar a melhor pontuação.</span>
            </li>
          </ul>
        </div>

        {/* Co-aligned Sound Configuration in full width as record card was removed */}
        <div className="w-full">
          <button
            onClick={() => {
              const nextEnabled = !soundEnabled;
              setSoundEnabledState(nextEnabled);
              setSoundEnabled(nextEnabled);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 transition text-slate-700 hover:text-slate-900 flex items-center justify-center gap-2 text-xs font-black cursor-pointer shadow-sm active:scale-95 text-center"
          >
            {soundEnabled ? <Volume2 size={14} className="text-blue-500" /> : <VolumeX size={14} className="text-slate-400" />}
            <span>Som: {soundEnabled ? 'Ativado' : 'Desativado'}</span>
          </button>
        </div>
      </div>

      {/* COLUMN 2: VERTICAL CONTAINER FOR MOBILE LOGO & CANVAS WINDOW */}
      <div 
        className="flex flex-col items-center justify-start lg:justify-center flex-shrink-0 min-h-0 w-full lg:w-auto"
        style={isMobilePortrait ? {
          paddingTop: `${mobilePortraitPaddingTop}px`,
          gap: `${mobilePortraitGap}px`
        } : isTabletPortrait ? {
          paddingTop: `${tabletPortraitPaddingTop}px`,
          gap: `${tabletPortraitGap}px`
        } : undefined}
      >
        
        {/* Mobile/Tablet vertical title header - only below 'lg' wide layout */}
        <div className={`lg:hidden text-center flex-shrink-0 select-none ${isVeryShortPortrait ? 'hidden' : ''} ${(isMobilePortrait || isTabletPortrait) ? 'mt-0 mb-0' : 'mt-0 mb-1'}`}>
          <h1 className={`${isCompact ? 'text-[22px]' : 'text-3xl sm:text-4xl'} font-black tracking-tight flex items-center justify-center gap-2 drop-shadow-md text-slate-800`}>
            <span className="text-blue-500">Sky</span>
            <span className="text-yellow-500 relative flex items-center">
              Hop
              <span className="absolute -top-1 -right-4 inline-flex h-2 w-2.5 rounded-full bg-orange-400 animate-ping"></span>
            </span>
          </h1>
        </div>

      {/* Main Game Frame Aspect-Ratio Area */}
      <div 
        id="skyhop-game-container" 
        className="relative w-full aspect-[3/4] rounded-3xl bg-slate-800 shadow-2xl border-4 border-slate-800 overflow-hidden cursor-pointer touch-none select-none flex-shrink-0"
        onPointerDown={handleContainerPointerDown}
        style={{ 
          touchAction: 'none',
          maxWidth: `${computedMaxWidth}px`
        }}
      >
        <canvas
          id="skyhop-game-canvas"
          ref={canvasRef}
          width={V_WIDTH}
          height={V_HEIGHT}
          className="w-full h-full block object-cover rounded-[20px] overflow-hidden"
        />

        {/* HUD Score, Coins count and Patent progress */}
        {!isOrientationBlocked && gameState !== GameState.START && (
          <div className={`absolute left-3 right-3 flex justify-between items-start z-10 pointer-events-none ${isCompact ? 'top-2.5' : 'top-4'}`}>
            {/* Score & Coins indicators */}
            <div className={`flex flex-col bg-slate-950/70 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg ${isCompact ? 'px-2.5 py-1.5 gap-0.5' : 'px-4 py-2.5 gap-1'}`}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 font-mono">Pontos:</span>
                <span className={`${isCompact ? 'text-lg' : 'text-2xl'} font-black text-white leading-none font-sans`}>{score}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 pt-0.5 border-t border-white/5">
                <Coins size={isCompact ? 11 : 14} className="text-amber-400" />
                <span className={`${isCompact ? 'text-[10px]' : 'text-xs'} font-bold text-amber-300 font-mono`}>{coinsCount} {isCompact ? '' : <span className="text-[9px] text-slate-400">moedas</span>}</span>
              </div>
            </div>

            {/* Float Level Accent Badge */}
            <div className="flex flex-col items-end gap-1">
              <div className={`bg-slate-950/75 backdrop-blur-md rounded-full border border-teal-500/30 flex items-center gap-1.5 ${isCompact ? 'px-2.5 py-1' : 'px-3.5 py-1.5'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className={`${isCompact ? 'text-[10px]' : 'text-xs'} font-black text-emerald-300 font-sans tracking-wide uppercase`}>
                  {currentRankInfo.badge}
                </span>
              </div>
              
              {!isCompact && (
                <div className="px-2 py-0.5 bg-slate-950/40 rounded-md text-[9px] font-bold text-slate-300 font-mono border border-white/5">
                  {getSkyGradients(score).label}
                </div>
              )}
            </div>

            {/* Pause Floating Button */}
            {gameState === GameState.PLAYING && (
              <button
                id="hud-pause-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePause();
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  togglePause();
                }}
                className={`p-2 bg-slate-950/70 border border-white/10 text-white rounded-full hover:bg-slate-800/80 hover:scale-105 active:scale-95 transition pointer-events-auto shadow-md ${isCompact ? 'ml-1' : 'ml-2 p-2.5'}`}
                title="Pausar Jogo (P)"
              >
                <Pause size={isCompact ? 13 : 16} fill="currentColor" />
              </button>
            )}
          </div>
        )}

        {/* 1. START GAME MENU OVERLAY */}
        {!isOrientationBlocked && gameState === GameState.START && (
          <div 
            id="start-menu-overlay"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[3px] flex flex-col justify-center items-center px-4 text-center z-25 py-4"
          >
            <div 
              id="start-menu-overlay-panel"
              className={`relative rounded-3xl bg-slate-900/95 border border-white/10 shadow-3xl max-w-xs sm:max-w-sm w-full mx-auto flex flex-col items-center ${
                isMobilePortrait 
                  ? 'p-5 gap-3' 
                  : isTabletPortrait
                    ? 'p-6 gap-3.5'
                    : isCompact 
                      ? 'p-3 py-4 gap-2.5' 
                      : 'p-4 sm:p-5 gap-3'
              }`}
            >
              {/* Mode Switcher */}
              <div className={`w-full flex bg-slate-950 rounded-xl border border-white/5 gap-1 select-none pointer-events-auto ${
                isMobilePortrait 
                  ? 'p-1' 
                  : isTabletPortrait
                    ? 'p-1'
                    : isCompact 
                      ? 'p-0.5' 
                      : 'p-1'
              }`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGameMode('campaign');
                  }}
                  className={`flex-1 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${
                    isMobilePortrait 
                      ? 'py-2 text-xs h-[38px]' 
                      : isTabletPortrait
                        ? 'py-2 text-xs h-[40px]'
                        : isCompact 
                          ? 'py-1.5 text-[11px]' 
                          : 'py-2 gap-1.5'
                  } ${
                    gameMode === 'campaign'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Award size={12} />
                  <span>Fases</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGameMode('endless');
                  }}
                  className={`flex-1 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${
                    isMobilePortrait 
                      ? 'py-2 text-xs h-[38px]' 
                      : isTabletPortrait
                        ? 'py-2 text-xs h-[40px]'
                        : isCompact 
                          ? 'py-1.5 text-[11px]' 
                          : 'py-2 gap-1.5'
                  } ${
                    gameMode === 'endless'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles size={12} />
                  <span>Infinito</span>
                </button>
              </div>

              {/* Sound Toggle */}
              <div id="start-menu-sound-control" className="w-full pointer-events-auto">
                <button
                  id="btn-toggle-sound"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextEnabled = !soundEnabled;
                    setSoundEnabled(nextEnabled);
                    setSoundEnabledState(nextEnabled);
                  }}
                  className={`w-full rounded-xl bg-slate-950/60 hover:bg-slate-950 text-slate-300 hover:text-white text-xs font-black border border-white/5 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98 ${
                    isMobilePortrait 
                      ? 'py-1.5 h-[34px]' 
                      : isTabletPortrait
                        ? 'py-2 h-[38px]'
                        : isCompact 
                          ? 'py-1.5' 
                          : 'py-2'
                  }`}
                >
                  {soundEnabled ? <Volume2 size={12} className="text-teal-400" /> : <VolumeX size={12} className="text-slate-500" />}
                  <span>Som: {soundEnabled ? 'Ativado' : 'Desativado'}</span>
                </button>
              </div>

              {/* Active level details if campaign mode */}
              {gameMode === 'campaign' && (
                <div className={`w-full text-center rounded-xl border border-white/5 bg-slate-950/80 leading-tight ${
                  isMobilePortrait 
                    ? 'p-1.5' 
                    : isTabletPortrait
                      ? 'p-2'
                      : 'p-2'
                }`}>
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">Fase Recomendada</span>
                  <p className={`${isMobilePortrait ? 'text-[12px]' : isTabletPortrait ? 'text-xs' : isCompact ? 'text-[11px]' : 'text-xs sm:text-sm'} font-black text-white mt-0.5`}>
                    Fase {currentLevelId}: {activeLevelForUi?.name}
                  </p>
                  {(isMobilePortrait || isTabletPortrait || !isCompact) && (
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                      Meta: Sobreviver {activeLevelForUi?.targetScore} vãos
                    </p>
                  )}
                </div>
              )}

              {/* Compact "Como jogar" trigger button for portable screens (mobile/tablet/iPad) */}
              <div className="w-full flex justify-center py-0.5 lg:hidden pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMobileHowToPlay(true);
                  }}
                  className="text-teal-400 hover:text-teal-300 font-extrabold text-[11px] xs:text-xs underline underline-offset-4 decoration-2 cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <HelpCircle size={12} className="animate-pulse" />
                  <span>Como jogar?</span>
                </button>
              </div>

              {/* Launcher block */}
              {gameMode === 'campaign' ? (
                <div className={`w-full flex flex-col pointer-events-auto ${
                  isMobilePortrait 
                    ? 'gap-1.5' 
                    : isTabletPortrait
                      ? 'gap-2'
                      : 'gap-2'
                }`}>
                  <button
                    id="btn-play-level"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGameState(GameState.PLAYING);
                      resetGame();
                    }}
                    className={`w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 font-extrabold text-white rounded-xl shadow-lg transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 ${
                      isMobilePortrait 
                        ? 'py-2 text-xs h-[46px]' 
                        : isTabletPortrait
                          ? 'py-2 text-xs h-[48px]'
                          : isCompact 
                            ? 'py-1.5 px-3 text-xs' 
                            : 'py-2.5 px-4 text-sm'
                    }`}
                  >
                    <Play size={14} fill="currentColor" />
                    <span>Jogar Fase {currentLevelId}</span>
                  </button>

                  <button
                    id="btn-levels-catalogue"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGameState(GameState.LEVEL_SELECTION);
                    }}
                    className={`w-full bg-slate-850 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-white/5 transition ${
                      isMobilePortrait 
                        ? 'py-1.5 text-[11px] h-[34px]' 
                        : isTabletPortrait
                          ? 'py-1.5 text-[11px] h-[36px]'
                          : isCompact 
                            ? 'py-1 text-[10px]' 
                            : 'py-1.5 text-xs'
                    }`}
                  >
                    Selecionar Outra Fase
                  </button>
                </div>
              ) : (
                <button
                  id="btn-start-game"
                  onClick={(e) => {
                    e.stopPropagation();
                    setGameState(GameState.PLAYING);
                    resetGame();
                  }}
                  className={`w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 font-extrabold text-white rounded-xl shadow-lg transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 pointer-events-auto ${
                    isMobilePortrait 
                      ? 'py-2 text-xs h-[46px]' 
                      : isTabletPortrait
                        ? 'py-2 text-xs h-[48px]'
                        : isCompact 
                          ? 'py-1.5 px-3 text-xs' 
                          : 'py-2.5 px-4 text-sm'
                  }`}
                >
                  <Play size={14} fill="currentColor" />
                  <span>Começar voo infinito</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 1B. FULL MOBILE HOW-TO-PLAY GUIDE CARD OVERLAY */}
        {showMobileHowToPlay && (
          <div 
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col justify-center items-center px-4 py-6 z-30 select-none animate-fade-in pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-5 rounded-3xl bg-slate-900 border border-white/10 shadow-3xl max-w-xs w-full mx-auto flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <HelpCircle size={20} strokeWidth={2.5} />
              </div>

              <div className="text-center">
                <h2 className="text-sm font-black text-teal-400 uppercase tracking-widest">Como jogar</h2>
                <p className="text-slate-200 text-xs font-semibold leading-relaxed mt-2.5 font-sans">
                  Toque na tela para fazer o personagem voar. Desvie dos obstáculos, colete moedas e tente concluir cada fase.
                </p>
                <div className="text-slate-400 text-[10px] font-medium leading-relaxed mt-2 border-t border-white/5 pt-2 font-sans">
                  No computador, use <span className="text-white font-mono bg-slate-800 px-1 py-0.5 rounded">Espaço</span> ou clique para voar. Pressione <span className="text-white font-mono bg-slate-800 px-1 py-0.5 rounded">P</span> para pausar.
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMobileHowToPlay(false);
                }}
                className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl transition shadow-md cursor-pointer pointer-events-auto"
              >
                Voltar
              </button>
            </div>
          </div>
        )}

        {/* 2. GAME OVER MENU OVERLAY */}
        {!isOrientationBlocked && gameState === GameState.GAMEOVER && (
          <div 
            id="gameover-menu-overlay"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-[4px] flex flex-col justify-center items-center px-4 text-center z-25 py-4"
          >
            <div 
              id="gameover-menu-overlay-panel"
              className={`relative rounded-3xl bg-slate-900/95 border-2 border-orange-500/20 shadow-3xl max-w-xs sm:max-w-sm w-full mx-auto flex flex-col items-center ${
                isCompact ? 'p-3 py-4 gap-2.5' : 'p-5 sm:p-6 gap-3.5'
              }`}
            >
              {/* Performance Indicator Medal */}
              {!isCompact && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-red-400 flex items-center justify-center shadow-lg border border-orange-400/30">
                  <Award size={22} className="text-white animate-pulse" />
                </div>
              )}

              <div>
                <h2 className={`${isCompact ? 'text-lg' : 'text-xl'} font-black text-rose-500 uppercase tracking-wide leading-none`}>Fim de jogo</h2>
                {!isCompact && <p className="text-slate-400 text-xs font-semibold mt-1">Ótimo percurso sob os céus!</p>}
              </div>

              {/* Patient Patent block */}
              <div className={`w-full rounded-xl border border-slate-700 bg-slate-950/80 flex flex-col items-center justify-center ${isCompact ? 'px-2 py-1.5' : 'px-3 py-1.5 sm:py-2.5'}`}>
                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Patente conquistada</span>
                <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-black text-yellow-400 tracking-wide mt-1 animate-pulse`}>
                  {currentRankInfo.badge}
                </span>
              </div>

              {/* Scores display box */}
              <div className="w-full grid grid-cols-2 gap-2 bg-slate-950/70 p-2 sm:p-3 rounded-xl border border-white/5">
                <div className="flex flex-col items-center justify-center border-r border-white/5 py-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pontos</span>
                  <span className={`${isCompact ? 'text-xl' : 'text-2xl'} font-black text-white mt-1`}>{score}</span>
                </div>
                <div className="flex flex-col items-center justify-center py-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Melhor</span>
                  <span className={`${isCompact ? 'text-xl' : 'text-2xl'} font-black text-amber-400 mt-1 flex items-center gap-1 justify-center`}>
                    <Trophy size={isCompact ? 11 : 14} className="text-amber-400" />
                    {highScore}
                  </span>
                </div>
              </div>

              {/* Collectible Info */}
              <div className={`w-full bg-yellow-950/30 border border-yellow-500/10 rounded-lg flex items-center justify-center gap-1.5 text-amber-300 font-mono font-bold ${isCompact ? 'py-0.5 text-[9.5px]' : 'py-1 text-[11px]'}`}>
                <Coins size={isCompact ? 10 : 12} />
                <span>Moedas coletadas: {coinsCount}</span>
              </div>

              {/* Interactive restart indicators */}
              <div className="w-full flex flex-col gap-2">
                <button
                  id="btn-restart-game"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetGame();
                  }}
                  className={`w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 font-extrabold text-slate-950 rounded-xl shadow-xl shadow-yellow-950/30 transform hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2 pointer-events-auto cursor-pointer ${
                    isCompact ? 'py-2 text-xs' : 'py-3 px-5 text-sm'
                  }`}
                >
                  <RotateCcw size={14} strokeWidth={3} />
                  <span>Jogar novamente</span>
                </button>

                <button
                  id="btn-back-to-menu-gameover"
                  onClick={(e) => {
                    e.stopPropagation();
                    setGameState(GameState.START);
                  }}
                  className={`w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl border border-white/10 transition flex items-center justify-center gap-1.5 pointer-events-auto cursor-pointer ${
                    isCompact ? 'py-1.5 text-[10.5px]' : 'py-2.5 text-xs'
                  }`}
                >
                  <ArrowLeft size={12} />
                  <span>Voltar ao menu</span>
                </button>
                
                {!isCompact && (
                  <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400">
                    Ou pressione o <strong className="text-slate-300 font-mono">ENTER / ESPAÇO</strong> no teclado.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. PAUSED GAME OVERLAY */}
        {!isOrientationBlocked && gameState === GameState.PAUSED && (
          <div 
            id="paused-menu-overlay"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-[3px] flex flex-col justify-center items-center px-4 text-center z-25"
          >
            <div 
              id="paused-menu-overlay-panel"
              className={`relative rounded-3xl bg-slate-900/90 border border-white/10 shadow-3xl max-w-xs w-full mx-auto flex flex-col items-center ${
                isCompact ? 'p-3 py-4 gap-2.5' : 'p-5 gap-3.5'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <Pause size={18} fill="currentColor" />
              </div>

              <div>
                <h2 className="text-xl font-black text-white">Voo pausado</h2>
                <p className="text-slate-400 text-xs mt-1">Continue quando estiver pronto.</p>
              </div>

              {/* Resume buttons */}
              <div className="w-full flex flex-col gap-2">
                <button
                  id="btn-resume-game"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePause();
                  }}
                  className={`w-full bg-teal-500 hover:bg-teal-400 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 pointer-events-auto cursor-pointer ${
                    isCompact ? 'py-2 text-xs' : 'py-2.5 px-4 text-sm'
                  }`}
                >
                  <Play size={14} fill="currentColor" />
                  <span>Retomar voo</span>
                </button>

                <button
                  id="btn-restart-from-pause"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetGame();
                  }}
                  className={`w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition flex items-center justify-center gap-1.5 border border-white/5 pointer-events-auto cursor-pointer ${
                    isCompact ? 'py-2 text-xs' : 'py-2.5 px-4 text-sm'
                  }`}
                >
                  <RotateCcw size={14} />
                  <span>Reiniciar do zero</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. LEVEL SELECTION OVERLAY */}
        {!isOrientationBlocked && gameState === GameState.LEVEL_SELECTION && (
          <div 
            id="level-selection-overlay"
            className="absolute inset-0 bg-slate-950/95 flex flex-col justify-start items-center px-4 py-5 overflow-y-auto z-30 pointer-events-auto"
          >
            {/* Header back navigation */}
            <div className="w-full flex items-center justify-between mb-4 pb-2 border-b border-slate-850 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setGameState(GameState.START);
                }}
                className="p-1 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-white/5"
              >
                <ArrowLeft size={13} />
                <span>Voltar</span>
              </button>
              <h2 className="text-sm font-black text-white font-sans uppercase tracking-wider text-right">Selecionar voo</h2>
            </div>

            {/* Scrolling levels container */}
            <div className="w-full space-y-5 pb-6">
              {[1, 2, 3, 4].map((worldNum) => {
                const worldName = worldNum === 1 ? 'Mundo 1: Céu Claro' :
                                  worldNum === 2 ? 'Mundo 2: Pôr do Sol' :
                                  worldNum === 3 ? 'Mundo 3: Noite Estrelada' :
                                  'Mundo 4: Tempestade';
                const worldBg = worldNum === 1 ? 'text-sky-300 bg-sky-950/35 border-sky-500/20' :
                                worldNum === 2 ? 'text-orange-300 bg-orange-950/35 border-orange-500/20' :
                                worldNum === 3 ? 'text-indigo-300 bg-indigo-950/35 border-indigo-500/25' :
                                'text-purple-300 bg-purple-950/35 border-purple-500/25';

                const worldLevels = LEVELS.filter(l => l.world === worldNum);

                return (
                  <div key={worldNum} className="space-y-2 text-left">
                    <div className={`p-1.5 px-3 rounded-lg border text-[10px] font-black uppercase tracking-wider ${worldBg}`}>
                      {worldName}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {worldLevels.map((lvl) => {
                        const starsEarned = completedStars[lvl.id] || 0;

                        return (
                          <button
                            key={lvl.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentLevelId(lvl.id);
                              setGameState(GameState.PLAYING);
                              resetGame();
                            }}
                            className="relative aspect-square rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-850 hover:scale-[1.05] active:scale-95 transition-all select-none flex flex-col items-center justify-between p-2 cursor-pointer shadow-md pointer-events-auto"
                          >
                            <span className="text-[10px] font-black text-slate-400">Fase {lvl.id}</span>
                            
                            <div className="flex flex-col items-center gap-1 my-1">
                              <span className="text-xs font-extrabold text-white text-center leading-tight truncate max-w-[85px]">{lvl.name}</span>
                              <div className="flex gap-0.5 justify-center">
                                {[1, 2, 3].map((starIdx) => (
                                  <Star 
                                    key={starIdx} 
                                    size={10} 
                                    className={starIdx <= starsEarned ? 'text-yellow-400 fill-yellow-400 font-bold' : 'text-slate-700'} 
                                  />
                                ))}
                              </div>
                            </div>

                            <span className="text-[8px] font-black tracking-wider text-teal-400 uppercase">
                              {lvl.targetScore} vãos
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom tools list */}
            <div className="w-full mt-auto pt-3 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-mono flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Deseja realmente reiniciar todo o progresso do modo Fases?')) {
                    localStorage.removeItem('skyhop_campaign_unlocked');
                    localStorage.removeItem('skyhop_campaign_stars');
                    setUnlockedLevels([1]);
                    setCompletedStars({});
                    setCurrentLevelId(1);
                  }
                }}
                className="px-2 py-1 bg-rose-950/40 text-rose-400 hover:bg-rose-900/50 border border-rose-500/10 rounded transition cursor-pointer"
              >
                Apagar progresso
              </button>
              <span>Selecione para voar!</span>
            </div>
          </div>
        )}

        {/* 5. LEVEL VICTORY OVERLAY */}
        {!isOrientationBlocked && gameState === GameState.VICTORY && (
          <div 
            id="level-victory-overlay"
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-[4px] flex flex-col justify-center items-center px-4 text-center z-30 py-4 pointer-events-auto"
          >
            {/* Level Confetti / Sparkle visual overlay panel */}
            <div 
              id="level-victory-panel"
              className={`relative rounded-3xl bg-slate-900/95 border-2 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)] max-w-xs sm:max-w-sm w-full mx-auto flex flex-col items-center ${
                isCompact ? 'p-3 py-4 gap-2.5' : 'p-5 sm:p-6 gap-3.5'
              }`}
            >
              {/* Crown Emblem badge */}
              {!isCompact && (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center shadow-lg border border-yellow-400/30 animate-pulse">
                  <Sparkles size={24} className="text-yellow-950" />
                </div>
              )}

              <div>
                <h2 className={`${isCompact ? 'text-lg' : 'text-xl'} font-black text-emerald-400 uppercase tracking-wide leading-none`}>Fase concluída!</h2>
                {!isCompact && <p className="text-slate-400 text-xs font-semibold mt-1">Céu cruzado com maestria!</p>}
              </div>

              {/* Display level details */}
              <div className={`w-full rounded-xl border border-slate-700 bg-slate-950/80 text-center ${isCompact ? 'p-1.5' : 'p-2 sm:p-3'}`}>
                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Você venceu a</span>
                <p className={`${isCompact ? 'text-xs' : 'text-md'} font-black text-white leading-tight`}>Fase {currentLevelId}: {activeLevelForUi?.name}</p>
                {!isCompact && <span className="text-[10px] font-bold text-slate-500">Mundo: {activeLevelForUi?.worldName}</span>}
              </div>

              {/* Starlit Rating Block */}
              <div className={`flex justify-center bg-slate-950/40 rounded-xl border border-white/5 w-full ${isCompact ? 'gap-2.5 p-1.5' : 'gap-4 p-2.5'}`}>
                {[1, 2, 3].map((starIdx) => {
                  const activeLevelConf = activeLevelForUi;
                  if (!activeLevelConf) return null;
                  let isEarned = false;
                  
                  if (starIdx === 1 && levelCoinsCollected >= activeLevelConf.star1Coins) isEarned = true;
                  if (starIdx === 2 && levelCoinsCollected >= activeLevelConf.star2Coins) isEarned = true;
                  if (starIdx === 3 && levelCoinsCollected >= activeLevelConf.star3Coins) isEarned = true;

                  return (
                    <div 
                      key={starIdx} 
                      className={`transform transition-all duration-700 ${isEarned ? 'scale-110 drop-shadow-[0_0_12px_rgba(234,179,8,0.7)] animate-bounce' : 'opacity-30 scale-95'}`}
                      style={{ animationDelay: `${starIdx * 150}ms` }}
                    >
                      <Star 
                        size={isCompact ? 24 : 32} 
                        className={isEarned ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} 
                      />
                    </div>
                  );
                })}
              </div>

              {/* Coins gathered during the run */}
              <div className={`w-full bg-yellow-950/30 border border-yellow-500/10 rounded-lg flex items-center justify-center gap-1.5 text-amber-300 font-mono font-bold ${isCompact ? 'py-0.5 text-[9.5px]' : 'py-1 text-xs'}`}>
                <Coins size={isCompact ? 10 : 12} />
                <span>Moedas coletadas: {levelCoinsCollected} / {activeLevelForUi?.star3Coins}</span>
              </div>

              {/* Action buttons */}
              <div className="w-full flex flex-col gap-1.5">
                {currentLevelId < 12 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentLevelId(prev => prev + 1);
                      setGameState(GameState.PLAYING);
                      resetGame();
                    }}
                    className={`w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 font-extrabold text-white rounded-xl shadow-lg transition transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 pointer-events-auto cursor-pointer ${
                      isCompact ? 'py-2 text-xs' : 'py-3 px-5 text-sm'
                    }`}
                  >
                    <span>Próxima fase ({currentLevelId + 1})</span>
                    <Play size={13} fill="currentColor" />
                  </button>
                ) : (
                  <div className="w-full p-2 bg-yellow-950/20 text-yellow-500 border border-yellow-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1">
                    <Trophy size={11} className="text-yellow-400 animate-pulse" />
                    <span>Todas as fases concluídas!</span>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGameState(GameState.LEVEL_SELECTION);
                  }}
                  className={`w-full bg-slate-850 hover:bg-slate-700 text-slate-300 font-bold rounded-lg border border-white/5 transition pointer-events-auto flex items-center justify-center gap-1 cursor-pointer ${
                    isCompact ? 'py-1.5 text-[10.5px]' : 'py-2 text-xs'
                  }`}
                >
                  <span>Mudar de fase</span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGameState(GameState.START);
                  }}
                  className={`w-full text-slate-400 hover:text-white font-semibold transition pointer-events-auto cursor-pointer text-[10.5px] ${
                    isCompact ? 'py-0.5' : 'py-1.5'
                  }`}
                >
                  Voltar ao menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
