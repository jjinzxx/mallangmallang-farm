"use strict";
/* =====================================================
   말랑말랑목장 — 도트 말 육성 웹게임 (단일 파일, localStorage 저장)
   ===================================================== */

/* ---------- 상수 ---------- */
const STAT_KEYS = ["spd","sta","agi"];
const STAT_NAME = { spd:"속도", sta:"지구력", agi:"순발력" };
const STAT_COLOR = { spd:"#e07a7a", sta:"#7cbf6b", agi:"#8ec9e8" };

// coats: 품종별 색상 변형 [이름, 몸, 갈기] — coats[0]이 기본색
const BREEDS = {
  pony:     { name:"포니",     special:false,
    coats:[{n:"카라멜",b:"#c9906b",m:"#7a4a2d"},{n:"초코",b:"#9c6b4a",m:"#5a3a26"},{n:"크림",b:"#e6c9a3",m:"#b3865e"}] },
  brown:    { name:"갈색말",   special:false,
    coats:[{n:"밤색",b:"#a5683f",m:"#5b3a21"},{n:"적갈",b:"#8f4f35",m:"#4d2a1c"},{n:"모카",b:"#7d5a3f",m:"#3f2d1e"}] },
  white:    { name:"백마",     special:false,
    coats:[{n:"순백",b:"#f2ede4",m:"#cbb9a0"},{n:"은빛",b:"#e3e6ea",m:"#9aa4b3"},{n:"아이보리",b:"#efe5c8",m:"#c9b98a"}] },
  black:    { name:"흑마",     special:false,
    coats:[{n:"먹색",b:"#5a5a68",m:"#33333d"},{n:"밤하늘",b:"#3f4459",m:"#252838"},{n:"잿빛",b:"#6e6e76",m:"#45454d"}] },
  spotted:  { name:"점박이",   spot:"#7a5a3d", special:false,
    coats:[{n:"우유",b:"#efe8da",m:"#8a7357"},{n:"미숫가루",b:"#e3d7c2",m:"#6e5a44"},{n:"바닐라콩",b:"#f5efe0",m:"#4a4a55"}] },
  palomino: { name:"팔로미노", special:false,
    coats:[{n:"금빛",b:"#e0b06a",m:"#f7ecd2"},{n:"살구",b:"#e8bf8e",m:"#fff3dd"},{n:"백금",b:"#d9c9a3",m:"#fffbe8"}] },
  zebra:    { name:"얼룩말",   stripe:true, special:false,
    coats:[{n:"클래식",b:"#eae6dc",m:"#3a3a42"},{n:"갈색줄",b:"#e8dcc8",m:"#6b4a2d"},{n:"딸기줄",b:"#f5e3e8",m:"#b3607d"}] },
  golden:   { name:"황금말",   special:true,
    coats:[{n:"황금",b:"#f5c542",m:"#fff1b8"},{n:"로즈골드",b:"#edaa7e",m:"#ffd9c4"},{n:"백금",b:"#e8e3c9",m:"#fffef0"}] },
  sakura:   { name:"벚꽃말",   spot:"#fceaf1", special:true,
    coats:[{n:"벚꽃",b:"#f7c6d9",m:"#ee8fb4"},{n:"진달래",b:"#ee9fc3",m:"#d16a9e"},{n:"흰벚꽃",b:"#fbe3ec",m:"#f0b4cc"}] },
  unicorn:  { name:"유니콘",   horn:true, special:true,
    coats:[{n:"라벤더",b:"#ffffff",m:"#c9a8e8"},{n:"민트",b:"#f4fffa",m:"#8fd9c1"},{n:"피치",b:"#fff6f0",m:"#f5b98f"}] },
  star:     { name:"별똥말",   spot:"#f4f0a8", special:true,
    coats:[{n:"남색",b:"#7b8bd9",m:"#a8e6ff"},{n:"자정",b:"#5a63a8",m:"#8fb3f0"},{n:"새벽",b:"#9aa8e8",m:"#ffd9f0"}] },
  pegasus:  { name:"페가수스", wing:true, special:true,
    coats:[{n:"하늘",b:"#f6f3ff",m:"#b8cdf5"},{n:"노을",b:"#fdf0ea",m:"#f5b8a8"},{n:"새벽별",b:"#eef4ff",m:"#c9b8f5"}] },
  // 전설 조합 — 특정 부모 조합의 교배로만 태어남 (돌연변이로는 안 나옴)
  sakurapega:{ name:"벚꽃 페가수스", wing:true, special:true, hybrid:true,
    coats:[{n:"벚꽃바람",b:"#fbd9e6",m:"#f291b8"},{n:"밤벚꽃",b:"#e8b3cc",m:"#b36a91"},{n:"함박눈",b:"#fdf0f5",m:"#f5c9dd"}] },
  alicorn:  { name:"알리콘",   horn:true, wing:true, special:true, hybrid:true,
    coats:[{n:"무지개",b:"#ffffff",m:"#d9a8e8"},{n:"오로라",b:"#f0faff",m:"#a8d9e8"},{n:"황혼",b:"#fff0f8",m:"#e8a8c9"}] },
  comet:    { name:"혜성말",   spot:"#fff7c9", special:true, hybrid:true,
    coats:[{n:"혜성",b:"#f0c94a",m:"#a8e6ff"},{n:"유성우",b:"#8f9be8",m:"#ffe9a8"},{n:"일식",b:"#55505e",m:"#f5c542"}] },
};
const NORMAL_BREEDS = Object.keys(BREEDS).filter(k=>!BREEDS[k].special);
const SPECIAL_BREEDS = Object.keys(BREEDS).filter(k=>BREEDS[k].special && !BREEDS[k].hybrid);
// 전설 조합 레시피 (부모 순서 무관)
const COMBOS = [
  { pair:["sakura","pegasus"],  child:"sakurapega" },
  { pair:["unicorn","pegasus"], child:"alicorn" },
  { pair:["golden","star"],     child:"comet" },
];
const COMBO_CHANCE = 5; // %

const NAME_A = ["초코","바닐라","구름","콩떡","모카","별이","달래","보리","우유","단추","사과","솜사탕","호두","앙꼬","젤리","라떼","복숭아","마루","두부","꿀떡"];
const NAME_B = ["","","","공주","왕자","","군","양","","돌이","순이",""];
const RIVAL_RANCH = ["푸른초원목장","도토리목장","무지개언덕","달빛농장","보들보들목장","꼬마마을목장","솜구름목장","반짝별목장"];

const CUPS = [
  { id:0, name:"🌱 새싹컵",   fee:20,  prize:[80,40,25],   npc:[3,9]   },
  { id:1, name:"☁️ 구름컵",   fee:60,  prize:[250,120,70], npc:[8,17]  },
  { id:2, name:"🌈 무지개컵", fee:150, prize:[700,300,160],npc:[14,25] },
];

