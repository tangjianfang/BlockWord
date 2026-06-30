/**
 * BlockWord - 核心游戏逻辑
 * Minecraft风格的英语单词学习游戏
 *
 * 玩法：字母方块从天空掉落，点击正确的字母方块来拼出目标单词
 * 答对得分，答错失血。完成足够单词即可过关。
 */

/* ===================== 游戏状态 ===================== */
const GameState = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  RESULT: 'result',
};

const DIFFICULTIES = {
  easy:    { name: '简单', speed: 1.0, blockSize: 56, spawnRate: 2200, maxBlocks: 6,  hp: 10, enemySpeed: 28 },
  medium:  { name: '普通', speed: 1.5, blockSize: 48, spawnRate: 1800, maxBlocks: 8,  hp: 8,  enemySpeed: 42 },
  hard:    { name: '困难', speed: 2.2, blockSize: 44, spawnRate: 1400, maxBlocks: 10, hp: 6,  enemySpeed: 60 },
  extreme: { name: '极难', speed: 3.0, blockSize: 40, spawnRate: 1000, maxBlocks: 12, hp: 4,  enemySpeed: 82 },
};

const BLOCK_TYPES = ['wood', 'stone', 'coal', 'iron', 'gold', 'diamond', 'emerald'];

const WORDS_PER_LEVEL = 5; // 每关需要完成的单词数
const TOTAL_LEVELS = 10;

const ENEMY_SPAWN_OFFSET  = 20;  // 敌人从右侧屏幕外多少像素出现
const ENEMY_RESPAWN_MARGIN = 40; // 敌人被弹回时距右侧屏幕边缘的像素
const ENEMY_CANVAS_FALLBACK = 600; // 无法获取画布宽度时的默认值

/* ===================== 游戏对象 ===================== */
let game = {
  state: GameState.IDLE,
  difficulty: 'easy',
  level: 1,
  score: 0,
  hp: 10,
  maxHp: 10,
  combo: 0,
  maxCombo: 0,
  wordsCompleted: 0,
  wordsTotal: WORDS_PER_LEVEL,
  wordsMissed: [],
  correctCount: 0,
  wrongCount: 0,

  // 当前单词
  currentWord: null,
  wordQueue: [],
  collectedLetters: [],

  // 方块
  blocks: [],
  blockIdCounter: 0,

  // 玩家
  playerX: 0,

  // 敌人
  enemyX: 0,
  enemyHp: 0,
  enemyMaxHp: 0,
  enemyMob: 'zombie',
  enemyWalking: false,

  // 生物群系
  biome: 'plains',

  // 定时器
  spawnTimer: null,
  gameLoop: null,
  lastTime: 0,

  // 动画帧
  animFrame: null,

  // 云朵
  clouds: [],
  cloudTimer: null,
};

/* ===================== 音效系统 (Web Audio) ===================== */
const sound = {
  ctx: null,
  enabled: true,

  init() {
    // 读取静音偏好
    try {
      const saved = localStorage.getItem('blockword.soundEnabled');
      if (saved !== null) this.enabled = saved === 'true';
    } catch (e) { /* localStorage 不可用时忽略 */ }
  },

  // 懒加载 AudioContext（需用户交互后才能创建/恢复）
  ensureCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  },

  // 播放一个简单的方波音符
  tone(freq, duration = 0.12, type = 'square', gain = 0.15) {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, ctx.currentTime);
    env.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(env);
    env.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  },

  // 播放一组音符（旋律）
  sequence(notes) {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;
    let t = 0;
    notes.forEach(n => {
      setTimeout(() => this.tone(n.freq, n.dur || 0.12, n.type || 'square', n.gain || 0.15), t * 1000);
      t += n.dur || 0.12;
    });
  },

  correct() { this.tone(660, 0.1, 'square', 0.16); },
  wrong() { this.tone(160, 0.22, 'sawtooth', 0.18); },
  complete() { this.sequence([{ freq: 523 }, { freq: 659 }, { freq: 784, dur: 0.18 }]); },
  levelUp() { this.sequence([{ freq: 523 }, { freq: 659 }, { freq: 784 }, { freq: 1047, dur: 0.22 }]); },
  win() { this.sequence([{ freq: 523 }, { freq: 659 }, { freq: 784 }, { freq: 1047 }, { freq: 1319, dur: 0.3 }]); },
  lose() { this.sequence([{ freq: 392, dur: 0.18 }, { freq: 311, dur: 0.18 }, { freq: 233, dur: 0.32 }]); },

  toggle() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('blockword.soundEnabled', String(this.enabled));
    } catch (e) { /* localStorage 不可用时忽略 */ }
    if (this.enabled) this.tone(660, 0.1, 'square', 0.16);
    return this.enabled;
  },
};

/* ===================== 最高分（localStorage） ===================== */
const HIGH_SCORE_KEY = 'blockword.highScore';

