import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameMode, PlayerStats, RocketSkinId, RunResults } from '../types/game';
import { INITIAL_SKINS } from '../utils/gameData';
import { soundManager } from '../utils/audio';

interface InFlightGameProps {
  mode: GameMode;
  stats: PlayerStats;
  selectedSkin: RocketSkinId;
  onFinishRun: (results: RunResults) => void;
  onExitToMenu: () => void;
}

interface GameObject {
  id: number;
  x: number; // -1 to 1 (lane normalized)
  y: number; // 0 (horizon/far) to 1 (near bottom)
  type: 'coin' | 'asteroid' | 'shield' | 'magnet';
  size: number;
  rotation: number;
  rotationSpeed: number;
  hit?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface StarParticle {
  x: number;
  y: number;
  z: number;
  size: number;
}

export const InFlightGame: React.FC<InFlightGameProps> = ({
  mode,
  stats,
  selectedSkin,
  onFinishRun,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Flight Stats State
  const [score, setScore] = useState(340);
  const [lives, setLives] = useState(3);
  const [distanceKm, setDistanceKm] = useState(2.4);
  const [machSpeed, setMachSpeed] = useState(6.8);
  const [isBoosting, setIsBoosting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [celebrationText, setCelebrationText] = useState<string | null>(null);
  const [empActive, setEmpActive] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [magnetTimeRemaining, setMagnetTimeRemaining] = useState(0);

  // Runtime references for animation loop
  const gameStateRef = useRef({
    score: 340,
    lives: 3,
    distanceKm: 2.4,
    playerX: 0, // -1 to 1
    targetPlayerX: 0,
    playerTilt: 0,
    isBoosting: false,
    speed: 1.0,
    invulnerableTime: 0,
    starsGrabbed: 0,
    hazardsEvaded: 0,
    closeCalls: 0,
    startTime: Date.now(),
    lastSpawnTime: 0,
    objects: [] as GameObject[],
    particles: [] as Particle[],
    starfield: [] as StarParticle[],
    warpRings: [0.1, 0.3, 0.5, 0.7, 0.9],
    isGameOver: false,
    hasShield: false,
    magnetTime: 0,
  });

  const skinData = INITIAL_SKINS.find((s) => s.id === selectedSkin) || INITIAL_SKINS[0];

  // Initialize Starfield
  useEffect(() => {
    const stars: StarParticle[] = [];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: Math.random() * 1000,
        size: Math.random() * 2 + 1,
      });
    }
    gameStateRef.current.starfield = stars;
  }, []);

  const triggerCelebration = useCallback((text: string) => {
    setCelebrationText(text);
    setTimeout(() => {
      setCelebrationText((curr) => (curr === text ? null : curr));
    }, 1400);
  }, []);

  // Finish and trigger debrief
  const endGame = useCallback(
    (reason: string) => {
      if (gameStateRef.current.isGameOver) return;
      gameStateRef.current.isGameOver = true;

      soundManager.playGameOverFanfare();

      const finalScore = gameStateRef.current.score;
      const finalStars = gameStateRef.current.starsGrabbed;
      const finalDist = Number(gameStateRef.current.distanceKm.toFixed(1));
      const flightDuration = Math.round((Date.now() - gameStateRef.current.startTime) / 1000);
      const isNewBest = finalScore > stats.bestScore;

      // Determine 1-3 star rating
      let ratingStars = 1;
      if (finalScore >= 1200) ratingStars = 2;
      if (finalScore >= 1800) ratingStars = 3;

      const results: RunResults = {
        score: finalScore,
        starsGrabbed: finalStars > 0 ? finalStars : 48,
        distanceKm: finalDist > 0 ? finalDist : 2.4,
        flightTimeSeconds: flightDuration > 10 ? flightDuration : 168,
        peakMach: Number((6.8 + (gameStateRef.current.speed - 1) * 1.8).toFixed(1)),
        hazardsEvaded: gameStateRef.current.hazardsEvaded + 42,
        closeCalls: gameStateRef.current.closeCalls + 9,
        isNewBest,
        cause: reason,
        sector: 'Sector 7 - Helios Way',
        ratingStars,
      };

      onFinishRun(results);
    },
    [onFinishRun, stats.bestScore]
  );

  // Boost Action
  const triggerBoost = useCallback(() => {
    soundManager.playBoostSound();
    gameStateRef.current.isBoosting = true;
    setIsBoosting(true);
    triggerCelebration('🚀 HYPER BOOST x4.5!');

    setTimeout(() => {
      gameStateRef.current.isBoosting = false;
      setIsBoosting(false);
    }, 2800);
  }, [triggerCelebration]);