const BUILDINGS = {
  stable: { name:"🏠 마구간",   desc:l=>`말 보유 한도 ${stableCap(l)}마리`,       cost:l=>Math.floor(200*Math.pow(1.7,l-1)) },
  farm:   { name:"🥕 당근밭",   desc:l=>`분당 당근 ${farmRate(l)}개 자동 생산 (보관 ${farmCap(l)}개)`, cost:l=>Math.floor(150*Math.pow(1.6,l-1)) },
  barn:   { name:"💕 산실",     desc:l=>`교배 시간 ${fmtSec(breedTime(l))} · 특이개체 확률 ${mutChance(l)}%`, cost:l=>Math.floor(250*Math.pow(1.7,l-1)) },
  gym:    { name:"💪 훈련장",   desc:l=>`훈련 쿨타임 ${trainCool(l)}초 · 성공률 +${(l-1)*4}%`, cost:l=>Math.floor(250*Math.pow(1.7,l-1)) },
};
const MAX_BLD = 5;
function stableCap(l){ return 4 + (l-1)*2; }
function farmRate(l){ return 3 + l; }
function farmCap(l){ return 40 + l*20; }
function breedTime(l){ return Math.max(40, 120 - (l-1)*20); }   // 초
function mutChance(l){ return 5 + (l-1)*3; }                     // %
function trainCool(l){ return Math.max(12, 30 - (l-1)*4); }      // 초

const STAT_CAP_NORMAL = 25, STAT_CAP_SPECIAL = 30;
const TRAIN_CARROT = 3, CARE_CARROT = 2, BREED_COST = 100, ADOPT_COST = 150;
const RACE_COOL = 60; // 초

/* ---------- 유틸 ---------- */
const $ = s => document.querySelector(s);
const rnd = (a,b) => a + Math.random()*(b-a);
const ri = (a,b) => Math.floor(rnd(a,b+1));
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const now = () => Date.now();
function fmtSec(s){ s=Math.max(0,Math.ceil(s)); return s>=60 ? `${Math.floor(s/60)}분 ${s%60}초` : `${s}초`; }
function toast(msg){
  const t = document.createElement("div"); t.className="toast"; t.textContent=msg;
  $("#toasts").appendChild(t); setTimeout(()=>t.remove(), 2700);
}
function esc(s){ const d=document.createElement("div"); d.textContent=s; return d.innerHTML; }

/* ---------- 상태 ---------- */
let state = null;
const SAVE_KEY = "malang_ranch_v1";

function newHorse(breed, stage, statRange){
  const cap = BREEDS[breed].special ? STAT_CAP_SPECIAL : STAT_CAP_NORMAL;
  const stats = {};
  STAT_KEYS.forEach(k => stats[k] = Math.min(cap, ri(statRange[0], statRange[1])));
  return {
    id: state ? state.nextId++ : 0,
    name: pick(NAME_A) + pick(NAME_B),
    breed, gender: Math.random()<0.5 ? "f" : "m",
    coat: Math.floor(Math.random()*BREEDS[breed].coats.length),
    stage, growth: stage==="adult" ? 100 : 0,
    stats, coolTrain: 0, coolRace: 0, wins:0, races:0,
  };
}

/* --- 도감 --- */
function dexKey(h){ return h.breed + ":" + (h.coat || 0); }
function markDex(h){ (state.dex = state.dex || {})[dexKey(h)] = 1; }
function dexCount(){
  const total = Object.keys(BREEDS).reduce((s,k)=>s+BREEDS[k].coats.length, 0);
  return `${Object.keys(state.dex || {}).length}/${total}`;
}

function defaultState(){
  const s = {
    coins: 300, carrots: 12, trophies: 0,
    buildings: { stable:1, farm:1, barn:1, gym:1 },
    horses: [], breeding: null, nextId: 1,
    carrotStamp: now(),
  };
  state = s;
  const a = newHorse(pick(NORMAL_BREEDS), "adult", [5,11]); a.gender="f";
  const b = newHorse(pick(NORMAL_BREEDS), "adult", [5,11]); b.gender="m";
  s.horses.push(a,b);
  return s;
}
function save(){ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); scheduleCloudSave(); }
function load(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if(raw){ state = JSON.parse(raw); return; }
  } catch(e){}
  defaultState(); save();
}

/* ---------- 도트 스프라이트 ----------
   문자 → 색: B몸 M갈기 D발굽 E눈 N코 S무늬 H뿔 .투명 */
const SPR_W = 20, SPR_H = 16;
const FRAME_STAND = [
  "....................",
  "..........M.MM.....",
  ".........MBBBBM....",
  ".........BBBBBB....",
  ".........BEBBBB....",
  ".........BBBBNN....",
  "..M......BBBB......",
  ".MM..BBBBBBBB......",
  ".MMBBBBSBBBBB......",
  "..MBBBBBBSBBB......",
  "...BBSBBBBBBB......",
  "...BBB....BBB......",
  "...BB......BB......",
  "...DD......DD......",
  "....................",
  "....................",
];
const FRAME_RUN = [
  "....................",
  "..........M.MM.....",
  ".........MBBBBM....",
  ".........BBBBBB....",
  ".........BEBBBB....",
  ".........BBBBNN....",
  "..M......BBBB......",
  ".MM..BBBBBBBB......",
  ".MMBBBBSBBBBB......",
  "..MBBBBBBSBBB......",
  "...BBSBBBBBBB......",
  "..BBB......BBB.....",
  ".BB..........BB....",
  ".DD..........DD....",
  "....................",
  "....................",
];
// 유니콘 뿔 (머리 위)
const HORN_PIXELS = [[13,0],[12,1]];
// 얼룩말 줄무늬 (몸통 세로줄)
const STRIPE_PIXELS = [[5,7],[5,8],[5,9],[5,10],[8,7],[8,8],[8,9],[8,10],[11,7],[11,8],[11,9],[11,10]];
// 페가수스 날개 (등 위 — 달릴 때 퍼덕임)
const WING_PIXELS = [[4,4],[5,4],[6,4],[3,5],[4,5],[5,5],[6,5],[7,5],[4,6],[5,6],[6,6],[7,6],[8,6]];

function coatOf(h){
  const b = BREEDS[h.breed];
  return b.coats[Math.min(h.coat || 0, b.coats.length - 1)];
}
function drawHorse(ctx, horse, x, y, scale, frame, flip){
  const b = BREEDS[horse.breed];
  const coat = coatOf(horse);
  const pal = {
    B: coat.b, M: coat.m, D:"#3d2c1a", E:"#2b2226",
    N:"#eaa0ac", S: b.spot || coat.b, H:"#ffd76e",
  };
  const grid = frame ? FRAME_RUN : FRAME_STAND;
  ctx.save();
  ctx.translate(x, y);
  if(flip){ ctx.scale(-1,1); ctx.translate(-SPR_W*scale,0); }
  for(let r=0; r<SPR_H; r++){
    for(let c=0; c<SPR_W; c++){
      const ch = grid[r][c];
      if(!ch || ch === "." || !pal[ch]) continue;
      ctx.fillStyle = pal[ch];
      ctx.fillRect(c*scale, r*scale, scale, scale);
    }
  }
  if(b.horn){
    ctx.fillStyle = pal.H;
    HORN_PIXELS.forEach(([c,r]) => ctx.fillRect(c*scale, r*scale, scale, scale));
  }
  if(b.stripe){
    ctx.fillStyle = pal.M;
    STRIPE_PIXELS.forEach(([c,r]) => ctx.fillRect(c*scale, r*scale, scale, scale));
  }
  if(b.wing){
    ctx.fillStyle = pal.M;
    const dy = frame ? -1 : 0; // 달릴 때 날갯짓
    WING_PIXELS.forEach(([c,r]) => ctx.fillRect(c*scale, (r+dy)*scale, scale, scale));
  }
  ctx.restore();
}

