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
  easy: { name: '简单', speed: 1.0, blockSize: 56, spawnRate: 2200, maxBlocks: 6, hp: 10 },
  medium: { name: '普通', speed: 1.5, blockSize: 48, spawnRate: 1800, maxBlocks: 8, hp: 8 },
  hard: { name: '困难', speed: 2.2, blockSize: 44, spawnRate: 1400, maxBlocks: 10, hp: 6 },
  extreme: { name: '极难', speed: 3.0, blockSize: 40, spawnRate: 1000, maxBlocks: 12, hp: 4 },
};

const BLOCK_TYPES = ['wood', 'stone', 'coal', 'iron', 'gold', 'diamond', 'emerald'];

const WORDS_PER_LEVEL = 5; // 每关需要完成的单词数
const TOTAL_LEVELS = 10;

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

    // 结果屏幕
    resultTitle: document.getElementById('result-title'),
    resultScore: document.getElementById('result-score'),
    resultCorrect: document.getElementById('result-correct'),
    resultWrong: document.getElementById('result-wrong'),
    resultCombo: document.getElementById('result-combo'),
    resultMissed: document.getElementById('result-missed'),
    missedList: document.getElementById('missed-list'),

    missedWordsSection: document.getElementById('missed-words-section'),
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

  showScreen('game-screen');
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
    loseHp(1);
    flashBlock(block, 'wrong');
    showToast(`错了！需要的是 "${word[nextIdx]}"`, 'danger');
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

  // 清理同字母的方块
  clearBlocksByLetter(word.word.toUpperCase().split(''));

  showToast(`✓ "${word.word}" = ${word.translation}  +${wordBonus}分`, 'success');
  updateHUD();
  updateLevelProgress();

  setTimeout(() => {
    if (game.state !== GameState.PLAYING) return;

    if (game.wordsCompleted % WORDS_PER_LEVEL === 0) {
      levelUp();
    } else {
      loadNewWord();
    }
  }, 1200);
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
  showLevelBanner(`第 ${game.level} 关`);

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

/* ===================== 游戏结束 ===================== */
function endGame(win) {
  game.state = GameState.RESULT;

  if (game.spawnTimer) clearInterval(game.spawnTimer);
  if (game.animFrame) cancelAnimationFrame(game.animFrame);

  // 清理所有方块
  game.blocks.forEach(b => b.element && b.element.remove());
  game.blocks = [];

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
window.addEventListener('DOMContentLoaded', () => {
  initDom();
  setupInput();

  // 绑定按钮
  document.getElementById('btn-start')?.addEventListener('click', startGame);
  document.getElementById('btn-resume')?.addEventListener('click', resumeGame);
  document.getElementById('btn-restart')?.addEventListener('click', startGame);
  document.getElementById('btn-menu')?.addEventListener('click', () => showScreen('start-screen'));
  document.getElementById('btn-pause')?.addEventListener('click', pauseGame);
  document.getElementById('btn-result-restart')?.addEventListener('click', startGame);
  document.getElementById('btn-result-menu')?.addEventListener('click', () => showScreen('start-screen'));

  // 难度按钮
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => setDifficulty(btn.dataset.diff));
  });

  // 初始化
  showScreen('start-screen');
  setDifficulty('easy');

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
