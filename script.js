/**
 * 타도! 폭주족 (Defeat the Bikers - 2D Road Survivor)
 * Vanilla JavaScript (ES6+) Game Engine for direct GitHub Pages execution without build tools.
 */

// 1. Procedural Web Audio Synthesizer (No external sound files required)
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.engineOsc = null;
    this.engineGain = null;
    this.isEngineRunning = false;
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted && this.engineGain) {
      this.engineGain.gain.setValueAtTime(0, this.ctx ? this.ctx.currentTime : 0);
    }
  }

  startEngine() {
    if (this.isEngineRunning || this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.035, this.ctx.currentTime);
      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
      this.isEngineRunning = true;
    } catch (e) {}
  }

  updateEnginePitch(speedRatio, isBoosting) {
    if (!this.ctx || !this.engineOsc || !this.engineGain || this.isMuted) return;
    try {
      const targetFreq = 48 + speedRatio * 80 + (isBoosting ? 65 : 0);
      const targetGain = isBoosting ? 0.08 : 0.035;
      const now = this.ctx.currentTime;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
      this.engineGain.gain.setTargetAtTime(targetGain, now, 0.08);
    } catch (e) {}
  }

  stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch (e) {}
      this.engineOsc = null;
    }
    this.isEngineRunning = false;
  }

  playShoot() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.07);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  playBladeHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320 + Math.random() * 80, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.06);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  playMissileLaunch() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    } catch (e) {}
  }

  playExplosion() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 0.28);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.31);
    } catch (e) {}
  }

  playBoost() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.25);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  }

  playPickup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950 + Math.random() * 200, now);
      osc.frequency.setValueAtTime(1400, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  playLevelUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.21);
      });
    } catch (e) {}
  }

  playBossWarning() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.3);
      osc.frequency.linearRampToValueAtTime(440, now + 0.6);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.75);
    } catch (e) {}
  }

  playJokerLaugh() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const laughs = [700, 520, 780, 500, 840, 540];
      const now = this.ctx.currentTime;
      laughs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.12, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.09);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.095);
      });
    } catch (e) {}
  }

  playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.25, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.36);
      });
    } catch (e) {}
  }

  playHurt() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  playOilSplash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch (e) {}
  }
}

const sound = new SoundEngine();

// 2. Vehicle Evolution Tiers (Lv.1 to Lv.5)
const VEHICLE_TIERS = {
  1: {
    tier: 1,
    name: '오토바이 (Batpod / Bike)',
    subName: '경량 고기동 2륜',
    series: '시작 탈것',
    description: '날렵하고 민첩하지만 차체가 약해 충돌에 주의해야 합니다.',
    maxHp: 100,
    speed: 5.5,
    handling: 0.088,
    ramDamage: 25,
    color: '#0284c7',
    accentColor: '#38bdf8',
    glowColor: '#38bdf8',
    width: 14,
    height: 30,
  },
  2: {
    tier: 2,
    name: '승용차 (Sedan)',
    subName: '균형 잡힌 소형 차량',
    series: '일반 차량',
    description: '안정적인 핸들링과 준수한 내구도를 가진 소형 승용차.',
    maxHp: 160,
    speed: 5.8,
    handling: 0.076,
    ramDamage: 50,
    color: '#10b981',
    accentColor: '#34d399',
    glowColor: '#10b981',
    width: 22,
    height: 38,
  },
  3: {
    tier: 3,
    name: '배트 모빌 (The Dark Knight)',
    subName: '다크나이트 전용 머신',
    series: '다크나이트 시리즈',
    description: '공기역학적 장갑 바디와 안정적인 속도, 강화된 터렛 연사력.',
    maxHp: 260,
    speed: 6.3,
    handling: 0.072,
    ramDamage: 85,
    color: '#1e293b',
    accentColor: '#facc15',
    glowColor: '#eab308',
    width: 26,
    height: 50,
  },
  4: {
    tier: 4,
    name: '텀블러 (The Tumbler)',
    subName: '중장갑 전투 탱크',
    series: '다크나이트 시리즈',
    description: '묵직하고 튼튼한 체력과 거대한 타이어, 강력한 넉백 및 돌진 파워.',
    maxHp: 380,
    speed: 6.5,
    handling: 0.066,
    ramDamage: 140,
    color: '#0f172a',
    accentColor: '#fb923c',
    glowColor: '#f97316',
    width: 32,
    height: 58,
  },
  5: {
    tier: 5,
    name: '배트모빌 (Arkham Knight)',
    subName: '궁극의 배틀 머신',
    series: '아캄나이트',
    description: '최고 속도, 무기 쿨타임 -25% 감소, 애프터버너와 60mm 중화기 탑재.',
    maxHp: 520,
    speed: 7.5,
    handling: 0.08,
    ramDamage: 210,
    color: '#020617',
    accentColor: '#38bdf8',
    glowColor: '#00f0ff',
    width: 34,
    height: 64,
  },
};

const RANKING_STORAGE_KEY = 'tado_pokjujok_rankings_v2';
const DEFAULT_RANKINGS = [
  { id: '1', name: '다크나이트', score: 1450, kills: 182, timeSurvived: 195, finalTierName: 'Lv.5 배트모빌 (아캄나이트)', cleared: true, date: '2026-11-01' },
  { id: '2', name: '고담수호자', score: 1120, kills: 145, timeSurvived: 160, finalTierName: 'Lv.4 텀블러', cleared: true, date: '2026-10-30' },
  { id: '3', name: '도로의정의', score: 820, kills: 110, timeSurvived: 125, finalTierName: 'Lv.3 배트 모빌', cleared: false, date: '2026-10-28' },
];

// 3. Main Game Engine & Controller
class GameApp {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.width = 800;
    this.height = 900;
    this.roadOffsetY = 0;
    this.screenShake = 0;

    // Road Branching
    this.roadBranchPhase = 0;
    this.forkTimer = 0;

    // Player State
    this.px = 400;
    this.py = 650;
    this.pvx = 0;
    this.pvy = 0;
    this.angle = -Math.PI / 2;
    this.isBoosting = false;
    this.isInvincible = false;
    this.invincibleTimer = 0;

    // Stats
    this.stats = {
      hp: 100,
      maxHp: 100,
      nitro: 100,
      maxNitro: 100,
      nitroRechargeRate: 20,
      level: 1,
      xp: 0,
      xpToNext: 35,
      tier: 1,
      kills: 0,
      score: 0,
      bossesDefeated: 0,
      timeSurvived: 0,
      weapons: { turret: 1, blades: 0, oilSlick: 0, missile: 0 },
      passives: { speed: 0, maxHp: 0, magnet: 0, nitro: 0, shield: 0 },
    };

    this.shieldActive = false;
    this.shieldTimer = 0;

    // Controls
    this.keys = {};
    this.joystickVector = { x: 0, y: 0 };
    this.virtualBoost = false;

    // Entities
    this.enemies = [];
    this.bullets = [];
    this.missiles = [];
    this.oilPuddles = [];
    this.dropItems = [];
    this.particles = [];
    this.floatingTexts = [];
    this.skidMarks = [];
    this.roadSceneries = [];

    // Weapon Timers
    this.turretCooldown = 0;
    this.oilSlickCooldown = 0;
    this.missileCooldown = 0;
    this.bladeAngle = 0;
    this.nextEntityId = 1;

    // Boss Timers
    this.currentBoss = null;
    this.bossActive = false;
    this.bossHpRatio = 1;
    this.bossWarningTimer = 0;
    this.bossWarningText = '';
    this.nextBossSpawnTime = 65;
    this.enemySpawnTimer = 0;

    // State flags
    this.isPaused = false;
    this.isGameOver = false;
    this.isVictory = false;
    this.isLevelUp = false;
    this.levelUpOptions = [];

    // Rankings
    this.rankings = this.loadRankings();
    this.hasSavedRank = false;