function getHighScore() {
  try {
    const v = parseInt(localStorage.getItem(HIGH_SCORE_KEY), 10);
    return Number.isFinite(v) ? v : 0;
  } catch (e) {
    return 0;
  }
}

function saveHighScore(score) {
  try {
    if (score > getHighScore()) {
      localStorage.setItem(HIGH_SCORE_KEY, String(score));
      return true;
    }
  } catch (e) { /* localStorage 不可用时忽略 */ }
  return false;
}

/* ===================== DOM 引用 ===================== */
let dom = {};

function initDom() {
  dom = {
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    resultScreen: document.getElementById('result-screen'),
    pauseOverlay: document.getElementById('pause-overlay'),

    canvas: document.getElementById('game-canvas'),
    blocksContainer: document.getElementById('blocks-container'),
    player: document.getElementById('player-char'),
    playerHead: document.getElementById('player-head'),

    hudLevel: document.getElementById('hud-level'),
    hudScore: document.getElementById('hud-score'),
    hudCombo: document.getElementById('hud-combo'),
    hpBar: document.getElementById('hp-bar'),

    wordTarget: document.getElementById('word-target'),
    wordTranslation: document.getElementById('word-translation'),
    wordSentencePanel: document.getElementById('word-sentence-panel'),
    wordHint: document.getElementById('word-hint'),
    inputSlots: document.getElementById('input-slots'),

    wordsCompletedEl: document.getElementById('words-completed'),
    wordsTotalEl: document.getElementById('words-total'),
    levelProgressFill: document.getElementById('level-progress-fill'),

    statsCorrect: document.getElementById('stats-correct'),
    statsWrong: document.getElementById('stats-wrong'),
    statsCombo: document.getElementById('stats-combo'),
    statsScore: document.getElementById('stats-score'),

    diffButtons: document.querySelectorAll('.diff-btn'),
    levelBanner: document.getElementById('level-banner'),
    levelBannerText: document.getElementById('level-banner-text'),
    toast: document.getElementById('game-toast'),

    comboDisplay: document.getElementById('combo-display'),
    comboNum: document.getElementById('combo-num'),

    // 敌人系统
    enemyContainer: document.getElementById('enemy-container'),
    enemySprite: document.getElementById('enemy-sprite'),
    enemyHpFill: document.getElementById('enemy-hp-fill'),
    enemyName: document.getElementById('enemy-name'),
    enemyDialogue: document.getElementById('enemy-dialogue'),

    // 胜利浮层
    wordVictory: document.getElementById('word-victory'),
    wvIcon: document.getElementById('wv-icon'),
    wvWord: document.getElementById('wv-word'),
    wvSentence: document.getElementById('wv-sentence'),
    wvScore: document.getElementById('wv-score'),

    // 结果屏幕
    resultTitle: document.getElementById('result-title'),
    resultScore: document.getElementById('result-score'),
    resultCorrect: document.getElementById('result-correct'),
    resultWrong: document.getElementById('result-wrong'),
    resultCombo: document.getElementById('result-combo'),
    resultBest: document.getElementById('result-best'),
    resultNewRecord: document.getElementById('result-new-record'),
    missedList: document.getElementById('missed-list'),

    missedWordsSection: document.getElementById('missed-words-section'),

    // 开始屏幕 / 设置
    startBest: document.getElementById('start-best'),
    btnSound: document.getElementById('btn-sound'),
  };
}

/* ===================== 屏幕管理 ===================== */
function showScreen(name) {
  ['start-screen', 'game-screen', 'result-screen'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  const target = document.getElementById(name);
  if (target) target.classList.add('active');
}

/* ===================== 难度选择 ===================== */
function setDifficulty(diff) {
  game.difficulty = diff;
  dom.diffButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.diff === diff);
  });
}

/* ===================== 游戏初始化 ===================== */
function startGame() {
  const diff = DIFFICULTIES[game.difficulty];
  game.state = GameState.PLAYING;
  game.level = 1;
  game.score = 0;
  game.hp = diff.hp;
  game.maxHp = diff.hp;
  game.combo = 0;
  game.maxCombo = 0;
  game.wordsCompleted = 0;
  game.wordsMissed = [];
  game.correctCount = 0;
  game.wrongCount = 0;
  game.blocks = [];
  game.blockIdCounter = 0;
  game.collectedLetters = [];
  game.enemyWalking = false;

  showScreen('game-screen');
  applyBiome(getBiome(game.level));
  updateHUD();
  setupClouds();
  loadNewWord();
  startSpawner();
  startGameLoop();
  positionPlayer();

  showLevelBanner(`第 ${game.level} 关`);
}

function positionPlayer() {
  const canvas = dom.canvas;
  game.playerX = canvas.offsetWidth / 2 - 24;
  if (dom.player) {
    dom.player.style.left = game.playerX + 'px';
  }
}