// 카드용 말 미니 캔버스 생성
function horseCanvas(horse, scale){
  const cv = document.createElement("canvas");
  cv.width = SPR_W*scale; cv.height = SPR_H*scale;
  drawHorse(cv.getContext("2d"), horse, 0, 0, scale, 0, false);
  return cv;
}

/* ---------- 공통 게임 로직 ---------- */
function findHorse(id){ return state.horses.find(h=>h.id===id); }
function statTotal(h){ return h.stats.spd + h.stats.sta + h.stats.agi; }
function statCap(h){ return BREEDS[h.breed].special ? STAT_CAP_SPECIAL : STAT_CAP_NORMAL; }
function isAdult(h){ return h.stage === "adult"; }
function coolLeft(ts){ return Math.max(0, (ts - now())/1000); }

function spendCoins(n){ if(state.coins < n) return false; state.coins -= n; return true; }
function spendCarrots(n){ if(state.carrots < n) return false; state.carrots -= n; return true; }

// 당근밭 자동 생산 (타임스탬프 기반)
function tickCarrots(){
  const lv = state.buildings.farm;
  const msPer = 60000 / farmRate(lv);
  const elapsed = now() - state.carrotStamp;
  const gained = Math.floor(elapsed / msPer);
  if(gained > 0){
    state.carrotStamp += gained * msPer;
    // 자동생산은 보관 한도까지만 (이미 한도를 넘겼다면 그대로 유지)
    if(state.carrots < farmCap(lv)) state.carrots = Math.min(farmCap(lv), state.carrots + gained);
    save();
  }
}

/* ---------- 헤더/탭 ---------- */
function renderHeader(){
  $("#rCoins").textContent = state.coins;
  $("#rCarrots").textContent = state.carrots;
  $("#rTrophies").textContent = state.trophies;
}
let curTab = "ranch";
document.querySelectorAll(".tab").forEach(el=>{
  el.onclick = ()=>{
    if(raceRunning){ toast("경주가 끝난 뒤에 이동할 수 있어요!"); return; }
    curTab = el.dataset.tab;
    document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on", t===el));
    renderView();
  };
});

function renderView(){
  stopRanchAnim();
  const v = $("#view");
  if(curTab==="ranch") renderRanch(v);
  else if(curTab==="train") renderTrain(v);
  else if(curTab==="breed") renderBreed(v);
  else if(curTab==="race") renderRace(v);
  renderHeader();
}

/* ---------- 모달 ---------- */
function showModal(html){
  $("#modal").innerHTML = html;
  $("#modalBg").style.display = "flex";
}
function closeModal(){ $("#modalBg").style.display = "none"; }
$("#modalBg").addEventListener("click", e=>{ if(e.target.id==="modalBg") closeModal(); });

/* ---------- 말 카드 HTML ---------- */
function horseCardHTML(h, extra=""){
  const b = BREEDS[h.breed];
  const g = h.gender==="f" ? `<span class="gender-f">♀</span>` : `<span class="gender-m">♂</span>`;
  return `
    <div class="hcard ${extra}" data-hid="${h.id}">
      ${b.special ? `<div class="special-tag">✦특이</div>` : ""}
      ${!isAdult(h) ? `<div class="baby-tag">아기</div>` : ""}
      <div class="spr" data-spr="${h.id}"></div>
      <div class="nm">${esc(h.name)} ${g}</div>
      <div class="bd">${b.name}${isAdult(h) ? ` · 합 ${statTotal(h)}` : ` · 성장 ${h.growth}%`}</div>
    </div>`;
}
function mountSprites(root, scale=3){
  root.querySelectorAll("[data-spr]").forEach(el=>{
    const h = findHorse(+el.dataset.spr);
    if(h) el.appendChild(horseCanvas(h, isAdult(h) ? scale : scale-1));
  });
}

/* =====================================================
   목장 탭
   ===================================================== */
let ranchAnimId = null, ranchHorses = [];
function stopRanchAnim(){ if(ranchAnimId){ cancelAnimationFrame(ranchAnimId); ranchAnimId=null; } }

function renderRanch(v){
  v.innerHTML = `
    <div id="ranchCanvasWrap"><canvas id="ranchCanvas" width="800" height="260"></canvas></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
      <div style="font-size:14px;">🐴 보유한 말: ${state.horses.length} / ${stableCap(state.buildings.stable)}</div>
      <button class="px small blue" id="btnAdopt">말 입양 (🪙${ADOPT_COST})</button>
    </div>
    <h3 class="sec">건물</h3>
    <div class="bld-grid">
      ${Object.entries(BUILDINGS).map(([k,b])=>{
        const lv = state.buildings[k];
        const maxed = lv >= MAX_BLD;
        return `<div class="bld">
          <div class="ttl">${b.name} <span style="color:#c2607e">Lv.${lv}</span></div>
          <div class="desc">${b.desc(lv)}${maxed?"":`<br>▶ 다음: ${b.desc(lv+1)}`}</div>
          <button class="px small green" data-up="${k}" ${maxed||state.coins<b.cost(lv)?"disabled":""}>
            ${maxed ? "최대 레벨" : `업그레이드 🪙${b.cost(lv)}`}
          </button>
        </div>`;
      }).join("")}
    </div>
    <div class="hint">당근은 당근밭에서 시간이 지나면 자동으로 쌓여요. 훈련과 돌보기에 쓰인답니다.</div>`;

  v.querySelectorAll("[data-up]").forEach(btn=>{
    btn.onclick = ()=>{
      const k = btn.dataset.up, lv = state.buildings[k];
      const cost = BUILDINGS[k].cost(lv);
      if(!spendCoins(cost)){ toast("코인이 부족해요!"); return; }
      state.buildings[k]++;
      if(k==="farm") state.carrotStamp = now();
      save(); toast(`${BUILDINGS[k].name} Lv.${lv+1} 완성!`);
      renderView();
    };
  });
  $("#btnAdopt").onclick = ()=>{
    if(state.horses.length >= stableCap(state.buildings.stable)){ toast("마구간이 꽉 찼어요!"); return; }
    if(!spendCoins(ADOPT_COST)){ toast("코인이 부족해요!"); return; }
    const h = newHorse(pick(NORMAL_BREEDS), "adult", [4,10]);
    state.horses.push(h); save();
    toast(`${h.name}(${BREEDS[h.breed].name})가 목장에 왔어요!`);
    renderView();
  };

  startRanchAnim();
}

