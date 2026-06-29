// BlockWord 英语单词数据库
// 按难度分级，每个单词包含：word(单词), translation(中文释义), hint(提示)

const WORD_LEVELS = {
  1: [
    { word: "cat", translation: "猫", hint: "一种常见的宠物" },
    { word: "dog", translation: "狗", hint: "人类的好朋友" },
    { word: "sun", translation: "太阳", hint: "天空中发光的星球" },
    { word: "run", translation: "跑", hint: "快速移动" },
    { word: "eat", translation: "吃", hint: "摄取食物的动作" },
    { word: "big", translation: "大的", hint: "尺寸较大" },
    { word: "red", translation: "红色", hint: "血液的颜色" },
    { word: "hot", translation: "热的", hint: "高温" },
    { word: "sky", translation: "天空", hint: "头顶上方" },
    { word: "fly", translation: "飞", hint: "鸟类的移动方式" },
    { word: "box", translation: "盒子", hint: "用来装东西的容器" },
    { word: "map", translation: "地图", hint: "显示地形的图" },
    { word: "cup", translation: "杯子", hint: "喝水用的器具" },
    { word: "pen", translation: "钢笔", hint: "书写工具" },
    { word: "bed", translation: "床", hint: "睡觉的家具" },
  ],
  2: [
    { word: "tree", translation: "树", hint: "有树干和树枝的植物" },
    { word: "bird", translation: "鸟", hint: "有翅膀会飞的动物" },
    { word: "book", translation: "书", hint: "用来阅读的物品" },
    { word: "fish", translation: "鱼", hint: "生活在水中的动物" },
    { word: "jump", translation: "跳", hint: "离地腾空的动作" },
    { word: "blue", translation: "蓝色", hint: "天空和海洋的颜色" },
    { word: "play", translation: "玩耍", hint: "娱乐活动" },
    { word: "rain", translation: "雨", hint: "从云中落下的水" },
    { word: "wind", translation: "风", hint: "流动的空气" },
    { word: "milk", translation: "牛奶", hint: "白色的营养饮料" },
    { word: "door", translation: "门", hint: "进出房间的入口" },
    { word: "hand", translation: "手", hint: "人体上肢末端" },
    { word: "food", translation: "食物", hint: "可以吃的东西" },
    { word: "song", translation: "歌曲", hint: "有节奏有旋律的声音" },
    { word: "time", translation: "时间", hint: "小时、分钟、秒" },
  ],
  3: [
    { word: "house", translation: "房子", hint: "人们居住的建筑" },
    { word: "water", translation: "水", hint: "生命之源" },
    { word: "grass", translation: "草", hint: "绿色的植物" },
    { word: "stone", translation: "石头", hint: "坚硬的矿物" },
    { word: "sword", translation: "剑", hint: "古代武器" },
    { word: "chest", translation: "箱子", hint: "储物容器" },
    { word: "craft", translation: "制作", hint: "创造物品的过程" },
    { word: "night", translation: "夜晚", hint: "太阳落山后" },
    { word: "light", translation: "光", hint: "照明能源" },
    { word: "power", translation: "力量", hint: "能力或电力" },
    { word: "world", translation: "世界", hint: "地球上所有地方" },
    { word: "block", translation: "方块", hint: "正方形的物体" },
    { word: "build", translation: "建造", hint: "构建某物" },
    { word: "apple", translation: "苹果", hint: "红色或绿色的水果" },
    { word: "horse", translation: "马", hint: "古代交通工具" },
  ],
  4: [
    { word: "dragon", translation: "龙", hint: "神话中的生物" },
    { word: "castle", translation: "城堡", hint: "古代贵族的居所" },
    { word: "forest", translation: "森林", hint: "密集的树木地带" },
    { word: "mining", translation: "挖矿", hint: "开采矿产的活动" },
    { word: "battle", translation: "战斗", hint: "战争或竞争" },
    { word: "golden", translation: "金色的", hint: "像黄金一样的颜色" },
    { word: "rocket", translation: "火箭", hint: "用于太空旅行" },
    { word: "jungle", translation: "丛林", hint: "热带密林" },
    { word: "desert", translation: "沙漠", hint: "干燥少雨的地区" },
    { word: "island", translation: "岛屿", hint: "被水环绕的陆地" },
    { word: "spider", translation: "蜘蛛", hint: "八条腿的节肢动物" },
    { word: "zombie", translation: "僵尸", hint: "游戏中的怪物" },
    { word: "shield", translation: "盾牌", hint: "防御武器" },
    { word: "potion", translation: "药水", hint: "有魔法效果的液体" },
    { word: "portal", translation: "传送门", hint: "传送到另一地方的门" },
  ],
  5: [
    { word: "crafting", translation: "合成", hint: "用材料制作物品" },
    { word: "survival", translation: "生存", hint: "在困难中存活" },
    { word: "skeleton", translation: "骷髅", hint: "骨头组成的生物" },
    { word: "treasure", translation: "宝藏", hint: "珍贵的财宝" },
    { word: "darkness", translation: "黑暗", hint: "没有光的状态" },
    { word: "guardian", translation: "守护者", hint: "保护某物的人或生物" },
    { word: "material", translation: "材料", hint: "制作物品所需的东西" },
    { word: "mountain", translation: "山脉", hint: "高大的地形" },
    { word: "powerful", translation: "强大的", hint: "有很强能力" },
    { word: "champion", translation: "冠军", hint: "竞赛中获胜者" },
    { word: "explorer", translation: "探险家", hint: "探索未知地方的人" },
    { word: "enchant", translation: "附魔", hint: "给物品增加魔法" },
    { word: "dungeon", translation: "地牢", hint: "地下监狱或关卡" },
    { word: "villager", translation: "村民", hint: "住在村庄的人" },
    { word: "creative", translation: "创造的", hint: "有创意的模式" },
  ]
};

// 根据关卡获取单词列表
function getWordsForLevel(level) {
  const lvl = Math.min(Math.ceil(level / 5), 5);
  const words = WORD_LEVELS[lvl] || WORD_LEVELS[1];
  // 随机打乱
  return [...words].sort(() => Math.random() - 0.5);
}

// 生成方块的字母选项（正确答案 + 干扰字母）
function generateLetterOptions(word, count = 8) {
  const wordLetters = word.toUpperCase().split('');
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const options = new Set(wordLetters);

  while (options.size < count) {
    const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
    options.add(randomLetter);
  }

  return [...options].sort(() => Math.random() - 0.5);
}