    this.init();
  }

  loadRankings() {
    try {
      const saved = localStorage.getItem(RANKING_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_RANKINGS;
    } catch (e) {
      return DEFAULT_RANKINGS;
    }
  }

  saveRankings(newRankings) {
    this.rankings = newRankings;
    try {
      localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(newRankings));
    } catch (e) {}
  }

  init() {
    this.resize();
    this.initScenery();
    this.bindEvents();
    this.bindUI();
    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  initScenery() {
    this.roadSceneries = [];
    const count = 30;
    const roadLeft = this.width * 0.12;
    const roadRight = this.width * 0.88;

    for (let i = 0; i < count; i++) {
      const y = (i * (this.height / 10)) % (this.height * 2) - this.height * 0.5;
      this.roadSceneries.push({
        x: roadLeft - 32 - Math.random() * 30,
        y,
        type: Math.random() > 0.4 ? 'tree' : 'lamp',
        side: 'left',
      });
      this.roadSceneries.push({
        x: roadRight + 32 + Math.random() * 30,
        y: y + 40,
        type: Math.random() > 0.4 ? 'tree' : 'lamp',
        side: 'right',
      });
      if (i % 7 === 0) {
        this.roadSceneries.push({
          x: this.width * 0.5,
          y,
          type: 'sign',
          label: i % 14 === 0 ? '← 강변북로 | 올림픽대로 →' : '폭주족 집중 단속구간',
          side: 'center',
        });
      }
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initScenery();
    });

    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code] = true;
      if (e.code === 'Space') e.preventDefault();
      if (e.key === 'p' || e.key === 'P') this.togglePause();

      // Number key selection in level up modal
      if (this.isLevelUp && this.levelUpOptions.length > 0) {
        if (e.key === '1' && this.levelUpOptions[0]) this.selectUpgrade(this.levelUpOptions[0]);
        if (e.key === '2' && this.levelUpOptions[1]) this.selectUpgrade(this.levelUpOptions[1]);
        if (e.key === '3' && this.levelUpOptions[2]) this.selectUpgrade(this.levelUpOptions[2]);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.keys[e.code] = false;
    });

    // Touch Booster
    const boostBtn = document.getElementById('btn-touch-boost');
    if (boostBtn) {
      boostBtn.addEventListener('pointerdown', () => { this.virtualBoost = true; });
      boostBtn.addEventListener('pointerup', () => { this.virtualBoost = false; });
      boostBtn.addEventListener('pointerleave', () => { this.virtualBoost = false; });
    }

    // Touch Joystick
    const joyStick = document.getElementById('touch-joystick');
    const joyKnob = document.getElementById('joystick-knob');
    let isDraggingJoy = false;

    if (joyStick && joyKnob) {
      const handleJoyStart = (e) => {
        isDraggingJoy = true;
        handleJoyMove(e);
      };
      const handleJoyMove = (e) => {
        if (!isDraggingJoy && e.type !== 'pointerdown') return;
        const rect = joyStick.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.hypot(dx, dy);
        const maxRadius = 38;
        const clampedDist = Math.min(dist, maxRadius);
        const normX = dist === 0 ? 0 : (dx / dist);
        const normY = dist === 0 ? 0 : (dy / dist);

        joyKnob.style.transform = `translate(${normX * clampedDist}px, ${normY * clampedDist}px)`;
        this.joystickVector = {
          x: normX * (clampedDist / maxRadius),
          y: normY * (clampedDist / maxRadius),
        };
      };
      const handleJoyEnd = () => {
        isDraggingJoy = false;
        joyKnob.style.transform = 'translate(0px, 0px)';
        this.joystickVector = { x: 0, y: 0 };
      };

      joyStick.addEventListener('pointerdown', handleJoyStart);
      window.addEventListener('pointermove', handleJoyMove);
      window.addEventListener('pointerup', handleJoyEnd);
      window.addEventListener('pointercancel', handleJoyEnd);
    }
  }

  bindUI() {
    // Sound Toggle
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.onclick = () => {
        const nextMuted = !sound.isMuted;
        sound.setMuted(nextMuted);
        soundBtn.innerHTML = nextMuted ? '🔇' : '🔊';
      };
    }

    // Pause Toggle
    const pauseBtn = document.getElementById('btn-pause-toggle');
    if (pauseBtn) {
      pauseBtn.onclick = () => this.togglePause();
    }
    const resumeBtn = document.getElementById('btn-resume');
    if (resumeBtn) {
      resumeBtn.onclick = () => this.togglePause();
    }

    // Guide Modal
    const helpBtn = document.getElementById('btn-help');
    const modalHelp = document.getElementById('modal-help');
    const closeHelpBtn = document.getElementById('btn-close-help');
    if (helpBtn && modalHelp) {
      helpBtn.onclick = () => modalHelp.classList.add('active');
    }
    if (closeHelpBtn && modalHelp) {
      closeHelpBtn.onclick = () => modalHelp.classList.remove('active');
    }

    // Ranking Modal
    const rankBtn = document.getElementById('btn-ranking-open');
    const modalRank = document.getElementById('modal-ranking');
    const closeRankBtn = document.getElementById('btn-close-ranking');
    if (rankBtn && modalRank) {
      rankBtn.onclick = () => {
        this.renderRankingsList();
        modalRank.classList.add('active');
      };
    }
    if (closeRankBtn && modalRank) {
      closeRankBtn.onclick = () => modalRank.classList.remove('active');
    }

    // Restart Buttons
    const restartBtn = document.getElementById('btn-restart');
    if (restartBtn) restartBtn.onclick = () => this.reset();

    const vicRestartBtn = document.getElementById('btn-vic-restart');
    if (vicRestartBtn) vicRestartBtn.onclick = () => this.reset();

    // Ranking Save Buttons
    const saveRankGameOver = document.getElementById('btn-save-rank-gameover');
    if (saveRankGameOver) {
      saveRankGameOver.onclick = () => {
        const input = document.getElementById('input-name-gameover');
        const name = (input && input.value.trim()) || '고담의 기사';
        this.addRankingEntry(name, false);
        saveRankGameOver.disabled = true;
        saveRankGameOver.innerText = '등록 완료';
      };
    }

    const saveRankVic = document.getElementById('btn-save-rank-vic');
    if (saveRankVic) {
      saveRankVic.onclick = () => {
        const input = document.getElementById('input-name-vic');
        const name = (input && input.value.trim()) || '다크나이트';
        this.addRankingEntry(name, true);
        saveRankVic.disabled = true;
        saveRankVic.innerText = '등록 완료';
      };
    }
  }

  addRankingEntry(name, cleared) {
    const newEntry = {
      id: String(Date.now()),
      name,
      score: this.stats.score,
      kills: this.stats.kills,
      timeSurvived: Math.floor(this.stats.timeSurvived),
      finalTierName: VEHICLE_TIERS[this.stats.tier].name,
      cleared,
      date: new Date().toISOString().split('T')[0],
    };

    const updated = [...this.rankings, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
    this.saveRankings(updated);
    this.renderRankingsList();
    const modalRank = document.getElementById('modal-ranking');
    if (modalRank) modalRank.classList.add('active');
  }

  renderRankingsList() {
    const listContainer = document.getElementById('rankings-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    this.rankings.forEach((entry, idx) => {
      const mins = String(Math.floor(entry.timeSurvived / 60)).padStart(2, '0');
      const secs = String(Math.floor(entry.timeSurvived % 60)).padStart(2, '0');
      const item = document.createElement('div');
      item.className = 'rank-item ' + (idx === 0 ? 'top1' : idx === 1 ? 'top2' : idx === 2 ? 'top3' : '');
      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-weight:900; font-size:15px; width:20px;">${idx + 1}</span>
          <div style="text-align:left;">
            <div style="font-weight:bold; display:flex; align-items:center; gap:6px;">
              ${entry.name}
              ${entry.cleared ? '<span class="badge-cleared">완주 성공</span>' : ''}
            </div>
            <div style="font-size:11px; color:#94a3b8;">${entry.finalTierName}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:900; color:#38bdf8; font-size:15px;">${entry.score} Pts</div>
          <div style="font-size:10px; color:#94a3b8;">${mins}:${secs} · ${entry.kills}대 격파</div>
        </div>
      `;
      listContainer.appendChild(item);
    });
  }

  start() {
    this.reset();
    sound.startEngine();
    this.lastTime = performance.now();
    this.loop = (t) => {
      const dt = Math.min((t - this.lastTime) / 1000, 0.1);
      this.lastTime = t;

      if (!this.isPaused && !this.isGameOver && !this.isVictory && !this.isLevelUp) {
        this.update(dt);
      }
      this.render();
      this.updateHUD();
      requestAnimationFrame(this.loop);
    };
    requestAnimationFrame(this.loop);
  }

  reset() {
    this.px = this.width / 2;
    this.py = this.height * 0.75;
    this.pvx = 0;
    this.pvy = 0;
    this.angle = -Math.PI / 2;
    this.isBoosting = false;
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.roadBranchPhase = 0;
    this.forkTimer = 0;

    const baseTier = VEHICLE_TIERS[1];
    this.stats = {
      hp: baseTier.maxHp,
      maxHp: baseTier.maxHp,
      nitro: 100,
      maxNitro: 100,
      nitroRechargeRate: 20,
      level: 1,
      xp: 0,
      xpToNext: 35,
      tier: 1,
      kills: 0,
      score: 0,
      bossesDefeated: 0,
      timeSurvived: 0,
      weapons: { turret: 1, blades: 0, oilSlick: 0, missile: 0 },
      passives: { speed: 0, maxHp: 0, magnet: 0, nitro: 0, shield: 0 },
    };

    this.enemies = [];
    this.bullets = [];
    this.missiles = [];
    this.oilPuddles = [];
    this.dropItems = [];
    this.particles = [];
    this.floatingTexts = [];
    this.skidMarks = [];
    this.currentBoss = null;
    this.bossActive = false;
    this.bossWarningTimer = 0;
    this.nextBossSpawnTime = 65;
    this.isPaused = false;
    this.isGameOver = false;
    this.isVictory = false;
    this.isLevelUp = false;

    // Reset modals
    const modalGameOver = document.getElementById('modal-gameover');
    if (modalGameOver) modalGameOver.classList.remove('active');
    const modalVic = document.getElementById('modal-victory');
    if (modalVic) modalVic.classList.remove('active');
    const modalLvl = document.getElementById('modal-levelup');
    if (modalLvl) modalLvl.classList.remove('active');
    const modalPause = document.getElementById('modal-pause');
    if (modalPause) modalPause.classList.remove('active');

    // Reset input buttons
    const saveRankGameOver = document.getElementById('btn-save-rank-gameover');
    if (saveRankGameOver) { saveRankGameOver.disabled = false; saveRankGameOver.innerText = '기록 저장'; }
    const saveRankVic = document.getElementById('btn-save-rank-vic');
    if (saveRankVic) { saveRankVic.disabled = false; saveRankVic.innerText = '랭킹 등록'; }

    sound.startEngine();
  }

  togglePause() {
    if (this.isGameOver || this.isVictory || this.isLevelUp) return;
    this.isPaused = !this.isPaused;
    const modalPause = document.getElementById('modal-pause');
    if (this.isPaused) {
      sound.stopEngine();
      if (modalPause) modalPause.classList.add('active');
    } else {
      sound.startEngine();
      this.lastTime = performance.now();
      if (modalPause) modalPause.classList.remove('active');
    }
  }

  update(dt) {
    this.stats.timeSurvived += dt;

    // Forking road cycle
    this.forkTimer += dt;
    this.roadBranchPhase = (Math.sin(this.forkTimer * 0.15) + 1) / 2;

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }
    if (this.bossWarningTimer > 0) {
      this.bossWarningTimer -= dt;
    }

    this.updatePlayer(dt);
    this.updateWeapons(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updateDrops(dt);
    this.updateParticles(dt);
    this.updateScenery(dt);

    // Boss 1 & Boss 2 spawning
    if (!this.bossActive && this.stats.bossesDefeated < 2 && this.stats.timeSurvived >= this.nextBossSpawnTime) {
      if (this.stats.bossesDefeated === 0) {
        this.spawnBoss1();
      } else if (this.stats.bossesDefeated === 1) {
        this.spawnBoss2();
      }
    }

    const curSpeed = Math.hypot(this.pvx, this.pvy);
    const maxSpeed = VEHICLE_TIERS[this.stats.tier].speed;
    sound.updateEnginePitch(Math.min(1.2, curSpeed / maxSpeed), this.isBoosting);
  }

  updatePlayer(dt) {
    const tierInfo = VEHICLE_TIERS[this.stats.tier];
    const speedBonus = 1 + this.stats.passives.speed * 0.12;
    const baseSpeed = tierInfo.speed * speedBonus;

    const wantsBoost = this.keys[' '] || this.keys['space'] || this.virtualBoost;
    if (wantsBoost && this.stats.nitro > 4) {
      this.isBoosting = true;
      this.stats.nitro = Math.max(0, this.stats.nitro - 35 * dt);
      if (Math.random() < 0.4) sound.playBoost();

      const rearDist = tierInfo.height * 0.55;
      const rx = this.px - Math.cos(this.angle) * rearDist;
      const ry = this.py - Math.sin(this.angle) * rearDist;
      const flameColor = this.stats.tier === 5 ? '#00f0ff' : this.stats.tier >= 3 ? '#38bdf8' : '#f97316';

      for (let i = 0; i < 3; i++) {
        this.particles.push({
          x: rx + (Math.random() - 0.5) * 12,
          y: ry + (Math.random() - 0.5) * 8,
          vx: -Math.cos(this.angle) * (7 + Math.random() * 5) + (Math.random() - 0.5) * 2,
          vy: -Math.sin(this.angle) * (7 + Math.random() * 5) + (Math.random() - 0.5) * 2,
          size: 7 + Math.random() * 7,
          color: flameColor,
          alpha: 1,
          decay: 2.8,
        });
      }
    } else {
      this.isBoosting = false;
      const nitroBonus = 1 + this.stats.passives.nitro * 0.25;
      this.stats.nitro = Math.min(this.stats.maxNitro, this.stats.nitro + this.stats.nitroRechargeRate * nitroBonus * dt);
    }

    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) this.isInvincible = false;
    }

    let moveX = 0;
    let moveY = 0;
    if (this.keys['arrowleft'] || this.keys['a']) moveX -= 1;
    if (this.keys['arrowright'] || this.keys['d']) moveX += 1;
    if (this.keys['arrowup'] || this.keys['w']) moveY -= 1;
    if (this.keys['arrowdown'] || this.keys['s']) moveY += 1;

    if (this.joystickVector.x !== 0 || this.joystickVector.y !== 0) {
      moveX += this.joystickVector.x;
      moveY += this.joystickVector.y;
    }

    const inputMag = Math.hypot(moveX, moveY);
    if (inputMag > 0.1) {
      moveX /= inputMag;
      moveY /= inputMag;

      const targetAngle = Math.atan2(moveY, moveX);
      let angleDiff = targetAngle - this.angle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

      const turnSpeed = tierInfo.handling * (this.isBoosting ? 1.4 : 1.0);
      this.angle += angleDiff * turnSpeed * (dt * 60);

      const targetSpeed = baseSpeed * (this.isBoosting ? 2.15 : 1.0);
      const accel = 12 * dt;
      this.pvx += (Math.cos(this.angle) * targetSpeed - this.pvx) * accel;
      this.pvy += (Math.sin(this.angle) * targetSpeed - this.pvy) * accel;

      if (Math.abs(angleDiff) > 0.55 || this.isBoosting) {
        if (Math.random() < 0.35) {
          const rearDist = tierInfo.height * 0.45;
          const leftWheelX = this.px - Math.cos(this.angle) * rearDist + Math.sin(this.angle) * (tierInfo.width * 0.4);
          const leftWheelY = this.py - Math.sin(this.angle) * rearDist - Math.cos(this.angle) * (tierInfo.width * 0.4);
          this.skidMarks.push({
            x1: leftWheelX,
            y1: leftWheelY,
            x2: leftWheelX - this.pvx * 0.5,
            y2: leftWheelY - this.pvy * 0.5,
            alpha: 0.7,
          });
        }
      }
    } else {
      this.pvx *= Math.pow(0.85, dt * 60);
      this.pvy *= Math.pow(0.85, dt * 60);
    }

    this.px += this.pvx;
    this.py += this.pvy;

    const forwardSpeedY = -this.pvy + 4;
    this.roadOffsetY = (this.roadOffsetY + forwardSpeedY) % 80;

    const roadLeft = this.width * 0.12;
    const roadRight = this.width * 0.88;
    const halfW = tierInfo.width / 2;
    if (this.px - halfW < roadLeft) {
      this.px = roadLeft + halfW;
      this.pvx *= -0.3;
      this.screenShake = 3;
    }
    if (this.px + halfW > roadRight) {
      this.px = roadRight - halfW;
      this.pvx *= -0.3;
      this.screenShake = 3;
    }
    if (this.py < 80) { this.py = 80; this.pvy = 0; }
    if (this.py > this.height - 70) { this.py = this.height - 70; this.pvy = 0; }

    // Safety island barrier in road bifurcation
    if (this.roadBranchPhase > 0.45) {
      const centerX = this.width * 0.5;
      const islandHalfW = (this.roadBranchPhase - 0.45) * 45;
      if (Math.abs(this.px - centerX) < islandHalfW + halfW && this.py > 150 && this.py < this.height - 150) {
        if (this.px < centerX) {
          this.px = centerX - islandHalfW - halfW - 2;
          this.pvx = -Math.abs(this.pvx);
        } else {
          this.px = centerX + islandHalfW + halfW + 2;
          this.pvx = Math.abs(this.pvx);
        }
        this.screenShake = 2;
      }
    }

    // Shield passive
    if (this.stats.passives.shield > 0) {
      this.shieldTimer += dt;
      if (!this.shieldActive && this.shieldTimer >= Math.max(6, 16 - this.stats.passives.shield * 2.5)) {
        this.shieldActive = true;
        this.floatingTexts.push({
          x: this.px,
          y: this.py - 30,
          text: '방어막 장착!',
          color: '#38bdf8',
          alpha: 1,
          vy: -1.2,
          scale: 1.2,
        });
      }
    }
  }

  updateWeapons(dt) {
    const cooldownReduction = this.stats.tier === 5 ? 0.75 : 1.0;

    // 1. 기관총
    if (this.stats.weapons.turret > 0) {
      this.turretCooldown -= dt;
      const baseTurretCd = Math.max(0.11, (0.40 - this.stats.weapons.turret * 0.05) * cooldownReduction);
      if (this.turretCooldown <= 0) {
        this.turretCooldown = baseTurretCd;
        this.fireTurret();
      }
    }

    // 2. 톱날
    if (this.stats.weapons.blades > 0) {
      const bladeSpeed = 3.5 + this.stats.weapons.blades * 0.8;
      this.bladeAngle += bladeSpeed * dt;
      this.checkBladeCollisions();
    }

    // 3. 기름 유출 & 화염
    if (this.stats.weapons.oilSlick > 0) {
      this.oilSlickCooldown -= dt;
      const oilCd = Math.max(1.1, (3.2 - this.stats.weapons.oilSlick * 0.45) * cooldownReduction);
      if (this.oilSlickCooldown <= 0) {
        this.oilSlickCooldown = oilCd;
        this.dropOilSlick();
      }
    }

    // 4. 유도 미사일
    if (this.stats.weapons.missile > 0) {
      this.missileCooldown -= dt;
      const missileCd = Math.max(1.3, (3.5 - this.stats.weapons.missile * 0.4) * cooldownReduction);
      if (this.missileCooldown <= 0) {
        this.missileCooldown = missileCd;
        this.fireMissile();
      }
    }
  }

  fireTurret() {
    const range = 440;
    let closestEnemy = null;
    let minDist = range;

    for (const enemy of this.enemies) {
      const dist = Math.hypot(enemy.x - this.px, enemy.y - this.py);
      if (dist < minDist) {
        minDist = dist;
        closestEnemy = enemy;
      }
    }

    let shootAngle = this.angle;
    if (closestEnemy) {
      shootAngle = Math.atan2(closestEnemy.y - this.py, closestEnemy.x - this.px);
    }

    const bulletSpeed = 16.5;
    const turretLvl = this.stats.weapons.turret;
    const bulletDamage = 24 + turretLvl * 8;
    const pierce = turretLvl >= 4 ? 2 : 1;
    const count = turretLvl >= 5 ? 3 : turretLvl >= 3 ? 2 : 1;
    const spreads = count === 1 ? [0] : count === 2 ? [-0.1, 0.1] : [-0.18, 0, 0.18];

    sound.playShoot();

    const noseDist = VEHICLE_TIERS[this.stats.tier].height * 0.55;
    const muzzleX = this.px + Math.cos(this.angle) * noseDist;
    const muzzleY = this.py + Math.sin(this.angle) * noseDist;

    for (const spread of spreads) {
      const finalAngle = shootAngle + spread;
      this.bullets.push({
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(finalAngle) * bulletSpeed,
        vy: Math.sin(finalAngle) * bulletSpeed,
        damage: bulletDamage,
        pierce,
        radius: 4,
        color: this.stats.tier >= 3 ? '#38bdf8' : '#facc15',
        life: 1.25,
      });
    }
  }

  checkBladeCollisions() {
    const bladeCount = Math.min(5, this.stats.weapons.blades);
    const orbitRadius = 65 + this.stats.weapons.blades * 6;
    const bladeDamage = 20 + this.stats.weapons.blades * 10;

    for (let i = 0; i < bladeCount; i++) {
      const bAngle = this.bladeAngle + (i * (Math.PI * 2 / bladeCount));
      const bx = this.px + Math.cos(bAngle) * orbitRadius;
      const by = this.py + Math.sin(bAngle) * orbitRadius;

      for (const enemy of this.enemies) {
        const dist = Math.hypot(enemy.x - bx, enemy.y - by);
        if (dist < 18 + enemy.width / 2) {
          enemy.hp -= bladeDamage;
          enemy.hitFlash = 0.1;
          sound.playBladeHit();

          this.floatingTexts.push({
            x: enemy.x + (Math.random() - 0.5) * 16,
            y: enemy.y - 10,
            text: `${bladeDamage}`,
            color: '#38bdf8',
            alpha: 1,
            vy: -1.4,
            scale: 0.9,
          });

          const kForce = enemy.isBoss ? 2 : 10;
          const kAngle = Math.atan2(enemy.y - this.py, enemy.x - this.px);
          enemy.x += Math.cos(kAngle) * kForce;
          enemy.y += Math.sin(kAngle) * kForce;
        }
      }
    }
  }

  dropOilSlick() {
    const lvl = this.stats.weapons.oilSlick;
    const rearDist = VEHICLE_TIERS[this.stats.tier].height * 0.5;
    const ox = this.px - Math.cos(this.angle) * rearDist;
    const oy = this.py - Math.sin(this.angle) * rearDist;
    const isFlaming = lvl >= 3;
    sound.playOilSplash();

    this.oilPuddles.push({
      x: ox,
      y: oy,
      radius: 32 + lvl * 7,
      duration: 360 + lvl * 60,
      isFlaming,
      damagePerSec: isFlaming ? 38 + lvl * 15 : 12,
    });
  }

  fireMissile() {
    let targetEnemy = null;
    for (const enemy of this.enemies) {
      if (enemy.isBoss) { targetEnemy = enemy; break; }
      if (!targetEnemy || enemy.hp > targetEnemy.hp) targetEnemy = enemy;
    }
    if (!targetEnemy && this.enemies.length > 0) targetEnemy = this.enemies[0];

    const lvl = this.stats.weapons.missile;
    const missileCount = lvl >= 4 ? 2 : 1;

    for (let i = 0; i < missileCount; i++) {
      sound.playMissileLaunch();
      const spreadAngle = (i === 0 ? -0.2 : 0.2);
      const startAngle = this.angle + spreadAngle;

      this.missiles.push({
        x: this.px,
        y: this.py,
        vx: Math.cos(startAngle) * 5,
        vy: Math.sin(startAngle) * 5,
        targetId: targetEnemy ? targetEnemy.id : null,
        damage: 90 + lvl * 32,
        blastRadius: 70 + lvl * 15,
        life: 4.5,
        angle: startAngle,
      });
    }
  }

  updateEnemies(dt) {
    this.enemySpawnTimer += dt;
    const spawnInterval = Math.max(0.35, 1.8 - Math.min(1.4, this.stats.timeSurvived * 0.007));
    if (this.enemySpawnTimer >= spawnInterval) {
      this.enemySpawnTimer = 0;
      this.spawnWave();
    }

    for (let pIdx = this.oilPuddles.length - 1; pIdx >= 0; pIdx--) {
      const puddle = this.oilPuddles[pIdx];
      puddle.duration--;
      if (puddle.duration <= 0) {
        this.oilPuddles.splice(pIdx, 1);
        continue;
      }
      for (const enemy of this.enemies) {
        const dist = Math.hypot(enemy.x - puddle.x, enemy.y - puddle.y);
        if (dist < puddle.radius + enemy.width / 2) {
          enemy.slowTimer = 0.5;
          if (puddle.isFlaming) {
            enemy.hp -= puddle.damagePerSec * dt;
            enemy.hitFlash = 0.05;
          }
        }
      }
    }

    const tier = VEHICLE_TIERS[this.stats.tier];
    const playerRadius = Math.max(tier.width, tier.height) * 0.45;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.hitFlash > 0) enemy.hitFlash -= dt;

      if (enemy.hp <= 0) {
        this.handleEnemyDeath(enemy);
        this.enemies.splice(i, 1);
        continue;
      }

      const dx = this.px - enemy.x;
      const dy = this.py - enemy.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0.1) {
        const targetAngle = Math.atan2(dy, dx);
        enemy.angle = targetAngle;
        let effectiveSpeed = enemy.speed;
        if (enemy.slowTimer > 0) {
          enemy.slowTimer -= dt;
          effectiveSpeed *= 0.5;
        }
        enemy.vx = Math.cos(targetAngle) * effectiveSpeed;
        enemy.vy = Math.sin(targetAngle) * effectiveSpeed;
      }

      enemy.x += enemy.vx;
      enemy.y += enemy.vy;

      const enemyRadius = Math.max(enemy.width, enemy.height) * 0.4;
      const collisionDist = playerRadius + enemyRadius;

      if (dist < collisionDist) {
        if (this.isBoosting) {
          const ramDmg = tier.ramDamage * 2.2;
          enemy.hp -= ramDmg;
          enemy.hitFlash = 0.2;
          sound.playExplosion();
          this.screenShake = 10;

          const kForce = enemy.isBoss ? 15 : 50;
          const kAngle = Math.atan2(enemy.y - this.py, enemy.x - this.px);
          enemy.x += Math.cos(kAngle) * kForce;
          enemy.y += Math.sin(kAngle) * kForce;

          this.floatingTexts.push({
            x: enemy.x,
            y: enemy.y - 15,
            text: `돌진 충돌! -${Math.floor(ramDmg)}`,
            color: '#facc15',
            alpha: 1,
            vy: -2.0,
            scale: 1.3,
          });
        } else if (!this.isInvincible) {
          if (this.shieldActive) {
            this.shieldActive = false;
            this.shieldTimer = 0;
            this.invincibleTimer = 0.6;
            this.isInvincible = true;
            this.floatingTexts.push({
              x: this.px,
              y: this.py - 25,
              text: '방어막 방어 성공!',
              color: '#38bdf8',
              alpha: 1,
              vy: -1.5,
              scale: 1.2,
            });
            sound.playBladeHit();
          } else {
            const takenDamage = enemy.damage;
            this.stats.hp = Math.max(0, this.stats.hp - takenDamage);
            this.invincibleTimer = 0.7;
            this.isInvincible = true;
            this.screenShake = 9;
            sound.playHurt();

            this.floatingTexts.push({
              x: this.px,
              y: this.py - 25,
              text: `-${takenDamage}`,
              color: '#ef4444',
              alpha: 1,
              vy: -1.5,
              scale: 1.2,
            });

            if (this.stats.hp <= 0) {
              this.handleGameOver();
              return;
            }
          }

          const pushAngle = Math.atan2(this.py - enemy.y, this.px - enemy.x);
          this.px += Math.cos(pushAngle) * 12;
          this.py += Math.sin(pushAngle) * 12;
          enemy.x -= Math.cos(pushAngle) * (enemy.isBoss ? 4 : 12);
          enemy.y -= Math.sin(pushAngle) * (enemy.isBoss ? 4 : 12);
        }
      }
    }

    const boss = this.enemies.find((e) => e.isBoss);
    if (boss) {
      this.currentBoss = boss;
      this.bossActive = true;
      this.bossHpRatio = Math.max(0, boss.hp / boss.maxHp);
    } else {
      this.currentBoss = null;
      this.bossActive = false;
    }
  }

  spawnWave() {
    const elapsed = this.stats.timeSurvived;
    const roadLeft = this.width * 0.16;
    const roadRight = this.width * 0.84;
    const count = Math.min(6, 1 + Math.floor(elapsed / 45));

    for (let c = 0; c < count; c++) {
      let sx = roadLeft + Math.random() * (roadRight - roadLeft);
      let sy = -50 - Math.random() * 80;

      let type = 'kickboard';
      const r = Math.random();
      if (elapsed < 30) type = 'kickboard';
      else if (elapsed < 75) type = r < 0.65 ? 'kickboard' : 'bicycle';
      else type = r < 0.35 ? 'kickboard' : r < 0.75 ? 'bicycle' : 'motorcycle';

      this.createEnemy(type, sx, sy);
    }
  }

  createEnemy(type, x, y) {
    let name = '전동 킥보드';
    let width = 16;
    let height = 24;
    let hp = 18;
    let speed = 3.2;
    let damage = 10;
    let color = '#c084fc';
    let isBoss = false;

    // Motorcycle baseline: width=24, height=36, speed=3.6
    switch (type) {
      case 'kickboard':
        name = '전동 킥보드';
        width = 16;
        height = 24;
        hp = 18 + Math.floor(this.stats.timeSurvived * 0.35);
        speed = 3.2;
        damage = 10;
        color = '#c084fc';
        break;
      case 'bicycle':
        name = '자전거 라이더';
        width = 20;
        height = 30;
        hp = 42 + Math.floor(this.stats.timeSurvived * 0.55);
        speed = 2.5;
        damage = 16;
        color = '#38bdf8';
        break;
      case 'motorcycle':
        name = '폭주족 오토바이';
        width = 24;
        height = 36;
        hp = 88 + Math.floor(this.stats.timeSurvived * 0.95);
        speed = 3.6;
        damage = 25;
        color = '#f43f5e';
        break;
      case 'armoredLeader':
        // Boss 1: 10px larger than motorcycle (34x46), 7% faster (3.85)
        name = '폭주족 리더의 방탄 차량 (Boss 1)';
        width = 34;
        height = 46;
        speed = 3.85;
        hp = 850 + Math.floor(this.stats.timeSurvived * 12);
        damage = 38;
        color = '#e11d48';
        isBoss = true;
        break;
      case 'jokerTruck':
        // Boss 2: 10px larger than motorcycle (34x46), 7% faster (3.85)
        name = '조커의 대형 몬스터 트럭 (Final Boss)';
        width = 34;
        height = 46;
        speed = 3.85;
        hp = 1500 + Math.floor(this.stats.timeSurvived * 18);
        damage = 48;
        color = '#7c3aed';
        isBoss = true;
        break;
    }

    this.enemies.push({
      id: this.nextEntityId++,
      type,
      name,
      x,
      y,
      vx: 0,
      vy: 0,
      width,
      height,
      hp,
      maxHp: hp,
      speed,
      damage,
      color,
      angle: Math.PI / 2,
      isBoss,
      slowTimer: 0,
      hitFlash: 0,
    });
  }

  spawnBoss1() {
    this.bossWarningTimer = 4.0;
    this.bossWarningText = '경고! 폭주족 리더의 방탄 차량 출현! (+10px 대형 / +7% 고속)';
    sound.playBossWarning();
    this.createEnemy('armoredLeader', this.width / 2, -70);
  }

  spawnBoss2() {
    this.bossWarningTimer = 4.5;
    this.bossWarningText = '경고! 조커가 탄 대형 몬스터 트럭 출현! HA HA HA!';
    sound.playBossWarning();
    sound.playJokerLaugh();
    this.createEnemy('jokerTruck', this.width / 2, -80);
  }

  // Scoring: 일반적 처치시 5점, 보스 처치시 100점
  handleEnemyDeath(enemy) {
    this.stats.kills++;

    if (enemy.isBoss) {
      this.stats.score += 100;
      this.stats.bossesDefeated++;
      sound.playExplosion();
      this.screenShake = 18;

      this.floatingTexts.push({
        x: enemy.x,
        y: enemy.y - 30,
        text: `보스 격파! +100점! (보스 ${this.stats.bossesDefeated}/2회 처치)`,
        color: '#facc15',
        alpha: 1,
        vy: -2.0,
        scale: 1.6,
      });

      this.dropItems.push({ id: this.nextEntityId++, x: enemy.x, y: enemy.y, type: 'wrench', healValue: 60 });
      this.dropItems.push({ id: this.nextEntityId++, x: enemy.x + 20, y: enemy.y, type: 'nitro' });
      for (let s = 0; s < 6; s++) {
        this.dropItems.push({
          id: this.nextEntityId++,
          x: enemy.x + (Math.random() - 0.5) * 50,
          y: enemy.y + (Math.random() - 0.5) * 50,
          type: 'scrap',
          xpValue: 50,
        });
      }

      if (this.stats.bossesDefeated >= 2) {
        this.handleVictory();
        return;
      } else {
        this.nextBossSpawnTime = this.stats.timeSurvived + 40;
      }
    } else {
      this.stats.score += 5;
      sound.playExplosion();
      this.screenShake = 3;

      const roll = Math.random();
      if (roll < 0.65) {
        this.dropItems.push({ id: this.nextEntityId++, x: enemy.x, y: enemy.y, type: 'oil', xpValue: 14 + Math.floor(this.stats.timeSurvived * 0.05) });
      } else if (roll < 0.9) {
        this.dropItems.push({ id: this.nextEntityId++, x: enemy.x, y: enemy.y, type: 'scrap', xpValue: 28 });
      } else if (roll < 0.95) {
        this.dropItems.push({ id: this.nextEntityId++, x: enemy.x, y: enemy.y, type: 'nitro' });
      } else {
        this.dropItems.push({ id: this.nextEntityId++, x: enemy.x, y: enemy.y, type: 'wrench', healValue: 30 });
      }
    }

    const pCount = enemy.isBoss ? 30 : 10;
    for (let p = 0; p < pCount; p++) {
      this.particles.push({
        x: enemy.x,
        y: enemy.y,
        vx: (Math.random() - 0.5) * (enemy.isBoss ? 13 : 7),
        vy: (Math.random() - 0.5) * (enemy.isBoss ? 13 : 7),
        size: 5 + Math.random() * (enemy.isBoss ? 10 : 4),
        color: Math.random() > 0.4 ? enemy.color : '#f97316',
        alpha: 1,
        decay: 2.2,
      });
    }
  }

  updateProjectiles(dt) {
    for (let bIdx = this.bullets.length - 1; bIdx >= 0; bIdx--) {
      const b = this.bullets[bIdx];
      b.x += b.vx;
      b.y += b.vy;
      b.life -= dt;

      if (b.life <= 0 || b.x < 0 || b.x > this.width || b.y < 0 || b.y > this.height) {
        this.bullets.splice(bIdx, 1);
        continue;
      }

      for (const enemy of this.enemies) {
        const dist = Math.hypot(enemy.x - b.x, enemy.y - b.y);
        if (dist < enemy.width / 2 + b.radius) {
          enemy.hp -= b.damage;
          enemy.hitFlash = 0.1;
          b.pierce--;

          this.floatingTexts.push({
            x: enemy.x + (Math.random() - 0.5) * 14,
            y: enemy.y - 12,
            text: `${b.damage}`,
            color: '#fef08a',
            alpha: 1,
            vy: -1.3,
            scale: 0.9,
          });

          if (b.pierce <= 0) {
            this.bullets.splice(bIdx, 1);
            break;
          }
        }
      }
    }

    for (let mIdx = this.missiles.length - 1; mIdx >= 0; mIdx--) {
      const m = this.missiles[mIdx];
      m.life -= dt;

      let target = null;
      if (m.targetId) target = this.enemies.find((e) => e.id === m.targetId) || null;
      if (!target && this.enemies.length > 0) {
        target = this.enemies[0];
        m.targetId = target.id;
      }

      if (target) {
        const tAngle = Math.atan2(target.y - m.y, target.x - m.x);
        let diff = tAngle - m.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        m.angle += diff * 0.13;
      }

      const mSpeed = 9.8;
      m.vx = Math.cos(m.angle) * mSpeed;
      m.vy = Math.sin(m.angle) * mSpeed;
      m.x += m.vx;
      m.y += m.vy;

      let exploded = m.life <= 0;
      if (!exploded) {
        for (const enemy of this.enemies) {
          const dist = Math.hypot(enemy.x - m.x, enemy.y - m.y);
          if (dist < enemy.width / 2 + 10) {
            exploded = true;
            break;
          }
        }
      }

      if (exploded) {
        sound.playExplosion();
        this.screenShake = 12;

        for (const enemy of this.enemies) {
          const dist = Math.hypot(enemy.x - m.x, enemy.y - m.y);
          if (dist < m.blastRadius) {
            const falloff = 1 - dist / m.blastRadius;
            const blastDmg = Math.floor(m.damage * (0.5 + falloff * 0.5));
            enemy.hp -= blastDmg;
            enemy.hitFlash = 0.2;

            this.floatingTexts.push({
              x: enemy.x + (Math.random() - 0.5) * 16,
              y: enemy.y - 14,
              text: `💥 ${blastDmg}`,
              color: '#f97316',
              alpha: 1,
              vy: -1.6,
              scale: 1.1,
            });
          }
        }

        for (let p = 0; p < 16; p++) {
          this.particles.push({
            x: m.x,
            y: m.y,
            vx: (Math.random() - 0.5) * 11,
            vy: (Math.random() - 0.5) * 11,
            size: 6 + Math.random() * 8,
            color: Math.random() > 0.4 ? '#f97316' : '#ef4444',
            alpha: 1,
            decay: 2.5,
          });
        }
        this.missiles.splice(mIdx, 1);
      }
    }
  }

  updateDrops(dt) {
    const magnetRange = 80 + this.stats.passives.magnet * 35;

    for (let dIdx = this.dropItems.length - 1; dIdx >= 0; dIdx--) {
      const item = this.dropItems[dIdx];
      const dx = this.px - item.x;
      const dy = this.py - item.y;
      const dist = Math.hypot(dx, dy);

      if (dist < magnetRange) {
        const pullSpeed = (magnetRange - dist) * 0.2 + 5;
        item.x += (dx / dist) * pullSpeed;
        item.y += (dy / dist) * pullSpeed;
      } else {
        item.y += 2.5;
      }

      if (dist < 28) {
        sound.playPickup();
        if (item.type === 'wrench' && item.healValue) {
          this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + item.healValue);
          this.floatingTexts.push({
            x: this.px,
            y: this.py - 25,
            text: `수리 +${item.healValue} HP`,
            color: '#10b981',
            alpha: 1,
            vy: -1.6,
            scale: 1.1,
          });
        } else if (item.type === 'nitro') {
          this.stats.nitro = this.stats.maxNitro;
          this.floatingTexts.push({
            x: this.px,
            y: this.py - 25,
            text: `니트로 완충! ⚡`,
            color: '#38bdf8',
            alpha: 1,
            vy: -1.6,
            scale: 1.1,
          });
        } else {
          this.stats.xp += item.xpValue;
          this.floatingTexts.push({
            x: item.x,
            y: item.y - 10,
            text: `+${item.xpValue} XP`,
            color: item.type === 'scrap' ? '#fbbf24' : '#34d399',
            alpha: 0.85,
            vy: -1.0,
            scale: 0.8,
          });
          if (this.stats.xp >= this.stats.xpToNext) this.levelUp();
        }
        this.dropItems.splice(dIdx, 1);
        continue;
      }
      if (item.y > this.height + 100) this.dropItems.splice(dIdx, 1);
    }
  }

  levelUp() {
    this.stats.level++;
    this.stats.xp -= this.stats.xpToNext;
    this.stats.xpToNext = Math.floor(this.stats.xpToNext * 1.35 + 15);
    sound.playLevelUp();

    let newTier = this.stats.tier;
    if (this.stats.level >= 10) newTier = 5;
    else if (this.stats.level >= 7) newTier = 4;
    else if (this.stats.level >= 4) newTier = 3;
    else if (this.stats.level >= 2) newTier = 2;

    if (newTier !== this.stats.tier) {
      this.stats.tier = newTier;
      const vInfo = VEHICLE_TIERS[newTier];
      const maxHpGain = vInfo.maxHp - VEHICLE_TIERS[newTier - 1].maxHp;
      this.stats.maxHp += maxHpGain;
      this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + maxHpGain + 50);

      this.floatingTexts.push({
        x: this.px,
        y: this.py - 40,
        text: `차량 진화! [${vInfo.name}]`,
        color: '#facc15',
        alpha: 1,
        vy: -1.8,
        scale: 1.6,
      });
    }

    this.levelUpOptions = this.generateUpgradeOptions();
    this.isLevelUp = true;
    sound.stopEngine();

    this.showLevelUpModal();
  }

  generateUpgradeOptions() {
    const pool = [];
    const tLvl = this.stats.weapons.turret;
    pool.push({
      id: 'turret',
      type: 'weapon',
      weaponKey: 'turret',
      level: tLvl + 1,
      title: tLvl === 0 ? '기관총(Front Turret) 장착' : `기관총 강화 Lv.${tLvl + 1}`,
      tag: '공격 무기',
      description: tLvl === 0
        ? '차량 전방으로 근접한 적을 자동 연사 공격합니다.'
        : `연사 속도 및 데미지 강화 (+8 DMG, ${tLvl >= 2 ? '탄환 확산 + 관통' : '발사 주기 단축'})`,
      icon: '🔫',
    });

    const bLvl = this.stats.weapons.blades;
    if (bLvl < 5) {
      pool.push({
        id: 'blades',
        type: 'weapon',
        weaponKey: 'blades',
        level: bLvl + 1,
        title: bLvl === 0 ? '회전형 톱날(Bumper Blades) 장착' : `회전형 톱날 강화 Lv.${bLvl + 1}`,
        tag: '근접 무기',
        description: bLvl === 0
          ? '차량 주변을 회전하며 접근하는 폭주족을 절단하는 근접 무기.'
          : `회전 칼날 추가 (${bLvl + 1}개) 및 회전 속도, 절삭 데미지 증가`,
        icon: '⚙️',
      });
    }

    const oLvl = this.stats.weapons.oilSlick;
    if (oLvl < 5) {
      pool.push({
        id: 'oilSlick',
        type: 'weapon',
        weaponKey: 'oilSlick',
        level: oLvl + 1,
        title: oLvl === 0 ? '기름 유출(Oil Slick) 장착' : oLvl === 2 ? '화염 방사지대 진화 Lv.3' : `기름 유출 강화 Lv.${oLvl + 1}`,
        tag: '특수 무기',
        description: oLvl === 0
          ? '차량 후방에 기름을 떨어뜨려 적을 슬로우 상태로 만듭니다.'
          : oLvl >= 2
            ? '기름 웅덩이에 불이 붙어 적들에게 지속 화염 데미지를 입히는 화염지대로 진화!'
            : '기름 살포 주기 단축 및 웅덩이 반경 확대',
        icon: '🛢️',
      });
    }

    const mLvl = this.stats.weapons.missile;
    if (mLvl < 5) {
      pool.push({
        id: 'missile',
        type: 'weapon',
        weaponKey: 'missile',
        level: mLvl + 1,
        title: mLvl === 0 ? '오토 타겟 미사일 장착' : `오토 미사일 강화 Lv.${mLvl + 1}`,
        tag: '원거리 폭격',
        description: mLvl === 0
          ? '먼 거리의 엘리트/보스 적을 유도 추적하여 광역 폭발을 일으킵니다.'
          : `폭발 반경 및 데미지 증가 (+32 DMG, ${mLvl >= 3 ? '동시 2발 발사' : '추적력 강화'})`,
        icon: '🚀',
      });
    }

    const pSpeed = this.stats.passives.speed;
    pool.push({
      id: 'speed',
      type: 'passive',
      passiveKey: 'speed',
      level: pSpeed + 1,
      title: `터보 엔진 (Speed) Lv.${pSpeed + 1}`,
      tag: '주행 성능',
      description: '최고 속도와 가속력이 +12% 증가합니다.',
      icon: '🏎️',
    });

    const pMaxHp = this.stats.passives.maxHp;
    pool.push({
      id: 'maxHp',
      type: 'passive',
      passiveKey: 'maxHp',
      level: pMaxHp + 1,
      title: `다크나이트 특수장갑 (HP) Lv.${pMaxHp + 1}`,
      tag: '내구도',
      description: '최대 체력 +40 및 현재 체력 35% 즉시 긴급 수리.',
      icon: '🛡️',
    });

    const pMag = this.stats.passives.magnet;
    pool.push({
      id: 'magnet',
      type: 'passive',
      passiveKey: 'magnet',
      level: pMag + 1,
      title: `배트 자석 안테나 Lv.${pMag + 1}`,
      tag: '수집 편의',
      description: '기름방울과 스크랩 부품의 원거리 흡수 반경이 대폭 넓어집니다.',
      icon: '🧲',
    });

    const pNitro = this.stats.passives.nitro;
    pool.push({
      id: 'nitro',
      type: 'passive',
      passiveKey: 'nitro',
      level: pNitro + 1,
      title: `대용량 니트로 탱크 Lv.${pNitro + 1}`,
      tag: '부스터 강화',
      description: '부스터 연료 최대치 및 충전 속도 +25% 증가.',
      icon: '🔥',
    });

    const pShield = this.stats.passives.shield;
    if (pShield < 4) {
      pool.push({
        id: 'shield',
        type: 'passive',
        passiveKey: 'shield',
        level: pShield + 1,
        title: pShield === 0 ? '에너지 쉴드 장착' : `에너지 쉴드 강화 Lv.${pShield + 1}`,
        tag: '방어 시스템',
        description: pShield === 0
          ? '주기적으로 충돌 공격을 1회 완벽 무효화하는 에너지 보호막을 장착합니다.'
          : '보호막 재생성 대기시간 단축',
        icon: '💠',
      });
    }

    return pool.sort(() => 0.5 - Math.random()).slice(0, 3);
  }

  showLevelUpModal() {
    const modal = document.getElementById('modal-levelup');
    const tierAnnounce = document.getElementById('modal-tier-announce');
    const cardsContainer = document.getElementById('levelup-cards-container');
    if (!modal || !cardsContainer) return;

    if (tierAnnounce) {
      tierAnnounce.innerText = `현재 차량: ${VEHICLE_TIERS[this.stats.tier].name} (${VEHICLE_TIERS[this.stats.tier].subName})`;
    }

    cardsContainer.innerHTML = '';
    this.levelUpOptions.forEach((card, idx) => {
      const btn = document.createElement('button');
      btn.className = 'upgrade-card-btn';
      btn.innerHTML = `
        <span class="card-shortcut">${idx + 1}</span>
        <div class="card-icon">${card.icon}</div>
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:bold; font-size:15px; color:#f8fafc;">${card.title}</span>
            <span class="card-badge">${card.tag}</span>
          </div>
          <p style="font-size:12px; color:#94a3b8; margin-top:3px; line-height:1.3;">${card.description}</p>
        </div>
        <span style="color:#64748b; font-size:18px;">›</span>
      `;
      btn.onclick = () => this.selectUpgrade(card);
      cardsContainer.appendChild(btn);
    });

    modal.classList.add('active');
  }

  selectUpgrade(card) {
    if (card.type === 'weapon' && card.weaponKey) {
      this.stats.weapons[card.weaponKey]++;
    } else if (card.type === 'passive' && card.passiveKey) {
      this.stats.passives[card.passiveKey]++;
      if (card.passiveKey === 'maxHp') {
        this.stats.maxHp += 40;
        this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + 50);
      }
      if (card.passiveKey === 'nitro') {
        this.stats.maxNitro += 20;
        this.stats.nitro = this.stats.maxNitro;
      }
      if (card.passiveKey === 'shield') {
        this.shieldActive = true;
      }
    }

    this.isLevelUp = false;
    const modal = document.getElementById('modal-levelup');
    if (modal) modal.classList.remove('active');
    sound.startEngine();
    this.lastTime = performance.now();
  }

  handleGameOver() {
    this.isGameOver = true;
    sound.stopEngine();
    sound.playExplosion();

    const modal = document.getElementById('modal-gameover');
    if (modal) {
      document.getElementById('final-score').innerText = `${this.stats.score} Pts`;
      document.getElementById('final-time').innerText = this.formatTime(this.stats.timeSurvived);
      document.getElementById('final-kills').innerText = `${this.stats.kills}대`;
      document.getElementById('final-bosses').innerText = `${this.stats.bossesDefeated} / 2 처치`;
      modal.classList.add('active');
    }
  }

  handleVictory() {
    this.isVictory = true;
    sound.stopEngine();
    sound.playVictory();

    const modal = document.getElementById('modal-victory');
    if (modal) {
      document.getElementById('vic-score').innerText = `${this.stats.score} Pts`;
      document.getElementById('vic-time').innerText = this.formatTime(this.stats.timeSurvived);
      document.getElementById('vic-kills').innerText = `${this.stats.kills}대`;
      document.getElementById('vic-tier').innerText = VEHICLE_TIERS[this.stats.tier].name;
      modal.classList.add('active');
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= dt * 1.2;
      if (ft.alpha <= 0) this.floatingTexts.splice(i, 1);
    }

    for (let i = this.skidMarks.length - 1; i >= 0; i--) {
      const sm = this.skidMarks[i];
      sm.alpha -= dt * 0.12;
      sm.y1 += 2.5;
      sm.y2 += 2.5;
      if (sm.alpha <= 0 || sm.y1 > this.height + 50) this.skidMarks.splice(i, 1);
    }
  }

  updateScenery(dt) {
    const scrollSpeed = 3.5 + (this.isBoosting ? 5 : 0);
    for (const sc of this.roadSceneries) {
      sc.y += scrollSpeed;
      if (sc.y > this.height + 60) sc.y = -60 - Math.random() * 40;
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  updateHUD() {
    // XP Bar
    const xpFill = document.getElementById('xp-fill');
    if (xpFill) xpFill.style.width = `${Math.min(100, (this.stats.xp / this.stats.xpToNext) * 100)}%`;

    // HP Bar
    const hpFill = document.getElementById('hp-fill');
    if (hpFill) hpFill.style.width = `${Math.min(100, Math.max(0, (this.stats.hp / this.stats.maxHp) * 100))}%`;
    const hpText = document.getElementById('hp-text');
    if (hpText) hpText.innerText = `${Math.ceil(this.stats.hp)} / ${this.stats.maxHp}`;

    // Nitro Bar
    const nitroFill = document.getElementById('nitro-fill');
    if (nitroFill) nitroFill.style.width = `${Math.min(100, Math.max(0, (this.stats.nitro / this.stats.maxNitro) * 100))}%`;
    const nitroText = document.getElementById('nitro-text');
    if (nitroText) nitroText.innerText = `${Math.floor(this.stats.nitro)}%`;

    // Tier & Level
    const tierName = document.getElementById('hud-tier-name');
    if (tierName) tierName.innerText = VEHICLE_TIERS[this.stats.tier].name;
    const tierDot = document.getElementById('hud-tier-dot');
    if (tierDot) {
      tierDot.style.backgroundColor = VEHICLE_TIERS[this.stats.tier].accentColor;
      tierDot.style.boxShadow = `0 0 8px ${VEHICLE_TIERS[this.stats.tier].glowColor}`;
    }
    const lvlBadge = document.getElementById('hud-lvl-badge');
    if (lvlBadge) lvlBadge.innerText = `Lv.${this.stats.level}`;

    // Boss clear count
    const bossMission = document.getElementById('hud-boss-mission');
    if (bossMission) bossMission.innerText = `${this.stats.bossesDefeated} / 2 처치`;

    // Time & Kills
    const timeText = document.getElementById('hud-time');
    if (timeText) timeText.innerText = this.formatTime(this.stats.timeSurvived);
    const killsText = document.getElementById('hud-kills');
    if (killsText) killsText.innerText = `${this.stats.kills}대`;
    const seriesText = document.getElementById('hud-series');
    if (seriesText) seriesText.innerText = VEHICLE_TIERS[this.stats.tier].series;

    // Score
    const scoreText = document.getElementById('hud-score');
    if (scoreText) scoreText.innerText = `${this.stats.score} Pts`;

    // Shield status
    const shieldBadge = document.getElementById('hud-shield-badge');
    if (shieldBadge) shieldBadge.style.display = this.shieldActive ? 'inline-flex' : 'none';

    // Fork Banner
    const forkBanner = document.getElementById('banner-fork');
    if (forkBanner) forkBanner.style.display = (this.roadBranchPhase > 0.35 && this.bossWarningTimer <= 0) ? 'block' : 'none';

    // Boss Warning Banner
    const warningBanner = document.getElementById('banner-boss-warning');
    const warningText = document.getElementById('banner-boss-text');
    if (warningBanner && warningText) {
      if (this.bossWarningTimer > 0) {
        warningText.innerText = `🚨 ${this.bossWarningText}`;
        warningBanner.style.display = 'flex';
      } else {
        warningBanner.style.display = 'none';
      }
    }

    // Boss HP Bar container
    const bossContainer = document.getElementById('boss-hp-container');
    const bossNameText = document.getElementById('boss-name-text');
    const bossRatioText = document.getElementById('boss-ratio-text');
    const bossFill = document.getElementById('boss-hp-fill');
    if (bossContainer) {
      if (this.bossActive && this.currentBoss) {
        bossContainer.style.display = 'flex';
        if (bossNameText) bossNameText.innerText = this.currentBoss.name;
        if (bossRatioText) bossRatioText.innerText = `${Math.floor(this.bossHpRatio * 100)}%`;
        if (bossFill) bossFill.style.width = `${this.bossHpRatio * 100}%`;
      } else {
        bossContainer.style.display = 'none';
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    this.renderRoad(ctx);
    this.renderSkidMarks(ctx);
    this.renderOilPuddles(ctx);
    this.renderScenery(ctx);
    this.renderDrops(ctx);
    this.renderEnemies(ctx);
    this.renderPlayer(ctx);
    this.renderBlades(ctx);
    this.renderProjectiles(ctx);
    this.renderParticles(ctx);
    this.renderNightAtmosphere(ctx);
    this.renderFloatingTexts(ctx);

    ctx.restore();
  }

  renderRoad(ctx) {
    const w = this.width;
    const h = this.height;
    const roadLeft = w * 0.12;
    const roadRight = w * 0.88;
    const roadWidth = roadRight - roadLeft;
    const centerX = w * 0.5;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#334155';
    ctx.fillRect(roadLeft - 18, 0, 18, h);
    ctx.fillRect(roadRight, 0, 18, h);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(roadLeft, 0, roadWidth, h);

    const branchWidth = this.roadBranchPhase * 44;
    if (branchWidth > 6) {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(centerX, 40);
      ctx.lineTo(centerX - branchWidth, h);
      ctx.lineTo(centerX + branchWidth, h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#eab308';
      for (let y = 80; y < h; y += 45) {
        const spanAtY = ((y - 40) / (h - 40)) * branchWidth;
        ctx.fillRect(centerX - spanAtY + 4, y, spanAtY * 2 - 8, 8);
      }

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(centerX, 60, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(centerX, 60, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#475569';
      ctx.fillRect(centerX - 4, 0, 8, h);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 8, 0);
      ctx.lineTo(centerX - 8, h);
      ctx.moveTo(centerX + 8, 0);
      ctx.lineTo(centerX + 8, h);
      ctx.stroke();
    }

    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.setLineDash([26, 26]);
    ctx.lineDashOffset = -this.roadOffsetY;

    const leftBranchMid = (roadLeft + (centerX - branchWidth)) / 2;
    ctx.beginPath();
    ctx.moveTo(leftBranchMid, 0);
    ctx.lineTo(leftBranchMid, h);
    ctx.stroke();

    const rightBranchMid = ((centerX + branchWidth) + roadRight) / 2;
    ctx.beginPath();
    ctx.moveTo(rightBranchMid, 0);
    ctx.lineTo(rightBranchMid, h);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  renderSkidMarks(ctx) {
    for (const sm of this.skidMarks) {
      ctx.strokeStyle = `rgba(15, 23, 42, ${sm.alpha * 0.6})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sm.x1, sm.y1);
      ctx.lineTo(sm.x2, sm.y2);
      ctx.stroke();
    }
  }

  renderOilPuddles(ctx) {
    for (const p of this.oilPuddles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.ellipse(0, 0, p.radius, p.radius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (p.isFlaming) {
        ctx.fillStyle = 'rgba(249, 115, 22, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * 0.8, p.radius * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f97316';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔥', 0, 4);
      }
      ctx.restore();
    }
  }

  renderScenery(ctx) {
    for (const sc of this.roadSceneries) {
      ctx.save();
      ctx.translate(sc.x, sc.y);
      if (sc.type === 'tree') {
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.arc(-4, -4, 15, 0, Math.PI * 2);
        ctx.fill();
      } else if (sc.type === 'lamp') {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-3, -3, 6, 6);
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 48);
        grad.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
        grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 48, 0, Math.PI * 2);
        ctx.fill();
      } else if (sc.type === 'sign') {
        ctx.fillStyle = '#15803d';
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-85, -13, 170, 26);
        ctx.strokeRect(-85, -13, 170, 26);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sc.label || '안전운전', 0, 0);
      }
      ctx.restore();
    }
  }

  renderDrops(ctx) {
    for (const d of this.dropItems) {
      ctx.save();
      ctx.translate(d.x, d.y);
      if (d.type === 'oil') {
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 2, 7, 0, Math.PI);
        ctx.lineTo(0, -8);
        ctx.closePath();
        ctx.fill();
      } else if (d.type === 'scrap') {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (d.type === 'wrench') {
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔧', 0, 0);
      } else if (d.type === 'nitro') {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', 0, 0);
      }
      ctx.restore();
    }
  }

  renderEnemies(ctx) {
    for (const e of this.enemies) {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle);

      const hw = e.width / 2;
      const hh = e.height / 2;
      const isFlash = e.hitFlash > 0;

      if (e.type === 'kickboard') {
        ctx.fillStyle = '#111827';
        ctx.fillRect(-3, -hh, 6, e.height);
        ctx.fillStyle = isFlash ? '#fff' : e.color;
        ctx.fillRect(-4, -hh, 8, 4);
        ctx.fillRect(-4, hh - 4, 8, 4);
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'bicycle') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-2, -hh, 4, 7);
        ctx.fillRect(-2, hh - 7, 4, 7);
        ctx.strokeStyle = isFlash ? '#fff' : e.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -hh + 3);
        ctx.lineTo(0, hh - 3);
        ctx.stroke();
        ctx.fillStyle = isFlash ? '#fff' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'motorcycle') {
        ctx.fillStyle = '#020617';
        ctx.fillRect(-4, -hh, 8, 9);
        ctx.fillRect(-4, hh - 9, 8, 9);
        ctx.fillStyle = isFlash ? '#fff' : e.color;
        ctx.beginPath();
        ctx.roundRect(-hw + 3, -hh + 4, e.width - 6, e.height - 8, 4);
        ctx.fill();
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(0, 2, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'armoredLeader') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-hw - 3, -hh + 4, 6, 12);
        ctx.fillRect(hw - 3, -hh + 4, 6, 12);
        ctx.fillRect(-hw - 3, hh - 16, 6, 12);
        ctx.fillRect(hw - 3, hh - 16, 6, 12);

        ctx.fillStyle = isFlash ? '#fff' : '#b91c1c';
        ctx.beginPath();
        ctx.roundRect(-hw, -hh, e.width, e.height, 5);
        ctx.fill();
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#334155';
        ctx.fillRect(-hw + 2, hh - 4, e.width - 4, 6);
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-2, -12, 4, 12);
      } else if (e.type === 'jokerTruck') {
        ctx.fillStyle = '#020617';
        ctx.fillRect(-hw - 4, -hh + 2, 7, 14);
        ctx.fillRect(hw - 3, -hh + 2, 7, 14);
        ctx.fillRect(-hw - 4, hh - 16, 7, 14);
        ctx.fillRect(hw - 3, hh - 16, 7, 14);

        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-hw - 3, -hh + 7, 3, 4);
        ctx.fillRect(hw, -hh + 7, 3, 4);
        ctx.fillRect(-hw - 3, hh - 11, 3, 4);
        ctx.fillRect(hw, hh - 11, 3, 4);

        ctx.fillStyle = isFlash ? '#fff' : '#6b21a8';
        ctx.beginPath();
        ctx.roundRect(-hw, -hh, e.width, e.height, 6);
        ctx.fill();
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, hh - 10, 8, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-6, hh - 18, 4, 4);
        ctx.fillRect(2, hh - 18, 4, 4);

        const isGreen = Math.floor(Date.now() / 150) % 2 === 0;
        ctx.fillStyle = isGreen ? '#22c55e' : '#ec4899';
        ctx.shadowColor = isGreen ? '#22c55e' : '#ec4899';
        ctx.shadowBlur = 12;
        ctx.fillRect(-6, -4, 12, 6);
        ctx.shadowBlur = 0;
      }

      if (e.hp < e.maxHp && !e.isBoss) {
        ctx.rotate(-e.angle);
        const barW = e.width * 1.3;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(-barW / 2, -hh - 10, barW, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-barW / 2, -hh - 10, barW * (e.hp / e.maxHp), 4);
      }

      ctx.restore();
    }
  }

  renderPlayer(ctx) {
    ctx.save();
    ctx.translate(this.px, this.py);
    ctx.rotate(this.angle + Math.PI / 2);

    const tierInfo = VEHICLE_TIERS[this.stats.tier];
    const hw = tierInfo.width / 2;
    const hh = tierInfo.height / 2;

    if (this.isInvincible && Math.floor(Date.now() / 60) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    if (this.isBoosting || this.stats.tier >= 4) {
      ctx.shadowColor = this.isBoosting ? '#00f0ff' : tierInfo.glowColor;
      ctx.shadowBlur = this.isBoosting ? 26 : 14;
    }

    if (this.stats.tier === 1) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-3, -hh, 6, 8);
      ctx.fillRect(-3, hh - 8, 6, 8);
      ctx.fillStyle = tierInfo.color;
      ctx.beginPath();
      ctx.roundRect(-hw + 2, -hh + 5, tierInfo.width - 4, tierInfo.height - 10, 4);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-hw, -hh + 6, tierInfo.width, 3);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.stats.tier === 2) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-hw - 1, -hh + 4, 4, 8);
      ctx.fillRect(hw - 3, -hh + 4, 4, 8);
      ctx.fillRect(-hw - 1, hh - 12, 4, 8);
      ctx.fillRect(hw - 3, hh - 12, 4, 8);

      ctx.fillStyle = tierInfo.color;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, tierInfo.width, tierInfo.height, 5);
      ctx.fill();
      ctx.strokeStyle = tierInfo.accentColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-hw + 3, -hh + 8, tierInfo.width - 6, tierInfo.height * 0.45);
    } else if (this.stats.tier === 3) {
      ctx.fillStyle = '#020617';
      ctx.fillRect(-hw - 2, -hh + 5, 5, 10);
      ctx.fillRect(hw - 3, -hh + 5, 5, 10);
      ctx.fillRect(-hw - 2, hh - 14, 5, 10);
      ctx.fillRect(hw - 3, hh - 14, 5, 10);

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, -hh);
      ctx.lineTo(hw, -hh + 12);
      ctx.lineTo(hw + 2, hh);
      ctx.lineTo(0, hh - 6);
      ctx.lineTo(-hw - 2, hh);
      ctx.lineTo(-hw, -hh + 12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, hh - 3, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.stats.tier === 4) {
      ctx.fillStyle = '#020617';
      ctx.fillRect(-hw - 3, -hh + 6, 6, 12);
      ctx.fillRect(hw - 3, -hh + 6, 6, 12);
      ctx.fillRect(-hw - 4, hh - 18, 8, 16);
      ctx.fillRect(hw - 4, hh - 18, 8, 16);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, tierInfo.width, tierInfo.height, 4);
      ctx.fill();
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-hw + 4, -hh + 14, tierInfo.width - 8, 16);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-4, hh - 4, 8, 5);
    } else if (this.stats.tier === 5) {
      ctx.fillStyle = '#020617';
      ctx.fillRect(-hw - 3, -hh + 6, 6, 12);
      ctx.fillRect(hw - 3, -hh + 6, 6, 12);
      ctx.fillRect(-hw - 3, hh - 18, 6, 16);
      ctx.fillRect(hw - 3, hh - 18, 6, 16);

      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.moveTo(0, -hh - 4);
      ctx.lineTo(hw + 2, -hh + 14);
      ctx.lineTo(hw + 4, hh);
      ctx.lineTo(0, hh - 8);
      ctx.lineTo(-hw - 4, hh);
      ctx.lineTo(-hw - 2, -hh + 14);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-2, -16, 4, 14);

      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(0, hh - 4, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.shieldActive) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(tierInfo.width, tierInfo.height) * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  renderBlades(ctx) {
    if (this.stats.weapons.blades <= 0) return;
    const bladeCount = Math.min(5, this.stats.weapons.blades);
    const orbitRadius = 65 + this.stats.weapons.blades * 6;

    for (let i = 0; i < bladeCount; i++) {
      const bAngle = this.bladeAngle + (i * (Math.PI * 2 / bladeCount));
      const bx = this.px + Math.cos(bAngle) * orbitRadius;
      const by = this.py + Math.sin(bAngle) * orbitRadius;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(this.bladeAngle * 4);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.px - bx, this.py - by, orbitRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0284c7';
      for (let t = 0; t < 6; t++) {
        const tAngle = (t * Math.PI) / 3;
        ctx.fillRect(Math.cos(tAngle) * 9 - 2, Math.sin(tAngle) * 9 - 2, 5, 5);
      }
      ctx.restore();
    }
  }

  renderProjectiles(ctx) {
    for (const b of this.bullets) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const m of this.missiles) {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.angle);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-8, -3, 16, 6);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(8, -3);
      ctx.lineTo(13, 0);
      ctx.lineTo(8, 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-12, -2, 4, 4);
      ctx.restore();
    }
  }

  renderParticles(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  renderNightAtmosphere(ctx) {
    ctx.save();
    const lightDist = 290;
    const lightAngle = 0.55;

    const grad = ctx.createRadialGradient(
      this.px,
      this.py,
      20,
      this.px + Math.cos(this.angle) * (lightDist * 0.7),
      this.py + Math.sin(this.angle) * (lightDist * 0.7),
      lightDist
    );
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
    grad.addColorStop(0.5, 'rgba(254, 240, 138, 0.08)');
    grad.addColorStop(1, 'rgba(254, 240, 138, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(this.px, this.py);
    ctx.arc(this.px, this.py, lightDist, this.angle - lightAngle, this.angle + lightAngle);
    ctx.closePath();
    ctx.fill();

    const vignette = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      this.width * 0.35,
      this.width / 2,
      this.height / 2,
      this.width * 0.75
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(2, 6, 23, 0.6)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.restore();
  }

  renderFloatingTexts(ctx) {
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${Math.floor(14 * ft.scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}

// Instantiate on window load
window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new GameApp();
});
