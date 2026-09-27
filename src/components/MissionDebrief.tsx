import React, { useEffect, useState } from 'react';
import { GameMode, RunResults, PlayerStats } from '../types/game';
import { soundManager } from '../utils/audio';

interface MissionDebriefProps {
  mode: GameMode;
  results: RunResults;
  stats: PlayerStats;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  onGoToHangar: () => void;
}

export const MissionDebrief: React.FC<MissionDebriefProps> = ({
  mode,
  results,
  stats,
  onPlayAgain,
  onMainMenu,
  onGoToHangar,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isMascotHovered, setIsMascotHovered] = useState(false);

  // Animated counter for final score
  useEffect(() => {
    let start = 0;
    const end = results.score;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentScore = Math.floor(ease * end);
      setAnimatedScore(currentScore);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [results.score]);

  // Spacebar hotkey to relaunch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        soundManager.playBoostSound();
        onPlayAgain();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayAgain]);

  if (mode === 'astra-thrust') {
    // Astra Thrust Mission Critical Failure & Blackbox Report (matching HTML snippet 1)
    return (
      <div className="flex flex-col w-full relative overflow-hidden pb-12 pt-6 px-4 lg:px-10 bg-[#121318] text-[#e3e1e9] min-h-[calc(100vh-4rem)]">
        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute -top-40 left-1/4 w-[700px] h-[500px] bg-[#ff5261]/15 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 -right-20 w-[550px] h-[550px] bg-[#00f2fe]/10 rounded-full blur-[130px]" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#e9d2ff]/10 rounded-full blur-[120px]" />
          <svg className="w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="48" id="hud-grid" patternUnits="userSpaceOnUse" width="48">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect fill="url(#hud-grid)" height="100%" width="100%" />
          </svg>
        </div>

        <div className="relative z-10 w-full flex flex-col gap-6">
          {/* Top Status Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2 border-b border-[#34343a]/50">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded bg-[#93000a] text-[#ffb4ab] font-space-mono text-[10px] tracking-widest uppercase font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-ping" />
                  SYS.CRIT // KINETIC SEPARATION
                </span>
                <span className="font-space-mono text-[10px] text-[#849495] tracking-wider">
                  BLACKBOX RECORD 0x7E3A-9
                </span>
              </div>
              <h1 className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight uppercase text-[#ff5261] drop-shadow-[0_0_24px_rgba(255,82,97,0.45)]">
                MISSION CRITICAL FAILURE
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-space-mono text-xs text-[#b9cacb]">
                <span className="text-[#ffb3b3] flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  COLLISION DETECTED — SECTOR 7
                </span>
                <span className="text-[#849495]">•</span>
                <span>
                  Cause: <strong className="text-[#e0fdff]">{results.cause} at Mach {results.peakMach}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#1a1b21]/80 backdrop-blur-md px-4 py-2 rounded border border-[#34343a]">
              <div className="flex flex-col text-right">
                <span className="font-space-mono text-[9px] text-[#849495]">TELEMETRY SYNC</span>
                <span className="font-space-mono text-[10px] text-[#6ff6ff] font-bold">100% PARSED // CLOUD VERIFIED</span>
              </div>
              <div className="w-9 h-9 rounded bg-[#292a2f] flex items-center justify-center text-[#00f2fe]">
                <span className="material-symbols-outlined text-[20px]">satellite_alt</span>
              </div>
            </div>
          </div>

          {/* Grid Layout: Main Stats + Flank Information */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Columns */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Flight Evaluation Score Card */}
              <div className="bg-[#1a1b21]/90 backdrop-blur-xl p-6 rounded shadow-2xl relative overflow-hidden border border-[#34343a]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff5261] via-[#00f2fe] to-[#e9d2ff]" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
                  <div className="flex flex-col">
                    <span className="font-space-mono text-[10px] uppercase tracking-widest text-[#b9cacb] font-bold">
                      FINAL FLIGHT EVALUATION
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-space-grotesk text-4xl sm:text-5xl text-[#e0fdff] font-bold tracking-tight">
                        {animatedScore.toLocaleString()}
                      </span>
                      <span className="font-space-mono text-xl text-[#6ff6ff]">PTS</span>
                    </div>
                  </div>

                  {results.isNewBest && (
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-gradient-to-r from-amber-500/20 to-yellow-300/10 border border-amber-400/40 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                      <span className="material-symbols-outlined text-amber-300 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        military_tech
                      </span>
                      <span className="font-space-grotesk text-xs tracking-widest text-amber-300 uppercase font-bold">
                        NEW PERSONAL RECORD!
                      </span>
                    </div>
                  )}
                </div>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <div className="flex flex-col gap-1 bg-[#1e1f25]/70 p-3 rounded border border-[#34343a]">
                    <div className="flex items-center justify-between text-[#849495]">
                      <span className="font-space-mono text-[9px] uppercase font-bold">FLIGHT TIME</span>
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                    </div>
                    <span className="font-space-mono text-xl text-[#e0fdff] font-bold">
                      0{Math.floor(results.flightTimeSeconds / 60)}:{String(results.flightTimeSeconds % 60).padStart(2, '0')}.82
                    </span>
                    <span className="font-space-mono text-[10px] text-[#6ff6ff]">+00:43.10 vs AVG</span>
                  </div>

                  <div className="flex flex-col gap-1 bg-[#1e1f25]/70 p-3 rounded border border-[#34343a]">
                    <div className="flex items-center justify-between text-[#849495]">
                      <span className="font-space-mono text-[9px] uppercase font-bold">PEAK VELOCITY</span>
                      <span className="material-symbols-outlined text-[14px]">speed</span>
                    </div>
                    <span className="font-space-mono text-xl text-[#00f2fe] font-bold">M {results.peakMach}</span>
                    <span className="font-space-mono text-[10px] text-[#ffb3b3] uppercase font-bold">HYPERSONIC</span>
                  </div>

                  <div className="flex flex-col gap-1 bg-[#1e1f25]/70 p-3 rounded border border-[#34343a]">
                    <div className="flex items-center justify-between text-[#849495]">
                      <span className="font-space-mono text-[9px] uppercase font-bold">HAZARDS EVADED</span>
                      <span className="material-symbols-outlined text-[14px]">shield</span>
                    </div>
                    <span className="font-space-mono text-xl text-[#e0fdff] font-bold">{results.hazardsEvaded}</span>
                    <span className="font-space-mono text-[10px] text-[#b9cacb]">94.8% CLEARANCE</span>
                  </div>

                  <div className="flex flex-col gap-1 bg-[#1e1f25]/70 p-3 rounded border border-[#34343a]">
                    <div className="flex items-center justify-between text-[#849495]">
                      <span className="font-space-mono text-[9px] uppercase font-bold">CLOSE CALLS</span>
                      <span className="material-symbols-outlined text-[14px]">bolt</span>
                    </div>
                    <span className="font-space-mono text-xl text-[#00dce6] font-bold">{results.closeCalls}</span>
                    <span className="font-space-mono text-[10px] text-[#6ff6ff] font-bold">+9,400 BONUS</span>
                  </div>
                </div>

                {/* Stardust Harvest Summary */}
                <div className="mt-5 p-3 rounded bg-[#292a2f]/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-[#34343a]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-[#00f2fe]/20 flex items-center justify-center text-[#00f2fe] font-bold text-lg">
                      ❖
                    </div>
                    <div className="flex flex-col">
                      <span className="font-space-grotesk text-[10px] uppercase text-[#849495] font-bold">
                        RESOURCE HARVEST
                      </span>
                      <span className="font-space-mono text-base text-[#e0fdff] font-bold">
                        +{results.starsGrabbed * 25 + 650} STARDUST CREDITS
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-space-mono text-[10px] text-[#b9cacb]">
                    <span>BASE: +950</span>
                    <span className="text-[#849495]">/</span>
                    <span>COMBO: +600</span>
                    <span className="text-[#849495]">/</span>
                    <span className="text-[#6ff6ff]">SECTOR 7: +300</span>
                  </div>
                </div>
              </div>

              {/* Trajectory Graph SVG */}
              <div className="bg-[#1a1b21]/90 backdrop-blur-xl p-5 rounded shadow-xl border border-[#34343a] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00f2fe] text-[18px]">insights</span>
                    <h2 className="font-space-grotesk text-sm uppercase text-[#e3e1e9] font-bold tracking-wider">
                      FLIGHT TRAJECTORY &amp; VELOCITY DYNAMICS
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 font-space-mono text-[10px]">
                    <span className="flex items-center gap-1 text-[#6ff6ff]">
                      <span className="w-2.5 h-0.5 bg-[#00f2fe]" />CRUISE RAMP
                    </span>
                    <span className="flex items-center gap-1 text-[#ffb3b3]">
                      <span className="w-2.5 h-0.5 bg-[#ff5261]" />CRITICAL POINT
                    </span>
                  </div>
                </div>

                <div className="w-full h-44 relative bg-[#0d0e13]/80 rounded p-2 flex flex-col justify-end border border-[#34343a]">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 160">
                    <defs>
                      <linearGradient id="velocityGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line stroke="#34343a" strokeDasharray="4,4" strokeWidth="1" x1="0" x2="700" y1="40" y2="40" />
                    <line stroke="#34343a" strokeDasharray="4,4" strokeWidth="1" x1="0" x2="700" y1="80" y2="80" />
                    <line stroke="#34343a" strokeDasharray="4,4" strokeWidth="1" x1="0" x2="700" y1="120" y2="120" />
                    <path d="M 0 150 Q 140 140 280 110 T 520 50 L 620 20 L 628 8 L 634 160 Z" fill="url(#velocityGrad)" />
                    <path d="M 0 150 Q 140 140 280 110 T 520 50 L 620 20 L 628 8" fill="none" stroke="#00dce6" strokeWidth="2.5" />
                    <path d="M 628 8 L 632 155" fill="none" stroke="#ff5261" strokeDasharray="2,2" strokeWidth="2.5" />
                    <circle className="animate-ping" cx="628" cy="8" fill="#ff5261" opacity="0.7" r="6" />
                    <circle cx="628" cy="8" fill="#ffffff" r="4" />
                  </svg>
                  <div className="absolute right-[8%] top-2 bg-[#ff5261] text-[#680015] px-2 py-0.5 rounded font-space-mono text-[10px] font-bold flex items-center gap-1 shadow-[0_0_12px_rgba(255,82,97,0.8)]">
                    <span className="material-symbols-outlined text-[12px]">crisis_alert</span>
                    IMPACT // {Math.round(results.distanceKm * 1000).toLocaleString()}M
                  </div>
                  <div className="flex items-center justify-between text-[#849495] font-space-mono text-[9px] pt-1">
                    <span>0M (LAUNCH)</span>
                    <span>4,500M</span>
                    <span>9,000M</span>
                    <span>13,500M</span>
                    <span className="text-[#ff5261] font-bold">{Math.round(results.distanceKm * 1000).toLocaleString()}M (TERMINATION)</span>
                  </div>
                </div>
              </div>

              {/* Pilot Progression */}
              <div className="bg-[#1a1b21]/90 backdrop-blur-xl p-5 rounded shadow-xl border border-[#34343a] flex flex-col gap-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#6ff6ff] text-[18px]">military_tech</span>
                    <h2 className="font-space-grotesk text-sm uppercase text-[#e3e1e9] font-bold">
                      PILOT PROGRESSION &amp; REQUISITION
                    </h2>
                  </div>
                  <div className="font-space-mono text-[10px] text-[#6ff6ff]">
                    RANK: FLIGHT LIEUTENANT // CALLSIGN: VORTEX-9
                  </div>
                </div>

                <div className="flex items-center justify-between font-space-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#e3e1e9] font-bold">LVL {stats.level}</span>
                    <span className="text-[#849495]">COMMANDER TIER</span>
                  </div>
                  <div className="text-right text-[#6ff6ff] font-bold text-[11px]">
                    3,400 / 4,000 XP (+850 XP THIS RUN)
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#e0fdff] font-bold">LVL {stats.level + 1}</span>
                    <span className="text-[#6ff6ff] animate-pulse text-[10px]">NEXT UNLOCK</span>
                  </div>
                </div>

                <div className="w-full h-2.5 rounded bg-[#34343a] overflow-hidden p-0.5">
                  <div className="h-full bg-gradient-to-r from-[#00f2fe] via-[#6ff6ff] to-[#ffdad9] rounded transition-all duration-1000 ease-out" style={{ width: '85%' }} />
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Leaderboard & Blackbox Still */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              {/* Leaderboard Snippet */}
              <div className="bg-[#1a1b21]/90 backdrop-blur-xl p-5 rounded shadow-xl border border-[#34343a] flex flex-col gap-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#34343a]/50">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#00f2fe] text-[18px]">leaderboard</span>
                    <h2 className="font-space-grotesk text-sm uppercase text-[#e3e1e9] font-bold">SECTOR 7 GLOBAL</h2>
                  </div>
                  <span className="font-space-mono text-[10px] text-[#849495]">SEASON 12</span>
                </div>

                <div className="flex flex-col gap-1.5 font-space-mono text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-[#292a2f]/40">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-300 font-bold">#1</span>
                      <span>HYPER_NOVA</span>
                    </div>
                    <span className="text-[#e0fdff] font-bold">142,880</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[#292a2f]/40">
                    <div className="flex items-center gap-2">
                      <span className="text-[#849495] font-bold">#2</span>
                      <span>ZERO_KELVIN</span>
                    </div>
                    <span className="text-[#e0fdff] font-bold">129,410</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[#00f2fe]/20 border border-[#00f2fe]/40 text-[#e0fdff] font-bold shadow-[0_0_12px_rgba(0,242,254,0.25)]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#00f2fe]">#14</span>
                      <span className="flex items-center gap-1">
                        YOU (VORTEX-9)
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe] animate-pulse" />
                      </span>
                    </div>
                    <span className="text-[#6ff6ff] font-bold">{animatedScore.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Wreckage Still Frame */}
              <div className="bg-[#1a1b21]/90 backdrop-blur-xl p-5 rounded shadow-xl border border-[#34343a] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-space-grotesk text-[10px] uppercase text-[#849495] font-bold">
                    VESSEL STATUS AT IMPACT
                  </span>
                  <span className="font-space-mono text-[10px] text-[#ff5261] font-bold">HULL: 0%</span>
                </div>
                <div className="relative w-full h-36 rounded overflow-hidden">
                  <img
                    alt="Futuristic sci-fi fighter rocket wreckage in deep space"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHENFX0feDvNVNa8_R9XwTo_MrQ1eW2tRim0VdC8Q6qRJsdX_mR-UvZ_dWhJWxbdkV2gRSa8r7lhkz5RjINfXoCaWSrz2dBJeUXrz0_NAmcqkYljDGuL2j-JQYT_8ql52YZwb0uYgxuRs9cYukFW_4GZHy5gI4s5ZbLarR3AyrmkPIlhoE0FZ4uVfQ79VVkZTslgpW0btJ94xDOXpUvqfV2Cvhmrh9EyrS8-iQwnrXj7jjVyNZh3CkJg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e13] via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-[#0d0e13]/80 backdrop-blur-md text-[#ff5261] font-space-mono text-[9px] uppercase font-bold">
                    <span className="material-symbols-outlined text-[12px]">broken_image</span>
                    BLACKBOX STILL-FRAME
                  </div>
                </div>
              </div>

              {/* Big Actions */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={onPlayAgain}
                  className="w-full py-3.5 px-6 rounded bg-gradient-to-r from-[#00f2fe] to-[#6ff6ff] text-[#002022] font-space-grotesk font-black text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[24px]">refresh</span>
                  <span>RELAUNCH MISSION</span>
                  <span className="ml-auto font-space-mono text-[10px] px-2 py-0.5 rounded bg-[#002022]/20 text-[#002022]">
                    [SPACE]
                  </span>
                </button>

                <button
                  onClick={onGoToHangar}
                  className="w-full py-3 px-4 rounded bg-[#292a2f] hover:bg-[#38393f] text-[#00f2fe] font-space-grotesk font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-colors border border-[#34343a] cursor-pointer"
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">build</span>
                    UPGRADE VESSEL IN HANGAR
                  </span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>

                <button
                  onClick={onMainMenu}
                  className="w-full py-2.5 px-4 rounded bg-[#1e1f25] hover:bg-[#292a2f] text-[#b9cacb] font-space-grotesk font-bold text-xs uppercase transition-colors flex items-center justify-center gap-1.5 border border-[#34343a] cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">exit_to_app</span>
                  <span>RETURN TO LAUNCH PAD</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cosmo Kids Galaxy Mission Debrief (matching Image 12 exactly!)
  return (
    <div className="flex flex-col w-full relative overflow-hidden py-8 px-4 md:px-8 items-center justify-center min-h-[calc(100vh-140px)] select-none">
      {/* Floating Ambient Cosmic Elements */}
      <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-[#00d2ff]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-[#fecf00]/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-8 w-12 h-12 text-[#fecf00] opacity-40 animate-pulse pointer-events-none">
        <span className="material-symbols-outlined text-[48px]">auto_awesome</span>
      </div>
      <div className="absolute top-1/4 right-12 w-16 h-16 text-[#ffad9a] opacity-30 animate-bounce pointer-events-none" style={{ animationDuration: '4s' }}>
        <span className="material-symbols-outlined text-[54px]">star</span>
      </div>

      {/* Main Game Summary Container Card (Exact match to Image 12) */}
      <div className="relative w-full max-w-2xl bg-[#191f32] rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 flex flex-col items-center text-center border border-[#2e3449]">
        {/* Cheerful Overhanging Badge / Rocket Buddy */}
        <div
          className={`-mt-18 sm:-mt-22 mb-3 relative group cursor-pointer transition-transform duration-300 ${
            isMascotHovered ? 'scale-115' : 'hover:scale-105 active:scale-95'
          }`}
          onClick={() => {
            soundManager.playCoinSound();
            setIsMascotHovered(true);
            setTimeout(() => setIsMascotHovered(false), 250);
          }}
          title="Tap your cosmic buddy!"
        >
          {/* Radiant Soft Glow Ring */}
          <div className="absolute inset-0 rounded-full bg-[#00d2ff]/30 blur-xl scale-125" />

          {/* Mascot Disc */}
          <div className="relative w-28 h-28 sm:w-34 sm:h-34 rounded-full bg-[#23293d] flex items-center justify-center shadow-[0_8px_0_#070d20] border-2 border-[#00d2ff]/40">
            {/* Friendly Cartoon Rocket Mascot Vector */}
            <svg
              className="w-20 h-20 sm:w-24 sm:h-24 filter drop-shadow-md"
              fill="none"
              viewBox="0 0 120 120"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M60 14C45 28 38 52 38 78C38 88 44 94 60 94C76 94 82 88 82 78C82 52 75 28 60 14Z" fill="#A5E7FF" />
              <path d="M38 68C26 74 20 86 24 94C32 94 38 88 38 82V68Z" fill="#FFAD9A" />
              <path d="M82 68C94 74 100 86 96 94C88 94 82 88 82 82V68Z" fill="#FFAD9A" />
              <path d="M60 14C53 23 48 34 45 44C52 46 68 46 75 44C72 34 67 23 60 14Z" fill="#00D2FF" />
              <circle cx="60" cy="56" fill="#0C1225" r="14" />
              <circle cx="60" cy="56" fill="#33384D" r="11" />
              <circle cx="57" cy="53" fill="#FFFFFF" r="3.5" />
              <circle cx="63" cy="59" fill="#FFFFFF" r="1.5" />
              <path d="M53 74C56 78 64 78 67 74" stroke="#003543" strokeLinecap="round" strokeWidth="3" />
              <ellipse cx="50" cy="73" fill="#FFAD9A" rx="2.5" ry="1.5" />
              <ellipse cx="70" cy="73" fill="#FFAD9A" rx="2.5" ry="1.5" />
              <path d="M52 94C52 104 60 110 60 110C60 110 68 104 68 94H52Z" fill="#FECF00" />
              <path d="M56 94C56 100 60 104 60 104C60 100 64 96 64 94H56Z" fill="#FFF0C9" />
            </svg>
            <span
              className="material-symbols-outlined text-[#fecf00] absolute -top-1 -right-2 text-[30px] animate-spin"
              style={{ animationDuration: '8s', fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span
              className="material-symbols-outlined text-[#ffad9a] absolute bottom-2 -left-2 text-[24px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
          </div>
        </div>

        {/* Heading Area */}
        <div className="flex flex-col items-center gap-1 mb-2">
          <div className="inline-flex items-center gap-1.5 bg-[#23293d] px-4 py-1 rounded-full border border-[#2e3449]">
            <span className="material-symbols-outlined text-[#fecf00] text-[18px]">celebration</span>
            <span className="font-rubik font-extrabold text-xs text-[#ffe082] tracking-wider uppercase">
              Galaxy Mission Debrief
            </span>
            <span className="material-symbols-outlined text-[#fecf00] text-[18px]">celebration</span>
          </div>

          <h1 className="font-rubik font-black text-3xl sm:text-4xl md:text-5xl text-[#a5e7ff] tracking-tight flex items-center justify-center gap-2 mt-1">
            <span>Great Flight!</span>
            <span className="inline-block transform hover:rotate-12 transition-transform cursor-pointer">🚀</span>
          </h1>

          <p className="font-quicksand font-bold text-sm sm:text-base text-[#bbc9cf] max-w-md">
            Awesome dodging out there! Can you beat your high score next time?
          </p>
        </div>

        {/* New Best Trophy Banner (matches Image 12 exactly!) */}
        <div className="w-full max-w-md bg-[#fecf00] text-[#3c2f00] rounded-full py-2 px-6 flex items-center justify-center gap-2 shadow-[0_4px_0_#6f5900] mb-4 animate-pulse">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            emoji_events
          </span>
          <span className="font-rubik font-black text-sm sm:text-base tracking-wide uppercase">
            New Personal Best!
          </span>
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            military_tech
          </span>
        </div>

        {/* The Giant Score Centerpiece Card (Exact match to Image 12) */}
        <div className="w-full bg-[#070d20] rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-inner mb-4 relative overflow-hidden border border-[#191f32]">
          <span className="font-rubik font-extrabold text-xs text-[#a5e7ff] uppercase tracking-widest mb-1">
            Flight Score Total
          </span>

          <div className="flex items-center justify-center gap-2 my-1">
            <span
              className="material-symbols-outlined text-[#fecf00] text-[40px] sm:text-[52px] filter drop-shadow-[0_4px_0_#6f5900]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="font-rubik font-black text-4xl sm:text-5xl md:text-6xl text-[#ffe082] tracking-normal leading-none">
              {animatedScore.toLocaleString()}
            </span>
            <span className="font-rubik font-extrabold text-xl sm:text-2xl text-[#a5e7ff] self-end mb-1">
              Stars
            </span>
          </div>

          {/* 3-Star Mastery Rating Pill */}
          <div className="flex items-center gap-3 mt-3 bg-[#191f32] px-5 py-1.5 rounded-full border border-[#23293d]">
            <span
              className="material-symbols-outlined text-[#fecf00] text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span
              className="material-symbols-outlined text-[#fecf00] text-[32px] -translate-y-1"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span
              className="material-symbols-outlined text-[#fecf00] text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
          </div>
        </div>

        {/* Secondary Stats Badges: 2 Columns Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Stat 1: Stars Grabbed */}
          <div className="bg-[#151b2e] rounded-2xl p-3.5 flex items-center justify-between shadow-[0_4px_0_#070d20] border border-[#23293d]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#fecf00]/20 flex items-center justify-center text-[#fecf00]">
                <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  stars
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-quicksand font-bold text-xs text-[#bbc9cf] leading-tight">Stars Grabbed</span>
                <span className="font-rubik font-black text-lg text-[#dce1fc]">{results.starsGrabbed} ⭐</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#191f32] flex items-center justify-center text-[#00d2ff]">
              <span className="material-symbols-outlined text-[18px]">check</span>
            </div>
          </div>

          {/* Stat 2: Distance Flown */}
          <div className="bg-[#151b2e] rounded-2xl p-3.5 flex items-center justify-between shadow-[0_4px_0_#070d20] border border-[#23293d]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#00d2ff]/20 flex items-center justify-center text-[#00d2ff]">
                <span className="material-symbols-outlined text-[26px]">explore</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-quicksand font-bold text-xs text-[#bbc9cf] leading-tight">Distance Traveled</span>
                <span className="font-rubik font-black text-lg text-[#dce1fc]">{results.distanceKm} km 🛸</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#191f32] flex items-center justify-center text-[#00d2ff]">
              <span className="material-symbols-outlined text-[18px]">check</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Primary: Play Again */}
          <button
            onClick={() => {
              soundManager.playBoostSound();
              onPlayAgain();
            }}
            className="w-full sm:flex-1 h-16 rounded-full bg-[#00d2ff] hover:bg-[#47d6ff] text-[#003543] font-rubik font-black text-lg sm:text-xl flex items-center justify-center gap-2 shadow-[0_6px_0_#00566a] active:translate-y-1 active:shadow-[0_2px_0_#00566a] transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[26px]">refresh</span>
            <span>Play Again</span>
            <span className="text-lg">🔁</span>
          </button>

          {/* Secondary: Main Menu */}
          <button
            onClick={() => {
              soundManager.playClickSound();
              onMainMenu();
            }}
            className="w-full sm:flex-1 h-16 rounded-full bg-[#23293d] hover:bg-[#2e3449] text-[#a5e7ff] font-rubik font-black text-lg sm:text-xl flex items-center justify-center gap-2 shadow-[0_6px_0_#070d20] active:translate-y-1 active:shadow-[0_2px_0_#070d20] transition-all border border-[#2e3449] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">home</span>
            <span>Main Menu</span>
            <span className="text-lg">🏠</span>
          </button>
        </div>

        {/* Footnote */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[#bbc9cf]">
          <span className="material-symbols-outlined text-[18px] text-[#ffad9a]">sentiment_very_satisfied</span>
          <span className="font-quicksand font-bold text-xs sm:text-sm">
            Every run earns stardust tokens for hangar upgrades!
          </span>
        </div>
      </div>
    </div>
  );
};
