import React, { useState } from 'react';
import { GameMode, PlayerStats } from '../types/game';
import { INITIAL_BADGES, LEADERBOARD_ENTRIES } from '../utils/gameData';
import { soundManager } from '../utils/audio';

interface StarBadgesProps {
  mode: GameMode;
  stats: PlayerStats;
  onLaunch: () => void;
}

export const StarBadges: React.FC<StarBadgesProps> = ({ stats, onLaunch }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredBadges = INITIAL_BADGES.filter((badge) => {
    if (filter === 'unlocked') return badge.unlocked;
    if (filter === 'locked') return !badge.unlocked;
    return true;
  });

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] py-6 px-4 md:px-10 max-w-7xl mx-auto select-none">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#23293d]">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#fecf00] text-[24px]">military_tech</span>
            <span className="font-rubik font-extrabold text-xs text-[#ffe082] uppercase tracking-wider">
              PILOT HALL OF FAME
            </span>
          </div>
          <h1 className="font-rubik font-black text-3xl sm:text-4xl text-[#dce1fc] tracking-tight">
            Star Badges &amp; Leaderboards
          </h1>
          <p className="font-quicksand font-bold text-sm text-[#bbc9cf]">
            Celebrate cosmic milestones, unlock reward stardust, and compare telemetry with pilots across the galaxy.
          </p>
        </div>

        {/* Total Badges Counter */}
        <div className="flex items-center gap-3 bg-[#191f32] px-5 py-2.5 rounded-2xl border border-[#2e3449] shadow-lg">
          <span className="material-symbols-outlined text-[#00d2ff] text-[28px]">workspace_premium</span>
          <div className="flex flex-col">
            <span className="font-quicksand font-bold text-xs text-[#bbc9cf] uppercase">BADGES UNLOCKED</span>
            <span className="font-rubik font-black text-xl text-[#a5e7ff]">
              {INITIAL_BADGES.filter((b) => b.unlocked).length} / {INITIAL_BADGES.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Badges Grid (8 Cols) & Global Leaderboard (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-start">
        {/* Badges Section */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Filters */}
          <div className="flex items-center gap-2 bg-[#151b2e] p-1.5 rounded-2xl border border-[#23293d] w-fit">
            <button
              onClick={() => {
                soundManager.playClickSound();
                setFilter('all');
              }}
              className={`px-4 py-1.5 rounded-xl font-rubik font-extrabold text-xs transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#23293d] text-[#a5e7ff] shadow-[0_2px_0_#070d20]'
                  : 'text-[#bbc9cf] hover:text-[#dce1fc]'
              }`}
              type="button"
            >
              All Badges ({INITIAL_BADGES.length})
            </button>
            <button
              onClick={() => {
                soundManager.playClickSound();
                setFilter('unlocked');
              }}
              className={`px-4 py-1.5 rounded-xl font-rubik font-extrabold text-xs transition-all cursor-pointer ${
                filter === 'unlocked'
                  ? 'bg-[#23293d] text-[#fecf00] shadow-[0_2px_0_#070d20]'
                  : 'text-[#bbc9cf] hover:text-[#dce1fc]'
              }`}
              type="button"
            >
              Unlocked ({INITIAL_BADGES.filter((b) => b.unlocked).length})
            </button>
            <button
              onClick={() => {
                soundManager.playClickSound();
                setFilter('locked');
              }}
              className={`px-4 py-1.5 rounded-xl font-rubik font-extrabold text-xs transition-all cursor-pointer ${
                filter === 'locked'
                  ? 'bg-[#23293d] text-[#bbc9cf] shadow-[0_2px_0_#070d20]'
                  : 'text-[#bbc9cf] hover:text-[#dce1fc]'
              }`}
              type="button"
            >
              In Progress ({INITIAL_BADGES.filter((b) => !b.unlocked).length})
            </button>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredBadges.map((badge) => {
              const progressPct = Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100));

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-3xl border transition-all flex flex-col justify-between gap-3 ${
                    badge.unlocked
                      ? 'bg-[#191f32] border-[#2e3449] shadow-lg'
                      : 'bg-[#151b2e]/60 border-[#23293d] opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        badge.unlocked
                          ? 'bg-[#fecf00]/20 text-[#fecf00] shadow-[0_3px_0_#6f5900]'
                          : 'bg-[#23293d] text-[#859399]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {badge.icon}
                      </span>
                    </div>

                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-rubik font-black text-base text-[#dce1fc]">
                          {badge.title}
                        </span>
                        {badge.unlocked ? (
                          <span className="font-rubik font-extrabold text-[10px] bg-[#fecf00]/20 text-[#ffe082] px-2 py-0.5 rounded-full">
                            UNLOCKED
                          </span>
                        ) : (
                          <span className="font-quicksand font-bold text-[10px] text-[#859399]">
                            {badge.progress} / {badge.maxProgress}
                          </span>
                        )}
                      </div>
                      <p className="font-quicksand font-bold text-xs text-[#bbc9cf] mt-0.5">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar & Reward */}
                  <div className="flex flex-col gap-1.5 pt-1 border-t border-[#23293d]/50">
                    <div className="w-full h-2 rounded-full bg-[#070d20] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          badge.unlocked ? 'bg-[#00d2ff]' : 'bg-[#fecf00]'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between font-quicksand font-bold text-[11px] text-[#bbc9cf]">
                      <span>Progress: {progressPct}%</span>
                      <span className="text-[#ffe082]">+{badge.rewardCoins} Coins Reward</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Leaderboard Section */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#191f32] p-5 rounded-3xl border border-[#2e3449] shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#23293d]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00d2ff] text-[20px]">leaderboard</span>
                <h2 className="font-rubik font-black text-base text-[#dce1fc] uppercase tracking-wide">
                  Sector 7 Global
                </h2>
              </div>
              <span className="font-rubik font-bold text-xs text-[#ffe082] bg-[#23293d] px-2.5 py-0.5 rounded-full">
                SEASON 12
              </span>
            </div>

            {/* List */}
            <div className="flex flex-col gap-2">
              {LEADERBOARD_ENTRIES.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                    entry.isUser
                      ? 'bg-[#00d2ff]/20 border-[#00d2ff] shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                      : 'bg-[#151b2e] border-[#23293d]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-rubik font-black text-sm w-7 text-center ${
                        entry.rank === 1
                          ? 'text-amber-300'
                          : entry.rank === 2
                          ? 'text-slate-300'
                          : entry.rank === 3
                          ? 'text-amber-600'
                          : entry.isUser
                          ? 'text-[#00d2ff]'
                          : 'text-[#859399]'
                      }`}
                    >
                      #{entry.rank}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-rubik font-black text-xs text-[#dce1fc] flex items-center gap-1">
                        {entry.name}
                        {entry.isUser && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-pulse" />
                        )}
                      </span>
                      <span className="font-quicksand font-bold text-[10px] text-[#bbc9cf]">
                        LVL {entry.level} • {entry.badge}
                      </span>
                    </div>
                  </div>
                  <span className="font-rubik font-black text-sm text-[#ffe082]">
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Launch Button */}
            <button
              onClick={() => {
                soundManager.playBoostSound();
                onLaunch();
              }}
              className="mt-3 w-full h-14 rounded-full bg-[#00d2ff] hover:bg-[#47d6ff] text-[#003543] font-rubik font-black text-base shadow-[0_4px_0_#00566a] active:translate-y-1 active:shadow-[0_1px_0_#00566a] transition-all flex items-center justify-center gap-2 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
              <span>PLAY &amp; CLIMB RANKS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
