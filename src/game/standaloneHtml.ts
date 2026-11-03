// Generates a 100% self-contained single HTML file with Canvas, CSS, and Vanilla JS
// Fully updated with Road Bifurcation, Batman/Dark Knight/Arkham Knight Evolution,
// 2 Bosses (Armored Leader + Joker Truck, +10px size & +7% speed), 5pt/100pt scoring, and Hall of Fame Leaderboard!

export function generateStandaloneHtml(): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>타도! 폭주족 - 2D 자동차 서바이벌</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-user-select: none;
    }
    body, html {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #090d16;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #f8fafc;
    }
    #game-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #020617;
    }
    canvas {
      display: block;
      background: #0f172a;
      box-shadow: 0 0 30px rgba(0,0,0,0.8);
      max-width: 100vw;
      max-height: 100vh;
    }
    /* HUD Overlays */
    .hud-top {
      position: absolute;
      top: 12px;
      left: 16px;
      right: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      pointer-events: none;
      z-index: 20;
    }
    .hud-card {
      background: rgba(15, 23, 42, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      padding: 8px 14px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    .hud-left {
      display: flex;
      flex-direction: column;
      gap: 6px;
      pointer-events: auto;
    }
    .bar-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .bar-label {
      font-size: 11px;
      font-weight: 800;
      width: 44px;
    }
    .bar-track {
      width: 130px;
      height: 10px;
      background: #1e293b;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .bar-fill-hp {
      height: 100%;
      background: linear-gradient(90deg, #ef4444, #f87171);
      transition: width 0.1s linear;
    }
    .bar-fill-nitro {
      height: 100%;
      background: linear-gradient(90deg, #0284c7, #38bdf8);
      transition: width 0.05s linear;
    }
    .xp-bar-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 6px;
      background: #1e293b;
      z-index: 30;
    }
    .xp-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #34d399);
      width: 0%;
      transition: width 0.15s ease-out;
    }
    /* Modals */
    .modal-overlay {
      position: absolute;
      inset: 0;
      background: rgba(2, 6, 23, 0.88);
      backdrop-filter: blur(10px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 50;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }
    .modal-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }
    .modal-box {
      background: #0f172a;
      border: 2px solid #334155;
      border-radius: 20px;
      padding: 24px;
      width: 90%;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0,0,0,0.85);
    }
    .card-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 16px;
    }
    .upgrade-btn {
      background: #1e293b;
      border: 1px solid #38bdf8;
      border-radius: 12px;
      padding: 12px;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      text-align: left;
      transition: transform 0.1s, background 0.2s;
    }
    .upgrade-btn:hover {
      background: #334155;
      transform: translateY(-2px);
    }
    .btn-action {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 12px 24px;
      font-size: 15px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 14px;
    }
    .btn-action:hover {
      filter: brightness(1.15);
    }
    .touch-btn {
      width: 72px;
      height: 72px;
      background: rgba(30, 41, 59, 0.7);
      border: 2px solid #38bdf8;
      border-radius: 50%;
      color: #38bdf8;
      font-weight: bold;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: auto;
      touch-action: none;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div id="game-container">
    <div class="xp-bar-container">
      <div id="xp-fill" class="xp-bar-fill"></div>
    </div>

    <div class="hud-top">
      <!-- LEFT HUD: HP & NITRO & TIER -->
      <div class="hud-card hud-left">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding-bottom:4px;">
          <span id="tier-text" style="font-size: 12px; font-weight: bold; color: #38bdf8;">Lv.1 오토바이</span>
          <span id="bosses-text" style="font-size: 10px; color: #facc15; font-weight: bold;">보스 처치: 0/2</span>
        </div>
        <div class="bar-row">
          <span class="bar-label" style="color: #f87171;">체력</span>
          <div class="bar-track"><div id="hp-fill" class="bar-fill-hp" style="width: 100%;"></div></div>
          <span id="hp-text" style="font-size: 10px; font-weight: 700; color: #94a3b8;">100/100</span>
        </div>
        <div class="bar-row">
          <span class="bar-label" style="color: #38bdf8;">부스터</span>
          <div class="bar-track"><div id="nitro-fill" class="bar-fill-nitro" style="width: 100%;"></div></div>
          <span id="nitro-text" style="font-size: 10px; font-weight: 700; color: #94a3b8;">100%</span>
        </div>
      </div>

      <!-- CENTER HUD: TIMER & KILLS -->
      <div class="hud-card" style="display:flex; flex-direction:row; gap:14px; align-items:center;">
        <div style="text-align:center;">
          <div style="font-size:9px; color:#94a3b8; font-weight:bold;">생존 시간</div>
          <div id="time-text" style="font-size:15px; font-weight:bold; color:#facc15;">00:00</div>
        </div>
        <div style="width:1px; height:20px; background:#334155;"></div>
        <div style="text-align:center;">
          <div style="font-size:9px; color:#94a3b8; font-weight:bold;">폭주족 처치</div>
          <div id="kills-text" style="font-size:15px; font-weight:bold; color:#ef4444;">0</div>
        </div>
      </div>

      <!-- RIGHT HUD: SCORE (일반 5점, 보스 100점) -->
      <div class="hud-card" style="align-items:flex-end;">
        <div style="font-size:9px; color:#94a3b8; font-weight:bold;">점수 (일반+5 / 보스+100)</div>
        <div id="score-text" style="font-size:18px; font-weight:black; color:#38bdf8;">0 Pts</div>
      </div>
    </div>

    <canvas id="game-canvas"></canvas>

    <!-- TOUCH BOOST (MOBILE) -->
    <div style="position:absolute; bottom:24px; right:20px; z-index:40;">
      <div id="btn-touch-boost" class="touch-btn">부스터!</div>
    </div>

    <!-- LEVEL UP MODAL -->
    <div id="modal-levelup" class="modal-overlay">
      <div class="modal-box">
        <div style="font-size: 24px; font-weight: 900; color: #facc15;">LEVEL UP!</div>
        <div id="modal-tier-announce" style="font-size: 13px; color: #38bdf8; margin-top: 4px;">차량이 진화하고 강력해졌습니다!</div>
        <div id="levelup-cards" class="card-grid"></div>
      </div>
    </div>

    <!-- VICTORY MODAL (보스 2회 처치 시) -->
    <div id="modal-victory" class="modal-overlay">
      <div class="modal-box" style="border-color: #facc15;">
        <div style="font-size: 32px;">🏆</div>
        <div style="font-size: 24px; font-weight: 900; color: #facc15;">미션 완수! 폭주족 소탕 성공!</div>
        <div style="color: #94a3b8; font-size: 13px; margin: 8px 0;">조커와 폭주족 리더를 모두 격파하여 도로의 평화를 되찾았습니다!</div>
        <div style="background: #1e293b; border-radius: 10px; padding: 12px; margin: 12px 0; text-align: left; font-size: 13px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>최종 점수:</span><b id="vic-score" style="color:#38bdf8;">0 Pts</b></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>소요 시간:</span><b id="vic-time" style="color:#facc15;">00:00</b></div>
          <div style="display:flex; justify-content:space-between;"><span>처치 수:</span><b id="vic-kills" style="color:#ef4444;">0대</b></div>
        </div>
        <div style="display:flex; gap:6px; margin-top:10px;">
          <input id="rank-name-input" type="text" placeholder="명예의 전당 닉네임" maxlength="10" style="flex:1; padding:10px; border-radius:8px; border:1px solid #475569; background:#020617; color:#fff; text-align:center;" />
          <button id="btn-save-rank" class="btn-action" style="margin:0; padding:10px 16px;">랭킹 등록</button>
        </div>
        <button id="btn-vic-restart" class="btn-action" style="background:#475569; width:100%; margin-top:8px;">다시 플레이</button>
      </div>
    </div>

    <!-- GAME OVER MODAL -->
    <div id="modal-gameover" class="modal-overlay">
      <div class="modal-box" style="border-color: #ef4444;">
        <div style="font-size: 26px; font-weight: 900; color: #ef4444;">차량 대파 (GAME OVER)</div>
        <div style="color: #94a3b8; font-size: 13px; margin: 8px 0;">폭주족의 습격으로 차량이 파괴되었습니다.</div>
        <div style="background: #1e293b; border-radius: 10px; padding: 12px; margin: 12px 0; text-align: left; font-size: 13px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>최종 점수:</span><b id="final-score" style="color:#38bdf8;">0 Pts</b></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>생존 시간:</span><b id="final-time" style="color:#facc15;">00:00</b></div>
          <div style="display:flex; justify-content:space-between;"><span>폭주족 격파:</span><b id="final-kills" style="color:#ef4444;">0대</b></div>
        </div>
        <button id="btn-restart" class="btn-action" style="width:100%;">다시 출격하기</button>
      </div>
    </div>
  </div>

  <script>
    (function() {
      const canvas = document.getElementById('game-canvas');
      const ctx = canvas.getContext('2d');

      function resize() {
        canvas.width = Math.min(window.innerWidth, 800);
        canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resize);
      resize();

      // Audio synth
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      let actx = null;
      function playTone(freq, type, dur, gainVal) {
        if (!actx) { try { actx = new AudioCtx(); } catch(e){} }
        if (!actx) return;
        try {
          const now = actx.currentTime;
          const osc = actx.createOscillator();
          const g = actx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, now);
          g.gain.setValueAtTime(gainVal || 0.1, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + dur);
          osc.connect(g);
          g.connect(actx.destination);
          osc.start(now);
          osc.stop(now + dur + 0.02);
        } catch(e){}
      }

      // Keys
      const keys = {};
      window.addEventListener('keydown', e => {
        keys[e.key.toLowerCase()] = true;
        keys[e.code] = true;
        if (e.code === 'Space') e.preventDefault();
      });
      window.addEventListener('keyup', e => {
        keys[e.key.toLowerCase()] = false;
        keys[e.code] = false;
      });

      let touchBoost = false;
      document.getElementById('btn-touch-boost').addEventListener('pointerdown', () => { touchBoost = true; });
      window.addEventListener('pointerup', () => { touchBoost = false; });

      // Vehicles Evolution: Lv1 오토바이, Lv2 승용차, Lv3 배트모빌, Lv4 텀블러, Lv5 아캄나이트 배트모빌
      const TIERS = {
        1: { name: 'Lv.1 오토바이 (Batpod)', speed: 5.5, maxHp: 100, color: '#0284c7', w: 14, h: 30, ram: 25 },
        2: { name: 'Lv.2 승용차 (Sedan)', speed: 5.8, maxHp: 160, color: '#10b981', w: 22, h: 38, ram: 50 },
        3: { name: 'Lv.3 배트 모빌 (다크나이트)', speed: 6.3, maxHp: 260, color: '#1e293b', w: 26, h: 50, ram: 85 },
        4: { name: 'Lv.4 텀블러 (다크나이트)', speed: 6.5, maxHp: 380, color: '#0f172a', w: 32, h: 58, ram: 140 },
        5: { name: 'Lv.5 배트모빌 (아캄나이트)', speed: 7.5, maxHp: 520, color: '#020617', w: 34, h: 64, ram: 210 }
      };

      let px = canvas.width / 2, py = canvas.height * 0.75;
      let pvx = 0, pvy = 0, angle = -Math.PI / 2;
      let hp = 100, maxHp = 100, nitro = 100, maxNitro = 100;
      let level = 1, xp = 0, xpNext = 35, tier = 1, kills = 0, score = 0, bossesDefeated = 0, time = 0;
      let weapons = { turret: 1, blades: 0, oilSlick: 0, missile: 0 };
      let passives = { speed: 0, maxHp: 0, magnet: 0, nitro: 0, shield: 0 };
      let isBoosting = false, isInvincible = false, invTimer = 0;
      let isPaused = false, isGameOver = false, isVictory = false, isLevelUp = false;
      let roadOffsetY = 0, bladeAngle = 0, forkPhase = 0;

      let enemies = [];
      let bullets = [];
      let drops = [];
      let turretCd = 0, spawnTimer = 0;
      let nextBossTime = 65;

      function spawnWave() {
        const count = Math.min(6, 1 + Math.floor(time / 45));
        for (let i = 0; i < count; i++) {
          const sx = canvas.width * 0.15 + Math.random() * (canvas.width * 0.7);
          const sy = -40 - Math.random() * 50;
          let type = 'kickboard';
          const r = Math.random();
          if (time < 30) type = 'kickboard';
          else if (time < 75) type = r < 0.6 ? 'kickboard' : 'bicycle';
          else type = r < 0.3 ? 'kickboard' : r < 0.7 ? 'bicycle' : 'motorcycle';

          let w = 18, h = 26, ehp = 20, spd = 2.5, dmg = 12, col = '#a855f7';
          if (type === 'kickboard') { w = 16; h = 24; ehp = 18; spd = 3.2; dmg = 10; col = '#c084fc'; }
          else if (type === 'bicycle') { w = 20; h = 30; ehp = 42; spd = 2.5; dmg = 16; col = '#38bdf8'; }
          else if (type === 'motorcycle') { w = 24; h = 36; ehp = 88; spd = 3.6; dmg = 25; col = '#f43f5e'; }

          enemies.push({ x: sx, y: sy, vx: 0, vy: 0, w, h, hp: ehp, maxHp: ehp, speed: spd, damage: dmg, col, isBoss: false, angle: Math.PI/2 });
        }
      }

      function spawnBoss1() {
        playTone(320, 'sawtooth', 0.6, 0.25);
        // Boss 1: 폭주족 리더 방탄차 (10px larger than motorcycle 24x36 -> 34x46, 7% faster than 3.6 -> 3.85)
        enemies.push({
          x: canvas.width / 2, y: -60, vx: 0, vy: 0,
          w: 34, h: 46, hp: 850 + time * 12, maxHp: 850 + time * 12,
          speed: 3.85, damage: 38, col: '#e11d48', isBoss: true, angle: Math.PI/2, name: '폭주족 리더 방탄차'
        });
      }

      function spawnBoss2() {
        playTone(400, 'sawtooth', 0.7, 0.3);
        // Boss 2: 조커의 대형 몬스터 트럭 (10px larger -> 34x46, 7% faster -> 3.85)
        enemies.push({
          x: canvas.width / 2, y: -70, vx: 0, vy: 0,
          w: 34, h: 46, hp: 1500 + time * 18, maxHp: 1500 + time * 18,
          speed: 3.85, damage: 48, col: '#7c3aed', isBoss: true, angle: Math.PI/2, name: '조커 몬스터 트럭'
        });
      }

      let lastT = performance.now();
      function loop(t) {
        const dt = Math.min((t - lastT) / 1000, 0.1);
        lastT = t;

        if (!isPaused && !isGameOver && !isVictory && !isLevelUp) {
          update(dt);
        }
        render();
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);

      function update(dt) {
        time += dt;
        forkPhase = (Math.sin(time * 0.15) + 1) / 2;

        const wantBoost = keys[' '] || keys['space'] || touchBoost;
        if (wantBoost && nitro > 4) {
          isBoosting = true;
          nitro = Math.max(0, nitro - 35 * dt);
        } else {
          isBoosting = false;
          nitro = Math.min(maxNitro, nitro + (20 + passives.nitro * 5) * dt);
        }

        if (invTimer > 0) {
          invTimer -= dt;
          if (invTimer <= 0) isInvincible = false;
        }

        let mx = 0, my = 0;
        if (keys['arrowleft'] || keys['a']) mx -= 1;
        if (keys['arrowright'] || keys['d']) mx += 1;
        if (keys['arrowup'] || keys['w']) my -= 1;
        if (keys['arrowdown'] || keys['s']) my += 1;

        const curTier = TIERS[tier];
        const spdBonus = 1 + passives.speed * 0.12;
        const baseSpd = curTier.speed * spdBonus;

        if (mx !== 0 || my !== 0) {
          const targetA = Math.atan2(my, mx);
          let diff = targetA - angle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          angle += diff * 0.08 * (dt * 60);

          const targetSpd = baseSpd * (isBoosting ? 2.15 : 1.0);
          pvx += (Math.cos(angle) * targetSpd - pvx) * (12 * dt);
          pvy += (Math.sin(angle) * targetSpd - pvy) * (12 * dt);
        } else {
          pvx *= Math.pow(0.85, dt * 60);
          pvy *= Math.pow(0.85, dt * 60);
        }

        px += pvx;
        py += pvy;
        roadOffsetY = (roadOffsetY - pvy + 4) % 60;

        px = Math.max(canvas.width * 0.12 + 15, Math.min(canvas.width * 0.88 - 15, px));
        py = Math.max(80, Math.min(canvas.height - 70, py));

        turretCd -= dt;
        if (turretCd <= 0 && weapons.turret > 0) {
          turretCd = Math.max(0.11, 0.40 - weapons.turret * 0.05);
          playTone(600, 'triangle', 0.06, 0.08);
          bullets.push({ x: px, y: py, vx: Math.cos(angle) * 16.5, vy: Math.sin(angle) * 16.5, dmg: 24 + weapons.turret * 8, life: 1.25 });
        }

        if (weapons.blades > 0) bladeAngle += 4.5 * dt;

        spawnTimer += dt;
        if (spawnTimer >= Math.max(0.4, 1.8 - time * 0.007)) {
          spawnTimer = 0;
          spawnWave();
        }

        if (bossesDefeated === 0 && time >= nextBossTime) {
          spawnBoss1();
          nextBossTime = time + 50;
        } else if (bossesDefeated === 1 && time >= nextBossTime) {
          spawnBoss2();
          nextBossTime = 999999;
        }

        // Bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          b.x += b.vx;
          b.y += b.vy;
          b.life -= dt;
          if (b.life <= 0) { bullets.splice(i, 1); continue; }
          for (const e of enemies) {
            if (Math.hypot(e.x - b.x, e.y - b.y) < e.w / 2 + 5) {
              e.hp -= b.dmg;
              bullets.splice(i, 1);
              break;
            }
          }
        }

        // Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
          const e = enemies[i];
          if (e.hp <= 0) {
            kills++;
            if (e.isBoss) {
              score += 100; // 보스 처치 100점!
              bossesDefeated++;
              playTone(220, 'square', 0.4, 0.25);
              if (bossesDefeated >= 2) {
                victory();
                return;
              }
            } else {
              score += 5; // 일반적 처치 5점!
              playTone(180, 'sawtooth', 0.15, 0.1);
            }
            drops.push({ x: e.x, y: e.y, xp: e.isBoss ? 150 : 18 });
            enemies.splice(i, 1);
            continue;
          }

          const dx = px - e.x, dy = py - e.y;
          const d = Math.hypot(dx, dy);
          if (d > 0.1) {
            e.angle = Math.atan2(dy, dx);
            e.x += (dx / d) * e.speed;
            e.y += (dy / d) * e.speed;
          }

          if (d < 24) {
            if (isBoosting) {
              e.hp -= curTier.ram * 2.2;
              playTone(120, 'square', 0.2, 0.2);
            } else if (!isInvincible) {
              hp = Math.max(0, hp - e.damage);
              isInvincible = true;
              invTimer = 0.7;
              playTone(140, 'sawtooth', 0.2, 0.25);
              if (hp <= 0) {
                gameOver();
                return;
              }
            }
          }
        }

        // Drops
        for (let i = drops.length - 1; i >= 0; i--) {
          const dr = drops[i];
          const d = Math.hypot(px - dr.x, py - dr.y);
          if (d < 90) {
            dr.x += ((px - dr.x) / d) * 7;
            dr.y += ((py - dr.y) / d) * 7;
          } else {
            dr.y += 2.5;
          }
          if (d < 25) {
            xp += dr.xp;
            playTone(900, 'sine', 0.08, 0.06);
            drops.splice(i, 1);
            if (xp >= xpNext) triggerLevelUp();
          }
        }

        updateUI();
      }

      function triggerLevelUp() {
        level++;
        xp -= xpNext;
        xpNext = Math.floor(xpNext * 1.35 + 15);
        playTone(523, 'triangle', 0.1, 0.15);

        let newTier = tier;
        if (level >= 10) newTier = 5;
        else if (level >= 7) newTier = 4;
        else if (level >= 4) newTier = 3;
        else if (level >= 2) newTier = 2;

        if (newTier !== tier) {
          tier = newTier;
          maxHp = TIERS[tier].maxHp;
          hp = Math.min(maxHp, hp + 60);
        }

        isLevelUp = true;
        document.getElementById('modal-tier-announce').innerText = \`진화 완료: \${TIERS[tier].name}\`;
        const container = document.getElementById('levelup-cards');
        container.innerHTML = '';

        const pool = [
          { title: '기관총 강화', desc: '전방 자동 연사 및 공격력 증가', key: 'turret' },
          { title: '회전 칼날 강화', desc: '접근하는 폭주족을 절단하는 칼날', key: 'blades' },
          { title: '터보 엔진', desc: '최고 속도와 가속력 +12%', key: 'speed' },
          { title: '다크나이트 특수장갑', desc: '최대 체력 증가 및 긴급 수리', key: 'maxHp' },
          { title: '배트 자석 안테나', desc: '원거리 스크랩 흡수 반경 대폭 확대', key: 'magnet' },
          { title: '대용량 니트로 탱크', desc: '부스터 연료 최대치 및 충전 속도 증가', key: 'nitro' }
        ];

        pool.sort(() => 0.5 - Math.random()).slice(0, 3).forEach(c => {
          const btn = document.createElement('div');
          btn.className = 'upgrade-btn';
          btn.innerHTML = \`<div style="font-size:22px;">⚡</div><div><div style="font-weight:bold;">\${c.title}</div><div style="font-size:12px;color:#94a3b8;">\${c.desc}</div></div>\`;
          btn.onclick = () => {
            if (c.key === 'turret') weapons.turret++;
            else if (c.key === 'blades') weapons.blades++;
            else if (c.key === 'speed') passives.speed++;
            else if (c.key === 'maxHp') { maxHp += 40; hp = Math.min(maxHp, hp + 50); }
            else if (c.key === 'magnet') passives.magnet++;
            else if (c.key === 'nitro') { maxNitro += 20; nitro = maxNitro; }
            document.getElementById('modal-levelup').classList.remove('active');
            isLevelUp = false;
          };
          container.appendChild(btn);
        });

        document.getElementById('modal-levelup').classList.add('active');
      }

      function gameOver() {
        isGameOver = true;
        const mins = String(Math.floor(time / 60)).padStart(2, '0');
        const secs = String(Math.floor(time % 60)).padStart(2, '0');
        document.getElementById('final-time').innerText = \`\${mins}:\${secs}\`;
        document.getElementById('final-kills').innerText = \`\${kills}대\`;
        document.getElementById('final-score').innerText = \`\${score} Pts\`;
        document.getElementById('modal-gameover').classList.add('active');
      }

      function victory() {
        isVictory = true;
        playTone(523, 'triangle', 0.2, 0.25);
        setTimeout(() => playTone(659, 'triangle', 0.2, 0.25), 150);
        setTimeout(() => playTone(783, 'triangle', 0.3, 0.25), 300);
        const mins = String(Math.floor(time / 60)).padStart(2, '0');
        const secs = String(Math.floor(time % 60)).padStart(2, '0');
        document.getElementById('vic-time').innerText = \`\${mins}:\${secs}\`;
        document.getElementById('vic-kills').innerText = \`\${kills}대\`;
        document.getElementById('vic-score').innerText = \`\${score} Pts\`;
        document.getElementById('modal-victory').classList.add('active');
      }

      document.getElementById('btn-restart').onclick = restartGame;
      document.getElementById('btn-vic-restart').onclick = restartGame;

      function restartGame() {
        hp = 100; maxHp = 100; nitro = 100; maxNitro = 100;
        level = 1; xp = 0; xpNext = 35; tier = 1; kills = 0; score = 0; bossesDefeated = 0; time = 0;
        enemies = []; bullets = []; drops = [];
        nextBossTime = 65;
        isGameOver = false; isVictory = false; isLevelUp = false;
        document.getElementById('modal-gameover').classList.remove('active');
        document.getElementById('modal-victory').classList.remove('active');
      }

      document.getElementById('btn-save-rank').onclick = () => {
        const name = document.getElementById('rank-name-input').value.trim() || '베놈';
        alert(\`명예의 전당 등록 완료! [기사단] \${name} - \${score}점\`);
        document.getElementById('btn-save-rank').disabled = true;
        document.getElementById('btn-save-rank').innerText = '등록 완료';
      };

      function updateUI() {
        document.getElementById('hp-fill').style.width = \`\${(hp / maxHp) * 100}%\`;
        document.getElementById('hp-text').innerText = \`\${Math.floor(hp)}/\${maxHp}\`;
        document.getElementById('nitro-fill').style.width = \`\${(nitro / maxNitro) * 100}%\`;
        document.getElementById('nitro-text').innerText = \`\${Math.floor(nitro)}%\`;
        document.getElementById('xp-fill').style.width = \`\${(xp / xpNext) * 100}%\`;

        const mins = String(Math.floor(time / 60)).padStart(2, '0');
        const secs = String(Math.floor(time % 60)).padStart(2, '0');
        document.getElementById('time-text').innerText = \`\${mins}:\${secs}\`;
        document.getElementById('kills-text').innerText = kills;
        document.getElementById('score-text').innerText = \`\${score} Pts\`;
        document.getElementById('tier-text').innerText = TIERS[tier].name;
        document.getElementById('bosses-text').innerText = \`보스 처치: \${bossesDefeated}/2\`;
      }

      function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width, h = canvas.height;
        const rl = w * 0.12, rr = w * 0.88;
        const cx = w * 0.5;

        // Base Road
        ctx.fillStyle = '#090d16'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#1e293b'; ctx.fillRect(rl, 0, rr - rl, h);

        // Branching Fork Barrier
        const branchW = forkPhase * 40;
        if (branchW > 6) {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.moveTo(cx, 40); ctx.lineTo(cx - branchW, h); ctx.lineTo(cx + branchW, h);
          ctx.closePath(); ctx.fill();
        } else {
          ctx.fillStyle = '#475569';
          ctx.fillRect(cx - 4, 0, 8, h);
        }

        // Dashed lines
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3;
        ctx.setLineDash([24, 24]);
        ctx.lineDashOffset = -roadOffsetY;
        ctx.beginPath();
        ctx.moveTo((rl + cx - branchW) / 2, 0); ctx.lineTo((rl + cx - branchW) / 2, h);
        ctx.moveTo((cx + branchW + rr) / 2, 0); ctx.lineTo((cx + branchW + rr) / 2, h);
        ctx.stroke();
        ctx.setLineDash([]);

        // Drops
        for (const dr of drops) {
          ctx.fillStyle = '#10b981';
          ctx.beginPath(); ctx.arc(dr.x, dr.y, 6, 0, Math.PI * 2); ctx.fill();
        }

        // Bullets
        ctx.fillStyle = tier >= 3 ? '#38bdf8' : '#facc15';
        for (const b of bullets) {
          ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI * 2); ctx.fill();
        }

        // Enemies
        for (const e of enemies) {
          ctx.save();
          ctx.translate(e.x, e.y);
          ctx.rotate(e.angle);
          ctx.fillStyle = e.col;
          ctx.fillRect(-e.w/2, -e.h/2, e.w, e.h);
          if (e.isBoss) {
            ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2;
            ctx.strokeRect(-e.w/2, -e.h/2, e.w, e.h);
          }
          ctx.restore();
        }

        // Player
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle + Math.PI / 2);
        const tInfo = TIERS[tier];
        ctx.fillStyle = tInfo.color;
        ctx.fillRect(-tInfo.w/2, -tInfo.h/2, tInfo.w, tInfo.h);
        ctx.strokeStyle = tier >= 3 ? '#38bdf8' : '#facc15';
        ctx.lineWidth = 1.5; ctx.strokeRect(-tInfo.w/2, -tInfo.h/2, tInfo.w, tInfo.h);
        ctx.restore();
      }
    })();
  </script>
</body>
</html>`;
}
