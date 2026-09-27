import React, { useState, useEffect } from 'react';
import { GameMode, ScreenView, RocketSkinId, PlayerStats, RunResults } from './types/game';
import { INITIAL_PLAYER_STATS } from './utils/gameData';
import { soundManager } from './utils/audio';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StartScreen } from './components/StartScreen';
import { InFlightGame } from './components/InFlightGame';
import { MissionDebrief } from './components/MissionDebrief';
import { RocketHangar } from './components/RocketHangar';
import { StarBadges } from './components/StarBadges';

export default function App() {
  const [mode, setMode] = useState<GameMode>('cosmo-kids');
  const [currentView, setCurrentView] = useState<ScreenView>('start');

  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem('rocket_dash_stats');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore
    }
    return INITIAL_PLAYER_STATS;
  });

  const [lastResults, setLastResults] = useState<RunResults>({
    score: 1850,
    starsGrabbed: 48,
    distanceKm: 2.4,
    flightTimeSeconds: 168,
    peakMach: 8.2,
    hazardsEvaded: 312,
    closeCalls: 47,
    isNewBest: true,
    cause: 'Impact with Class-4 Rogue Asteroid',
    sector: 'Sector 7 - Helios Way',
    ratingStars: 3,
  });

  // Sync stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rocket_dash_stats', JSON.stringify(stats));
    } catch {
      // Ignore
    }
  }, [stats]);

  // Toggle Sound
  const handleToggleSound = () => {
    soundManager.enabled = !stats.soundEnabled;
    soundManager.playClickSound();
    setStats((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  // Toggle Mode (Cosmo Kids vs Astra Thrust)
  const handleToggleMode = () => {
    soundManager.playClickSound();
    setMode((prev) => (prev === 'cosmo-kids' ? 'astra-thrust' : 'cosmo-kids'));
  };

  // Skin Selection
  const handleSelectSkin = (skinId: RocketSkinId) => {
    setStats((prev) => ({
      ...prev,
      activeSkin: skinId,
    }));
  };

  // Module Upgrade
  const handleUpgradeModule = (module: 'thruster' | 'shield' | 'magnet' | 'boost') => {
    const cost = 250;
    if (stats.coins < cost) return;

    setStats((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      upgrades: {
        ...prev.upgrades,
        [`${module}Level`]: prev.upgrades[`${module}Level` as keyof typeof prev.upgrades] + 1,
      },
    }));
  };

  // Run Finished Handler
  const handleFinishRun = (results: RunResults) => {
    setLastResults(results);

    // Update stats
    setStats((prev) => {
      const newCoins = prev.coins + results.starsGrabbed * 25 + 50;
      const isNewBest = results.score > prev.bestScore;
      const newBest = isNewBest ? results.score : prev.bestScore;
      const newRecord = results.score > prev.highRecord ? results.score : prev.highRecord;
      const addedXp = results.starsGrabbed * 15 + 100;
      let newXp = prev.xp + addedXp;
      let newLevel = prev.level;
      let newNextXp = prev.nextLevelXp;

      if (newXp >= newNextXp) {
        newLevel += 1;
        newXp = newXp - newNextXp;
        newNextXp += 500;
      }

      return {
        ...prev,
        coins: newCoins,
        bestScore: newBest,
        highRecord: newRecord,
        totalFlights: prev.totalFlights + 1,
        totalDistanceKm: Number((prev.totalDistanceKm + results.distanceKm).toFixed(1)),
        totalStarsGrabbed: prev.totalStarsGrabbed + results.starsGrabbed,
        level: newLevel,
        xp: newXp,
        nextLevelXp: newNextXp,
      };
    });

    setCurrentView('debrief');
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        mode === 'astra-thrust' ? 'bg-[#121318] text-[#e3e1e9]' : 'bg-[#0c1225] text-[#dce1fc]'
      }`}
    >
      {/* Top Header Navigation */}
      <Header
        mode={mode}
        onToggleMode={handleToggleMode}
        activeView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        coins={stats.coins}
        record={stats.highRecord}
        soundEnabled={stats.soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${mode === 'astra-thrust' ? 'pt-16' : 'pt-20'}`}>
        {currentView === 'start' && (
          <StartScreen
            stats={stats}
            onStartGame={() => setCurrentView('play')}
            onSelectSkin={handleSelectSkin}
          />
        )}

        {currentView === 'play' && (
          <InFlightGame
            mode={mode}
            stats={stats}
            selectedSkin={stats.activeSkin}
            onFinishRun={handleFinishRun}
            onExitToMenu={() => setCurrentView('start')}
          />
        )}

        {currentView === 'debrief' && (
          <MissionDebrief
            mode={mode}
            results={lastResults}
            stats={stats}
            onPlayAgain={() => setCurrentView('play')}
            onMainMenu={() => setCurrentView('start')}
            onGoToHangar={() => setCurrentView('hangar')}
          />
        )}

        {currentView === 'hangar' && (
          <RocketHangar
            mode={mode}
            stats={stats}
            onSelectSkin={handleSelectSkin}
            onUpgradeModule={handleUpgradeModule}
            onLaunch={() => setCurrentView('play')}
          />
        )}

        {currentView === 'badges' && (
          <StarBadges
            mode={mode}
            stats={stats}
            onLaunch={() => setCurrentView('play')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer mode={mode} />
    </div>
  );
}
