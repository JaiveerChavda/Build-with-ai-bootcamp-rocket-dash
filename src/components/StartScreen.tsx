import React, { useState } from 'react';
import { RocketSkinId, PlayerStats } from '../types/game';
import { INITIAL_SKINS } from '../utils/gameData';
import { soundManager } from '../utils/audio';

interface StartScreenProps {
  stats: PlayerStats;
  onStartGame: () => void;
  onSelectSkin: (skinId: RocketSkinId) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  stats,
  onStartGame,
  onSelectSkin,
}) => {
  const [selectedSkin, setSelectedSkin] = useState<RocketSkinId>(stats.activeSkin);
  const [isHoveringRocket, setIsHoveringRocket] = useState(false);

  const handleSkinSelect = (skinId: RocketSkinId) => {
    soundManager.playClickSound();
    setSelectedSkin(skinId);
    onSelectSkin(skinId);
  };

  const handleLaunch = () => {
    soundManager.playBoostSound();
    onStartGame();
  };

  const currentSkinData = INITIAL_SKINS.find((s) => s.id === selectedSkin) || INITIAL_SKINS[0];

  return (
    <div className="flex flex-col w-full relative overflow-hidden py-4 sm:py-6 px-4 md:px-8 items-center justify-between min-h-[calc(100vh-80px)] select-none">
      {/* Ambient Planetary Backglow Decorators */}
      <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-[#00d2ff]/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-20 w-[30rem] h-[30rem] rounded-full bg-[#fecf00]/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[42rem] rounded-full bg-[#a5e7ff]/5 blur-[140px] pointer-events-none" />

      {/* Animated Twinkling Stardust SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle className="animate-pulse" cx="12%" cy="18%" fill="#ffe082" r="3" style={{ animationDuration: '2.4s' }} />
        <circle className="animate-ping" cx="28%" cy="12%" fill="#a5e7ff" r="2" style={{ animationDuration: '4.2s' }} />
        <circle className="animate-pulse" cx="85%" cy="22%" fill="#ffd4ca" r="3.5" style={{ animationDuration: '3.1s' }} />
        <circle className="animate-pulse" cx="92%" cy="45%" fill="#ffe082" r="2" style={{ animationDuration: '2.8s' }} />
        <circle className="animate-ping" cx="8%" cy="65%" fill="#a5e7ff" r="3" style={{ animationDuration: '5s' }} />
        <circle className="animate-pulse" cx="80%" cy="78%" fill="#fecf00" r="4" style={{ animationDuration: '3.5s' }} />
        <circle className="animate-pulse" cx="22%" cy="84%" fill="#ffb4a3" r="2" style={{ animationDuration: '2s' }} />
      </svg>

      {/* TOP BAR: Best Score Pill */}
      <div className="w-full max-w-4xl flex items-center justify-center relative z-10 mb-2 mt-1">
        <div className="bg-[#191f32]/95 backdrop-blur-md px-6 py-2 rounded-full shadow-[0_4px_0_#070d20] border border-[#2e3449] flex items-center gap-3 transform hover:scale-105 transition-transform duration-200">
          <div className="w-8 h-8 rounded-full bg-[#fecf00] flex items-center justify-center text-[#6f5900] shadow-inner">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-rubik font-bold text-base sm:text-lg text-[#ffe082]">Best Score:</span>
            <span className="font-rubik font-extrabold text-lg sm:text-xl text-[#fecf00] tracking-wider">
              {stats.bestScore.toLocaleString()}
            </span>
            <span className="font-quicksand font-bold text-xs sm:text-sm text-[#bbc9cf]">Stars</span>
          </div>
        </div>
      </div>

      {/* CENTER STAGE: Cute 3D Rocket Over Colorful Friendly Planet */}
      <div className="w-full max-w-4xl flex flex-col items-center justify-center relative z-10 my-auto py-2">
        <div className="relative w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 flex items-center justify-center">
          {/* Stylized Planet Surface Grounding the Stage */}
          <div className="absolute bottom-2 w-64 h-32 md:w-80 md:h-40 bg-[#191f32] rounded-t-full shadow-[0_8px_0_#070d20] border-t-2 border-[#2e3449] overflow-hidden flex items-start justify-center pt-3">
            <div className="w-24 h-6 rounded-full bg-[#2e3449]/60" />
            <div className="absolute -right-4 top-8 w-16 h-8 rounded-full bg-[#2e3449]/50" />
            <div className="absolute -left-6 top-10 w-20 h-10 rounded-full bg-[#2e3449]/50" />
          </div>

          {/* Glowing Stardust Ring around the Rocket Base */}
          <div className="absolute bottom-16 w-56 h-12 bg-[#00d2ff]/25 rounded-full blur-md" />

          {/* 3D Cute Toy Rocket Hero Asset */}
          <div
            className={`relative z-10 w-52 h-52 sm:w-64 sm:h-64 transition-all duration-300 transform cursor-pointer ${
              isHoveringRocket ? 'scale-115' : 'hover:scale-110'
            }`}
            onClick={() => {
              soundManager.playCoinSound();
              setIsHoveringRocket(true);
              setTimeout(() => setIsHoveringRocket(false), 300);
            }}
          >
            <img
              alt={currentSkinData.name}
              className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,210,255,0.4)] animate-bounce"
              src={currentSkinData.imageUrl}
              style={{ animationDuration: '2.8s' }}
            />
          </div>

          {/* Floating Thruster Particles */}
          <div className="absolute bottom-10 flex gap-2">
            <span className="w-3 h-3 rounded-full bg-[#fecf00] animate-ping" style={{ animationDuration: '1.2s' }} />
            <span className="w-4 h-4 rounded-full bg-[#ffad9a] animate-pulse" style={{ animationDuration: '0.9s' }} />
            <span className="w-3 h-3 rounded-full bg-[#fecf00] animate-ping" style={{ animationDuration: '1.5s' }} />
          </div>
        </div>

        {/* Quick Rocket Skin Selector */}
        <div className="mt-3 bg-[#151b2e]/95 px-4 sm:px-6 py-2 rounded-full shadow-[0_4px_0_#070d20] border border-[#23293d] flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          <span className="font-rubik font-extrabold text-xs text-[#bbc9cf] pr-1 hidden sm:inline uppercase tracking-wider">
            CHOOSE ROCKET:
          </span>

          {/* Cosmo Blue */}
          <button
            onClick={() => handleSkinSelect('blue')}
            className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-rubik font-extrabold text-xs transition-all active:translate-y-0.5 cursor-pointer ${
              selectedSkin === 'blue'
                ? 'bg-[#00d2ff] text-[#003543] shadow-[0_3px_0_#00566a]'
                : 'bg-[#23293d] text-[#dce1fc] hover:text-[#a5e7ff] shadow-[0_3px_0_#070d20]'
            }`}
            type="button"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-[#a5e7ff] ring-2 ring-[#00d2ff]" />
            <span>Cosmo Blue</span>
          </button>

          {/* Solar Red */}
          <button
            onClick={() => handleSkinSelect('red')}
            className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-rubik font-extrabold text-xs transition-all active:translate-y-0.5 cursor-pointer ${
              selectedSkin === 'red'
                ? 'bg-[#ff5261] text-[#680015] shadow-[0_3px_0_#920022]'
                : 'bg-[#23293d] text-[#dce1fc] hover:text-[#ffb4a3] shadow-[0_3px_0_#070d20]'
            }`}
            type="button"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-[#ffad9a]" />
            <span>Solar Red</span>
          </button>

          {/* Sparkle Yellow */}
          <button
            onClick={() => handleSkinSelect('yellow')}
            className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-rubik font-extrabold text-xs transition-all active:translate-y-0.5 cursor-pointer ${
              selectedSkin === 'yellow'
                ? 'bg-[#fecf00] text-[#3c2f00] shadow-[0_3px_0_#6f5900]'
                : 'bg-[#23293d] text-[#dce1fc] hover:text-[#ffe082] shadow-[0_3px_0_#070d20]'
            }`}
            type="button"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-[#fecf00]" />
            <span>Sparkle Yellow</span>
          </button>
        </div>
      </div>

      {/* BOTTOM CALL-TO-ACTION & CONTROLS HUD */}
      <div className="w-full max-w-2xl flex flex-col items-center gap-4 relative z-10 mt-2 mb-2">
        {/* Big Bouncy Primary "START GAME" Launch Button */}
        <button
          onClick={handleLaunch}
          className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-10 sm:px-14 py-4 sm:py-5 bg-[#fecf00] hover:bg-[#ffe082] text-[#3c2f00] rounded-full shadow-[0_8px_0_#6f5900] hover:shadow-[0_6px_0_#6f5900] hover:translate-y-0.5 active:translate-y-2 active:shadow-[0_1px_0_#6f5900] transition-all duration-150 cursor-pointer"
          type="button"
        >
          <span
            className="material-symbols-outlined text-[32px] sm:text-[38px] group-hover:rotate-45 transition-transform duration-200"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            rocket_launch
          </span>
          <span className="font-rubik font-black text-2xl sm:text-3xl tracking-wide uppercase">
            Start Game
          </span>
          <span className="material-symbols-outlined text-[28px] sm:text-[32px] group-hover:translate-x-1.5 transition-transform duration-200">
            arrow_forward
          </span>
        </button>

        {/* Clean Controls Hint for Kids */}
        <div className="bg-[#191f32]/95 px-6 py-2.5 rounded-2xl shadow-[0_4px_0_#070d20] border border-[#2e3449] flex flex-col sm:flex-row items-center gap-2 text-center">
          <div className="flex items-center gap-1.5">
            <kbd className="px-2.5 py-1 rounded-lg bg-[#2e3449] text-[#a5e7ff] font-rubik font-extrabold text-xs shadow-[0_2px_0_#070d20]">
              ← Left
            </kbd>
            <span className="font-quicksand font-bold text-xs text-[#bbc9cf]">or</span>
            <kbd className="px-2.5 py-1 rounded-lg bg-[#2e3449] text-[#a5e7ff] font-rubik font-extrabold text-xs shadow-[0_2px_0_#070d20]">
              A
            </kbd>
            <kbd className="px-2.5 py-1 rounded-lg bg-[#2e3449] text-[#a5e7ff] font-rubik font-extrabold text-xs shadow-[0_2px_0_#070d20] ml-2">
              Right →
            </kbd>
            <span className="font-quicksand font-bold text-xs text-[#bbc9cf]">or</span>
            <kbd className="px-2.5 py-1 rounded-lg bg-[#2e3449] text-[#a5e7ff] font-rubik font-extrabold text-xs shadow-[0_2px_0_#070d20]">
              D
            </kbd>
          </div>
          <span className="hidden sm:inline text-[#2e3449]">•</span>
          <div className="flex items-center gap-1.5 text-[#dce1fc]">
            <span className="material-symbols-outlined text-[#fecf00] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
            <span className="font-quicksand font-bold text-xs sm:text-sm">
              Dodge cosmic rocks &amp; zoom faster!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
