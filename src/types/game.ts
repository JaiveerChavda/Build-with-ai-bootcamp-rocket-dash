export type GameMode = 'cosmo-kids' | 'astra-thrust';

export type ScreenView = 'start' | 'play' | 'debrief' | 'hangar' | 'badges';

export type RocketSkinId = 'blue' | 'red' | 'yellow' | 'vortex';

export interface RocketSkin {
  id: RocketSkinId;
  name: string;
  themeColor: string;
  accentColor: string;
  badge: string;
  speedBonus: number;
  magnetBonus: number;
  shieldBonus: number;
  unlocked: boolean;
  cost: number;
  description: string;
  imageUrl: string;
}

export interface PlayerStats {
  coins: number;
  bestScore: number;
  highRecord: number;
  totalFlights: number;
  totalDistanceKm: number;
  totalStarsGrabbed: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  activeSkin: RocketSkinId;
  soundEnabled: boolean;
  upgrades: {
    thrusterLevel: number;
    shieldLevel: number;
    magnetLevel: number;
    boostLevel: number;
  };
}

export interface RunResults {
  score: number;
  starsGrabbed: number;
  distanceKm: number;
  flightTimeSeconds: number;
  peakMach: number;
  hazardsEvaded: number;
  closeCalls: number;
  isNewBest: boolean;
  cause: string;
  sector: string;
  ratingStars: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardCoins: number;
}