/* ===================== 单词管理 ===================== */
function loadNewWord() {
  if (game.wordQueue.length === 0) {
    game.wordQueue = getWordsForLevel(game.level);
  }

  game.currentWord = game.wordQueue.shift();
  game.collectedLetters = [];

  updateWordDisplay();
  updateInputSlots();
  spawnEnemy(game.currentWord);
}

function updateWordDisplay() {
  if (!game.currentWord) return;

  // 显示字母占位（已收集的显示，未收集的显示 _）
  const word = game.currentWord.word.toUpperCase();
  let display = '';
  for (let i = 0; i < word.length; i++) {
    if (game.collectedLetters[i]) {
      display += game.collectedLetters[i] + ' ';
    } else {
      display += '_ ';
    }
  }
  dom.wordTarget.textContent = display.trim();
  dom.wordTranslation.textContent = game.currentWord.translation;
  dom.wordHint.textContent = `提示: ${game.currentWord.hint}`;

  // 情景句子（侧边栏）
  if (dom.wordSentencePanel && game.currentWord.sentence) {
    const parts = game.currentWord.sentence.split('___');
    if (parts.length === 2) {
      dom.wordSentencePanel.innerHTML =
        escapeHtml(parts[0]) +
        '<span class="blank-word">___</span>' +
        escapeHtml(parts[1]);
    } else {
      dom.wordSentencePanel.textContent = game.currentWord.sentence;
    }
  }
}

function updateInputSlots() {
  if (!game.currentWord) return;
  const word = game.currentWord.word.toUpperCase();
  dom.inputSlots.innerHTML = '';

  for (let i = 0; i < word.length; i++) {
    const slot = document.createElement('div');
    slot.className = 'input-slot' + (game.collectedLetters[i] ? ' filled' : '');
    slot.textContent = game.collectedLetters[i] || '';
    dom.inputSlots.appendChild(slot);
  }
}

/* ===================== 方块生成 ===================== */
function startSpawner() {
  if (game.spawnTimer) clearInterval(game.spawnTimer);
  const diff = DIFFICULTIES[game.difficulty];
  game.spawnTimer = setInterval(() => {
    if (game.state === GameState.PLAYING && game.currentWord) {
      spawnBlock();
    }
  }, diff.spawnRate);
}

function spawnBlock() {
  const diff = DIFFICULTIES[game.difficulty];
  if (game.blocks.length >= diff.maxBlocks) return;

  const word = game.currentWord.word.toUpperCase();
  const nextIdx = game.collectedLetters.filter(Boolean).length;
  const canvas = dom.canvas;

  // 决定这个方块是正确字母还是干扰字母
  const isCorrect = Math.random() < 0.45; // 45% 概率是正确字母
  let letter;

  if (isCorrect && nextIdx < word.length) {
    letter = word[nextIdx];
  } else {
    // 随机字母，但保证不与当前需要的字母相同一半以上
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    do {
      letter = allLetters[Math.floor(Math.random() * 26)];
    } while (letter === word[nextIdx] && Math.random() < 0.7);
  }

  const blockType = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)];
  const id = ++game.blockIdCounter;
  const blockSize = diff.blockSize;

  // 随机水平位置
  const maxX = canvas.offsetWidth - blockSize - 20;
  const x = 20 + Math.random() * maxX;

  const block = {
    id,
    letter,
    blockType,
    x,
    y: -blockSize,
    size: blockSize,
    speed: diff.speed * (0.8 + Math.random() * 0.4),
    isCorrect: letter === word[nextIdx],
    element: null,
  };

  // 创建 DOM 元素
  const el = document.createElement('div');
  el.className = 'falling-block';
  el.id = `block-${id}`;
  el.style.cssText = `
    left: ${x}px;
    top: ${-blockSize}px;
    width: ${blockSize}px;
    height: ${blockSize}px;
  `;

  el.innerHTML = `
    <div class="block-face block-type-${blockType}" style="width:${blockSize}px;height:${blockSize}px;">
      <span class="block-letter">${letter}</span>
    </div>
  `;

  el.addEventListener('click', () => onBlockClick(id));
  el.addEventListener('touchstart', (e) => { e.preventDefault(); onBlockClick(id); }, { passive: false });

  dom.blocksContainer.appendChild(el);
  block.element = el;
  game.blocks.push(block);
}

/* ===================== 游戏循环 ===================== */
function startGameLoop() {
  if (game.animFrame) cancelAnimationFrame(game.animFrame);
  game.lastTime = performance.now();
  gameLoop(game.lastTime);
}

function gameLoop(timestamp) {
  if (game.state !== GameState.PLAYING) return;

  const dt = (timestamp - game.lastTime) / 1000; // 秒
  game.lastTime = timestamp;

  updateBlocks(dt);
  updateEnemy(dt);
  movePlayerTowardTarget(dt);

  game.animFrame = requestAnimationFrame(gameLoop);
}

