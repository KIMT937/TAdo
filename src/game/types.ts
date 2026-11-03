export type VehicleTier = 1 | 2 | 3 | 4 | 5;

export interface VehicleInfo {
  tier: VehicleTier;
  name: string;
  subName: string;
  series: string;
  description: string;
  maxHp: number;
  speed: number;
  handling: number;
  ramDamage: number;
  color: string;
  accentColor: string;
  glowColor: string;
  width: number;
  height: number;
}

export const VEHICLE_TIERS: Record<VehicleTier, VehicleInfo> = {
  1: {
    tier: 1,
    name: '오토바이 (Batpod / Bike)',
    subName: '경량 고기동 2륜',
    series: '시작 차량',
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

export type WeaponType = 'turret' | 'blades' | 'oilSlick' | 'missile';
export type PassiveType = 'speed' | 'maxHp' | 'magnet' | 'nitro' | 'shield';

export interface UpgradeCard {
  id: string;
  type: 'weapon' | 'passive';
  weaponKey?: WeaponType;
  passiveKey?: PassiveType;
  level: number;
  title: string;
  tag: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic';
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  nitro: number;
  maxNitro: number;
  nitroRechargeRate: number;
  level: number;
  xp: number;
  xpToNext: number;
  tier: VehicleTier;
  kills: number;
  score: number;
  bossesDefeated: number; // 2 clears required for victory
  timeSurvived: number;
  weapons: {
    turret: number;
    blades: number;
    oilSlick: number;
    missile: number;
  };
  passives: {
    speed: number;
    maxHp: number;
    magnet: number;
    nitro: number;
    shield: number;
  };
}

export interface RankingEntry {
  id: string;
  name: string;
  score: number;
  kills: number;
  timeSurvived: number;
  finalTierName: string;
  cleared: boolean;
  date: string;
}