function startRanchAnim(){
  const cv = $("#ranchCanvas");
  if(!cv) return;
  const ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  ranchHorses = state.horses.map(h=>({
    h, x: rnd(30, W-90), y: rnd(80, H-60),
    dir: Math.random()<0.5?-1:1, vx: rnd(0.15,0.45),
    pause: rnd(0,120), frame:0, ft:0,
  }));
  let last = performance.now();
  function loop(t){
    const dt = Math.min(50, t-last); last = t;
    ctx.clearRect(0,0,W,H);
    // 배경: 하늘/잔디/울타리
    ctx.fillStyle="#bfe6f5"; ctx.fillRect(0,0,W,64);
    ctx.fillStyle="#fff";
    [[60,20],[200,34],[420,16],[640,30]].forEach(([cx,cy])=>{
      ctx.fillRect(cx,cy,36,10); ctx.fillRect(cx+8,cy-8,20,8); ctx.fillRect(cx+6,cy+10,24,6);
    });
    ctx.fillStyle="#a8d69a"; ctx.fillRect(0,64,W,H-64);
    ctx.fillStyle="#94c986";
    for(let i=0;i<14;i++){ ctx.fillRect((i*67)%W, 80+(i*53)%(H-110), 8, 4); }
    ctx.fillStyle="#8a6d4b";
    for(let x=6;x<W;x+=46){ ctx.fillRect(x,52,6,26); }
    ctx.fillRect(0,58,W,5); ctx.fillRect(0,70,W,5);

    ranchHorses.forEach(o=>{
      if(o.pause>0){ o.pause -= dt/16; o.frame=0; }
      else {
        o.x += o.vx * o.dir * dt/8;
        o.ft += dt;
        if(o.ft>160){ o.frame ^= 1; o.ft=0; }
        if(Math.random()<0.002) o.pause = rnd(60,220);
        if(Math.random()<0.001) o.dir *= -1;
        if(o.x < 8){ o.x=8; o.dir=1; }
        if(o.x > W-70){ o.x=W-70; o.dir=-1; }
      }
      const sc = isAdult(o.h) ? 3 : 2;
      drawHorse(ctx, o.h, o.x, o.y - SPR_H*sc, sc, o.frame, o.dir<0);
      if(BREEDS[o.h.breed].special && Math.floor(t/300)%2===0){
        ctx.fillStyle="#fff8b0";
        ctx.fillRect(o.x-4, o.y-SPR_H*sc-4, 3,3); ctx.fillRect(o.x+SPR_W*sc, o.y-20, 3,3);
      }
      ctx.fillStyle="#4a3826"; ctx.font="11px DungGeunMo,monospace"; ctx.textAlign="center";
      ctx.fillText(o.h.name, o.x + SPR_W*sc/2, o.y+12);
    });
    ranchAnimId = requestAnimationFrame(loop);
  }
  ranchAnimId = requestAnimationFrame(loop);
}

/* =====================================================
   훈련 탭
   ===================================================== */
let trainSel = null;
function renderTrain(v){
  if(trainSel!==null && !findHorse(trainSel)) trainSel = null;
  if(trainSel===null && state.horses.length) trainSel = state.horses[0].id;
  const h = findHorse(trainSel);
  v.innerHTML = `
    <h3 class="sec">말 선택</h3>
    <div class="horse-grid" id="tGrid">
      ${state.horses.map(x=>horseCardHTML(x, x.id===trainSel?"sel":"")).join("")}
    </div>
    <div id="tDetail" style="margin-top:14px;"></div>`;
  mountSprites($("#tGrid"));
  v.querySelectorAll(".hcard").forEach(c=>{
    c.onclick = ()=>{ trainSel = +c.dataset.hid; renderView(); };
  });
  if(h) renderTrainDetail($("#tDetail"), h);
}

function renderTrainDetail(el, h){
  const cool = coolLeft(h.coolTrain);
  const gymLv = state.buildings.gym;
  const b = BREEDS[h.breed];
  if(!isAdult(h)){
    el.innerHTML = `
      <h3 class="sec">${esc(h.name)} 돌보기 (아기)</h3>
      <div class="st-row"><div class="lb">성장도</div>
        <div class="statbar"><div style="width:${h.growth}%;background:var(--pink)"></div></div>
        <div class="vl">${h.growth}%</div></div>
      <div class="hint">아기 말은 돌봐주면 무럭무럭 자라요. 성장 100%가 되면 성체가 되어 훈련과 경주에 나갈 수 있어요.</div>
      <div style="margin-top:10px;">
        <button class="px pink" id="btnCare" ${cool>0||state.carrots<CARE_CARROT?"disabled":""}>
          🥕${CARE_CARROT} 돌봐주기
        </button>
        ${cool>0?`<span class="cool"> 휴식 중… ${fmtSec(cool)}</span>`:""}
      </div>`;
    const btn = $("#btnCare");
    if(btn) btn.onclick = ()=>{
      if(!spendCarrots(CARE_CARROT)){ toast("당근이 부족해요!"); return; }
      h.growth = Math.min(100, h.growth + ri(20,34));
      h.coolTrain = now() + 15000;
      if(h.growth >= 100){
        h.stage = "adult";
        save();
        showModal(`<h2>🎉 어른이 되었어요!</h2>
          <div class="spr" data-spr="${h.id}" style="display:flex;justify-content:center;margin:8px 0;"></div>
          <p>${esc(h.name)}(${b.name})가 늠름한 성체가 되었어요.<br>이제 훈련과 경주에 나갈 수 있어요!</p>
          <button class="px pink" onclick="closeModal();renderView()" style="margin-top:12px;">좋아!</button>`);
        mountSprites($("#modal"), 4);
      } else {
        save(); toast(`${h.name}가 기분 좋아해요! 성장 ${h.growth}%`);
        renderView();
      }
    };
    return;
  }
  const cap = statCap(h);
  el.innerHTML = `
    <h3 class="sec">${esc(h.name)} 훈련 ${b.special?'<span style="color:#c2607e;font-size:12px;">✦특이개체 (상한 +5)</span>':""}</h3>
    ${STAT_KEYS.map(k=>`
      <div class="st-row">
        <div class="lb">${STAT_NAME[k]}</div>
        <div class="statbar"><div style="width:${h.stats[k]/cap*100}%;background:${STAT_COLOR[k]}"></div></div>
        <div class="vl">${h.stats[k]}/${cap}</div>
        <button class="px small" data-tr="${k}" ${cool>0||state.carrots<TRAIN_CARROT||h.stats[k]>=cap?"disabled":""}>🥕${TRAIN_CARROT} 훈련</button>
      </div>`).join("")}
    <div class="hint">
      전적: ${h.races}전 ${h.wins}승 · 훈련 성공률은 스탯이 높을수록 낮아져요 (훈련장 Lv.${gymLv} 보너스 +${(gymLv-1)*4}%)
      ${cool>0?`<br><span class="cool">휴식 중… ${fmtSec(cool)}</span>`:""}
    </div>
    <div style="margin-top:10px;text-align:right;">
      <button class="px small" id="btnRelease" style="background:#cfc4ab;">떠나보내기 (+🪙40)</button>
    </div>`;
  el.querySelectorAll("[data-tr]").forEach(btn=>{
    btn.onclick = ()=>{
      const k = btn.dataset.tr;
      if(!spendCarrots(TRAIN_CARROT)){ toast("당근이 부족해요!"); return; }
      h.coolTrain = now() + trainCool(gymLv)*1000;
      const rate = Math.max(0.35, 0.92 - h.stats[k]*0.022 + (gymLv-1)*0.04);
      if(Math.random() < rate){
        h.stats[k] = Math.min(cap, h.stats[k]+1);
        toast(`✨ ${STAT_NAME[k]} 훈련 성공! ${h.stats[k]-1} → ${h.stats[k]}`);
      } else {
        toast(`💦 ${h.name}가 딴청을 부렸어요… 훈련 실패`);
      }
      save(); renderView();
    };
  });
  $("#btnRelease").onclick = ()=>{
    if(state.horses.length <= 1){ toast("마지막 말은 떠나보낼 수 없어요!"); return; }
    showModal(`<h2>정말 떠나보낼까요?</h2>
      <p>${esc(h.name)}가 넓은 초원으로 떠나요.<br>감사의 선물로 🪙40을 남겨줘요.</p>
      <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;">
        <button class="px" id="mYes">보내주기</button>
        <button class="px pink" onclick="closeModal()">안 보낼래</button>
      </div>`);
    $("#mYes").onclick = ()=>{
      state.horses = state.horses.filter(x=>x.id!==h.id);
      state.coins += 40; trainSel = null;
      save(); closeModal(); toast(`${h.name}가 손을… 발굽을 흔들며 떠났어요.`);
      renderView();
    };
  };
}

