/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Download,
  RotateCcw,
  HelpCircle,
  Zap,
  Shield,
  Trophy,
  Sparkles,
  ChevronRight,
  Target,
  Skull,
} from 'lucide-react';
import { GameEngine } from './game/GameEngine';
import { sound } from './game/audio';
import { UpgradeCard, VEHICLE_TIERS, VehicleTier, RankingEntry } from './game/types';
import { generateStandaloneHtml } from './game/standaloneHtml';

const RANKING_STORAGE_KEY = 'tado_pokjujok_rankings_v2';

const DEFAULT_RANKINGS: RankingEntry[] = [
  { id: '1', name: '다크나이트', score: 1450, kills: 182, timeSurvived: 195, finalTierName: 'Lv.5 배트모빌 (아캄나이트)', cleared: true, date: '2026-11-01' },
  { id: '2', name: '고담수호자', score: 1120, kills: 145, timeSurvived: 160, finalTierName: 'Lv.4 텀블러', cleared: true, date: '2026-10-30' },
  { id: '3', name: '도로의정의', score: 820, kills: 110, timeSurvived: 125, finalTierName: 'Lv.3 배트 모빌', cleared: false, date: '2026-10-28' },
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Stats
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [nitro, setNitro] = useState(100);
  const [maxNitro, setMaxNitro] = useState(100);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpToNext, setXpToNext] = useState(35);
  const [tier, setTier] = useState<VehicleTier>(1);
  const [kills, setKills] = useState(0);
  const [score, setScore] = useState(0);
  const [bossesDefeated, setBossesDefeated] = useState(0);
  const [timeSurvived, setTimeSurvived] = useState(0);

  // States
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isLevelUp, setIsLevelUp] = useState(false);
  const [levelUpCards, setLevelUpCards] = useState<UpgradeCard[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [bossActive, setBossActive] = useState(false);
  const [bossName, setBossName] = useState('');
  const [bossHpRatio, setBossHpRatio] = useState(1);
  const [bossWarning, setBossWarning] = useState(false);
  const [bossWarningText, setBossWarningText] = useState('');
  const [shieldActive, setShieldActive] = useState(false);
  const [weapons, setWeapons] = useState({ turret: 1, blades: 0, oilSlick: 0, missile: 0 });

  // Road Branching info
  const [isForking, setIsForking] = useState(false);

  // Ranking state
  const [rankings, setRankings] = useState<RankingEntry[]>(() => {
    try {
      const saved = localStorage.getItem(RANKING_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_RANKINGS;
    } catch {
      return DEFAULT_RANKINGS;
    }
  });
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [hasSavedRank, setHasSavedRank] = useState(false);

  // Virtual Joystick
  const joystickRef = useRef<HTMLDivElement | null>(null);
  const [isDraggingJoy, setIsDraggingJoy] = useState(false);
  const [joyOffset, setJoyOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    engine.onStateChange = () => syncState(engine);
    engine.onLevelUp = (cards) => {
      setLevelUpCards(cards);
      setIsLevelUp(true);
      syncState(engine);
    };
    engine.onGameOver = () => {
      setIsGameOver(true);
      setHasSavedRank(false);
      syncState(engine);
    };
    engine.onVictory = () => {
      setIsVictory(true);
      setHasSavedRank(false);
      syncState(engine);
    };

    engine.start();

    const interval = setInterval(() => {
      if (engineRef.current) {
        syncState(engineRef.current);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      engine.destroy();
    };
  }, []);

  const syncState = (engine: GameEngine) => {
    setHp(engine.stats.hp);
    setMaxHp(engine.stats.maxHp);
    setNitro(engine.stats.nitro);
    setMaxNitro(engine.stats.maxNitro);
    setLevel(engine.stats.level);
    setXp(engine.stats.xp);
    setXpToNext(engine.stats.xpToNext);
    setTier(engine.stats.tier);
    setKills(engine.stats.kills);
    setScore(engine.stats.score);
    setBossesDefeated(engine.stats.bossesDefeated);
    setTimeSurvived(engine.stats.timeSurvived);
    setIsPaused(engine.isPaused);
    setIsGameOver(engine.isGameOver);
    setIsVictory(engine.isVictory);
    setIsLevelUp(engine.isLevelUp);
    setBossActive(engine.bossActive);
    setBossName(engine.currentBoss?.name || '보스 탈것');
    setBossHpRatio(engine.bossHpRatio);
    setBossWarning(engine.bossWarningTimer > 0);
    setBossWarningText(engine.bossWarningText);
    setShieldActive(engine.shieldActive);
    setIsForking(engine.roadBranchPhase > 0.35);
    setWeapons({ ...engine.stats.weapons });
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  const togglePause = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  };

  const handleSelectUpgrade = (card: UpgradeCard) => {
    if (engineRef.current) {
      engineRef.current.selectUpgrade(card);
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.reset();
      engineRef.current.start();
      setHasSavedRank(false);
      setPlayerNameInput('');
      syncState(engineRef.current);
    }
  };

  const handleSaveToRanking = () => {
    if (hasSavedRank) return;
    const name = playerNameInput.trim() || '고담의 기사';
    const newEntry: RankingEntry = {
      id: String(Date.now()),
      name,
      score,
      kills,
      timeSurvived: Math.floor(timeSurvived),
      finalTierName: VEHICLE_TIERS[tier].name,
      cleared: isVictory,
      date: new Date().toISOString().split('T')[0],
    };

    const updated = [...rankings, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
    setRankings(updated);
    try {
      localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    setHasSavedRank(true);
    setShowRanking(true);
  };

  const downloadStandaloneHtmlFile = () => {
    const htmlContent = generateStandaloneHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tado-pokjujok-batmobile.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLevelUp && levelUpCards.length > 0) {
        if (e.key === '1' && levelUpCards[0]) handleSelectUpgrade(levelUpCards[0]);
        if (e.key === '2' && levelUpCards[1]) handleSelectUpgrade(levelUpCards[1]);
        if (e.key === '3' && levelUpCards[2]) handleSelectUpgrade(levelUpCards[2]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLevelUp, levelUpCards]);

  // Touch joystick
  const handleJoyStart = (e: React.PointerEvent) => {
    setIsDraggingJoy(true);
    handleJoyMove(e);
  };
  const handleJoyMove = (e: React.PointerEvent) => {
    if (!isDraggingJoy && e.type !== 'pointerdown') return;
    if (!joystickRef.current || !engineRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 38;
    const clampedDist = Math.min(dist, maxRadius);
    const normX = dist === 0 ? 0 : (dx / dist);
    const normY = dist === 0 ? 0 : (dy / dist);

    setJoyOffset({ x: normX * clampedDist, y: normY * clampedDist });
    engineRef.current.joystickVector = {
      x: normX * (clampedDist / maxRadius),
      y: normY * (clampedDist / maxRadius),
    };
  };
  const handleJoyEnd = () => {
    setIsDraggingJoy(false);
    setJoyOffset({ x: 0, y: 0 });
    if (engineRef.current) engineRef.current.joystickVector = { x: 0, y: 0 };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const curTierInfo = VEHICLE_TIERS[tier];

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden font-sans select-none text-slate-100">
      {/* XP Level Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-slate-800 z-30">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(52,211,153,0.8)]"
          style={{ width: `${Math.min(100, (xp / xpToNext) * 100)}%` }}
        />
      </div>

      {/* ROAD FORK / BRANCHING STATUS BANNER */}
      {isForking && !bossWarning && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-25 pointer-events-none animate-bounce">
          <div className="bg-slate-900/90 border border-emerald-500/60 text-emerald-300 px-3 py-1 rounded-full text-[11px] font-bold shadow-lg flex items-center gap-1.5">
            🛣️ 도로 차선 분기 구간 (좌측/우측 갈래 선택)
          </div>
        </div>
      )}

      {/* BOSS WARNING RED FLASH BANNER */}
      {bossWarning && (
        <div className="absolute top-4 left-0 right-0 z-40 flex justify-center pointer-events-none animate-pulse">
          <div className="bg-red-600/95 text-white font-black px-6 py-2.5 rounded-full border-2 border-red-300 shadow-[0_0_25px_rgba(239,68,68,0.95)] tracking-wider text-xs md:text-sm flex items-center gap-2">
            🚨 {bossWarningText}
          </div>
        </div>
      )}

      {/* BOSS HEALTH BAR */}
      {bossActive && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 w-80 md:w-96 bg-slate-900/95 backdrop-blur-md p-2.5 rounded-2xl border border-red-500/60 shadow-2xl flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs font-black text-red-400 px-1">
            <span className="flex items-center gap-1.5">
              <Skull className="w-4 h-4 text-red-500 animate-spin" />
              {bossName}
            </span>
            <span className="font-mono text-amber-300">{Math.floor(bossHpRatio * 100)}%</span>
          </div>
          <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-red-950">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-orange-400 transition-all duration-100 ease-out shadow-[0_0_8px_rgba(239,68,68,0.8)]"
              style={{ width: `${bossHpRatio * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* TOP HUD BAR */}
      <header className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
        {/* 1. 좌측 상단: 차량 체력바(HP Bar), 부스터 연료 게이지 */}
        <div className="flex flex-col gap-2 pointer-events-auto bg-slate-900/85 backdrop-blur-md p-3 rounded-2xl border border-slate-700/60 shadow-xl min-w-[210px]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full shadow-[0_0_8px]"
                style={{ backgroundColor: curTierInfo.accentColor, boxShadow: `0 0 8px ${curTierInfo.glowColor}` }}
              />
              <span className="text-xs font-black tracking-wide text-slate-100">{curTierInfo.name}</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-cyan-300 font-bold px-1.5 py-0.5 rounded">
              Lv.{level}
            </span>
          </div>

          {/* 체력바 */}
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-rose-400 flex items-center gap-1">
                차량 체력 (HP)
                {shieldActive && (
                  <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1 py-0.2 rounded border border-cyan-500/40 flex items-center gap-0.5">
                    <Shield className="w-2.5 h-2.5" /> 쉴드
                  </span>
                )}
              </span>
              <span className="text-slate-300">{Math.ceil(hp)} / {maxHp}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700/50">
              <div
                className={`h-full transition-all duration-100 ${
                  hp / maxHp < 0.25 ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-red-500 to-rose-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, (hp / maxHp) * 100))}%` }}
              />
            </div>
          </div>

          {/* 부스터 연료 게이지 */}
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-sky-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-sky-400" /> 부스터 (Space)
              </span>
              <span className="text-slate-300">{Math.floor(nitro)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-75"
                style={{ width: `${Math.min(100, Math.max(0, (nitro / maxNitro) * 100))}%` }}
              />
            </div>
          </div>

          {/* 보스 처치 현황 (2회 처치 시 클리어) */}
          <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-600/30">
            <span>보스 소탕 미션</span>
            <span className="text-yellow-400">{bossesDefeated} / 2 처치</span>
          </div>
        </div>

        {/* 2. 상단 중앙: 탈것 단계 및 타이머, 킬수 */}
        <div className="hidden sm:flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/60 shadow-xl pointer-events-auto">
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">탈것 단계</div>
            <div className="text-xs font-black text-cyan-300">{curTierInfo.series}</div>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">생존 시간</div>
            <div className="text-lg font-black text-amber-400 tracking-wider">{formatTime(timeSurvived)}</div>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">처치 수</div>
            <div className="text-lg font-black text-rose-400 tracking-wider">{kills}대</div>
          </div>
        </div>

        {/* 3. 우측 상단: 점수 (일반적 처치시 5점, 보스 처치시 100점) & 메뉴 버튼 */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {/* 점수 전용 카드 */}
          <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-cyan-500/40 shadow-xl text-right min-w-[170px]">
            <div className="text-[10px] font-bold text-slate-400 flex items-center justify-end gap-1">
              <Target className="w-3 h-3 text-cyan-400" /> 점수 (일반 5점 / 보스 100점)
            </div>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300 tracking-wider">
              {score} <span className="text-xs text-slate-400 font-bold">Pts</span>
            </div>
          </div>

          {/* 기능 버튼 툴바 */}
          <div className="flex items-center gap-1.5">
            {/* 단일 HTML 다운로드 */}
            <button
              onClick={downloadStandaloneHtmlFile}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl border border-emerald-400/40 shadow-lg cursor-pointer"
              title="단일 HTML 파일로 저장하여 언제든 더블클릭으로 플레이할 수 있습니다."
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">단일 HTML 저장</span>
            </button>

            {/* 명예의 전당 랭킹 보기 */}
            <button
              onClick={() => setShowRanking(true)}
              className="p-1.5 bg-slate-900/85 hover:bg-slate-800 text-amber-400 rounded-xl border border-amber-500/40 shadow-lg cursor-pointer"
              title="명예의 전당 (랭킹)"
            >
              <Trophy className="w-4 h-4" />
            </button>

            {/* 음소거 토글 */}
            <button
              onClick={toggleSound}
              className="p-1.5 bg-slate-900/85 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 shadow-lg cursor-pointer"
              title={isMuted ? '음소거 해제' : '음소거'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* 일시정지 */}
            <button
              onClick={togglePause}
              className="p-1.5 bg-slate-900/85 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 shadow-lg cursor-pointer"
              title={isPaused ? '게임 재개' : '일시정지 (P)'}
            >
              {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4 text-slate-300" />}
            </button>

            {/* 도움말 */}
            <button
              onClick={() => setShowHelp(true)}
              className="p-1.5 bg-slate-900/85 hover:bg-slate-800 text-sky-400 rounded-xl border border-slate-700 shadow-lg cursor-pointer"
              title="게임 방법 및 조작키"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Canvas Viewport */}
      <main className="w-full h-full flex items-center justify-center bg-slate-950">
        <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />
      </main>

      {/* Touch Mobile Controls */}
      <div className="md:hidden absolute bottom-5 left-5 right-5 z-25 flex justify-between items-end pointer-events-none">
        <div
          ref={joystickRef}
          onPointerDown={handleJoyStart}
          onPointerMove={handleJoyMove}
          onPointerUp={handleJoyEnd}
          onPointerCancel={handleJoyEnd}
          className="w-24 h-24 rounded-full bg-slate-900/60 border-2 border-cyan-500/40 backdrop-blur-sm flex items-center justify-center pointer-events-auto touch-none relative shadow-xl"
        >
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_12px_rgba(56,189,248,0.8)] pointer-events-none transition-transform duration-75"
            style={{ transform: `translate(${joyOffset.x}px, ${joyOffset.y}px)` }}
          />
        </div>

        <button
          onPointerDown={() => {
            if (engineRef.current) engineRef.current.virtualBoost = true;
          }}
          onPointerUp={() => {
            if (engineRef.current) engineRef.current.virtualBoost = false;
          }}
          onPointerLeave={() => {
            if (engineRef.current) engineRef.current.virtualBoost = false;
          }}
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 border-2 border-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.7)] flex flex-col items-center justify-center font-black text-white pointer-events-auto touch-none active:scale-95 text-xs gap-0.5"
        >
          <Zap className="w-6 h-6 text-yellow-300" />
          부스터!
        </button>
      </div>

      {/* LEVEL UP MODAL */}
      {isLevelUp && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(245,158,11,0.3)] text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 font-black text-xs uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" /> LEVEL UP! (Lv.{level})
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
              차량 진화 및 장비 강화
            </h2>
            <p className="text-xs md:text-sm text-cyan-300 font-semibold mt-1">
              현재 차량: <span className="font-bold underline text-amber-300">{curTierInfo.name}</span> ({curTierInfo.subName})
            </p>

            <div className="w-full flex flex-col gap-3 mt-5">
              {levelUpCards.map((card, idx) => (
                <button
                  key={card.id + idx}
                  onClick={() => handleSelectUpgrade(card)}
                  className={`group relative w-full text-left p-4 rounded-2xl border transition-all duration-150 flex items-center gap-4 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${
                    card.rarity === 'epic'
                      ? 'bg-purple-950/40 border-purple-500/50 hover:bg-purple-900/50 hover:border-purple-400'
                      : card.rarity === 'rare'
                      ? 'bg-sky-950/40 border-sky-500/50 hover:bg-sky-900/50 hover:border-sky-400'
                      : 'bg-slate-900/80 border-slate-700/80 hover:bg-slate-800 hover:border-slate-500'
                  }`}
                >
                  <span className="hidden sm:flex items-center justify-center w-6 h-6 rounded-md bg-slate-800 text-slate-400 font-mono text-xs border border-slate-700">
                    {idx + 1}
                  </span>
                  <div className="text-3xl p-2 rounded-xl bg-slate-800/80 border border-slate-700 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm md:text-base group-hover:text-amber-300 transition-colors">
                        {card.title}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-700/50 text-slate-300">
                        {card.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-snug">
                      {card.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-500 mt-4">
              키보드 숫자키 [1], [2], [3] 을 눌러도 바로 선택할 수 있습니다.
            </div>
          </div>
        </div>
      )}

      {/* VICTORY MODAL (보스 2회 처치 시 완료 & 랭킹 등록) */}
      {isVictory && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-[0_0_60px_rgba(245,158,11,0.4)] text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl mb-2 animate-bounce">
              🏆
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-amber-400 tracking-tight">
              미션 완수! 폭주족 소탕 성공!
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              폭주족 리더의 방탄차와 조커의 대형 몬스터 트럭을 모두 격파하여 도로의 평화를 되찾았습니다!
            </p>

            <div className="w-full bg-slate-950/90 rounded-2xl p-4 my-4 border border-slate-800 flex flex-col gap-2 text-xs md:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">최종 점수 (일반 5점/보스 100점)</span>
                <span className="font-black text-cyan-400 text-lg">{score} Pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">소요 시간</span>
                <span className="font-bold text-amber-400">{formatTime(timeSurvived)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">처치한 폭주족</span>
                <span className="font-bold text-rose-400">{kills}대</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">최종 진화 차량</span>
                <span className="font-bold text-emerald-400">{curTierInfo.name}</span>
              </div>
            </div>

            {/* 랭킹 등록 인풋 */}
            {!hasSavedRank ? (
              <div className="w-full flex gap-2 mb-3">
                <input
                  type="text"
                  value={playerNameInput}
                  onChange={(e) => setPlayerNameInput(e.target.value)}
                  placeholder="명예의 전당에 남길 닉네임"
                  maxLength={12}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-center text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleSaveToRanking}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 text-xs md:text-sm rounded-xl cursor-pointer"
                >
                  랭킹 등록
                </button>
              </div>
            ) : (
              <div className="w-full py-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-xs mb-3">
                ✅ 명예의 전당 랭킹에 성공적으로 등록되었습니다!
              </div>
            )}

            <div className="flex gap-2 w-full">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 font-bold text-white rounded-xl shadow-lg cursor-pointer"
              >
                다시 질주하기
              </button>
              <button
                onClick={() => setShowRanking(true)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 cursor-pointer flex items-center gap-1"
              >
                <Trophy className="w-4 h-4" /> 랭킹 보기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-500/70 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center text-3xl mb-3 animate-bounce">
              💥
            </div>

            <h2 className="text-3xl font-black text-red-500 tracking-tight">차량 대파 (GAME OVER)</h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              폭주족들의 습격에 차량이 파괴되었습니다.
            </p>

            <div className="w-full bg-slate-950/80 rounded-2xl p-4 my-4 border border-slate-800 flex flex-col gap-2 text-xs md:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">최종 점수 (일반 5점/보스 100점)</span>
                <span className="font-bold text-cyan-400 text-lg">{score} Pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">버틴 시간</span>
                <span className="font-bold text-amber-400">{formatTime(timeSurvived)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">폭주족 격파</span>
                <span className="font-bold text-rose-400">{kills}대</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">보스 격파 현황</span>
                <span className="font-bold text-yellow-400">{bossesDefeated} / 2 처치</span>
              </div>
            </div>

            {/* 랭킹 등록 인풋 */}
            {!hasSavedRank ? (
              <div className="w-full flex gap-2 mb-3">
                <input
                  type="text"
                  value={playerNameInput}
                  onChange={(e) => setPlayerNameInput(e.target.value)}
                  placeholder="명예의 전당 닉네임"
                  maxLength={12}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-center text-white focus:outline-none focus:border-red-400"
                />
                <button
                  onClick={handleSaveToRanking}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 font-bold text-white text-xs md:text-sm rounded-xl cursor-pointer"
                >
                  기록 저장
                </button>
              </div>
            ) : (
              <div className="w-full py-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-xs mb-3">
                ✅ 기록이 명예의 전당에 저장되었습니다!
              </div>
            )}

            <div className="flex gap-2 w-full">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 font-bold text-white rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> 다시 출격하기
              </button>
              <button
                onClick={() => setShowRanking(true)}
                className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl border border-slate-600 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trophy className="w-4 h-4" /> 랭킹
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HALL OF FAME RANKING MODAL */}
      {showRanking && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 md:p-8 max-w-lg w-full text-center flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-amber-400 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" /> 명예의 전당 (Top 10 랭킹)
              </h3>
              <button
                onClick={() => setShowRanking(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {rankings.map((entry, idx) => (
                <div
                  key={entry.id + idx}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs md:text-sm ${
                    idx === 0
                      ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                      : idx === 1
                      ? 'bg-slate-800/80 border-slate-500/50 text-slate-200'
                      : idx === 2
                      ? 'bg-orange-950/30 border-orange-500/40 text-orange-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm w-5">{idx + 1}</span>
                    <div className="text-left">
                      <div className="font-bold flex items-center gap-1.5">
                        {entry.name}
                        {entry.cleared && (
                          <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1 py-0.2 rounded border border-amber-500/40">
                            완주 성공
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{entry.finalTierName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-cyan-400 text-sm">{entry.score} Pts</div>
                    <div className="text-[10px] text-slate-400">{formatTime(entry.timeSurvived)} · {entry.kills}대 격파</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowRanking(false)}
              className="w-full mt-5 py-2.5 bg-slate-800 hover:bg-slate-700 font-bold text-white rounded-xl cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* PAUSE MODAL */}
      {isPaused && !isGameOver && !isVictory && !isLevelUp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center">
            <h3 className="text-2xl font-black text-amber-400 mb-2">일시정지 (PAUSED)</h3>
            <p className="text-xs text-slate-400 mb-5">잠시 숨을 고르고 도로 상황을 점검하세요.</p>
            <button
              onClick={togglePause}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold text-white rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> 주행 계속하기 (Resume)
            </button>
          </div>
        </div>
      )}

      {/* HELP MODAL */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-lg w-full text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-sky-400" /> 타도! 폭주족 가이드
              </h3>
              <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1">✕</button>
            </div>

            <div className="flex flex-col gap-3 text-xs md:text-sm text-slate-300">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="font-bold text-amber-400 mb-1">🎮 조작법 & 부스터</div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                  <li><b className="text-slate-200">WASD / 방향키</b>: 차량 조향 및 가감속</li>
                  <li><b className="text-slate-200">Spacebar</b>: 니트로 고속 돌진 (충돌 공격 강화 & 무적)</li>
                  <li><b className="text-slate-200">P</b>: 일시정지</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="font-bold text-cyan-400 mb-1">🚗 탈것 진화 (5단계 라인업)</div>
                <div className="text-slate-400 space-y-1">
                  <div>• <b className="text-sky-300">Lv.1 오토바이</b>: 날렵한 시작 머신 (Batpod)</div>
                  <div>• <b className="text-emerald-300">Lv.2 승용차</b>: 균형 잡힌 소형 차량</div>
                  <div>• <b className="text-yellow-300">Lv.3 배트 모빌 (다크나이트)</b>: 안정적 방어력과 고속 주행</div>
                  <div>• <b className="text-orange-300">Lv.4 텀블러 (다크나이트)</b>: 육중한 장갑과 압도적 넉백</div>
                  <div>• <b className="text-cyan-300">Lv.5 배트모빌 (아캄나이트)</b>: 최고 속도 & 무기 쿨타임 -25% 극대화!</div>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="font-bold text-rose-400 mb-1">⚔️ 점수 & 보스 규칙 (보스 2회 처치 시 클리어!)</div>
                <p className="text-slate-400 leading-relaxed">
                  • 일반 폭주족 처치 시 <b className="text-cyan-300">+5점</b>, 보스 처치 시 <b className="text-yellow-300">+100점</b>.<br />
                  • 1차 보스: <b>폭주족 리더의 방탄 차량</b><br />
                  • 2차 최종 보스: <b>조커가 탄 대형 몬스터 트럭</b><br />
                  • <span className="text-rose-400 font-bold">보스는 일반 적보다 10픽셀 크고 7% 더 빠르게 이동합니다.</span><br />
                  • 보스를 2회 모두 처치하면 게임이 종료되고 <b className="text-amber-400">명예의 전당 랭킹</b>에 등록됩니다!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold text-white rounded-xl cursor-pointer"
            >
              확인 및 도로 복귀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