function updateBlocks(dt) {
  const canvas = dom.canvas;
  const groundY = canvas.offsetHeight - 80; // 地面高度

  for (let i = game.blocks.length - 1; i >= 0; i--) {
    const block = game.blocks[i];
    block.y += block.speed * dt * 60;

    if (block.element) {
      block.element.style.top = block.y + 'px';
    }

    // 方块落到地面
    if (block.y >= groundY - block.size) {
      removeBlock(block);
      game.blocks.splice(i, 1);

      // 如果是需要的正确字母落地，扣血
      if (block.isCorrect) {
        loseHp(1);
        showMissEffect(block.x + block.size / 2, groundY - 20, '×');
        showToast('字母落地！失去1点生命值', 'danger');
      }
    }
  }
}

// 让玩家跟随鼠标/触摸
let targetPlayerX = 0;
let isMouseOnCanvas = false;

function movePlayerTowardTarget(dt) {
  if (!dom.player) return;
  const canvas = dom.canvas;
  const maxX = canvas.offsetWidth - 48;
  game.playerX = Math.max(0, Math.min(maxX, targetPlayerX));
  dom.player.style.left = game.playerX + 'px';
}

/* ===================== 点击方块 ===================== */
function onBlockClick(id) {
  if (game.state !== GameState.PLAYING) return;

  const idx = game.blocks.findIndex(b => b.id === id);
  if (idx === -1) return;

  const block = game.blocks[idx];
  const word = game.currentWord.word.toUpperCase();
  const nextIdx = game.collectedLetters.filter(Boolean).length;

  if (block.letter === word[nextIdx]) {
    // 正确！
    game.collectedLetters[nextIdx] = block.letter;
    game.correctCount++;
    game.combo++;
    if (game.combo > game.maxCombo) game.maxCombo = game.combo;

    showCollectEffect(block.x + block.size / 2, block.y, '+' + getLetterScore());
    game.score += getLetterScore();
    sound.correct();
    damageEnemy();

    // 移动玩家到方块位置
    targetPlayerX = block.x;

    removeBlock(block);
    game.blocks.splice(idx, 1);

    updateWordDisplay();
    updateInputSlots();
    updateHUD();

    // 检查是否完成单词
    if (game.collectedLetters.filter(Boolean).length === word.length) {
      completeWord();
    }
  } else {
    // 错误！
    game.wrongCount++;
    game.combo = 0;
    sound.wrong();
    loseHp(1);
    flashBlock(block, 'wrong');

    const nextLetter = word[nextIdx];
    showToast(`✗ 错了！需要字母 "${nextLetter}"`, 'danger');

    // 敌人攻击玩家特效：敌人短暂向玩家冲刺
    if (dom.enemyContainer) {
      const origX = game.enemyX;
      const rushX = Math.max(origX - 50, game.playerX + 30);
      dom.enemyContainer.style.transition = 'left 0.15s ease-out';
      dom.enemyContainer.style.left = rushX + 'px';
      setTimeout(() => {
        if (dom.enemyContainer) {
          dom.enemyContainer.style.transition = 'left 0.3s ease-out';
          dom.enemyContainer.style.left = origX + 'px';
          setTimeout(() => { if (dom.enemyContainer) dom.enemyContainer.style.transition = ''; }, 300);
        }
      }, 200);
    }
    // 玩家受击伤害数字
    const px = game.playerX + 24;
    const py = dom.canvas ? dom.canvas.offsetHeight - 160 : 100;
    showDamageText(px, py, '-1', 'player');

    updateHUD();
  }

  updateComboDisplay();
}

function getLetterScore() {
  const base = 10;
  const comboBonus = Math.floor(game.combo / 3) * 5;
  const levelBonus = (game.level - 1) * 3;
  return base + comboBonus + levelBonus;
}

function flashBlock(block, type) {
  if (!block.element) return;
  block.element.style.outline = type === 'wrong' ? '3px solid red' : '3px solid lime';
  setTimeout(() => {
    if (block.element) block.element.style.outline = '';
  }, 300);
}

/* ===================== 单词完成 ===================== */
function completeWord() {
  const word = game.currentWord;
  const wordBonus = 50 * game.level + game.combo * 10;
  game.score += wordBonus;
  game.wordsCompleted++;
  game.enemyWalking = false;

  // 清理同字母的方块
  clearBlocksByLetter(word.word.toUpperCase().split(''));

  updateHUD();
  updateLevelProgress();

  // 击杀动画 → 胜利浮层 → 下一个单词
  killEnemy(() => {
    showWordVictory(word, wordBonus);
    sound.levelUp();

    setTimeout(() => {
      if (game.state !== GameState.PLAYING) return;
      hideWordVictory(() => {
        if (game.wordsCompleted % WORDS_PER_LEVEL === 0) {
          levelUp();
        } else {
          loadNewWord();
        }
      });
    }, 2200);
  });
}

