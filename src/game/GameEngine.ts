import { sound } from './audio';
import { PlayerStats, UpgradeCard, VEHICLE_TIERS, VehicleTier, WeaponType, PassiveType } from './types';

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  scale: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface SkidMark {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  pierce: number;
  radius: number;
  color: string;
  life: number;
}

export interface Missile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetId: number | null;
  damage: number;
  blastRadius: number;
  life: number;
  angle: number;
}

export interface OilPuddle {
  x: number;
  y: number;
  radius: number;
  duration: number;
  isFlaming: boolean;
  damagePerSec: number;
}

export interface DropItem {
  id: number;
  x: number;
  y: number;
  type: 'oil' | 'scrap' | 'wrench' | 'nitro';
  xpValue: number;
  healValue?: number;
  vx: number;
  vy: number;
}

export type EnemyType = 'kickboard' | 'bicycle' | 'motorcycle' | 'armoredLeader' | 'jokerTruck';

export interface Enemy {
  id: number;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  color: string;
  angle: number;
  isBoss: boolean;
  slowTimer: number;
  hitFlash: number;
}

export interface RoadScenery {
  x: number;
  y: number;
  type: 'tree' | 'lamp' | 'sign' | 'barrel';
  label?: string;
  side: 'left' | 'right' | 'center';
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Viewport
  public width: number = 800;
  public height: number = 900;
  private roadOffsetY: number = 0;
  private screenShake: number = 0;

  // Road Branching / Forking simulation
  // As the car travels, the road can branch into two distinct paths with a central safety island
  public roadBranchPhase: number = 0; // 0 to 1 cycle
  public isForking: boolean = false;
  private forkTimer: number = 0;

  // Player state
  public px: number = 400;
  public py: number = 650;
  public pvx: number = 0;
  public pvy: number = 0;
  public angle: number = -Math.PI / 2; // facing north
  public isBoosting: boolean = false;
  public isInvincible: boolean = false;
  private invincibleTimer: number = 0;

  // Stats
  public stats: PlayerStats = {
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
    weapons: {
      turret: 1,
      blades: 0,
      oilSlick: 0,
      missile: 0,
    },
    passives: {
      speed: 0,
      maxHp: 0,
      magnet: 0,
      nitro: 0,
      shield: 0,
    },
  };

  // Shield
  public shieldActive: boolean = false;
  private shieldTimer: number = 0;

  // Input
  public keys: Record<string, boolean> = {};
  public joystickVector = { x: 0, y: 0 };
  public virtualBoost: boolean = false;

  // Entities
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private missiles: Missile[] = [];
  private oilPuddles: OilPuddle[] = [];
  private dropItems: DropItem[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private skidMarks: SkidMark[] = [];
  private roadSceneries: RoadScenery[] = [];

  // Weapon Timers
  private turretCooldown: number = 0;
  private oilSlickCooldown: number = 0;
  private missileCooldown: number = 0;
  private bladeAngle: number = 0;
  private nextEntityId: number = 1;

  // Boss & Wave Timers
  public currentBoss: Enemy | null = null;
  public bossActive: boolean = false;
  public bossHpRatio: number = 1;
  public bossWarningTimer: number = 0;
  public bossWarningText: string = '';
  private nextBossSpawnTime: number = 65; // Boss 1 spawns at 65s
  private enemySpawnTimer: number = 0;

  // Game States
  public isPaused: boolean = false;
  public isGameOver: boolean = false;
  public isVictory: boolean = false;
  public isLevelUp: boolean = false;
  public levelUpOptions: UpgradeCard[] = [];

  // Callbacks
  public onStateChange?: () => void;
  public onLevelUp?: (cards: UpgradeCard[]) => void;
  public onGameOver?: () => void;
  public onVictory?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;

    this.resize();
    this.initScenery();
    this.bindEvents();
  }

  public resize() {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.width = parent.clientWidth || 800;
      this.height = parent.clientHeight || 900;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
  }

