import React from 'react';
import { GameMode, ScreenView } from '../types/game';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  mode: GameMode;
  onToggleMode: () => void;
  activeView: ScreenView;
  onNavigate: (view: ScreenView) => void;
  coins: number;
  record: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onToggleMode,
  activeView,
  onNavigate,
  coins,
  record,
  soundEnabled,
  onToggleSound,
}) => {
  const toggleFullscreen = () => {
    soundManager.playClickSound();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleNav = (view: ScreenView) => {
    soundManager.playClickSound();
    onNavigate(view);
  };

  if (mode === 'astra-thrust') {
    return (
      <header className="fixed top-0 w-full z-50 bg-[#0d0e13]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)] border-b border-[#34343a]">
        <div className="h-16 w-full px-4 lg:px-10 flex items-center justify-between gap-4">
          {/* Emblem & Branding */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => handleNav('start')}
          >
            <img
              alt="Astra Thrust Game Emblem"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1Uvf83fyN_aJ8dTXMWNyndVJ1tZAFFB6BRjANWkOnsMPgUq_Ii4Emoc-GeTtRVE_-U0oRy0kr1p9cN-sfVYmeHmjnZRrInEeE3rNQz1-0ibPD2ZxRKK9qRf_2TXj_ROtqxZQaLv2SLacuvhZGyUo59tSiv5QQSRprh_VX_taMmj-_PZMlsrI_KALdo0PH-3VReL9REtOFB_m0TrTJza5FhSbLBQZKb_OJQ7IenQmScYd3Fi5afA_0vdSpOd"
            />
            <div className="flex flex-col">
              <span className="font-space-grotesk font-bold text-lg uppercase tracking-wider text-[#e0fdff]">
                ASTRA THRUST
              </span>
              <span className="font-space-mono text-[10px] uppercase tracking-widest text-[#849495]">
                VELOCITY RUN // ORBITAL DECK
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#1a1b21]/70 p-1 rounded font-space-grotesk text-xs">
            <button
              onClick={() => handleNav('start')}
              className={`uppercase px-3 py-1.5 rounded font-bold tracking-wider transition-colors ${
                activeView === 'start'
                  ? 'bg-[#00f2fe] text-[#002022]'
                  : 'text-[#b9cacb] hover:text-[#e3e1e9]'
              }`}
            >
              LAUNCH PAD
            </button>
            <button
              onClick={() => handleNav('play')}
              className={`uppercase px-3 py-1.5 rounded font-bold tracking-wider transition-colors ${
                activeView === 'play'
                  ? 'bg-[#00f2fe] text-[#002022]'
                  : 'text-[#b9cacb] hover:text-[#e3e1e9]'
              }`}
            >
              IN-FLIGHT HUD
            </button>
            <button
              onClick={() => handleNav('debrief')}
              className={`uppercase px-3 py-1.5 rounded font-bold tracking-wider transition-colors ${
                activeView === 'debrief'
                  ? 'bg-[#00f2fe] text-[#002022]'
                  : 'text-[#b9cacb] hover:text-[#e3e1e9]'
              }`}
            >
              MISSION REPORT
            </button>
            <button
              onClick={() => handleNav('hangar')}
              className={`uppercase px-3 py-1.5 rounded font-bold tracking-wider transition-colors ${
                activeView === 'hangar'
                  ? 'bg-[#00f2fe] text-[#002022]'
                  : 'text-[#b9cacb] hover:text-[#e3e1e9]'
              }`}
            >
              HANGAR
            </button>
            <button
              onClick={() => handleNav('badges')}
              className={`uppercase px-3 py-1.5 rounded font-bold tracking-wider transition-colors ${
                activeView === 'badges'
                  ? 'bg-[#00f2fe] text-[#002022]'
                  : 'text-[#b9cacb] hover:text-[#e3e1e9]'
              }`}
            >
              LEADERBOARD
            </button>
          </nav>

          {/* Right Metrics & Controls */}
          <div className="flex items-center gap-3">
            {/* FPS/Network Status */}
            <div className="hidden xl:flex items-center gap-2 font-space-mono text-[10px] text-[#b9cacb] bg-[#1a1b21]/50 px-2 py-1 rounded">
              <span className="flex items-center gap-1 text-[#6ff6ff]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6ff6ff] animate-pulse"></span>
                60 FPS
              </span>
              <span className="text-[#849495]">|</span>
              <span>PING 14MS</span>
              <span className="text-[#849495]">|</span>
              <span className="text-[#6ff6ff]">US-EAST [ONLINE]</span>
            </div>

            {/* Stardust Balance */}
            <div className="flex items-center gap-1.5 bg-[#292a2f]/60 px-3 py-1 rounded font-space-mono text-xs text-[#e3e1e9]">
              <span className="text-[#00f2fe] font-bold text-base leading-none">❖</span>
              <div className="flex flex-col leading-tight">
                <span className="text-[#849495] text-[9px] font-bold leading-none">STARDUST</span>
                <span className="text-[#e0fdff] font-bold font-space-mono">
                  {coins.toLocaleString()} CR
                </span>
              </div>
            </div>

            {/* Sound & Fullscreen Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleSound}
                className="p-1.5 text-[#b9cacb] hover:text-[#e0fdff] transition-colors rounded hover:bg-[#292a2f]"
                title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {soundEnabled ? 'volume_up' : 'volume_off'}
                </span>
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-1.5 text-[#b9cacb] hover:text-[#e0fdff] transition-colors rounded hover:bg-[#292a2f]"
                title="Toggle Fullscreen"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">fullscreen</span>
              </button>
            </div>

            {/* Edition Switcher */}
            <button
              onClick={onToggleMode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00f2fe]/20 hover:bg-[#00f2fe]/30 border border-[#00f2fe]/50 text-[#6ff6ff] font-space-mono text-[10px] font-bold uppercase transition-all"
              title="Switch to Cosmo Kids Arcade Edition"
            >
              <span>🚀 KIDS ARCADE</span>
            </button>

            {/* Pilot Profile */}
            <div className="flex items-center gap-2 pl-1 bg-[#1a1b21]/80 py-1 pr-3 rounded">
              <img
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover border border-[#00f2fe]/40"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-m-nQkQ17OEtOWN6ds-UL_pKi4ggOOuxVmcrypM1XcglvUCBNMX69zxTwFXzsVHWPa-y3lO2HV7_-TlXZPJa0oiSKjcG1GLs3cDcbyw5IAxYCROaYSsDzm2UzcEMGexz0d6br5k2wup75xanSIn7jJ9gCte3tDnEqAg0cCApj2wzsLLtj6ge821Kkby3iTqyKUhVqJQnTbnLSpc6e8bj8w-ORFDvw7s28eZ4vtxcy3QvD-9hlNBmQPw"
              />
              <div className="flex flex-col">
                <span className="font-space-grotesk text-[10px] font-bold text-[#e3e1e9] leading-tight">
                  COMMANDER
                </span>
                <span className="font-space-mono text-[9px] text-[#6ff6ff] leading-tight">
                  LVL 28
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Cosmo Kids Theme Header (matching Image 10, 12, 14 exactly!)
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#0c1225]/90 backdrop-blur-xl border-b border-[#191f32] shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
      <div className="h-20 w-full px-4 sm:px-6 md:px-10 flex items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => handleNav('start')}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#00d2ff] flex items-center justify-center text-[#003543] shadow-[0_4px_0_#00566a] transition-transform active:scale-95">
            <span className="material-symbols-outlined text-[28px] sm:text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              rocket_launch
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-rubik font-extrabold text-xl sm:text-2xl text-[#a5e7ff] tracking-wide leading-none">
              Rocket Dash
            </span>
            <span className="font-rubik font-bold text-xs sm:text-sm text-[#bbc9cf] leading-tight">
              Cosmo Kids Arcade
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#151b2e] px-2 py-1.5 rounded-full border border-[#23293d]">
          <button
            onClick={() => handleNav('play')}
            className={`px-4 py-2 rounded-full font-rubik font-extrabold text-sm transition-all ${
              activeView === 'play' || activeView === 'start' || activeView === 'debrief'
                ? 'bg-[#23293d] text-[#a5e7ff] shadow-[0_2px_0_#070d20]'
                : 'text-[#bbc9cf] hover:text-[#dce1fc]'
            }`}
          >
            Mission Play
          </button>
          <button
            onClick={() => handleNav('hangar')}
            className={`px-4 py-2 rounded-full font-rubik font-extrabold text-sm transition-all ${
              activeView === 'hangar'
                ? 'bg-[#23293d] text-[#a5e7ff] shadow-[0_2px_0_#070d20]'
                : 'text-[#bbc9cf] hover:text-[#dce1fc]'
            }`}
          >
            Rocket Hangar
          </button>
          <button
            onClick={() => handleNav('badges')}
            className={`px-4 py-2 rounded-full font-rubik font-extrabold text-sm transition-all ${
              activeView === 'badges'
                ? 'bg-[#23293d] text-[#a5e7ff] shadow-[0_2px_0_#070d20]'
                : 'text-[#bbc9cf] hover:text-[#dce1fc]'
            }`}
          >
            Star Badges
          </button>
        </nav>

        {/* Right HUD: Coins, Record, Audio & Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Coins Pill */}
          <div className="flex items-center gap-1.5 bg-[#191f32] px-3 sm:px-4 py-1.5 rounded-full shadow-[0_4px_0_rgba(0,0,0,0.25)] border border-[#2e3449]">
            <span
              className="material-symbols-outlined text-[#fecf00] text-[20px] sm:text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              stars
            </span>
            <div className="flex flex-col">
              <span className="font-rubik font-extrabold text-xs sm:text-sm text-[#fecf00] leading-none">
                {coins.toLocaleString()}
              </span>
              <span className="font-quicksand font-bold text-[10px] text-[#bbc9cf] leading-none hidden sm:inline">
                COINS
              </span>
            </div>
          </div>

          {/* Record Pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#191f32] px-3 sm:px-4 py-1.5 rounded-full shadow-[0_4px_0_rgba(0,0,0,0.25)] border border-[#2e3449]">
            <span
              className="material-symbols-outlined text-[#ffad9a] text-[20px] sm:text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              military_tech
            </span>
            <div className="flex flex-col">
              <span className="font-rubik font-extrabold text-xs sm:text-sm text-[#ffd4ca] leading-none">
                {record.toLocaleString()}
              </span>
              <span className="font-quicksand font-bold text-[10px] text-[#bbc9cf] leading-none">
                RECORD
              </span>
            </div>
          </div>

          {/* Sound Toggle Button */}
          <button
            aria-label="Toggle Sound Effects"
            onClick={onToggleSound}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#23293d] hover:bg-[#2e3449] text-[#a5e7ff] flex items-center justify-center shadow-[0_4px_0_#070d20] active:translate-y-1 active:shadow-[0_1px_0_#070d20] transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px] sm:text-[24px]">
              {soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* Mode Switcher */}
          <button
            onClick={onToggleMode}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2e3449] hover:bg-[#33384d] text-[#6ff6ff] font-rubik text-xs font-bold border border-[#00d2ff]/30 shadow-[0_2px_0_#070d20] active:translate-y-0.5"
            title="Switch to Astra Thrust Cyberpunk Simulator"
          >
            <span className="material-symbols-outlined text-[16px]">sensors</span>
            <span>ASTRA SIM</span>
          </button>

          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#00d2ff] flex items-center justify-center shadow-[0_3px_0_#00566a] overflow-hidden">
            <span className="material-symbols-outlined text-[#003543] text-[22px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};