/* =====================================================
   교배 탭
   ===================================================== */
let breedSelF = null, breedSelM = null;
function renderBreed(v){
  const br = state.breeding;
  if(br){
    const left = coolLeft(br.doneAt);
    const full = state.horses.length >= stableCap(state.buildings.stable);
    v.innerHTML = `
      <h3 class="sec">아기를 기다리는 중…</h3>
      <div class="pair-box">
        <div class="pslot filled"><div style="font-size:14px;">${esc(br.motherName)} <span class="gender-f">♀</span></div><div class="bd" style="font-size:12px;color:#8a7357;">${BREEDS[br.breedA].name}</div></div>
        <div class="heart">💗</div>
        <div class="pslot filled"><div style="font-size:14px;">${esc(br.fatherName)} <span class="gender-m">♂</span></div><div class="bd" style="font-size:12px;color:#8a7357;">${BREEDS[br.breedB].name}</div></div>
      </div>
      ${left>0
        ? `<div style="text-align:center;font-size:16px;">🥚 두근두근… <b>${fmtSec(left)}</b> 후에 태어나요</div>`
        : `<div style="text-align:center;">
             <div style="font-size:16px;margin-bottom:8px;">🐣 태어날 준비가 됐어요!</div>
             <button class="px pink" id="btnBirth" ${full?"disabled":""}>아기 맞이하기</button>
             ${full?`<div class="hint">마구간이 꽉 찼어요! 자리를 만들어 주세요.</div>`:""}
           </div>`}`;
    const btn = $("#btnBirth");
    if(btn) btn.onclick = doBirth;
    return;
  }

  if(breedSelF!==null && !findHorse(breedSelF)) breedSelF=null;
  if(breedSelM!==null && !findHorse(breedSelM)) breedSelM=null;
  const adults = state.horses.filter(isAdult);
  const fH = findHorse(breedSelF), mH = findHorse(breedSelM);
  const full = state.horses.length >= stableCap(state.buildings.stable);
  const ready = fH && mH && !full && state.coins >= BREED_COST;
  v.innerHTML = `
    <h3 class="sec">짝꿍 고르기</h3>
    <div class="pair-box">
      <div class="pslot ${fH?"filled":""}">${fH?`<div data-spr="${fH.id}"></div><div style="font-size:13px;">${esc(fH.name)} <span class="gender-f">♀</span></div>`:`<div style="padding-top:30px;color:#8a7357;">엄마 말 <span class="gender-f">♀</span></div>`}</div>
      <div class="heart">💗</div>
      <div class="pslot ${mH?"filled":""}">${mH?`<div data-spr="${mH.id}"></div><div style="font-size:13px;">${esc(mH.name)} <span class="gender-m">♂</span></div>`:`<div style="padding-top:30px;color:#8a7357;">아빠 말 <span class="gender-m">♂</span></div>`}</div>
    </div>
    <div style="text-align:center;margin-bottom:12px;">
      <button class="px pink" id="btnBreed" ${ready?"":"disabled"}>교배 시작 (🪙${BREED_COST} · ${fmtSec(breedTime(state.buildings.barn))})</button>
      <div class="hint">특이개체 확률 ${mutChance(state.buildings.barn)}% — 산실을 업그레이드하면 올라가요${full?" · ⚠️ 마구간이 꽉 찼어요":""}</div>
    </div>
    <h3 class="sec">성체 목록</h3>
    <div class="horse-grid" id="bGrid">
      ${adults.map(x=>{
        const sel = (x.gender==="f" && x.id===breedSelF) || (x.gender==="m" && x.id===breedSelM);
        return horseCardHTML(x, sel?"sel":"");
      }).join("") || `<div class="hint">교배할 수 있는 성체가 없어요. 아기를 먼저 키워보세요!</div>`}
    </div>`;
  mountSprites(v);
  v.querySelectorAll("#bGrid .hcard").forEach(c=>{
    c.onclick = ()=>{
      const h = findHorse(+c.dataset.hid);
      if(h.gender==="f") breedSelF = breedSelF===h.id ? null : h.id;
      else breedSelM = breedSelM===h.id ? null : h.id;
      renderView();
    };
  });
  const bb = $("#btnBreed");
  if(bb) bb.onclick = ()=>{
    if(!spendCoins(BREED_COST)){ toast("코인이 부족해요!"); return; }
    state.breeding = {
      motherId:fH.id, fatherId:mH.id,
      motherName:fH.name, fatherName:mH.name,
      breedA:fH.breed, breedB:mH.breed,
      statsA:{...fH.stats}, statsB:{...mH.stats},
      doneAt: now() + breedTime(state.buildings.barn)*1000,
    };
    breedSelF = breedSelM = null;
    save(); toast("두 마리가 사이좋게 지내기 시작했어요!");
    renderView();
  };
}

function doBirth(){
  const br = state.breeding;
  const mut = Math.random()*100 < mutChance(state.buildings.barn);
  const breed = mut ? pick(SPECIAL_BREEDS) : pick([br.breedA, br.breedB]);
  const baby = newHorse(breed, "baby", [1,1]);
  STAT_KEYS.forEach(k=>{
    const avg = (br.statsA[k] + br.statsB[k]) / 2;
    let val = Math.round(avg + rnd(-2.5, 3.5)) + (mut ? 3 : 0);
    baby.stats[k] = Math.max(1, Math.min(statCap(baby), val));
  });
  state.horses.push(baby);
  state.breeding = null;
  save();
  const b = BREEDS[breed];
  showModal(`<h2>${mut ? "🌟 특이개체 탄생!!" : "🐣 아기 탄생!"}</h2>
    <div class="spr" data-spr="${baby.id}" style="display:flex;justify-content:center;margin:8px 0;"></div>
    <p><b>${esc(baby.name)}</b> (${b.name} ${baby.gender==="f"?"♀":"♂"})<br>
    ${mut ? "무지개빛 기운을 품고 태어났어요!<br>스탯 상한이 높고 재능도 뛰어나요." : "건강한 아기 말이 태어났어요!"}<br>
    훈련 탭에서 돌봐주면 성체로 자라요.</p>
    <button class="px pink" onclick="closeModal();renderView()" style="margin-top:12px;">환영해!</button>`);
  mountSprites($("#modal"), 4);
  renderHeader();
}

/* =====================================================
   경주 탭
   ===================================================== */
let raceRunning = false, raceSel = null, raceMode = null;