function clearBlocksByLetter(letters) {
  // 不清理，让已有方块继续存在
}

/* ===================== 升级 ===================== */
function levelUp() {
  if (game.level >= TOTAL_LEVELS) {
    endGame(true);
    return;
  }

  game.level++;
  applyBiome(getBiome(game.level));
  showLevelBanner(`第 ${game.level} 关`);
  sound.levelUp();

  // 每隔几关加快速度
  if (game.spawnTimer) clearInterval(game.spawnTimer);
  startSpawner();

  // 每关恢复1点生命
  if (game.hp < game.maxHp) {
    game.hp = Math.min(game.maxHp, game.hp + 1);
  }

  updateHUD();

  setTimeout(() => {
    if (game.state === GameState.PLAYING) {
      loadNewWord();
    }
  }, 1800);
}

/* ===================== 失血 ===================== */
function loseHp(amount) {
  game.hp = Math.max(0, game.hp - amount);
  updateHpBar();

  // 屏幕闪红
  dom.canvas.style.outline = '4px solid red';
  setTimeout(() => { dom.canvas.style.outline = ''; }, 300);

  if (game.hp <= 0) {
    endGame(false);
  }
}

/* ===================== 记录未答出的单词 ===================== */
function recordMissedWord(word) {
  if (!word) return;
  // 避免重复记录同一个单词
  if (game.wordsMissed.some(w => w.word === word.word)) return;
  game.wordsMissed.push({ word: word.word, translation: word.translation });
}

/* ===================== 游戏结束 ===================== */
function endGame(win) {
  game.state = GameState.RESULT;
  game.enemyWalking = false;

  // 游戏失败时，当前未完成的单词计入"未答出"列表
  if (!win && game.currentWord &&
      game.collectedLetters.filter(Boolean).length < game.currentWord.word.length) {
    recordMissedWord(game.currentWord);
  }

  if (game.spawnTimer) clearInterval(game.spawnTimer);
  if (game.animFrame) cancelAnimationFrame(game.animFrame);

  // 清理所有方块
  game.blocks.forEach(b => b.element && b.element.remove());
  game.blocks = [];

  // 隐藏胜利浮层
  if (dom.wordVictory) {
    dom.wordVictory.classList.remove('show');
    dom.wordVictory.classList.add('hidden');
  }

  setTimeout(() => showResultScreen(win), 800);
}

function showResultScreen(win) {
  showScreen('result-screen');

  dom.resultTitle.textContent = win ? '🏆 胜利！' : '💀 游戏结束';
  dom.resultTitle.className = 'result-title ' + (win ? 'win' : 'lose');

  dom.resultScore.textContent = game.score;
  dom.resultCorrect.textContent = game.correctCount;
  dom.resultWrong.textContent = game.wrongCount;
  dom.resultCombo.textContent = game.maxCombo;

  // 最高分处理
  const isNewRecord = saveHighScore(game.score);
  if (dom.resultBest) dom.resultBest.textContent = getHighScore();
  if (dom.resultNewRecord) {
    dom.resultNewRecord.style.display = isNewRecord && game.score > 0 ? 'block' : 'none';
  }

  // 结束音效
  if (win) sound.win(); else sound.lose();

  // 错误单词列表
  if (game.wordsMissed.length > 0) {
    dom.missedWordsSection.style.display = 'block';
    dom.missedList.innerHTML = game.wordsMissed.map(w =>
      `<div class="missed-word-item">
        <span class="missed-word-en">${w.word}</span>
        <span class="missed-word-cn">${w.translation}</span>
      </div>`
    ).join('');
  } else {
    dom.missedWordsSection.style.display = 'none';
  }
}

/* ===================== HUD 更新 ===================== */
function updateHUD() {
  if (dom.hudLevel) dom.hudLevel.textContent = game.level;
  if (dom.hudScore) dom.hudScore.textContent = game.score;
  if (dom.hudCombo) dom.hudCombo.textContent = game.combo + 'x';

  if (dom.statsCorrect) dom.statsCorrect.textContent = game.correctCount;
  if (dom.statsWrong) dom.statsWrong.textContent = game.wrongCount;
  if (dom.statsCombo) dom.statsCombo.textContent = game.maxCombo;
  if (dom.statsScore) dom.statsScore.textContent = game.score;

  updateHpBar();
}

function updateHpBar() {
  if (!dom.hpBar) return;
  const hearts = [];
  for (let i = 0; i < game.maxHp; i++) {
    hearts.push(`<span class="hp-heart ${i < game.hp ? '' : 'empty'}">❤</span>`);
  }
  dom.hpBar.innerHTML = hearts.join('');
}

