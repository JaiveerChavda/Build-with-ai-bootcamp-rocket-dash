import React, { useState } from 'react';
import { GameMode, PlayerStats, RocketSkinId } from '../types/game';
import { INITIAL_SKINS } from '../utils/gameData';
import { soundManager } from '../utils/audio';

interface RocketHangarProps {
  mode: GameMode;
  stats: PlayerStats;
  onSelectSkin: (skinId: RocketSkinId) => void;
  onUpgradeModule: (module: 'thruster' | 'shield' | 'magnet' | 'boost') => void;
  onLaunch: () => void;
}

export const RocketHangar: React.FC<RocketHangarProps> = ({
  mode,
  stats,
  onSelectSkin,
  onUpgradeModule,
  onLaunch,
}) => {
  const [selectedSkinId, setSelectedSkinId] = useState<RocketSkinId>(stats.activeSkin);

  const activeSkin = INITIAL_SKINS.find((s) => s.id === selectedSkinId) || INITIAL_SKINS[0];

  const handleSelect = (skinId: RocketSkinId) => {
    soundManager.playClickSound();
    setSelectedSkinId(skinId);
    onSelectSkin(skinId);
  };

  const handleUpgrade = (module: 'thruster' | 'shield' | 'magnet' | 'boost') => {
    soundManager.playCoinSound();
    onUpgradeModule(module);
  };

  const UPGRADE_COST = 250;

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] py-6 px-4 md:px-10 max-w-7xl mx-auto select-none">
      {/* Hangar Title & Pilot Tier */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#23293d]">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00d2ff] text-[24px]">build</span>
            <span className="font-rubik font-extrabold text-xs text-[#a5e7ff] uppercase tracking-wider">
              ORBITAL DOCK // SHIP MODIFICATION
            </span>
          </div>
          <h1 className="font-rubik font-black text-3xl sm:text-4xl text-[#dce1fc] tracking-tight">
            Rocket Hangar &amp; Upgrades
          </h1>
          <p className="font-quicksand font-bold text-sm text-[#bbc9cf]">
            Customize your star vessel, tune hyperdrive thrusters, and equip magnetic stardust coils.
          </p>
        </div>

        {/* Currency / Stardust Display */}
        <div className="flex items-center gap-3 bg-[#191f32] px-5 py-2.5 rounded-2xl border border-[#2e3449] shadow-lg">
          <span className="material-symbols-outlined text-[#fecf00] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            stars
          </span>
          <div className="flex flex-col">
            <span className="font-quicksand font-bold text-xs text-[#bbc9cf] uppercase">AVAILABLE STARDUST</span>
            <span className="font-rubik font-black text-xl text-[#fecf00]">
              {stats.coins.toLocaleString()} COINS
            </span>
          </div>
        </div>
      </div>

      {/* Main Hangar Stage: Selected Rocket Display & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-start">
        {/* Left 7 Columns: Rocket Visualizer & Skin Selector */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* 3D Ship Showcase Bay */}
          <div className="relative w-full h-80 sm:h-96 bg-[#151b2e] rounded-3xl border border-[#23293d] shadow-2xl flex flex-col items-center justify-center overflow-hidden">
            {/* Ambient Spotlight */}
            <div
              className="absolute inset-0 bg-radial from-[#00d2ff]/20 via-transparent to-transparent pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${activeSkin.themeColor}33 0%, transparent 70%)`,
              }}
            />

            {/* Launch platform disc */}
            <div className="absolute bottom-6 w-64 h-16 bg-[#191f32] rounded-full border border-[#2e3449] shadow-[0_8px_0_#070d20] flex items-center justify-center">
              <div className="w-48 h-8 rounded-full bg-[#00d2ff]/10 blur-sm" />
            </div>

            {/* Vessel Image */}
            <div className="relative z-10 w-52 h-52 sm:w-64 sm:h-64 transition-transform duration-300 hover:scale-110">
              <img
                alt={activeSkin.name}
                className="w-full h-full object-contain filter drop-shadow-[0_16px_32px_rgba(0,210,255,0.4)] animate-bounce"
                src={activeSkin.imageUrl}
                style={{ animationDuration: '3s' }}
              />
            </div>

            {/* Top Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#070d20]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#23293d]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeSkin.themeColor }} />
              <span className="font-rubik font-black text-xs text-[#dce1fc] uppercase tracking-wider">
                {activeSkin.name}
              </span>
            </div>

            <div className="absolute top-4 right-4 bg-[#23293d]/80 px-3 py-1 rounded-full text-xs font-rubik font-bold text-[#ffe082]">
              {activeSkin.badge}
            </div>
          </div>

          {/* Skin Selection Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {INITIAL_SKINS.map((skin) => {
              const isSelected = selectedSkinId === skin.id;
              return (
                <button
                  key={skin.id}
                  onClick={() => handleSelect(skin.id)}
                  className={`p-3.5 rounded-2xl flex flex-col items-center gap-2 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#23293d] border-[#00d2ff] shadow-[0_4px_0_#00566a] scale-102'
                      : 'bg-[#151b2e] border-[#23293d] hover:bg-[#191f32] shadow-[0_4px_0_#070d20]'
                  }`}
                  type="button"
                >
                  <div className="w-16 h-16 rounded-full bg-[#191f32] flex items-center justify-center p-1">
                    <img alt={skin.name} className="w-full h-full object-contain" src={skin.imageUrl} />
                  </div>
                  <span className="font-rubik font-black text-xs text-[#dce1fc]">{skin.name}</span>
                  <span
                    className={`font-rubik font-bold text-[10px] px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-[#00d2ff] text-[#003543]' : 'bg-[#23293d] text-[#bbc9cf]'
                    }`}
                  >
                    {isSelected ? 'ACTIVE' : 'SELECT'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 5 Columns: Vessel Upgrades & Flight Specs */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Ship Specs Overview */}
          <div className="bg-[#191f32] p-5 sm:p-6 rounded-3xl border border-[#2e3449] shadow-xl flex flex-col gap-4">
            <h2 className="font-rubik font-black text-lg text-[#a5e7ff] uppercase tracking-wide flex items-center gap-2">
              <span className="material-symbols-outlined text-[#fecf00]">tune</span>
              Vessel Core Capabilities
            </h2>

            {/* Spec 1: Speed Factor */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-rubik font-bold text-xs">
                <span className="text-[#bbc9cf]">Acceleration &amp; Top Speed</span>
                <span className="text-[#00d2ff]">{Math.round(activeSkin.speedBonus * 100)}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#070d20] overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#00d2ff] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, activeSkin.speedBonus * 70)}%` }}
                />
              </div>
            </div>

            {/* Spec 2: Magnet Range */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-rubik font-bold text-xs">
                <span className="text-[#bbc9cf]">Stardust Magnet Suction</span>
                <span className="text-[#fecf00]">{Math.round(activeSkin.magnetBonus * 100)}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#070d20] overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#fecf00] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, activeSkin.magnetBonus * 70)}%` }}
                />
              </div>
            </div>

            {/* Spec 3: Hull Durability */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-rubik font-bold text-xs">
                <span className="text-[#bbc9cf]">Shield Absorption Level</span>
                <span className="text-[#ffad9a]">{Math.round(activeSkin.shieldBonus * 100)}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#070d20] overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#ffad9a] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, activeSkin.shieldBonus * 70)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Module Upgrades List */}
          <div className="bg-[#191f32] p-5 sm:p-6 rounded-3xl border border-[#2e3449] shadow-xl flex flex-col gap-3">
            <h2 className="font-rubik font-black text-lg text-[#dce1fc] uppercase tracking-wide flex items-center justify-between">
              <span>Hangar Module Upgrades</span>
              <span className="text-xs text-[#859399] font-quicksand font-bold">250 Coins / Upgrade</span>
            </h2>

            {/* Module 1: Thrusters */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#151b2e] border border-[#23293d]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00d2ff]/20 text-[#00d2ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-rubik font-extrabold text-sm text-[#dce1fc]">Ion Thrusters</span>
                  <span className="font-quicksand font-bold text-xs text-[#bbc9cf]">
                    Level {stats.upgrades.thrusterLevel} (+{stats.upgrades.thrusterLevel * 5}% Speed)
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleUpgrade('thruster')}
                disabled={stats.coins < UPGRADE_COST}
                className="px-3 py-1.5 rounded-full bg-[#00d2ff] hover:bg-[#47d6ff] disabled:opacity-40 disabled:pointer-events-none text-[#003543] font-rubik font-black text-xs shadow-[0_2px_0_#00566a] active:translate-y-0.5 cursor-pointer"
                type="button"
              >
                UPGRADE
              </button>
            </div>

            {/* Module 2: Shield */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#151b2e] border border-[#23293d]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ffad9a]/20 text-[#ffad9a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">shield</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-rubik font-extrabold text-sm text-[#dce1fc]">Shield Matrix</span>
                  <span className="font-quicksand font-bold text-xs text-[#bbc9cf]">
                    Level {stats.upgrades.shieldLevel} (Extra Barrier)
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleUpgrade('shield')}
                disabled={stats.coins < UPGRADE_COST}
                className="px-3 py-1.5 rounded-full bg-[#ffad9a] hover:bg-[#ffd4ca] disabled:opacity-40 disabled:pointer-events-none text-[#630f00] font-rubik font-black text-xs shadow-[0_2px_0_#8b1a00] active:translate-y-0.5 cursor-pointer"
                type="button"
              >
                UPGRADE
              </button>
            </div>

            {/* Module 3: Magnet */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#151b2e] border border-[#23293d]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fecf00]/20 text-[#fecf00] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">all_inclusive</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-rubik font-extrabold text-sm text-[#dce1fc]">Quantum Magnet</span>
                  <span className="font-quicksand font-bold text-xs text-[#bbc9cf]">
                    Level {stats.upgrades.magnetLevel} (Wider Pull Radius)
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleUpgrade('magnet')}
                disabled={stats.coins < UPGRADE_COST}
                className="px-3 py-1.5 rounded-full bg-[#fecf00] hover:bg-[#ffe082] disabled:opacity-40 disabled:pointer-events-none text-[#3c2f00] font-rubik font-black text-xs shadow-[0_2px_0_#6f5900] active:translate-y-0.5 cursor-pointer"
                type="button"
              >
                UPGRADE
              </button>
            </div>
          </div>

          {/* Big Launch Mission Button */}
          <button
            onClick={() => {
              soundManager.playBoostSound();
              onLaunch();
            }}
            className="w-full h-16 rounded-full bg-[#fecf00] hover:bg-[#ffe082] text-[#3c2f00] font-rubik font-black text-xl shadow-[0_6px_0_#6f5900] active:translate-y-1 active:shadow-[0_2px_0_#6f5900] transition-all flex items-center justify-center gap-3 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              rocket_launch
            </span>
            <span>LAUNCH WITH THIS ROCKET</span>
            <span className="material-symbols-outlined text-[26px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