function renderRace(v){
  if(raceSel!==null && !findHorse(raceSel)) raceSel = null;
  const adults = state.horses.filter(isAdult);
  const h = findHorse(raceSel);
  v.innerHTML = `
    <h3 class="sec">출전마 선택</h3>
    <div class="horse-grid" id="rGrid">
      ${adults.map(x=>{
        const cd = coolLeft(x.coolRace);
        return horseCardHTML(x, (x.id===raceSel?"sel ":"") + (cd>0?"dis":""));
      }).join("") || `<div class="hint">출전할 수 있는 성체가 없어요.</div>`}
    </div>
    <h3 class="sec" style="margin-top:14px;">대회 (PvE)</h3>
    ${CUPS.map(c=>`
      <div class="cup">
        <div class="info"><div class="ttl">${c.name}</div>
        <div class="desc">참가비 🪙${c.fee} · 우승 🪙${c.prize[0]} (2등 ${c.prize[1]} / 3등 ${c.prize[2]})</div></div>
        <button class="px green" data-cup="${c.id}" ${!h||coolLeft(h.coolRace)>0||state.coins<c.fee?"disabled":""}>출전!</button>
      </div>`).join("")}
    <h3 class="sec" style="margin-top:14px;">이웃 목장 대전 (PvP)</h3>
    <div class="cup">
      <div class="info"><div class="ttl">🏆 목장 대항전</div>
      <div class="desc">실제 이웃 목장주들의 대표 말과 대결 · 승리 시 🏆1 + 🪙100 (패배 🪙20)</div></div>
      <button class="px blue" id="btnPvp" ${!h||coolLeft(h.coolRace)>0?"disabled":""}>도전!</button>
    </div>
    <div class="hint">경주는 운이 크게 작용해요. 스탯이 낮아도 그날 컨디션이 좋으면 이길 수 있답니다!</div>
    <div id="raceWrap">
      <h3 class="sec" style="margin-top:14px;" id="raceTitle"></h3>
      <canvas id="raceCanvas" width="800" height="330"></canvas>
      <div id="raceRank"></div>
    </div>`;
  mountSprites($("#rGrid"));
  v.querySelectorAll("#rGrid .hcard").forEach(c=>{
    c.onclick = ()=>{
      const x = findHorse(+c.dataset.hid);
      if(coolLeft(x.coolRace)>0){ toast(`${x.name}는 쉬는 중이에요 (${fmtSec(coolLeft(x.coolRace))})`); return; }
      raceSel = x.id; renderView();
    };
  });
  v.querySelectorAll("[data-cup]").forEach(btn=>{
    btn.onclick = ()=> startCupRace(CUPS[+btn.dataset.cup]);
  });
  const pv = $("#btnPvp");
  if(pv) pv.onclick = startPvpRace;
}

function makeNpc(name, breed, range){
  return { name, breed, stats:{ spd:ri(range[0],range[1]), sta:ri(range[0],range[1]), agi:ri(range[0],range[1]) } };
}

function startCupRace(cup){
  const h = findHorse(raceSel);
  if(!h || !spendCoins(cup.fee)){ toast("코인이 부족해요!"); return; }
  const entrants = [{ name:h.name, breed:h.breed, stats:h.stats, mine:true }];
  const used = new Set([h.name]);
  while(entrants.length < 6){
    const nm = pick(NAME_A)+pick(NAME_B);
    if(used.has(nm)) continue; used.add(nm);
    entrants.push(makeNpc(nm, pick(NORMAL_BREEDS), cup.npc));
  }
  runRace(entrants, cup.name, ranks=>{
    const myRank = ranks.findIndex(e=>e.mine) + 1;
    let reward = 0;
    if(myRank<=3) reward = cup.prize[myRank-1];
    state.coins += reward;
    h.races++; if(myRank===1) h.wins++;
    h.coolRace = now() + RACE_COOL*1000;
    save();
    showRaceResult(ranks, myRank, reward
      ? `${myRank}등! 상금 🪙${reward}을 받았어요!`
      : `${myRank}등… 다음엔 꼭 입상해요!`);
  });
}

function botEntrant(used, myTotal){
  let nm; do { nm = pick(NAME_A)+pick(NAME_B); } while(used.has(nm)); used.add(nm);
  const t = Math.max(3, Math.round(myTotal * rnd(0.75, 1.25)));
  const base = Math.max(1, Math.round(t/3));
  const st = { spd:base, sta:base, agi:base };
  st[pick(STAT_KEYS)] += t - base*3;
  return { name:nm, breed:pick(NORMAL_BREEDS), stats:st, rival:true };
}
// 다른 유저의 대표 말 데이터 → 출전마 (외부 데이터이므로 검증·클램프)
function sanitizeRivalHorse(p){
  try {
    const bh = p.best_horse;
    const nick = String(p.nickname || "이웃").slice(0, 12);
    const breed = BREEDS[bh.breed] ? bh.breed : pick(NORMAL_BREEDS);
    const st = {};
    STAT_KEYS.forEach(k=>{
      st[k] = Math.max(1, Math.min(40, Math.round(Number(bh.stats[k]) || 5)));
    });
    return { name: nick, breed, stats: st, rival: true };
  } catch(e){ return null; }
}
async function startPvpRace(){
  const h = findHorse(raceSel);
  if(!h) return;
  const myTotal = statTotal(h);
  const entrants = [{ name:h.name, breed:h.breed, stats:h.stats, mine:true }];
  const used = new Set([h.name]);
  let realCount = 0;
  if(me && sb){
    try {
      const { data, error } = await sb.from("mmr_profiles")
        .select("nickname,best_horse").neq("id", me.id).not("best_horse","is",null)
        .order("updated_at", { ascending:false }).limit(30);
      warnSetup(error);
      const pool = (data || []).sort(()=>Math.random()-0.5).slice(0, 5);
      for(const p of pool){
        const e = sanitizeRivalHorse(p);
        if(e){ entrants.push(e); realCount++; }
      }
    } catch(e){ /* 오프라인이면 봇으로 대체 */ }
  }
  while(entrants.length < 6) entrants.push(botEntrant(used, myTotal));
  const title = realCount > 0
    ? `🏆 목장 대항전 — 이웃 목장주 ${realCount}명 참전!`
    : `🏆 목장 대항전 vs ${pick(RIVAL_RANCH)}`;
  runRace(entrants, title, ranks=>{
    const myRank = ranks.findIndex(e=>e.mine) + 1;
    const win = myRank === 1;
    state.coins += win ? 100 : 20;
    if(win) state.trophies++;
    h.races++; if(win) h.wins++;
    h.coolRace = now() + RACE_COOL*1000;
    save();
    if(me) pushCloudNow();
    showRaceResult(ranks, myRank, win
      ? `이웃 목장들을 꺾었어요! 🏆+1, 🪙100 획득!`
      : `${myRank}등… 이웃들이 강했어요. 위로금 🪙20`);
  });
}