function updateLevelProgress() {
  const progress = (game.wordsCompleted % WORDS_PER_LEVEL) / WORDS_PER_LEVEL * 100;
  if (dom.levelProgressFill) {
    dom.levelProgressFill.style.width = progress + '%';
  }
  if (dom.wordsCompletedEl) dom.wordsCompletedEl.textContent = game.wordsCompleted % WORDS_PER_LEVEL;
  if (dom.wordsTotalEl) dom.wordsTotalEl.textContent = WORDS_PER_LEVEL;
}

function updateComboDisplay() {
  if (!dom.comboDisplay) return;
  if (game.combo >= 3) {
    dom.comboDisplay.classList.add('show');
    dom.comboNum.textContent = game.combo;
  } else {
    dom.comboDisplay.classList.remove('show');
  }
}

/* ===================== 关卡横幅 ===================== */
function showLevelBanner(text) {
  if (!dom.levelBanner) return;
  dom.levelBannerText.textContent = text;
  dom.levelBanner.classList.add('show');
  setTimeout(() => dom.levelBanner.classList.remove('show'), 1600);
}

/* ===================== 通知 ===================== */
let toastTimer = null;
function showToast(msg, type = 'info') {
  if (!dom.toast) return;
  dom.toast.textContent = msg;
  dom.toast.style.borderColor = type === 'danger' ? '#cc3333' : type === 'success' ? '#33cc33' : '#555';
  dom.toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => dom.toast.classList.remove('show'), 2000);
}

/* ===================== 视觉特效 ===================== */
function showCollectEffect(x, y, text) {
  const el = document.createElement('div');
  el.className = 'collect-effect';
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  dom.canvas.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function showMissEffect(x, y, text) {
  const el = document.createElement('div');
  el.className = 'miss-effect';
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  dom.canvas.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

/* ===================== 方块移除 ===================== */
function removeBlock(block) {
  if (block.element) {
    block.element.style.transition = 'opacity 0.2s, transform 0.2s';
    block.element.style.opacity = '0';
    block.element.style.transform = 'scale(0.5)';
    setTimeout(() => block.element && block.element.remove(), 200);
    block.element = null;
  }
}

/* ===================== 云朵 ===================== */
function setupClouds() {
  const canvas = dom.canvas;
  // 生成几朵云
  for (let i = 0; i < 4; i++) {
    spawnCloud(Math.random() * canvas.offsetWidth, true);
  }

  if (game.cloudTimer) clearInterval(game.cloudTimer);
  game.cloudTimer = setInterval(() => {
    if (game.state === GameState.PLAYING) {
      spawnCloud(canvas.offsetWidth + 50, false);
    }
  }, 8000);
}

function spawnCloud(startX, initial) {
  const canvas = dom.canvas;
  const el = document.createElement('div');
  el.className = 'game-cloud';
  const w = 60 + Math.floor(Math.random() * 80);
  const h = 20 + Math.floor(Math.random() * 20);
  const y = 20 + Math.random() * (canvas.offsetHeight * 0.3);
  const duration = 30 + Math.random() * 40;

  el.style.cssText = `
    width: ${w}px;
    height: ${h}px;
    left: ${startX}px;
    top: ${y}px;
    animation-duration: ${duration}s;
    animation-delay: ${initial ? -Math.random() * duration : 0}s;
  `;

  canvas.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

/* ===================== 暂停 ===================== */
function pauseGame() {
  if (game.state === GameState.PLAYING) {
    game.state = GameState.PAUSED;
    if (game.animFrame) cancelAnimationFrame(game.animFrame);
    dom.pauseOverlay.classList.add('visible');
  }
}

function resumeGame() {
  if (game.state === GameState.PAUSED) {
    game.state = GameState.PLAYING;
    dom.pauseOverlay.classList.remove('visible');
    game.lastTime = performance.now();
    gameLoop(game.lastTime);
  }
}

/* ===================== 输入控制 ===================== */
function setupInput() {
  const canvas = dom.canvas;

  // 鼠标移动 - 玩家跟随
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    targetPlayerX = e.clientX - rect.left - 24;
  });

  // 触摸移动
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    targetPlayerX = e.touches[0].clientX - rect.left - 24;
  }, { passive: false });

  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      if (game.state === GameState.PLAYING) pauseGame();
      else if (game.state === GameState.PAUSED) resumeGame();
    }
  });

  // 窗口大小变化
  window.addEventListener('resize', () => {
    if (game.state === GameState.PLAYING) {
      positionPlayer();
    }
  });
}

/* ===================== 初始化 ===================== */
function updateSoundButton() {
  if (dom.btnSound) {
    dom.btnSound.textContent = sound.enabled ? '🔊 音效: 开' : '🔇 音效: 关';
    dom.btnSound.classList.toggle('muted', !sound.enabled);
  }
}

