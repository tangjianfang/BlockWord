// BlockWord 英语单词数据库
// 按难度分级，每个单词包含：word(单词), translation(中文释义), hint(提示),
//   sentence(情景例句，___代表空白), mob(对应敌人类型)

const WORD_LEVELS = {
  1: [
    { word: "cat",  translation: "猫",   hint: "一种常见的宠物",     sentence: "The ___ sat on the warm mat.",            mob: "zombie" },
    { word: "dog",  translation: "狗",   hint: "人类的好朋友",       sentence: "The ___ barked to warn the villager.",    mob: "zombie" },
    { word: "sun",  translation: "太阳", hint: "天空中发光的星球",   sentence: "The ___ rises in the east each morning.", mob: "zombie" },
    { word: "run",  translation: "跑",   hint: "快速移动",           sentence: "You must ___ from the creeper fast!",     mob: "zombie" },
    { word: "eat",  translation: "吃",   hint: "摄取食物的动作",     sentence: "___ some food to restore your hearts.",   mob: "zombie" },
    { word: "big",  translation: "大的", hint: "尺寸较大",           sentence: "The ___ dragon blocked the gate.",        mob: "zombie" },
    { word: "red",  translation: "红色", hint: "血液的颜色",         sentence: "The ___ mushroom glows in the cave.",     mob: "zombie" },
    { word: "hot",  translation: "热的", hint: "高温",               sentence: "Lava is very ___ — don't fall in!",       mob: "zombie" },
    { word: "sky",  translation: "天空", hint: "头顶上方",           sentence: "The ___ turns dark red before a storm.",  mob: "zombie" },
    { word: "fly",  translation: "飞",   hint: "鸟类的移动方式",     sentence: "Bats ___ through the dark cave at night.",mob: "zombie" },
    { word: "box",  translation: "盒子", hint: "用来装东西的容器",   sentence: "Open the ___ to find a surprise inside.", mob: "zombie" },
    { word: "map",  translation: "地图", hint: "显示地形的图",       sentence: "Use the ___ to find the hidden dungeon.",  mob: "zombie" },
    { word: "cup",  translation: "杯子", hint: "喝水用的器具",       sentence: "Fill your ___ from the clear river.",     mob: "zombie" },
    { word: "pen",  translation: "钢笔", hint: "书写工具",           sentence: "Write the spell with a magic ___.",       mob: "zombie" },
    { word: "bed",  translation: "床",   hint: "睡觉的家具",         sentence: "Sleep in a ___ to skip the dark night.",  mob: "zombie" },
  ],
  2: [
    { word: "tree", translation: "树",   hint: "有树干和树枝的植物", sentence: "Chop the ___ to collect wood blocks.",     mob: "spider" },
    { word: "bird", translation: "鸟",   hint: "有翅膀会飞的动物",   sentence: "A ___ sang from the top of the tower.",   mob: "spider" },
    { word: "book", translation: "书",   hint: "用来阅读的物品",     sentence: "Read the spell ___ by candlelight.",      mob: "spider" },
    { word: "fish", translation: "鱼",   hint: "生活在水中的动物",   sentence: "Catch a ___ in the river to cook.",       mob: "spider" },
    { word: "jump", translation: "跳",   hint: "离地腾空的动作",     sentence: "___ over the fence to escape!",           mob: "spider" },
    { word: "blue", translation: "蓝色", hint: "天空和海洋的颜色",   sentence: "The ___ ocean stretches to the horizon.", mob: "spider" },
    { word: "play", translation: "玩耍", hint: "娱乐活动",           sentence: "We ___ games after clearing the dungeon.",mob: "spider" },
    { word: "rain", translation: "雨",   hint: "从云中落下的水",     sentence: "The ___ fills the empty lake with water.",mob: "zombie" },
    { word: "wind", translation: "风",   hint: "流动的空气",         sentence: "The ___ blew away the dry leaves.",       mob: "zombie" },
    { word: "milk", translation: "牛奶", hint: "白色的营养饮料",     sentence: "Drink ___ from the cow to heal yourself.", mob: "zombie" },
    { word: "door", translation: "门",   hint: "进出房间的入口",     sentence: "Open the iron ___ and enter the castle.",  mob: "spider" },
    { word: "hand", translation: "手",   hint: "人体上肢末端",       sentence: "Reach out your ___ and grab the torch.",  mob: "zombie" },
    { word: "food", translation: "食物", hint: "可以吃的东西",       sentence: "___ keeps your hearts from dropping.",    mob: "spider" },
    { word: "song", translation: "歌曲", hint: "有节奏有旋律的声音", sentence: "Sing a ___ to calm the frightened villagers.", mob: "zombie" },
    { word: "time", translation: "时间", hint: "小时、分钟、秒",     sentence: "There is no ___ to waste — fight now!",   mob: "spider" },
  ],
  3: [
    { word: "house", translation: "房子", hint: "人们居住的建筑",   sentence: "Build a ___ before the night comes.",      mob: "skeleton" },
    { word: "water", translation: "水",   hint: "生命之源",         sentence: "___ stops the fire from spreading fast.",  mob: "skeleton" },
    { word: "grass", translation: "草",   hint: "绿色的植物",       sentence: "Walk on the ___ block to find seeds.",     mob: "skeleton" },
    { word: "stone", translation: "石头", hint: "坚硬的矿物",       sentence: "Mine ___ to craft stronger tools.",        mob: "skeleton" },
    { word: "sword", translation: "剑",   hint: "古代武器",         sentence: "Craft a ___ to defeat the zombie.",        mob: "skeleton" },
    { word: "chest", translation: "箱子", hint: "储物容器",         sentence: "The ___ is full of rare gems and gold.",   mob: "skeleton" },
    { word: "craft", translation: "制作", hint: "创造物品的过程",   sentence: "___ a pickaxe at the workbench.",          mob: "skeleton" },
    { word: "night", translation: "夜晚", hint: "太阳落山后",       sentence: "Monsters spawn during the dark ___.",      mob: "skeleton" },
    { word: "light", translation: "光",   hint: "照明能源",         sentence: "Place a torch to create ___ in the cave.", mob: "creeper" },
    { word: "power", translation: "力量", hint: "能力或电力",       sentence: "Diamond armor gives you incredible ___.",  mob: "skeleton" },
    { word: "world", translation: "世界", hint: "地球上所有地方",   sentence: "Explore the ___ to find new biomes.",      mob: "skeleton" },
    { word: "block", translation: "方块", hint: "正方形的物体",     sentence: "Place a ___ to build your shelter.",       mob: "skeleton" },
    { word: "build", translation: "建造", hint: "构建某物",         sentence: "___ a tall wall to keep monsters out.",    mob: "creeper" },
    { word: "apple", translation: "苹果", hint: "红色或绿色的水果", sentence: "A golden ___ grants you extra hearts.",    mob: "skeleton" },
    { word: "horse", translation: "马",   hint: "古代交通工具",     sentence: "Ride a ___ to travel across the plains.",  mob: "skeleton" },
  ],
  4: [
    { word: "dragon", translation: "龙",     hint: "神话中的生物",         sentence: "The ___ guards the end portal.",          mob: "creeper" },
    { word: "castle", translation: "城堡",   hint: "古代贵族的居所",       sentence: "The king rules from a stone ___.",        mob: "creeper" },
    { word: "forest", translation: "森林",   hint: "密集的树木地带",       sentence: "A witch hides deep in the dark ___.",     mob: "creeper" },
    { word: "mining", translation: "挖矿",   hint: "开采矿产的活动",       sentence: "___ deep caves reveals rare diamonds.",   mob: "blaze"   },
    { word: "battle", translation: "战斗",   hint: "战争或竞争",           sentence: "Prepare your armor for the final ___.",   mob: "blaze"   },
    { word: "golden", translation: "金色的", hint: "像黄金一样的颜色",     sentence: "The ___ apple grants you extra hearts.", mob: "creeper" },
    { word: "rocket", translation: "火箭",   hint: "用于太空旅行",         sentence: "Launch a ___ to glide with an elytra.",   mob: "blaze"   },
    { word: "jungle", translation: "丛林",   hint: "热带密林",             sentence: "Explore the ___ for hidden temples.",     mob: "creeper" },
    { word: "desert", translation: "沙漠",   hint: "干燥少雨的地区",       sentence: "Sandstone buildings fill the ___ biome.", mob: "creeper" },
    { word: "island", translation: "岛屿",   hint: "被水环绕的陆地",       sentence: "Sail to the ___ and find rare treasure.",  mob: "blaze"   },
    { word: "spider", translation: "蜘蛛",   hint: "八条腿的节肢动物",     sentence: "The ___ shoots webs to slow you down.",   mob: "creeper" },
    { word: "zombie", translation: "僵尸",   hint: "游戏中的怪物",         sentence: "A ___ groans as it shambles toward you.", mob: "blaze"   },
    { word: "shield", translation: "盾牌",   hint: "防御武器",             sentence: "Raise your ___ to block the arrow.",      mob: "creeper" },
    { word: "potion", translation: "药水",   hint: "有魔法效果的液体",     sentence: "Drink the ___ of strength before battle.", mob: "blaze"  },
    { word: "portal", translation: "传送门", hint: "传送到另一地方的门",   sentence: "Step through the ___ to reach the Nether.", mob: "creeper"},
  ],
  5: [
    { word: "crafting",  translation: "合成",   hint: "用材料制作物品",       sentence: "Use the ___ table to make powerful tools.", mob: "enderman" },
    { word: "survival",  translation: "生存",   hint: "在困难中存活",         sentence: "___ mode tests all of your true skills.",   mob: "enderman" },
    { word: "skeleton",  translation: "骷髅",   hint: "骨头组成的生物",       sentence: "A ___ fires arrows from the dark shadows.", mob: "enderman" },
    { word: "treasure",  translation: "宝藏",   hint: "珍贵的财宝",           sentence: "Dig deep to uncover the buried ___.",       mob: "enderman" },
    { word: "darkness",  translation: "黑暗",   hint: "没有光的状态",         sentence: "A torch cuts through the cold ___.",        mob: "enderman" },
    { word: "guardian",  translation: "守护者", hint: "保护某物的人或生物",   sentence: "The ___ patrols the ocean monument.",       mob: "enderman" },
    { word: "material",  translation: "材料",   hint: "制作物品所需的东西",   sentence: "Collect every ___ to craft powerful gear.", mob: "enderman" },
    { word: "mountain",  translation: "山脉",   hint: "高大的地形",           sentence: "Climb the ___ to find rare emerald ore.",   mob: "enderman" },
    { word: "powerful",  translation: "强大的", hint: "有很强能力",           sentence: "Enchanted armor makes you truly ___.",       mob: "enderman" },
    { word: "champion",  translation: "冠军",   hint: "竞赛中获胜者",         sentence: "Defeat the ender dragon to be ___.",        mob: "enderman" },
    { word: "explorer",  translation: "探险家", hint: "探索未知地方的人",     sentence: "An ___ never fears the unknown biome.",     mob: "enderman" },
    { word: "enchant",   translation: "附魔",   hint: "给物品增加魔法",       sentence: "___ your sword with Sharpness V now.",      mob: "enderman" },
    { word: "dungeon",   translation: "地牢",   hint: "地下监狱或关卡",       sentence: "A ___ hides a chest with rare loot.",       mob: "enderman" },
    { word: "villager",  translation: "村民",   hint: "住在村庄的人",         sentence: "Trade your emeralds with the ___.",         mob: "enderman" },
    { word: "creative",  translation: "创造的", hint: "有创意的模式",         sentence: "___ mode lets you build without limits.",   mob: "enderman" },
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
