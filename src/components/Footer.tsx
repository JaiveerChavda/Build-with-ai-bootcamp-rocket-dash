import React from 'react';
import { GameMode } from '../types/game';

interface FooterProps {
  mode: GameMode;
}

export const Footer: React.FC<FooterProps> = ({ mode }) => {
  if (mode === 'astra-thrust') {
    return (
      <footer className="w-full bg-[#0d0e13]/90 backdrop-blur-md py-4 border-t border-[#34343a] z-40 relative">
        <div className="w-full px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-2 font-space-mono text-[10px] text-[#b9cacb]">
          <div className="flex items-center gap-3">
            <span className="text-[#6ff6ff] font-bold">SYSTEM: OPTIMAL</span>
            <span className="text-[#849495]">|</span>
            <span>CANOPY TELEMETRY REV 4.9.1</span>
            <span className="text-[#849495]">|</span>
            <span>ENCRYPTION: QUANTUM LOCK</span>
          </div>
          <div className="flex items-center gap-4">
            <span>© 2024 ASTRA THRUST // VELOCITY RUN</span>
            <span className="text-[#849495]">•</span>
            <button className="text-[#b9cacb] hover:text-[#00f2fe] transition-colors" type="button">
              FLIGHT MANUAL
            </button>
            <span className="text-[#849495]">•</span>
            <button className="text-[#b9cacb] hover:text-[#00f2fe] transition-colors" type="button">
              COMM PROTOCOLS
            </button>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full bg-[#070d20] border-t border-[#191f32] py-5 z-40 relative">
      <div className="w-full px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#00d2ff]/20 flex items-center justify-center text-[#00d2ff]">
            <span className="material-symbols-outlined text-[18px]">rocket</span>
          </div>
          <span className="font-quicksand font-bold text-sm text-[#bbc9cf]">
            Rocket Dash • Friendly Galaxy Arcade
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-quicksand font-bold text-sm text-[#859399]">
            Safe for Little Explorers
          </span>
          <span className="font-rubik font-extrabold text-xs text-[#bbc9cf] bg-[#151b2e] px-3 py-1 rounded-full border border-[#23293d]">
            v1.2 Cosmic Edition
          </span>
        </div>
      </div>
    </footer>
  );
};