function updateHighScoreDisplays() {
  const best = getHighScore();
  if (dom.startBest) dom.startBest.textContent = best;
}

function goToMenu() {
  game.state = GameState.IDLE;
  game.enemyWalking = false;
  if (game.spawnTimer) clearInterval(game.spawnTimer);
  if (game.animFrame) cancelAnimationFrame(game.animFrame);
  if (game.cloudTimer) clearInterval(game.cloudTimer);
  game.blocks.forEach(b => b.element && b.element.remove());
  game.blocks = [];
  if (dom.pauseOverlay) dom.pauseOverlay.classList.remove('visible');
  // 重置画布生物群系
  if (dom.canvas) {
    ['plains','forest','cave','nether','end'].forEach(b => dom.canvas.classList.remove('biome-' + b));
  }
  // 隐藏胜利浮层
  if (dom.wordVictory) {
    dom.wordVictory.classList.remove('show');
    dom.wordVictory.classList.add('hidden');
  }
  updateHighScoreDisplays();
  showScreen('start-screen');
}

window.addEventListener('DOMContentLoaded', () => {
  initDom();
  sound.init();
  setupInput();

  // 绑定按钮
  document.getElementById('btn-start')?.addEventListener('click', startGame);
  document.getElementById('btn-resume')?.addEventListener('click', resumeGame);
  document.getElementById('btn-menu')?.addEventListener('click', goToMenu);
  document.getElementById('btn-pause')?.addEventListener('click', pauseGame);
  document.getElementById('btn-result-restart')?.addEventListener('click', startGame);
  document.getElementById('btn-result-menu')?.addEventListener('click', goToMenu);

  // 音效开关
  dom.btnSound?.addEventListener('click', () => {
    sound.toggle();
    updateSoundButton();
  });

  // 难度按钮
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => setDifficulty(btn.dataset.diff));
  });

  // 初始化
  showScreen('start-screen');
  setDifficulty('easy');
  updateSoundButton();
  updateHighScoreDisplays();

  // 开始屏幕的像素云朵
  createStartClouds();
});

function createStartClouds() {
  const container = document.getElementById('start-clouds');
  if (!container) return;

  for (let i = 0; i < 6; i++) {
    const cloud = document.createElement('div');
    const w = 40 + Math.floor(Math.random() * 80);
    const h = 16 + Math.floor(Math.random() * 16);
    cloud.className = 'cloud-block';
    cloud.style.cssText = `
      width: ${w}px;
      height: ${h}px;
      left: ${Math.random() * 90}%;
      top: ${Math.random() * 80}px;
    `;
    container.appendChild(cloud);
  }
}

/* ===================== 生物群系系统 ===================== */
function getBiome(level) {
  if (level <= 2) return 'plains';
  if (level <= 4) return 'forest';
  if (level <= 6) return 'cave';
  if (level <= 8) return 'nether';
  return 'end';
}

function applyBiome(biome) {
  game.biome = biome;
  if (!dom.canvas) return;
  ['plains','forest','cave','nether','end'].forEach(b => dom.canvas.classList.remove('biome-' + b));
  dom.canvas.classList.add('biome-' + biome);
}

/* ===================== 敌人系统 ===================== */
const MOB_NAMES = {
  zombie:   '🧟 僵尸',
  spider:   '🕷 蜘蛛',
  skeleton: '💀 骷髅',
  creeper:  '💣 苦力怕',
  blaze:    '🔥 烈焰人',
  enderman: '👾 末影人',
};

const MOB_DIALOGUES = [
  '你能拼出这个单词吗？',
  '嘿！准备战斗！',
  '我来啦，阻止我吧！',
  '你逃不掉的，快拼！',
  '嘶嘶嘶... 来战！',
];

function spawnEnemy(word) {
  if (!dom.enemyContainer || !dom.enemySprite) return;

  const mob = word.mob || 'zombie';
  game.enemyMob = mob;
  game.enemyHp = word.word.length;
  game.enemyMaxHp = word.word.length;

  // 切换怪物外观
  const sprite = dom.enemySprite;
  ['mob-zombie','mob-spider','mob-skeleton','mob-creeper','mob-blaze','mob-enderman']
    .forEach(c => sprite.classList.remove(c));
  sprite.classList.add('mob-' + mob);
  sprite.classList.remove('dying', 'hit');
  sprite.style.opacity = '1';

  // 从屏幕右侧出现
  const canvas = dom.canvas;
  game.enemyX = (canvas ? canvas.offsetWidth : ENEMY_CANVAS_FALLBACK) + ENEMY_SPAWN_OFFSET;
  dom.enemyContainer.style.left = game.enemyX + 'px';

  // 名字标签
  if (dom.enemyName) dom.enemyName.textContent = MOB_NAMES[mob] || mob;

  // HP条满格
  updateEnemyHpBar();

  // 对话气泡
  const dialogue = MOB_DIALOGUES[Math.floor(Math.random() * MOB_DIALOGUES.length)];
  showEnemyDialogue(dialogue);

  game.enemyWalking = true;
}