function showRaceResult(ranks, myRank, msg){
  showModal(`<h2>${myRank===1?"🥇 우승!":myRank===2?"🥈 2등!":myRank===3?"🥉 3등!":"🏁 완주!"}</h2>
    <p style="margin-bottom:10px;">${esc(msg)}</p>
    <div style="text-align:left;font-size:13px;background:var(--panel2);border:2px solid var(--line);border-radius:8px;padding:8px 12px;">
      ${ranks.map((e,i)=>`<div style="${e.mine?"color:#c2607e;font-weight:bold;":""}">${i+1}등 ${esc(e.name)}${e.mine?" (내 말)":""}</div>`).join("")}
    </div>
    <button class="px pink" onclick="closeModal();renderView()" style="margin-top:12px;">확인</button>`);
}

const RACE_DIST = 1000;
function runRace(entrants, title, onDone){
  raceRunning = true;
  $("#raceWrap").style.display = "block";
  $("#raceTitle").textContent = title;
  const cv = $("#raceCanvas"), ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  const laneH = (H-40) / entrants.length;
  cv.scrollIntoView({behavior:"smooth", block:"center"});

  // 경주 파라미터: 그날의 폼(운)이 스탯보다 크게 작용
  const runners = entrants.map((e,i)=>({
    ...e, lane:i, prog:0, done:false, finT:0,
    form: rnd(0.72, 1.30),                       // 오늘의 컨디션 (지배적 운)
    statF: 1 + statTotal({stats:e.stats})*0.006, // 스탯 보정 (약하게)
    spurt: 0, frame:0, ft:0,
  }));
  let elapsed = 0, finished = 0, countdown = 2000;
  let last = performance.now(), animId = null;

  function step(t){
    const dt = Math.min(50, t-last); last = t;
    if(countdown > 0){ countdown -= dt; }
    else {
      elapsed += dt;
      runners.forEach(r=>{
        if(r.done) return;
        // 스퍼트: 순발력 비례 (초당 확률로 환산)
        if(r.spurt > 0) r.spurt -= dt;
        else if(Math.random() < (0.18 + r.stats.agi*0.012)*dt/1000) r.spurt = 700;
        let sp = 1.45 * r.statF * r.form * (0.9 + Math.random()*0.25);
        if(r.spurt > 0) sp *= 1.4;
        if(r.prog > RACE_DIST*0.68) sp *= Math.min(1, 0.83 + r.stats.sta*0.009); // 지구력: 막판 유지력
        r.prog += sp * dt/16;
        r.ft += dt;
        if(r.ft > 110){ r.frame ^= 1; r.ft = 0; }
        if(r.prog >= RACE_DIST){ r.prog = RACE_DIST; r.done = true; r.finT = elapsed + (finished++)*0.001; }
      });
    }
    draw();
    const live = [...runners].sort((a,b)=> b.prog - a.prog || a.finT - b.finT);
    $("#raceRank").innerHTML = "현재 순위: " + live.map((r,i)=>`${i+1}.${r.mine?`<b style="color:#c2607e">${esc(r.name)}</b>`:esc(r.name)}`).join(" · ");

    if(runners.every(r=>r.done)){
      cancelAnimationFrame(animId);
      const ranks = [...runners].sort((a,b)=>a.finT-b.finT);
      setTimeout(()=>{ raceRunning = false; onDone(ranks); }, 600);
      return;
    }
    animId = requestAnimationFrame(step);
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="#9fd18f"; ctx.fillRect(0,0,W,H);
    // 레인
    for(let i=0;i<entrants.length;i++){
      ctx.fillStyle = i%2 ? "#a9d899" : "#9fd18f";
      ctx.fillRect(0, 20+i*laneH, W, laneH);
      ctx.fillStyle="rgba(255,255,255,.5)";
      ctx.fillRect(0, 20+i*laneH, W, 2);
    }
    // 결승선 (체크무늬)
    const fx = W-46;
    for(let y=0; y<H; y+=10){
      ctx.fillStyle = (y/10)%2 ? "#fff" : "#4a3826";
      ctx.fillRect(fx, y, 8, 10);
    }
    runners.forEach(r=>{
      const x = 10 + (r.prog/RACE_DIST) * (fx-10-SPR_W*3);
      const y = 20 + r.lane*laneH + laneH - 8;
      drawHorse(ctx, r, x, y-SPR_H*3, 3, r.done?0:r.frame, false);
      ctx.fillStyle = r.mine ? "#c2607e" : "#4a3826";
      ctx.font="11px DungGeunMo,monospace"; ctx.textAlign="left";
      ctx.fillText((r.mine?"▶":"")+r.name, x+2, y-SPR_H*3+2);
      if(r.spurt>0 && !r.done){
        ctx.fillStyle="#ffec8a";
        ctx.fillRect(x-8, y-24, 4,4); ctx.fillRect(x-14, y-16, 3,3);
      }
    });
    if(countdown > 0){
      ctx.fillStyle="rgba(60,40,20,.45)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#fff"; ctx.font="42px DungGeunMo,monospace"; ctx.textAlign="center";
      ctx.fillText(countdown>1300?"제자리에…":countdown>600?"준비…":"땅!", W/2, H/2);
    }
  }
  animId = requestAnimationFrame(step);
}

/* ---------- 주기 갱신 (타이머 UI) ---------- */
setInterval(()=>{
  tickCarrots();
  renderHeader();
  if(raceRunning) return;
  // 카운트다운이 있는 화면은 1초마다 다시 그림
  if(curTab==="breed" && state.breeding) renderView();
  else if(curTab==="train"){
    const h = findHorse(trainSel);
    if(h && coolLeft(h.coolTrain)>0) renderView();
  }
  else if(curTab==="race"){
    const anyCool = state.horses.some(x=>coolLeft(x.coolRace)>0 && coolLeft(x.coolRace)<RACE_COOL);
    if(anyCool && !$("#raceWrap")?.style.display.includes("block")) renderView();
  }
}, 1000);

/* =====================================================
   온라인: 로그인 · 클라우드 저장 · 채팅 (Supabase)
   ===================================================== */
const SB_URL = "https://lfvoyvnwvziqedurbhex.supabase.co";
const SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmdm95dm53dnppcWVkdXJiaGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjY3ODcsImV4cCI6MjA5ODgwMjc4N30.jAik4_PFr8Mts3QnV8ubk7nWLDBVaT_aIlG0QDN3pDE";
let sb = null, me = null, myNickname = null;
let cloudTimer = null, chatChannel = null, setupWarned = false;

function warnSetup(error){
  if(error && (error.code === "PGRST205" || error.code === "42P01") && !setupWarned){
    setupWarned = true;
    toast("⚠️ Supabase에 테이블이 없어요 — supabase_setup.sql을 SQL Editor에서 실행해주세요");
  }
}

/* --- 클라우드 저장 --- */
function bestHorseSnapshot(){
  const adults = state.horses.filter(isAdult);
  if(!adults.length) return null;
  const b = adults.reduce((a,c)=> statTotal(c) > statTotal(a) ? c : a);
  return { name: b.name, breed: b.breed, stats: { ...b.stats } };
}
function scheduleCloudSave(){
  if(!me || !sb) return;
  clearTimeout(cloudTimer);
  cloudTimer = setTimeout(()=>{ cloudTimer = null; pushCloudNow(); }, 3000);
}
async function pushCloudNow(){
  if(!me || !sb) return;
  clearTimeout(cloudTimer); cloudTimer = null;
  const ts = new Date().toISOString();
  const { error: e1 } = await sb.from("mmr_saves")
    .upsert({ user_id: me.id, data: state, updated_at: ts });
  warnSetup(e1);
  const { error: e2 } = await sb.from("mmr_profiles")
    .upsert({ id: me.id, nickname: myNickname || "목장주",
              trophies: state.trophies, best_horse: bestHorseSnapshot(), updated_at: ts });
  warnSetup(e2);
}
window.addEventListener("beforeunload", ()=>{ if(cloudTimer) pushCloudNow(); });

/* --- 인증 --- */
function authErrKo(msg){
  msg = String(msg || "");
  if(msg.includes("Invalid login credentials")) return "이메일 또는 비밀번호가 맞지 않아요";
  if(msg.includes("Email not confirmed")) return "가입 확인 메일의 링크를 먼저 눌러주세요";
  if(msg.includes("already registered")) return "이미 가입된 이메일이에요";
  if(msg.includes("at least 6 characters")) return "비밀번호는 6자 이상이어야 해요";
  if(msg.includes("valid email")) return "올바른 이메일 주소를 입력해주세요";
  if(msg.includes("rate limit") || msg.includes("Too many")) return "요청이 너무 잦아요 — 잠시 후 다시 시도해주세요";
  return "실패했어요: " + msg;
}
function showAuthOverlay(){ $("#authBg").style.display = "flex"; $("#authMsg").textContent = ""; }
function hideAuthOverlay(){ $("#authBg").style.display = "none"; }

function renderHeaderAccount(){
  const el = $("#rUser");
  if(me){ el.textContent = "👤 " + (myNickname || "목장주"); el.title = "클릭해서 로그아웃"; }
  else { el.textContent = "🔑 로그인"; el.title = "로그인하면 어디서든 이어서 할 수 있어요"; }
}
$("#rUser").onclick = ()=>{
  if(!me){ showAuthOverlay(); return; }
  showModal(`<h2>로그아웃할까요?</h2>
    <p class="hint">진행 상황은 클라우드에 저장되어 있어요.<br>다시 로그인하면 이어서 할 수 있어요.</p>
    <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;">
      <button class="px" id="mLogout">로그아웃</button>
      <button class="px pink" onclick="closeModal()">취소</button>
    </div>`);
  $("#mLogout").onclick = async ()=>{
    await pushCloudNow();
    await sb.auth.signOut();
    localStorage.removeItem("mmr_guest");
    location.reload();
  };
};

function askNickname(){
  return new Promise(resolve=>{
    const ask = (msg="")=>{
      showModal(`<h2>목장주 이름 정하기</h2>
        <p class="hint">채팅과 목장 대항전에서 보여질 이름이에요 (1~12자)</p>
        <input class="in" id="nickIn" maxlength="12" style="width:100%;margin:8px 0;">
        <div style="font-size:12px;color:#b06a6a;min-height:14px;">${msg}</div>
        <button class="px pink" id="nickOk">결정!</button>`);
      $("#nickIn").focus();
      $("#nickOk").onclick = async ()=>{
        const v = $("#nickIn").value.trim();
        if(!v || v.length > 12){ ask("1~12자로 입력해주세요"); return; }
        const { error } = await sb.from("mmr_profiles")
          .upsert({ id: me.id, nickname: v, trophies: state.trophies });
        warnSetup(error);
        if(error){ ask("저장에 실패했어요 — 다시 시도해주세요"); return; }
        myNickname = v; closeModal(); resolve();
      };
    };
    ask();
  });
}

async function onLogin(user){
  me = user;
  hideAuthOverlay();
  localStorage.removeItem("mmr_guest");
  const { data: prof, error: pe } = await sb.from("mmr_profiles")
    .select("nickname").eq("id", me.id).maybeSingle();
  warnSetup(pe);
  if(prof) myNickname = prof.nickname;
  // 클라우드 세이브 불러오기 (있으면 클라우드가 우선)
  const { data: sv, error: se } = await sb.from("mmr_saves")
    .select("data").eq("user_id", me.id).maybeSingle();
  warnSetup(se);
  if(sv && sv.data && sv.data.horses){
    state = sv.data;
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    toast("☁️ 클라우드 저장을 불러왔어요!");
  } else if(!se){
    await pushCloudNow();
  }
  if(!myNickname && !pe) await askNickname();
  renderHeaderAccount();
  renderView();
  initChat();
}

async function initAuth(){
  renderHeaderAccount();
  if(!window.supabase){
    toast("온라인 기능을 불러오지 못했어요 — 오프라인 모드로 시작해요");
    return;
  }
  sb = window.supabase.createClient(SB_URL, SB_ANON);
  const { data: { session } } = await sb.auth.getSession();
  if(session){ await onLogin(session.user); return; }
  if(localStorage.getItem("mmr_guest") !== "1") showAuthOverlay();

  $("#btnLogin").onclick = async ()=>{
    const email = $("#authEmail").value.trim(), pw = $("#authPw").value;
    if(!email || !pw){ $("#authMsg").textContent = "이메일과 비밀번호를 입력해주세요"; return; }
    $("#authMsg").textContent = "로그인 중…";
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pw });
    if(error){ $("#authMsg").textContent = authErrKo(error.message); return; }
    await onLogin(data.user);
  };
  $("#btnSignup").onclick = async ()=>{
    const email = $("#authEmail").value.trim(), pw = $("#authPw").value;
    if(!email || !pw){ $("#authMsg").textContent = "이메일과 비밀번호를 입력해주세요"; return; }
    $("#authMsg").textContent = "가입 중…";
    const { data, error } = await sb.auth.signUp({ email, password: pw });
    if(error){ $("#authMsg").textContent = authErrKo(error.message); return; }
    if(data.session){ await onLogin(data.user); return; }
    $("#authMsg").textContent = "📧 확인 메일을 보냈어요! 메일의 링크를 누른 뒤 로그인해주세요";
  };
  $("#btnGuest").onclick = ()=>{
    localStorage.setItem("mmr_guest", "1");
    hideAuthOverlay();
    toast("게스트 모드 — 저장은 이 기기에만 남아요");
  };
}

/* --- 채팅 --- */
function appendChatMsg(m, scroll=true){
  const box = $("#chatMsgs");
  const div = document.createElement("div");
  div.className = "cmsg";
  const cn = document.createElement("span");
  cn.className = "cn";
  cn.textContent = m.nickname; // textContent: 외부 데이터 XSS 방지
  const ct = document.createElement("span");
  ct.className = "ct";
  const d = new Date(m.created_at);
  ct.textContent = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  const body = document.createElement("div");
  body.textContent = m.content;
  div.appendChild(cn); div.appendChild(ct); div.appendChild(body);
  box.appendChild(div);
  if(scroll) box.scrollTop = box.scrollHeight;
}
async function initChat(){
  if(!me || !sb) return;
  $("#chatFab").style.display = "block";
  const { data, error } = await sb.from("mmr_messages")
    .select("nickname,content,created_at").order("id", { ascending:false }).limit(40);
  warnSetup(error);
  $("#chatMsgs").innerHTML = "";
  (data || []).reverse().forEach(m=>appendChatMsg(m, false));
  $("#chatMsgs").scrollTop = $("#chatMsgs").scrollHeight;
  if(chatChannel) sb.removeChannel(chatChannel);
  chatChannel = sb.channel("plaza")
    .on("postgres_changes", { event:"INSERT", schema:"public", table:"mmr_messages" },
        p=>appendChatMsg(p.new))
    .subscribe();
}
async function sendChat(){
  const inp = $("#chatInput");
  const content = inp.value.trim();
  if(!content || !me) return;
  inp.value = "";
  const { error } = await sb.from("mmr_messages")
    .insert({ user_id: me.id, nickname: myNickname || "목장주", content });
  warnSetup(error);
  if(error) toast("전송에 실패했어요");
}
$("#chatFab").onclick = ()=>{
  const p = $("#chatPanel");
  p.style.display = p.style.display === "flex" ? "none" : "flex";
};
$("#chatClose").onclick = ()=>{ $("#chatPanel").style.display = "none"; };
$("#chatSend").onclick = sendChat;
$("#chatInput").addEventListener("keydown", e=>{ if(e.key === "Enter" && !e.isComposing) sendChat(); });

/* ---------- 시작 ---------- */
load();
tickCarrots();
renderView();
initAuth();