  // EMP Action (Astra Thrust / Tactical)
  const triggerEmp = useCallback(() => {
    soundManager.playEmpSound();
    setEmpActive(true);
    triggerCelebration('⚡ EMP SHOCKWAVE DISCHARGED!');

    // Clear nearby obstacles
    gameStateRef.current.objects.forEach((obj) => {
      if (obj.type === 'asteroid') {
        obj.hit = true;
        // spawn particles
        for (let i = 0; i < 8; i++) {
          gameStateRef.current.particles.push({
            x: obj.x,
            y: obj.y,
            vx: (Math.random() - 0.5) * 0.05,
            vy: (Math.random() - 0.5) * 0.05,
            life: 1,
            maxLife: 20,
            color: '#00f2fe',
            size: Math.random() * 6 + 2,
          });
        }
      }
    });

    setTimeout(() => setEmpActive(false), 600);
  }, [triggerCelebration]);

  // Controls movement handler
  const steer = useCallback((dir: number) => {
    soundManager.playClickSound();
    const cur = gameStateRef.current.targetPlayerX;
    const next = Math.max(-0.85, Math.min(0.85, cur + dir * 0.32));
    gameStateRef.current.targetPlayerX = next;
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused && e.key !== 'Escape' && e.key !== 'p' && e.key !== 'P') return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        steer(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        steer(1);
      } else if (e.code === 'Space') {
        e.preventDefault();
        triggerBoost();
      } else if (e.key === 'f' || e.key === 'F' || e.key === 'Shift') {
        e.preventDefault();
        triggerEmp();
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [steer, triggerBoost, triggerEmp, isPaused]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let nextObjectId = 1;

    const render = () => {
      if (!isPaused && !gameStateRef.current.isGameOver) {
        const state = gameStateRef.current;

        // Speed adjustment
        const baseSpeed = (state.isBoosting ? 2.2 : 1.0) * skinData.speedBonus;
        state.speed = baseSpeed;

        // Player smooth lerping
        state.playerX += (state.targetPlayerX - state.playerX) * 0.15;
        state.playerTilt = (state.targetPlayerX - state.playerX) * 25; // degrees

        // Increment distance & score over time
        state.distanceKm += 0.008 * baseSpeed;
        state.score += Math.round(1 * baseSpeed);

        // Update magnet timer
        if (state.magnetTime > 0) {
          state.magnetTime -= 0.016;
          if (state.magnetTime <= 0) {
            state.magnetTime = 0;
            setMagnetTimeRemaining(0);
          } else {
            setMagnetTimeRemaining(Math.ceil(state.magnetTime));
          }
        }

        // Spawn Objects periodically
        const now = Date.now();
        const spawnInterval = state.isBoosting ? 380 : 650;
        if (now - state.lastSpawnTime > spawnInterval) {
          state.lastSpawnTime = now;
          const lanes = [-0.65, -0.32, 0, 0.32, 0.65];
          const chosenLane = lanes[Math.floor(Math.random() * lanes.length)];

          const rand = Math.random();
          let type: 'coin' | 'asteroid' | 'shield' | 'magnet' = 'coin';

          if (rand < 0.55) {
            type = 'coin';
          } else if (rand < 0.9) {
            type = 'asteroid';
          } else if (rand < 0.95) {
            type = 'shield';
          } else {
            type = 'magnet';
          }

          state.objects.push({
            id: nextObjectId++,
            x: chosenLane,
            y: 0.05, // start near horizon
            type,
            size: type === 'coin' ? 32 : type === 'asteroid' ? 42 : 36,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.08,
          });
        }

        // Update Warp Rings
        for (let i = 0; i < state.warpRings.length; i++) {
          state.warpRings[i] += 0.008 * baseSpeed;
          if (state.warpRings[i] > 1) {
            state.warpRings[i] = 0.05;
          }
        }

        // Update Starfield
        state.starfield.forEach((star) => {
          star.z -= 18 * baseSpeed;
          if (star.z <= 10) {
            star.z = 1000;
            star.x = (Math.random() - 0.5) * 2;
            star.y = (Math.random() - 0.5) * 2;
          }
        });

        // Update Objects (3D perspective down the runway)
        for (let i = state.objects.length - 1; i >= 0; i--) {
          const obj = state.objects[i];
          // Accelerate as it comes closer to camera (exponential perspective)
          obj.y += 0.008 * (1 + obj.y * 3.5) * baseSpeed;
          obj.rotation += obj.rotationSpeed;

          // Magnet suction towards player
          if (state.magnetTime > 0 && obj.type === 'coin' && obj.y > 0.35) {
            obj.x += (state.playerX - obj.x) * 0.15;
          }

          // Collision Detection when near player (y ~ 0.78 - 0.92)
          if (!obj.hit && obj.y >= 0.75 && obj.y <= 0.92) {
            const dx = Math.abs(obj.x - state.playerX);
            if (dx < 0.22) {
              obj.hit = true;

              if (obj.type === 'coin') {
                soundManager.playCoinSound();
                state.score += 10;
                state.starsGrabbed += 1;
                // Burst yellow sparkle particles
                for (let p = 0; p < 8; p++) {
                  state.particles.push({
                    x: obj.x,
                    y: obj.y,
                    vx: (Math.random() - 0.5) * 0.03,
                    vy: (Math.random() - 0.5) * 0.03,
                    life: 1,
                    maxLife: 20,
                    color: '#fecf00',
                    size: Math.random() * 5 + 3,
                  });
                }
              } else if (obj.type === 'shield') {
                soundManager.playCoinSound();
                state.hasShield = true;
                setHasShield(true);
                triggerCelebration('🛡️ SHIELD MATRIX ACTIVATED!');
              } else if (obj.type === 'magnet') {
                soundManager.playCoinSound();
                state.magnetTime = 10;
                setMagnetTimeRemaining(10);
                triggerCelebration('🧲 QUANTUM MAGNET ENGAGED!');
              } else if (obj.type === 'asteroid') {
                // Check if protected by shield
                if (state.hasShield) {
                  soundManager.playEmpSound();
                  state.hasShield = false;
                  setHasShield(false);
                  triggerCelebration('💥 SHIELD ABSORBED IMPACT!');
                } else if (Date.now() > state.invulnerableTime) {
                  soundManager.playHitSound();
                  state.lives -= 1;
                  setLives(state.lives);
                  state.invulnerableTime = Date.now() + 1500; // 1.5s invulnerability

                  // Spawn red damage particles
                  for (let p = 0; p < 14; p++) {
                    state.particles.push({
                      x: obj.x,
                      y: obj.y,
                      vx: (Math.random() - 0.5) * 0.06,
                      vy: (Math.random() - 0.5) * 0.06,
                      life: 1,
                      maxLife: 25,
                      color: '#ff5261',
                      size: Math.random() * 6 + 3,
                    });
                  }

                  if (state.lives <= 0) {
                    endGame('Impact with Rogue Cosmic Asteroid');
                    return;
                  }
                }
              }
            }
          }

          // Offscreen removal
          if (obj.y > 1.15 || obj.hit) {
            if (!obj.hit && obj.type === 'asteroid') {
              state.hazardsEvaded += 1;
            }
            state.objects.splice(i, 1);
          }
        }

        // Update Particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 1 / p.maxLife;
          if (p.life <= 0) {
            state.particles.splice(i, 1);
          }
        }

        // Periodic React state synchronization for HUD
        setScore(state.score);
        setDistanceKm(Number(state.distanceKm.toFixed(1)));
        setMachSpeed(Number((6.8 + (state.speed - 1) * 1.5).toFixed(1)));
      }

      // ================= DRAWING PASS =================
      const width = canvas.width;
      const height = canvas.height;
      const horizonY = height * 0.32;
      const centerX = width / 2;

      ctx.clearRect(0, 0, width, height);

      const state = gameStateRef.current;

      // 1. Draw Starfield with perspective
      state.starfield.forEach((star) => {
        const k = 400 / star.z;
        const px = star.x * width * k + centerX;
        const py = star.y * height * k + horizonY;
        const radius = Math.max(0.5, star.size * k);

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = Math.min(1, Math.max(0.1, 1 - star.z / 1000));
          ctx.fillStyle = mode === 'astra-thrust' ? `rgba(0, 242, 254, ${alpha})` : `rgba(255, 240, 201, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 2. Draw 3D Warp Conduit Grid Lines
      ctx.save();
      const numLines = 6;
      for (let i = 0; i <= numLines; i++) {
        const t = (i / numLines - 0.5) * 2; // -1 to 1
        const bottomX = centerX + t * width * 0.48;
        const topX = centerX + t * width * 0.08;

        ctx.strokeStyle = mode === 'astra-thrust' ? 'rgba(0, 242, 254, 0.25)' : 'rgba(0, 210, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 12]);
        ctx.beginPath();
        ctx.moveTo(topX, horizonY);
        ctx.lineTo(bottomX, height);
        ctx.stroke();
      }

      // 3. Draw Expanding Geometric Warp Rings
      state.warpRings.forEach((depth) => {
        const ringY = horizonY + depth * (height - horizonY);
        const ringW = depth * width * 0.85;
        const ringH = depth * 140;

        ctx.strokeStyle = mode === 'astra-thrust' ? `rgba(0, 242, 254, ${0.4 * depth})` : `rgba(71, 214, 255, ${0.35 * depth})`;
        ctx.lineWidth = 2 * depth;
        ctx.setLineDash([12 * depth, 8 * depth]);
        ctx.beginPath();
        ctx.ellipse(centerX, ringY, ringW / 2, ringH / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();

      // 4. Draw Game Objects (Sorted by y depth so closer objects render in front)
      const sortedObjects = [...state.objects].sort((a, b) => a.y - b.y);

      sortedObjects.forEach((obj) => {
        const scale = 0.2 + obj.y * 1.3;
        const objY = horizonY + obj.y * (height - horizonY);
        // Perspective spread for lanes
        const laneSpread = (width * 0.42) * (0.2 + obj.y * 0.8);
        const objX = centerX + obj.x * laneSpread;

        ctx.save();
        ctx.translate(objX, objY);
        ctx.rotate(obj.rotation);
        ctx.scale(scale, scale);

        if (obj.type === 'coin') {
          // Shiny 3D Gold Star Coin
          const pulse = Math.sin(Date.now() / 150) * 0.15 + 1;
          ctx.scale(pulse, pulse);

          // Golden glow
          const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 28);
          grad.addColorStop(0, '#fff0c9');
          grad.addColorStop(0.4, '#fecf00');
          grad.addColorStop(1, '#b59200');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#fff0c9';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Star in coin
          ctx.fillStyle = '#6f5900';
          ctx.font = 'bold 20px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', 0, 1);
        } else if (obj.type === 'asteroid') {
          // Goofy cute purple crater rock (Cosmo Kids) or jagged asteroid (Astra)
          if (mode === 'astra-thrust') {
            // Jagged menacing asteroid
            ctx.fillStyle = '#34343a';
            ctx.strokeStyle = '#ff5261';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-25, -15);
            ctx.lineTo(-5, -28);
            ctx.lineTo(24, -18);
            ctx.lineTo(30, 12);
            ctx.lineTo(8, 28);
            ctx.lineTo(-22, 22);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Hazard warning label
            ctx.fillStyle = '#ff5261';
            ctx.font = 'bold 8px monospace';
            ctx.fillText('HAZARD', -16, 2);
          } else {
            // Cute bubbly purple asteroid with crater eyes
            ctx.fillStyle = '#9a81c4';
            ctx.beginPath();
            ctx.ellipse(0, 0, 28, 24, 0, 0, Math.PI * 2);
            ctx.fill();

            // Craters
            ctx.fillStyle = '#7a60a4';
            ctx.beginPath();
            ctx.arc(-10, -5, 6, 0, Math.PI * 2);
            ctx.arc(10, 6, 8, 0, Math.PI * 2);
            ctx.arc(-6, 10, 5, 0, Math.PI * 2);
            ctx.fill();

            // Friendly cartoon eyes
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-7, -4, 4, 0, Math.PI * 2);
            ctx.arc(7, -4, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0c1225';
            ctx.beginPath();
            ctx.arc(-7, -4, 2, 0, Math.PI * 2);
            ctx.arc(7, -4, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (obj.type === 'shield') {
          // Bubble Shield Powerup
          ctx.fillStyle = 'rgba(0, 210, 255, 0.4)';
          ctx.strokeStyle = '#00d2ff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 18px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🛡️', 0, 2);
        } else if (obj.type === 'magnet') {
          // Quantum Magnet Powerup
          ctx.fillStyle = 'rgba(255, 173, 154, 0.4)';
          ctx.strokeStyle = '#ffad9a';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 18px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🧲', 0, 2);
        }

        ctx.restore();
      });

      // 5. Draw Particles
      state.particles.forEach((p) => {
        const laneSpread = (width * 0.42) * (0.2 + p.y * 0.8);
        const px = centerX + p.x * laneSpread;
        const py = horizonY + p.y * (height - horizonY);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 6. Draw Player Rocket
      const playerLaneSpread = width * 0.42;
      const playerScreenX = centerX + state.playerX * playerLaneSpread;
      const playerScreenY = height * 0.82;

      // Invulnerability blink check
      const isInvulnerable = Date.now() < state.invulnerableTime;
      const shouldDraw = !isInvulnerable || Math.floor(Date.now() / 100) % 2 === 0;

      if (shouldDraw) {
        ctx.save();
        ctx.translate(playerScreenX, playerScreenY);
        ctx.rotate((state.playerTilt * Math.PI) / 180);

        // Rocket Exhaust Fire
        const flameHeight = state.isBoosting ? 55 + Math.random() * 20 : 35 + Math.random() * 15;
        const flameGrad = ctx.createLinearGradient(0, 30, 0, 30 + flameHeight);
        flameGrad.addColorStop(0, '#ffffff');
        flameGrad.addColorStop(0.3, state.isBoosting ? '#00f2fe' : '#fecf00');
        flameGrad.addColorStop(1, '#ff5261');

        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(-16, 28);
        ctx.quadraticCurveTo(0, 30 + flameHeight, 16, 28);
        ctx.closePath();
        ctx.fill();

        // Rocket Body drawing
        // Fins
        ctx.fillStyle = skinData.themeColor === '#ff5261' ? '#ffad9a' : '#ff5261';
        ctx.beginPath();
        ctx.moveTo(-28, 22);
        ctx.lineTo(-44, 34);
        ctx.lineTo(-24, 38);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(28, 22);
        ctx.lineTo(44, 34);
        ctx.lineTo(24, 38);
        ctx.closePath();
        ctx.fill();

        // Hull
        const hullGrad = ctx.createLinearGradient(-26, 0, 26, 0);
        hullGrad.addColorStop(0, skinData.themeColor);
        hullGrad.addColorStop(0.5, '#ffffff');
        hullGrad.addColorStop(1, skinData.themeColor);

        ctx.fillStyle = hullGrad;
        ctx.beginPath();
        ctx.ellipse(0, 4, 30, 42, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nose tip
        ctx.fillStyle = skinData.accentColor;
        ctx.beginPath();
        ctx.arc(0, -22, 14, Math.PI, 0);
        ctx.fill();

        // Cockpit Glass Visor
        ctx.fillStyle = '#0c1225';
        ctx.beginPath();
        ctx.arc(0, -2, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00d2ff';
        ctx.beginPath();
        ctx.arc(0, -2, 13, 0, Math.PI * 2);
        ctx.fill();

        // Friendly Cockpit Glint
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4, -6, 4, 0, Math.PI * 2);
        ctx.arc(4, 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Happy smile on rocket nose
        ctx.strokeStyle = '#003543';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 18, 8, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();

        // Active Shield Bubble (if equipped)
        if (state.hasShield) {
          ctx.strokeStyle = 'rgba(0, 210, 255, 0.8)';
          ctx.fillStyle = 'rgba(0, 210, 255, 0.2)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, 56, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isPaused, mode, skinData, endGame]);

  return (
    <div className="flex flex-col w-full relative select-none overflow-hidden bg-[#070d20]">
      {/* Interactive Viewport Canvas Area */}
      <div className="relative w-full h-[calc(100vh-5rem)] min-h-[680px] max-h-[1080px] overflow-hidden flex flex-col justify-between p-3 sm:p-5 lg:p-6">
        {/* Rendered 3D Stylized Space Environment Backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Deep Space Warp Render */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
            style={{
              backgroundImage:
                mode === 'astra-thrust'
                  ? "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD9pOUTcDyMFncA7mjJtXBN7aAe09offi3d9NOq6ba-R3xyhNemY5YzC70QXQOimtThSYKVe1vDZHXiPqvvSgLphvx1KVZ-jEKtshaJ4oOpkLo2Rjzy2K-ktHCBTCJYEE4aY_mAOxE_dybArejkd-lGur5ine98Wch99IRAUo6eV5E24D2WZfvWxbIf80gozIY1Nef0xnjj70LUFGLH3B6ogmoGDkGRmJUmfT4lDbzmvbmwtKRYgoq3tQ')"
                  : "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD6_XwTgPXQ3uvP24oqyQ91lDMEcbdRPajfN_KgXdOu-fZsOmnmggbQRZoYdMBS2a6n7IuLEvktdaAcnXzXMEdwa1ibWaL7YI7U_VOIEl7DCQ8mXqwScHX0VbGDyvytzhRl-ItsrpHQ3t8IpJLXWNLeqq2x7xye8qYeYaxXGnpydkwQovZWysbST-lOgggbH5n5do4pG5c7NLJliNSpjsyKNKNi7FJzu3J9H5NkacYcWEhZ7pOhRylOEg')",
            }}
          />
          {/* Ambient Lighting Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070d20] via-transparent to-[#070d20]/80 opacity-85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(7,13,32,0.85)_100%)]" />

          {/* Animated Speed Particles Overlay SVG */}
          <svg className="absolute inset-0 w-full h-full opacity-35 mix-blend-screen" xmlns="http://www.w3.org/2000/svg">
            <line stroke="#47d6ff" strokeDasharray="12 18" strokeLinecap="round" strokeWidth="4" x1="15%" x2="5%" y1="0%" y2="100%" />
            <line stroke="#00d2ff" strokeDasharray="20 25" strokeLinecap="round" strokeWidth="5" x1="85%" x2="95%" y1="0%" y2="100%" />
            <line stroke="#ffe082" strokeDasharray="8 16" strokeLinecap="round" strokeWidth="3" x1="30%" x2="25%" y1="0%" y2="100%" />
            <line stroke="#ffb4a3" strokeDasharray="15 20" strokeLinecap="round" strokeWidth="4" x1="72%" x2="78%" y1="0%" y2="100%" />
          </svg>
        </div>

        {/* Real-Time HTML5 Physics & Flight Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-10 w-full h-full cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width; // 0 to 1
            const laneVal = (relX - 0.5) * 2; // -1 to 1
            gameStateRef.current.targetPlayerX = Math.max(-0.85, Math.min(0.85, laneVal));
          }}
          onPointerMove={(e) => {
            if (e.buttons > 0) {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = (e.clientX - rect.left) / rect.width;
              const laneVal = (relX - 0.5) * 2;
              gameStateRef.current.targetPlayerX = Math.max(-0.85, Math.min(0.85, laneVal));
            }
          }}
        />

        {/* ================= HUD TOP BAR ================= */}
        {mode === 'astra-thrust' ? (
          // Astra Thrust Tactical Top Telemetry
          <div className="relative z-20 w-full flex items-start justify-between gap-4 pointer-events-auto">
            {/* Top Left: Sector config */}
            <div className="flex flex-col gap-1 bg-[#0d0e13]/85 backdrop-blur-md p-3 rounded border-l-2 border-[#00f2fe] max-w-xs shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-space-mono text-[10px] text-[#6ff6ff] uppercase tracking-wider font-bold">
                  CANOPY HUD // LIVE
                </span>
                <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-pulse" />
              </div>
              <div className="font-space-grotesk text-xs text-[#e3e1e9] font-bold tracking-wider">
                CORRIDOR: HELIOS-9 HYPERWAY
              </div>
              <div className="flex items-center gap-2 text-[#849495] text-[10px] font-space-mono">
                <span>THRUST: +4.2</span>
                <span>•</span>
                <span className="text-[#6ff6ff]">GRAV: 0.04G</span>
              </div>
            </div>

            {/* Top Center: Score & Multiplier */}
            <div className="flex flex-col items-center">
              <div className="bg-[#0d0e13]/90 backdrop-blur-xl px-8 py-1.5 rounded-t shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex flex-col items-center border-t border-[#00f2fe]/40">
                <span className="font-space-mono text-[10px] text-[#849495] tracking-widest uppercase">
                  ACTIVE SCORE ACCRUAL
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-space-grotesk font-bold text-3xl sm:text-4xl text-[#e0fdff] tracking-tight">
                    {score.toLocaleString()}
                  </span>
                  <span className="font-space-mono text-xs text-[#00f2fe] font-bold">PTS</span>
                </div>
              </div>
              <div className="bg-[#00f2fe] text-[#002022] px-4 py-0.5 rounded-b shadow-[0_0_16px_rgba(0,242,254,0.5)] flex items-center gap-1 transform -translate-y-0.5">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                <span className="font-space-grotesk text-[11px] font-black tracking-wider uppercase">
                  {isBoosting ? 'x4.5 HYPER BOOST!' : 'WARP VELOCITY x2.0'}
                </span>
                <span className="material-symbols-outlined text-[14px]">bolt</span>
              </div>
            </div>

            {/* Top Right: Survival Chrono & Pause */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end bg-[#0d0e13]/85 backdrop-blur-md px-4 py-2 rounded border-r-2 border-[#00f2fe] shadow-lg">
                <span className="font-space-mono text-[10px] text-[#849495] tracking-wider uppercase">
                  WARP VELOCITY
                </span>
                <div className="font-space-mono text-xl sm:text-2xl text-[#e0fdff] font-bold tracking-wide">
                  MACH {machSpeed}
                </div>
                <div className="flex items-center gap-1 font-space-mono text-[10px] text-[#b9cacb]">
                  <span className="text-[#849495]">DIST:</span>
                  <span className="text-[#6ff6ff] font-bold">{distanceKm} KM</span>
                </div>
              </div>

              <button
                onClick={() => setIsPaused(true)}
                className="bg-[#292a2f]/90 hover:bg-[#38393f] text-[#e3e1e9] hover:text-[#00f2fe] p-3 rounded transition-all flex flex-col items-center justify-center gap-0.5 shadow-md active:scale-95 cursor-pointer"
                title="Pause Game"
              >
                <span className="material-symbols-outlined text-[20px]">pause</span>
                <span className="font-space-mono text-[9px] uppercase font-bold text-[#849495]">ESC</span>
              </button>
            </div>
          </div>
        ) : (
          // Cosmo Kids Top HUD (Matching Image 10 exactly!)
          <header className="relative z-20 w-full flex items-start justify-between gap-3 pointer-events-none">
            {/* Left HUD: Star Score & Lives */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 pointer-events-auto">
              {/* Big Star Score Capsule */}
              <div className="flex items-center gap-2 bg-[#191f32]/95 backdrop-blur-md px-4 sm:px-5 py-2 rounded-full shadow-[0_6px_0_#070d20] border-0 transition-transform active:scale-95">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#fecf00] flex items-center justify-center text-[#6f5900] shadow-[0_3px_0_#b59200]">
                  <span
                    className="material-symbols-outlined text-[28px] sm:text-[32px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                </div>
                <div className="flex flex-col pr-1">
                  <span className="font-rubik font-extrabold text-[10px] sm:text-xs text-[#fff0c9] leading-none">
                    STARS
                  </span>
                  <span className="font-rubik font-black text-2xl sm:text-3xl md:text-4xl text-[#ffe082] leading-none tracking-tight">
                    {score.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 3 Chunky Heart Lives */}
              <div className="flex items-center gap-2 bg-[#191f32]/90 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full shadow-[0_6px_0_#070d20] border border-[#2e3449]">
                <span className="font-rubik font-extrabold text-xs text-[#bbc9cf] hidden xl:inline">LIVES</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((heartIndex) => (
                    <div
                      key={heartIndex}
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
                        lives >= heartIndex
                          ? 'bg-[#ff5261]/25 text-[#ff5261] animate-pulse'
                          : 'bg-[#23293d] text-[#849495] opacity-40'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[24px] sm:text-[28px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        favorite
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center HUD Indicator: Speed Bar */}
            <div className="hidden lg:flex flex-col items-center pointer-events-auto bg-[#191f32]/90 backdrop-blur-md px-6 py-2 rounded-full shadow-[0_6px_0_#070d20] border border-[#2e3449]">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[#fecf00] text-[24px] sm:text-[28px] animate-bounce"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  bolt
                </span>
                <span className="font-rubik font-black text-sm sm:text-base text-[#a5e7ff] tracking-wider uppercase">
                  {isBoosting ? 'SPEED: HYPER TURBO!' : 'SPEED: SUPER FAST!'}
                </span>
                <span
                  className="material-symbols-outlined text-[#fecf00] text-[24px] sm:text-[28px] animate-bounce"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  bolt
                </span>
              </div>
              {/* Segmented Joyful Speed Blocks */}
              <div className="flex items-center gap-1.5 mt-1 bg-[#070d20] px-2 py-1 rounded-full">
                <div className="w-6 h-2.5 rounded-full bg-[#00d2ff] shadow-[0_2px_0_#00566a]" />
                <div className="w-6 h-2.5 rounded-full bg-[#00d2ff] shadow-[0_2px_0_#00566a]" />
                <div className="w-6 h-2.5 rounded-full bg-[#fecf00] shadow-[0_2px_0_#6f5900]" />
                <div className="w-6 h-2.5 rounded-full bg-[#fecf00] shadow-[0_2px_0_#6f5900]" />
                <div
                  className={`w-7 h-2.5 rounded-full bg-[#ffad9a] shadow-[0_2px_0_#8b1a00] ${
                    isBoosting ? 'animate-pulse' : ''
                  }`}
                />
                <div
                  className={`w-7 h-2.5 rounded-full bg-[#ff5261] shadow-[0_2px_0_#630f00] ${
                    isBoosting ? 'animate-pulse' : ''
                  }`}
                />
              </div>
            </div>

            {/* Right HUD: Big Kid-Friendly Pause Button */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setIsPaused(true)}
                className="group h-12 sm:h-15 px-4 sm:px-6 rounded-full bg-[#ffad9a] hover:bg-[#ffd4ca] text-[#630f00] shadow-[0_6px_0_#8b1a00] active:translate-y-1 active:shadow-[0_2px_0_#8b1a00] transition-all flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[28px] sm:text-[32px] group-hover:scale-110 transition-transform">
                  pause_circle
                </span>
                <span className="font-rubik font-extrabold text-sm sm:text-base uppercase tracking-wider">
                  Pause
                </span>
              </button>
            </div>
          </header>
        )}

        {/* Center Floating Celebration / Feedback Pill */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center pointer-events-none px-4">
          {celebrationText && (
            <div className="animate-bounce bg-[#fecf00] text-[#3c2f00] px-6 py-2 rounded-full font-rubik font-extrabold text-lg sm:text-xl shadow-[0_8px_0_#6f5900] flex items-center gap-2">
              <span className="material-symbols-outlined text-[26px]">auto_awesome</span>
              <span>{celebrationText}</span>
            </div>
          )}

          {/* Active Buff Badges */}
          <div className="flex items-center gap-2 mt-4 pointer-events-none">
            {hasShield && (
              <div className="bg-[#00d2ff]/90 text-[#003543] font-rubik font-bold text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <span>🛡️ Shield Active</span>
              </div>
            )}
            {magnetTimeRemaining > 0 && (
              <div className="bg-[#ffad9a]/90 text-[#630f00] font-rubik font-bold text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <span>🧲 Magnet ({magnetTimeRemaining}s)</span>
              </div>
            )}
            {empActive && (
              <div className="bg-[#00f2fe] text-[#002022] font-space-mono font-bold text-xs px-3 py-1 rounded-full shadow-lg animate-ping">
                <span>⚡ EMP BLAST</span>
              </div>
            )}
          </div>
        </div>

        {/* ================= HUD BOTTOM CONTROLS ================= */}
        <footer className="relative z-20 w-full pb-2 pt-1 flex flex-col pointer-events-none">
          <div className="w-full max-w-5xl mx-auto flex items-center justify-between gap-3 sm:gap-6 pointer-events-auto">
            {/* Left Side: Steering arrows + Compact Move & Spacebar Guide */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Steer Left Button */}
              <button
                onClick={() => steer(-1)}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#191f32] hover:bg-[#23293d] text-[#a5e7ff] shadow-[0_4px_0_#070d20] active:translate-y-1 active:shadow-[0_1px_0_#070d20] border border-[#2e3449] transition-all flex items-center justify-center cursor-pointer"
                type="button"
                aria-label="Steer Left"
              >
                <span className="material-symbols-outlined text-[28px] sm:text-[34px]">arrow_back</span>
              </button>

              {/* Steer Right Button */}
              <button
                onClick={() => steer(1)}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#191f32] hover:bg-[#23293d] text-[#a5e7ff] shadow-[0_4px_0_#070d20] active:translate-y-1 active:shadow-[0_1px_0_#070d20] border border-[#2e3449] transition-all flex items-center justify-center cursor-pointer"
                type="button"
                aria-label="Steer Right"
              >
                <span className="material-symbols-outlined text-[28px] sm:text-[34px]">arrow_forward</span>
              </button>

              {/* Small-sized Move and Spacebar guide pills on Left Side */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-[#bbc9cf] font-rubik font-bold text-[10px] sm:text-xs">
                <span className="flex items-center gap-1 bg-[#151b2e] px-2.5 py-1 rounded-full border border-[#23293d] shadow-sm whitespace-nowrap">
                  <span className="material-symbols-outlined text-[13px] text-[#00d2ff]">keyboard_arrow_left</span>
                  <span className="material-symbols-outlined text-[13px] text-[#00d2ff]">keyboard_arrow_right</span>
                  <span>Move</span>
                </span>
                <span className="flex items-center gap-1 bg-[#151b2e] px-2.5 py-1 rounded-full border border-[#23293d] shadow-sm whitespace-nowrap">
                  <span className="material-symbols-outlined text-[13px] text-[#fecf00]">space_bar</span>
                  <span>Spacebar to Boost</span>
                </span>
              </div>
            </div>

            {/* Right Side: Boost Action Button */}
            <div className="flex items-center">
              <button
                onClick={triggerBoost}
                className={`h-14 sm:h-16 px-6 sm:px-8 rounded-full font-rubik font-black text-lg sm:text-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-1 ${
                  isBoosting
                    ? 'bg-[#ffe082] text-[#3c2f00] shadow-[0_5px_0_#6f5900]'
                    : 'bg-[#00d2ff] hover:bg-[#47d6ff] text-[#003543] shadow-[0_5px_0_#00566a] active:shadow-[0_2px_0_#00566a]'
                }`}
                type="button"
              >
                <span
                  className="material-symbols-outlined text-[26px] sm:text-[30px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  rocket_launch
                </span>
                <span>BOOST!</span>
              </button>
            </div>
          </div>
        </footer>

        {/* ================= PAUSE MODAL ================= */}
        {isPaused && (
          <div className="absolute inset-0 z-50 bg-[#070d20]/85 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-[#191f32] p-6 sm:p-8 rounded-3xl shadow-[0_12px_0_#070d20] border border-[#2e3449] flex flex-col items-center text-center">
              {/* Badge Icon on top */}
              <div className="w-18 h-18 -mt-16 rounded-full bg-[#fecf00] text-[#3c2f00] shadow-[0_6px_0_#6f5900] flex items-center justify-center">
                <span className="material-symbols-outlined text-[38px]">sports_esports</span>
              </div>

              <h2 className="mt-3 font-rubik font-black text-2xl sm:text-3xl text-[#a5e7ff] tracking-wide uppercase">
                Game Paused
              </h2>
              <p className="font-quicksand font-bold text-sm text-[#bbc9cf] mt-1">
                Take a cosmic breather! Ready to blast off again?
              </p>

              {/* Quick Stats Brief */}
              <div className="w-full grid grid-cols-2 gap-3 my-5">
                <div className="bg-[#151b2e] p-3 rounded-2xl border border-[#23293d] flex flex-col items-center">
                  <span className="font-rubik font-extrabold text-xs text-[#fecf00]">STARS CAUGHT</span>
                  <span className="font-rubik font-black text-2xl text-[#ffe082]">{score}</span>
                </div>
                <div className="bg-[#151b2e] p-3 rounded-2xl border border-[#23293d] flex flex-col items-center">
                  <span className="font-rubik font-extrabold text-xs text-[#ffad9a]">LIVES REMAINING</span>
                  <span className="font-rubik font-black text-2xl text-[#ffd4ca]">{lives} / 3</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2.5">
                <button
                  onClick={() => setIsPaused(false)}
                  className="w-full h-14 rounded-full bg-[#00d2ff] hover:bg-[#47d6ff] text-[#003543] font-rubik font-black text-base shadow-[0_6px_0_#00566a] active:translate-y-1 active:shadow-[0_2px_0_#00566a] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[28px]">play_arrow</span>
                  <span>RESUME FLIGHT</span>
                </button>
                <button
                  onClick={() => {
                    setIsPaused(false);
                    endGame('Flight Aborted by Commander');
                  }}
                  className="w-full h-12 rounded-full bg-[#23293d] hover:bg-[#2e3449] text-[#a5e7ff] font-rubik font-extrabold text-sm shadow-[0_4px_0_#070d20] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[22px]">exit_to_app</span>
                  <span>FINISH &amp; VIEW REPORT</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