function showEnemyDialogue(text) {
  if (!dom.enemyDialogue) return;
  dom.enemyDialogue.textContent = text;
  dom.enemyDialogue.classList.add('show');
  setTimeout(() => {
    if (dom.enemyDialogue) dom.enemyDialogue.classList.remove('show');
  }, 2800);
}

function updateEnemyHpBar() {
  if (!dom.enemyHpFill) return;
  const pct = game.enemyMaxHp > 0 ? (game.enemyHp / game.enemyMaxHp) * 100 : 0;
  dom.enemyHpFill.style.width = pct + '%';
}

function updateEnemy(dt) {
  if (!game.enemyWalking || !dom.enemyContainer) return;
  const diff = DIFFICULTIES[game.difficulty];
  game.enemyX -= diff.enemySpeed * dt;
  dom.enemyContainer.style.left = game.enemyX + 'px';

  // 到达玩家位置
  if (game.enemyX <= game.playerX + 16) {
    enemyReachesPlayer();
  }
}

function enemyReachesPlayer() {
  game.enemyWalking = false;
  loseHp(2);
  showToast('⚠ 怪物攻击！-2 生命值', 'danger');
  sound.wrong();

  // 弹回屏幕右侧重新走过来
  const canvas = dom.canvas;
  game.enemyX = (canvas ? canvas.offsetWidth : ENEMY_CANVAS_FALLBACK) - ENEMY_RESPAWN_MARGIN;
  if (dom.enemyContainer) dom.enemyContainer.style.left = game.enemyX + 'px';

  showEnemyDialogue('嗯哼！我还会回来的！');

  setTimeout(() => {
    if (game.state === GameState.PLAYING) {
      game.enemyWalking = true;
    }
  }, 1400);
}

function damageEnemy() {
  if (game.enemyHp <= 0) return;
  game.enemyHp--;
  updateEnemyHpBar();

  // 受击闪光动画
  const sprite = dom.enemySprite;
  if (sprite) {
    sprite.classList.remove('hit');
    void sprite.offsetWidth; // 重置动画帧
    sprite.classList.add('hit');
    setTimeout(() => sprite && sprite.classList.remove('hit'), 350);
  }

  // 受击伤害数字
  const ex = game.enemyX + 20;
  const ey = dom.canvas ? dom.canvas.offsetHeight * 0.38 : 140;
  showDamageText(ex, ey, '⚔-1', 'enemy');

  // 玩家挥击动画
  if (dom.player) {
    dom.player.classList.add('swing');
    setTimeout(() => dom.player && dom.player.classList.remove('swing'), 300);
  }
}

function killEnemy(onDone) {
  game.enemyWalking = false;
  const sprite = dom.enemySprite;
  if (sprite) {
    sprite.classList.add('dying');
  }
  // 爆炸提示
  const ex = game.enemyX + 20;
  const ey = dom.canvas ? dom.canvas.offsetHeight * 0.4 : 150;
  showDamageText(ex, ey, '💥', 'enemy');

  setTimeout(() => {
    if (onDone) onDone();
  }, 680);
}

/* ===================== 胜利浮层 ===================== */
function showWordVictory(word, scoreGained) {
  if (!dom.wordVictory) return;

  const mobIcons = {
    zombie: '⚔', spider: '⚔', skeleton: '🏹',
    creeper: '💥', blaze: '🔥', enderman: '✨'
  };
  if (dom.wvIcon) dom.wvIcon.textContent = mobIcons[word.mob] || '⚔';

  if (dom.wvWord) {
    dom.wvWord.textContent = `${word.word.toUpperCase()}  =  ${word.translation}`;
  }

  if (dom.wvSentence && word.sentence) {
    const highlighted = word.sentence.replace(
      '___',
      `<span class="highlight-word">${word.word}</span>`
    );
    dom.wvSentence.innerHTML = highlighted;
  }

  if (dom.wvScore) dom.wvScore.textContent = `+${scoreGained} 分`;

  dom.wordVictory.classList.remove('hidden');
  setTimeout(() => dom.wordVictory.classList.add('show'), 20);
}

function hideWordVictory(cb) {
  if (!dom.wordVictory) { if (cb) cb(); return; }
  dom.wordVictory.classList.remove('show');
  setTimeout(() => {
    dom.wordVictory.classList.add('hidden');
    if (cb) cb();
  }, 320);
}

/* ===================== 伤害数字特效 ===================== */
function showDamageText(x, y, text, type) {
  if (!dom.canvas) return;
  const el = document.createElement('div');
  el.className = `damage-text ${type}`;
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  dom.canvas.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

/* ===================== HTML 转义工具 ===================== */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