  private initScenery() {
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

  private bindEvents() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code] = true;
      if (e.code === 'Space') e.preventDefault();
      if (e.key === 'p' || e.key === 'P') this.togglePause();
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.keys[e.code] = false;
    });

    window.addEventListener('resize', () => {
      this.resize();
    });
  }

  public start() {
    this.reset();
    sound.startEngine();
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public reset() {
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
      weapons: {
        turret: 1,
        blades: 0,
        oilSlick: 0,
        missile: 0,
      },
      passives: {
        speed: 0,
        maxHp: 0,
        magnet: 0,
        nitro: 0,
        shield: 0,
      },
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
    this.nextBossSpawnTime = 65; // 1st Boss at 65s
    this.isPaused = false;
    this.isGameOver = false;
    this.isVictory = false;
    this.isLevelUp = false;
  }

  public togglePause() {
    if (this.isGameOver || this.isVictory || this.isLevelUp) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      sound.stopEngine();
    } else {
      sound.startEngine();
      this.lastTime = performance.now();
    }
    this.onStateChange?.();
  }

  private loop = (time: number) => {
    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    if (!this.isPaused && !this.isGameOver && !this.isVictory && !this.isLevelUp) {
      this.update(dt);
    }
    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    sound.stopEngine();
  }

  // UPDATE LOOP
  private update(dt: number) {
    this.stats.timeSurvived += dt;

    // Road bifurcation cycle: Road forking effect emerges as player advances
    this.forkTimer += dt;
    this.roadBranchPhase = (Math.sin(this.forkTimer * 0.15) + 1) / 2; // smooth 0 -> 1 oscillation

    // Screen shake decay
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

    // Boss 1 & Boss 2 Spawns
    if (!this.bossActive && this.stats.bossesDefeated < 2 && this.stats.timeSurvived >= this.nextBossSpawnTime) {
      if (this.stats.bossesDefeated === 0) {
        this.spawnBoss1(); // 일반 보스: 폭주족 리더의 방탄 차량
      } else if (this.stats.bossesDefeated === 1) {
        this.spawnBoss2(); // 최종 보스: 조커가 탄 대형 몬스터 트럭
      }
    }

    // Engine Pitch Audio Sync
    const curSpeed = Math.hypot(this.pvx, this.pvy);
    const maxSpeed = VEHICLE_TIERS[this.stats.tier].speed;
    sound.updateEnginePitch(Math.min(1.2, curSpeed / maxSpeed), this.isBoosting);
  }

  // PLAYER UPDATE
  private updatePlayer(dt: number) {
    const tierInfo = VEHICLE_TIERS[this.stats.tier];
    const speedBonus = 1 + this.stats.passives.speed * 0.12;
    const baseSpeed = tierInfo.speed * speedBonus;

    // Nitro Boost Check
    const wantsBoost = this.keys[' '] || this.keys['space'] || this.virtualBoost;
    if (wantsBoost && this.stats.nitro > 4) {
      this.isBoosting = true;
      this.stats.nitro = Math.max(0, this.stats.nitro - 35 * dt);
      if (Math.random() < 0.4) {
        sound.playBoost();
      }

      // Exhaust Boost Flames
      const rearDist = tierInfo.height * 0.55;
      const rx = this.px - Math.cos(this.angle) * rearDist;
      const ry = this.py - Math.sin(this.angle) * rearDist;

      // Batmobile / Tumbler specific flame colors
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

    // Invincible
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
      }
    }

    // Controls
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

      // Skid marks
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

    // Road scroll
    const forwardSpeedY = -this.pvy + 4;
    this.roadOffsetY = (this.roadOffsetY + forwardSpeedY) % 80;

    // Road boundaries
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
    if (this.py < 80) {
      this.py = 80;
      this.pvy = 0;
    }
    if (this.py > this.height - 70) {
      this.py = this.height - 70;
      this.pvy = 0;
    }

    // Central safety island barrier collision if road is branched
    if (this.roadBranchPhase > 0.45) {
      const centerX = this.width * 0.5;
      const islandHalfW = (this.roadBranchPhase - 0.45) * 45; // island width up to ~50px
      if (Math.abs(this.px - centerX) < islandHalfW + halfW && this.py > 150 && this.py < this.height - 150) {
        // Push vehicle gently to left or right lane
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

  // WEAPONS
  private updateWeapons(dt: number) {
    const cooldownReduction = this.stats.tier === 5 ? 0.75 : 1.0;

    // 1. 기관총 (Front Turret)
    if (this.stats.weapons.turret > 0) {
      this.turretCooldown -= dt;
      const baseTurretCd = Math.max(0.11, (0.40 - this.stats.weapons.turret * 0.05) * cooldownReduction);
      if (this.turretCooldown <= 0) {
        this.turretCooldown = baseTurretCd;
        this.fireTurret();
      }
    }

    // 2. 회전형 톱날/범퍼 (Bumper Blades)
    if (this.stats.weapons.blades > 0) {
      const bladeSpeed = 3.5 + this.stats.weapons.blades * 0.8;
      this.bladeAngle += bladeSpeed * dt;
      this.checkBladeCollisions();
    }

    // 3. 기름 유출 & 화염 방사 (Oil Slick)
    if (this.stats.weapons.oilSlick > 0) {
      this.oilSlickCooldown -= dt;
      const oilCd = Math.max(1.1, (3.2 - this.stats.weapons.oilSlick * 0.45) * cooldownReduction);
      if (this.oilSlickCooldown <= 0) {
        this.oilSlickCooldown = oilCd;
        this.dropOilSlick();
      }
    }

    // 4. 오토 타겟 미사일 (Homing Missile)
    if (this.stats.weapons.missile > 0) {
      this.missileCooldown -= dt;
      const missileCd = Math.max(1.3, (3.5 - this.stats.weapons.missile * 0.4) * cooldownReduction);
      if (this.missileCooldown <= 0) {
        this.missileCooldown = missileCd;
        this.fireMissile();
      }
    }
  }

  private fireTurret() {
    const range = 440;
    let closestEnemy: Enemy | null = null;
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

  private checkBladeCollisions() {
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

          // Knockback (boss has knockback resistance)
          const kForce = enemy.isBoss ? 2 : 10;
          const kAngle = Math.atan2(enemy.y - this.py, enemy.x - this.px);
          enemy.x += Math.cos(kAngle) * kForce;
          enemy.y += Math.sin(kAngle) * kForce;
        }
      }
    }
  }

  private dropOilSlick() {
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

  private fireMissile() {
    let targetEnemy: Enemy | null = null;
    for (const enemy of this.enemies) {
      if (enemy.isBoss) {
        targetEnemy = enemy;
        break;
      }
      if (!targetEnemy || enemy.hp > targetEnemy.hp) {
        targetEnemy = enemy;
      }
    }

    if (!targetEnemy && this.enemies.length > 0) {
      targetEnemy = this.enemies[0];
    }

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

  // ENEMIES & SPAWNS
  private updateEnemies(dt: number) {
    this.enemySpawnTimer += dt;
    const spawnInterval = Math.max(0.35, 1.8 - Math.min(1.4, this.stats.timeSurvived * 0.007));
    if (this.enemySpawnTimer >= spawnInterval) {
      this.enemySpawnTimer = 0;
      this.spawnWave();
    }

    // Oil puddle tick
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

      // Death check
      if (enemy.hp <= 0) {
        this.handleEnemyDeath(enemy);
        this.enemies.splice(i, 1);
        continue;
      }

      // Move toward player
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

      // Collision with player
      const enemyRadius = Math.max(enemy.width, enemy.height) * 0.4;
      const collisionDist = playerRadius + enemyRadius;

      if (dist < collisionDist) {
        if (this.isBoosting) {
          // PLAYER IS BOOSTING: SMASH!
          const ramDmg = tier.ramDamage * 2.2;
          enemy.hp -= ramDmg;
          enemy.hitFlash = 0.2;
          sound.playExplosion();
          this.screenShake = 10;

          const kForce = enemy.isBoss ? 15 : 50; // boss resists knockback
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
          // Player hit
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

    // Boss sync
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

  private spawnWave() {
    const elapsed = this.stats.timeSurvived;
    const roadLeft = this.width * 0.16;
    const roadRight = this.width * 0.84;
    const count = Math.min(6, 1 + Math.floor(elapsed / 45));

    for (let c = 0; c < count; c++) {
      let sx = roadLeft + Math.random() * (roadRight - roadLeft);
      let sy = -50 - Math.random() * 80;

      let type: EnemyType = 'kickboard';
      const r = Math.random();
      if (elapsed < 30) {
        type = 'kickboard';
      } else if (elapsed < 75) {
        type = r < 0.65 ? 'kickboard' : 'bicycle';
      } else {
        type = r < 0.35 ? 'kickboard' : r < 0.75 ? 'bicycle' : 'motorcycle';
      }

      this.createEnemy(type, sx, sy);
    }
  }

  // CREATE ENEMY (strictly adhering to: 보스는 일반적인 적들보다 10픽셀정도 크고 7% 더 빠르게 이동)
  private createEnemy(type: EnemyType, x: number, y: number) {
    let name = '전동 킥보드';
    let width = 16;
    let height = 24;
    let hp = 18;
    let speed = 3.2;
    let damage = 10;
    let color = '#a855f7';
    let isBoss = false;

    // Standard baseline for regular enemies:
    // Motorcycle: width=24, height=36, speed=3.6
    switch (type) {
      case 'kickboard': // 1단계 - 전동 킥보드
        name = '전동 킥보드';
        width = 16;
        height = 24;
        hp = 18 + Math.floor(this.stats.timeSurvived * 0.35);
        speed = 3.2;
        damage = 10;
        color = '#c084fc';
        break;
      case 'bicycle': // 2단계 - 자전거
        name = '자전거 라이더';
        width = 20;
        height = 30;
        hp = 42 + Math.floor(this.stats.timeSurvived * 0.55);
        speed = 2.5;
        damage = 16;
        color = '#38bdf8';
        break;
      case 'motorcycle': // 3단계 - 폭주족 오토바이
        name = '폭주족 오토바이';
        width = 24;
        height = 36;
        hp = 88 + Math.floor(this.stats.timeSurvived * 0.95);
        speed = 3.6; // Regular fastest speed
        damage = 25;
        color = '#f43f5e';
        break;
      case 'armoredLeader': // 일반 보스 - 폭주족 리더가 탄 방탄 차량
        // SPECIAL REQUIREMENT: 보스는 일반적인 적들보다 10픽셀정도 크고 7% 더 빠르게 이동
        // Motorcycle width 24 -> 34 (+10px), height 36 -> 46 (+10px)
        // Fastest speed 3.6 * 1.07 = 3.85 (+7% faster!)
        name = '폭주족 리더의 방탄 차량 (Boss 1)';
        width = 34; // 24 + 10 px
        height = 46; // 36 + 10 px
        speed = 3.85; // 3.6 * 1.07 (7% faster)
        hp = 850 + Math.floor(this.stats.timeSurvived * 12);
        damage = 38;
        color = '#e11d48'; // crimson armored vehicle
        isBoss = true;
        break;
      case 'jokerTruck': // 최종 보스 - 조커가 탄 대형 몬스터 트럭
        // SPECIAL REQUIREMENT: 보스는 일반적인 적들보다 10픽셀정도 크고 7% 더 빠르게 이동
        name = '조커의 대형 몬스터 트럭 (Final Boss)';
        width = 34; // 24 + 10 px
        height = 46; // 36 + 10 px
        speed = 3.85; // 3.6 * 1.07 (7% faster)
        hp = 1500 + Math.floor(this.stats.timeSurvived * 18);
        damage = 48;
        color = '#7c3aed'; // Joker purple & neon green
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

  // 1차 일반 보스 스폰: 폭주족 리더의 방탄 차량
  public spawnBoss1() {
    this.bossWarningTimer = 4.0;
    this.bossWarningText = '경고! 폭주족 리더의 방탄 차량 출현! (+10px 대형 / +7% 고속)';
    sound.playBossWarning();

    this.floatingTexts.push({
      x: this.width / 2,
      y: 180,
      text: '🚨 1차 보스: 폭주족 리더의 방탄 차량 출현!',
      color: '#f43f5e',
      alpha: 1,
      vy: -0.5,
      scale: 1.6,
    });

    this.createEnemy('armoredLeader', this.width / 2, -70);
  }

  // 2차 최종 보스 스폰: 조커가 탄 대형 몬스터 트럭
  public spawnBoss2() {
    this.bossWarningTimer = 4.5;
    this.bossWarningText = '경고! 조커가 탄 대형 몬스터 트럭 출현! HA HA HA!';
    sound.playBossWarning();
    sound.playJokerLaugh();

    this.floatingTexts.push({
      x: this.width / 2,
      y: 180,
      text: '🃏 최종 보스: 조커의 대형 몬스터 트럭 출현!',
      color: '#a855f7',
      alpha: 1,
      vy: -0.5,
      scale: 1.8,
    });

    this.createEnemy('jokerTruck', this.width / 2, -80);
  }

  // ENEMY DEATH & SCORING: 일반적 처치 시 5점, 보스 처치 시 100점!
  private handleEnemyDeath(enemy: Enemy) {
    this.stats.kills++;

    if (enemy.isBoss) {
      this.stats.score += 100; // 보스 처치 시 100점!
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

      // Drops: Wrench, Nitro, 6 Scrap crates
      this.dropItems.push({
        id: this.nextEntityId++,
        x: enemy.x,
        y: enemy.y,
        type: 'wrench',
        xpValue: 0,
        healValue: 60,
        vx: 0,
        vy: 0,
      });
      this.dropItems.push({
        id: this.nextEntityId++,
        x: enemy.x + 20,
        y: enemy.y,
        type: 'nitro',
        xpValue: 0,
        vx: 0,
        vy: 0,
      });
      for (let s = 0; s < 6; s++) {
        this.dropItems.push({
          id: this.nextEntityId++,
          x: enemy.x + (Math.random() - 0.5) * 50,
          y: enemy.y + (Math.random() - 0.5) * 50,
          type: 'scrap',
          xpValue: 50,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
        });
      }

      // Check VICTORY condition: "보스를 2회 처치시 게임 종료 후 랭킹에 등록"
      if (this.stats.bossesDefeated >= 2) {
        this.handleVictory();
        return;
      } else {
        // Set up next boss (Joker) spawn time
        this.nextBossSpawnTime = this.stats.timeSurvived + 40;
      }
    } else {
      this.stats.score += 5; // 일반적 처치시 5점!
      sound.playExplosion();
      this.screenShake = 3;

      // Regular Drops
      const roll = Math.random();
      if (roll < 0.65) {
        this.dropItems.push({
          id: this.nextEntityId++,
          x: enemy.x,
          y: enemy.y,
          type: 'oil',
          xpValue: 14 + Math.floor(this.stats.timeSurvived * 0.05),
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
        });
      } else if (roll < 0.9) {
        this.dropItems.push({
          id: this.nextEntityId++,
          x: enemy.x,
          y: enemy.y,
          type: 'scrap',
          xpValue: 28,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
        });
      } else if (roll < 0.95) {
        this.dropItems.push({
          id: this.nextEntityId++,
          x: enemy.x,
          y: enemy.y,
          type: 'nitro',
          xpValue: 0,
          vx: 0,
          vy: 0,
        });
      } else {
        this.dropItems.push({
          id: this.nextEntityId++,
          x: enemy.x,
          y: enemy.y,
          type: 'wrench',
          xpValue: 0,
          healValue: 30,
          vx: 0,
          vy: 0,
        });
      }
    }

    // Explosion particles
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

  // PROJECTILES
  private updateProjectiles(dt: number) {
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

    // Missiles
    for (let mIdx = this.missiles.length - 1; mIdx >= 0; mIdx--) {
      const m = this.missiles[mIdx];
      m.life -= dt;

      let target: Enemy | null = null;
      if (m.targetId) {
        target = this.enemies.find((e) => e.id === m.targetId) || null;
      }
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

  // DROPS
  private updateDrops(dt: number) {
    const magnetRange = 80 + this.stats.passives.magnet * 35;

    for (let dIdx = this.dropItems.length - 1; dIdx >= 0; dIdx--) {
      const item = this.dropItems[dIdx];
      const dx = this.px - item.x;
      const dy = this.py - item.y;
      const dist = Math.hypot(dx, dy);

      if (dist < magnetRange) {
        const pullSpeed = (magnetRange - dist) * 0.2 + 5;
        item.vx = (dx / dist) * pullSpeed;
        item.vy = (dy / dist) * pullSpeed;
        item.x += item.vx;
        item.y += item.vy;
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

          if (this.stats.xp >= this.stats.xpToNext) {
            this.levelUp();
          }
        }
        this.dropItems.splice(dIdx, 1);
        continue;
      }

      if (item.y > this.height + 100) {
        this.dropItems.splice(dIdx, 1);
      }
    }
  }

  // LEVEL UP & EVOLUTION (Batman / Dark Knight / Arkham Knight line)
  private levelUp() {
    this.stats.level++;
    this.stats.xp -= this.stats.xpToNext;
    this.stats.xpToNext = Math.floor(this.stats.xpToNext * 1.35 + 15);
    sound.playLevelUp();

    // Evolution Ladder:
    // Lv.1: 오토바이 (시작)
    // Lv.2: 승용차 (Lv 2)
    // Lv.3: 배트 모빌 (다크나이트) (Lv 4)
    // Lv.4: 텀블러 (다크나이트) (Lv 7)
    // Lv.5: 배트모빌 (아캄나이트) (Lv 10)
    let newTier: VehicleTier = this.stats.tier;
    if (this.stats.level >= 10) newTier = 5;
    else if (this.stats.level >= 7) newTier = 4;
    else if (this.stats.level >= 4) newTier = 3;
    else if (this.stats.level >= 2) newTier = 2;

    if (newTier !== this.stats.tier) {
      this.stats.tier = newTier;
      const vInfo = VEHICLE_TIERS[newTier];
      const maxHpGain = vInfo.maxHp - VEHICLE_TIERS[(newTier - 1) as VehicleTier].maxHp;
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

    this.onLevelUp?.(this.levelUpOptions);
    this.onStateChange?.();
  }

  public generateUpgradeOptions(): UpgradeCard[] {
    const pool: UpgradeCard[] = [];

    // Turret
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
      rarity: tLvl >= 3 ? 'epic' : 'common',
    });

    // Blades
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
        rarity: bLvl === 0 ? 'rare' : 'common',
      });
    }

    // Oil Slick
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
        rarity: oLvl >= 2 ? 'epic' : 'rare',
      });
    }

    // Missile
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
        rarity: 'epic',
      });
    }

    // Passives
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
      rarity: 'common',
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
      rarity: 'common',
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
      rarity: 'common',
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
      rarity: 'rare',
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
        rarity: 'epic',
      });
    }

    const shuffled = pool.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }

  public selectUpgrade(card: UpgradeCard) {
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
    sound.startEngine();
    this.lastTime = performance.now();
    this.onStateChange?.();
  }

  private handleGameOver() {
    this.isGameOver = true;
    sound.stopEngine();
    sound.playExplosion();
    this.onGameOver?.();
    this.onStateChange?.();
  }

  private handleVictory() {
    this.isVictory = true;
    sound.stopEngine();
    sound.playVictory();
    this.onVictory?.();
    this.onStateChange?.();
  }

  // PARTICLES & SCENERY
  private updateParticles(dt: number) {
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

  private updateScenery(dt: number) {
    const scrollSpeed = 3.5 + (this.isBoosting ? 5 : 0);
    for (const sc of this.roadSceneries) {
      sc.y += scrollSpeed;
      if (sc.y > this.height + 60) {
        sc.y = -60 - Math.random() * 40;
      }
    }
  }

  // RENDER PIPELINE
  private render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    this.renderRoadWithBranching(ctx);
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

  // ROAD & LANE BRANCHING (플레이어가 전진함에 따라 도로 차선이 분기되어 지는 연출)
  private renderRoadWithBranching(ctx: CanvasRenderingContext2D) {
    const w = this.width;
    const h = this.height;
    const roadLeft = w * 0.12;
    const roadRight = w * 0.88;
    const roadWidth = roadRight - roadLeft;
    const centerX = w * 0.5;

    // Roadside ground
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Sidewalk curbs
    ctx.fillStyle = '#334155';
    ctx.fillRect(roadLeft - 18, 0, 18, h);
    ctx.fillRect(roadRight, 0, 18, h);

    // Asphalt base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(roadLeft, 0, roadWidth, h);

    // Road bifurcation / branching calculation
    // When roadBranchPhase is active, a concrete divider / safety crash island appears in the center
    const branchWidth = this.roadBranchPhase * 44; // expands up to ~44px wide

    if (branchWidth > 6) {
      // Draw Central Fork Barrier Island (분기점 중앙 분리대 & 안전지대)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(centerX, 40);
      ctx.lineTo(centerX - branchWidth, h);
      ctx.lineTo(centerX + branchWidth, h);
      ctx.closePath();
      ctx.fill();

      // Yellow chevron warning stripes on the dividing island
      ctx.fillStyle = '#eab308';
      for (let y = 80; y < h; y += 45) {
        const spanAtY = ((y - 40) / (h - 40)) * branchWidth;
        ctx.fillRect(centerX - spanAtY + 4, y, spanAtY * 2 - 8, 8);
      }

      // Crash cushion impact barrels at the tip of the fork
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(centerX, 60, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(centerX, 60, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal central barrier
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

    // Lane dashes
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.setLineDash([26, 26]);
    ctx.lineDashOffset = -this.roadOffsetY;

    // Left branched road lanes
    const leftBranchMid = (roadLeft + (centerX - branchWidth)) / 2;
    ctx.beginPath();
    ctx.moveTo(leftBranchMid, 0);
    ctx.lineTo(leftBranchMid, h);
    ctx.stroke();

    // Right branched road lanes
    const rightBranchMid = ((centerX + branchWidth) + roadRight) / 2;
    ctx.beginPath();
    ctx.moveTo(rightBranchMid, 0);
    ctx.lineTo(rightBranchMid, h);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  private renderSkidMarks(ctx: CanvasRenderingContext2D) {
    for (const sm of this.skidMarks) {
      ctx.strokeStyle = `rgba(15, 23, 42, ${sm.alpha * 0.6})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sm.x1, sm.y1);
      ctx.lineTo(sm.x2, sm.y2);
      ctx.stroke();
    }
  }

  private renderOilPuddles(ctx: CanvasRenderingContext2D) {
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

  private renderScenery(ctx: CanvasRenderingContext2D) {
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
        // Highway overhead sign
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

  private renderDrops(ctx: CanvasRenderingContext2D) {
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

  // RENDER ENEMIES (Kickboard, Bicycle, Motorcycle, Boss 1 Armored Car, Boss 2 Joker Monster Truck)
  private renderEnemies(ctx: CanvasRenderingContext2D) {
    for (const e of this.enemies) {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle);

      const hw = e.width / 2;
      const hh = e.height / 2;
      const isFlash = e.hitFlash > 0;

      if (e.type === 'kickboard') {
        // 1단계 전동 킥보드
        ctx.fillStyle = '#111827';
        ctx.fillRect(-3, -hh, 6, e.height);
        ctx.fillStyle = isFlash ? '#fff' : e.color;
        ctx.fillRect(-4, -hh, 8, 4);
        ctx.fillRect(-4, hh - 4, 8, 4);
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'bicycle') {
        // 2단계 자전거
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
        // 3단계 폭주족 오토바이
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
        // 1차 보스: 폭주족 리더의 방탄 차량 (34x46, 10px larger than motorcycle)
        // Heavy Armored Wheels
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-hw - 3, -hh + 4, 6, 12);
        ctx.fillRect(hw - 3, -hh + 4, 6, 12);
        ctx.fillRect(-hw - 3, hh - 16, 6, 12);
        ctx.fillRect(hw - 3, hh - 16, 6, 12);

        // Armored Red Plating
        ctx.fillStyle = isFlash ? '#fff' : '#b91c1c';
        ctx.beginPath();
        ctx.roundRect(-hw, -hh, e.width, e.height, 5);
        ctx.fill();
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Front Spiked Ramming Bullbar
        ctx.fillStyle = '#334155';
        ctx.fillRect(-hw + 2, hh - 4, e.width - 4, 6);
        // Roof Machine Gun Turret
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-2, -12, 4, 12);
      } else if (e.type === 'jokerTruck') {
        // 최종 보스: 조커의 대형 몬스터 트럭 (34x46, 10px larger than motorcycle)
        // Giant Monster Tires with green rims
        ctx.fillStyle = '#020617';
        ctx.fillRect(-hw - 4, -hh + 2, 7, 14);
        ctx.fillRect(hw - 3, -hh + 2, 7, 14);
        ctx.fillRect(-hw - 4, hh - 16, 7, 14);
        ctx.fillRect(hw - 3, hh - 16, 7, 14);

        // Neon Green Tire Hubs
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-hw - 3, -hh + 7, 3, 4);
        ctx.fillRect(hw, -hh + 7, 3, 4);
        ctx.fillRect(-hw - 3, hh - 11, 3, 4);
        ctx.fillRect(hw, hh - 11, 3, 4);

        // Purple Joker Body
        ctx.fillStyle = isFlash ? '#fff' : '#6b21a8';
        ctx.beginPath();
        ctx.roundRect(-hw, -hh, e.width, e.height, 6);
        ctx.fill();
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Joker Red Smile & Eyes on Hood
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, hh - 10, 8, 0, Math.PI); // smiling mouth
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-6, hh - 18, 4, 4); // eye
        ctx.fillRect(2, hh - 18, 4, 4); // eye

        // Flashing Emergency/Party Neon Siren
        const isGreen = Math.floor(Date.now() / 150) % 2 === 0;
        ctx.fillStyle = isGreen ? '#22c55e' : '#ec4899';
        ctx.shadowColor = isGreen ? '#22c55e' : '#ec4899';
        ctx.shadowBlur = 12;
        ctx.fillRect(-6, -4, 12, 6);
        ctx.shadowBlur = 0;
      }

      // Small HP bar for damaged non-bosses
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

  // RENDER PLAYER (Batpod Bike -> Sedan -> Batmobile Dark Knight -> Tumbler -> Batmobile Arkham Knight)
  private renderPlayer(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.px, this.py);
    ctx.rotate(this.angle + Math.PI / 2);

    const tierInfo = VEHICLE_TIERS[this.stats.tier];
    const hw = tierInfo.width / 2;
    const hh = tierInfo.height / 2;

    if (this.isInvincible && Math.floor(Date.now() / 60) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    // Boost & High Tier Neon Underglow
    if (this.isBoosting || this.stats.tier >= 4) {
      ctx.shadowColor = this.isBoosting ? '#00f0ff' : tierInfo.glowColor;
      ctx.shadowBlur = this.isBoosting ? 26 : 14;
    }

    if (this.stats.tier === 1) {
      // Lv.1: 오토바이 (Batpod / Bike)
      // Wheels
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-3, -hh, 6, 8);
      ctx.fillRect(-3, hh - 8, 6, 8);
      // Sleek chassis
      ctx.fillStyle = tierInfo.color;
      ctx.beginPath();
      ctx.roundRect(-hw + 2, -hh + 5, tierInfo.width - 4, tierInfo.height - 10, 4);
      ctx.fill();
      // Handlebars
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-hw, -hh + 6, tierInfo.width, 3);
      // Rider
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.stats.tier === 2) {
      // Lv.2: 승용차 (Sedan)
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
      // Lv.3: 배트 모빌 (다크나이트 시리즈)
      // Sleek armored bat wings & jet turbine
      ctx.fillStyle = '#020617';
      ctx.fillRect(-hw - 2, -hh + 5, 5, 10);
      ctx.fillRect(hw - 3, -hh + 5, 5, 10);
      ctx.fillRect(-hw - 2, hh - 14, 5, 10);
      ctx.fillRect(hw - 3, hh - 14, 5, 10);

      // Main dark batmobile chassis
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
      ctx.strokeStyle = '#facc15'; // Bat gold accents
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Jet exhaust center
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, hh - 3, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.stats.tier === 4) {
      // Lv.4: 텀블러 (다크나이트 시리즈 - The Tumbler)
      // Giant wide dual rear wheels
      ctx.fillStyle = '#020617';
      ctx.fillRect(-hw - 3, -hh + 6, 6, 12);
      ctx.fillRect(hw - 3, -hh + 6, 6, 12);
      ctx.fillRect(-hw - 4, hh - 18, 8, 16); // massive rear tires
      ctx.fillRect(hw - 4, hh - 18, 8, 16);

      // Angled heavy stealth armor
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, tierInfo.width, tierInfo.height, 4);
      ctx.fill();
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Front cockpit flaps
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-hw + 4, -hh + 14, tierInfo.width - 8, 16);
      // Center rocket thruster
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-4, hh - 4, 8, 5);
    } else if (this.stats.tier === 5) {
      // Lv.5: 배트모빌 (아캄나이트 - Arkham Knight Batmobile)
      // Sleek supercar / battle tank hybrid
      ctx.fillStyle = '#020617';
      ctx.fillRect(-hw - 3, -hh + 6, 6, 12);
      ctx.fillRect(hw - 3, -hh + 6, 6, 12);
      ctx.fillRect(-hw - 3, hh - 18, 6, 16);
      ctx.fillRect(hw - 3, hh - 18, 6, 16);

      // Super aerodynamic body
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

      // Cyan / Blue Arkham battle mode lights
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 60mm Cannon Turret on top
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-2, -16, 4, 14);

      // Afterburner Jet engine
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(0, hh - 4, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shield
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

  private renderBlades(ctx: CanvasRenderingContext2D) {
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

  private renderProjectiles(ctx: CanvasRenderingContext2D) {
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

  private renderParticles(ctx: CanvasRenderingContext2D) {
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

  private renderNightAtmosphere(ctx: CanvasRenderingContext2D) {
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

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
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
