// BlockWord 英语单词数据库
// 按难度分级，对应深圳中小学英语课程标准（人教版PEP）
//   Level 1 = 小学3-4年级  Level 2 = 小学5-6年级
//   Level 3 = 初中7年级    Level 4 = 初中8年级    Level 5 = 初中9年级
// 每个单词包含：word(单词), translation(中文释义), hint(提示),
//   sentence(情景例句，___代表空白), mob(对应敌人类型)

const WORD_LEVELS = {
  // ── Level 1  小学3-4年级 ── 主题：动物、颜色、身体、日常物品、基础动词
  1: [
    { word: "cat",  translation: "猫",   hint: "一种常见的宠物",       sentence: "My ___ likes to drink warm milk every day.",  mob: "zombie" },
    { word: "dog",  translation: "狗",   hint: "人类的好朋友",         sentence: "The ___ wags its tail when I come home.",     mob: "zombie" },
    { word: "sun",  translation: "太阳", hint: "天空中发光的星球",     sentence: "The ___ rises in the east each morning.",     mob: "zombie" },
    { word: "run",  translation: "跑",   hint: "比走路快的移动方式",   sentence: "We ___ to school when we are late.",          mob: "zombie" },
    { word: "eat",  translation: "吃",   hint: "把食物放入口中的动作", sentence: "We ___ breakfast together every morning.",    mob: "zombie" },
    { word: "big",  translation: "大的", hint: "尺寸较大",             sentence: "The ___ tree in our yard gives good shade.",  mob: "zombie" },
    { word: "red",  translation: "红色", hint: "苹果和草莓的颜色",     sentence: "The traffic light turns ___ and we stop.",    mob: "zombie" },
    { word: "hot",  translation: "热的", hint: "高温，不能用手触碰",   sentence: "Be careful — the soup is very ___!",          mob: "zombie" },
    { word: "sky",  translation: "天空", hint: "头顶上方的广阔空间",   sentence: "Look at the ___ — it is so blue today!",      mob: "zombie" },
    { word: "fly",  translation: "飞",   hint: "鸟类和飞机的移动方式", sentence: "Birds ___ south when winter comes.",          mob: "zombie" },
    { word: "bag",  translation: "书包", hint: "上学背的包",           sentence: "I put all my books into my school ___.",      mob: "zombie" },
    { word: "face", translation: "脸",   hint: "头部的前方",           sentence: "Wash your ___ before you go to school.",     mob: "zombie" },
    { word: "cup",  translation: "杯子", hint: "喝水用的器具",         sentence: "Pour the hot tea into the ___ carefully.",   mob: "zombie" },
    { word: "pen",  translation: "钢笔", hint: "书写工具",             sentence: "Use a ___ to write neatly in your notebook.", mob: "zombie" },
    { word: "bed",  translation: "床",   hint: "睡觉的家具",           sentence: "Make your ___ every morning before class.",   mob: "zombie" },
  ],
  // ── Level 2  小学5-6年级 ── 主题：自然、学校、运动、食物、日常活动
  2: [
    { word: "tree", translation: "树",   hint: "有树干和树枝的植物",   sentence: "We planted a ___ in the school garden.",      mob: "spider" },
    { word: "bird", translation: "鸟",   hint: "有翅膀会飞的动物",     sentence: "A ___ sang outside my window this morning.",  mob: "spider" },
    { word: "book", translation: "书",   hint: "用来阅读学习的物品",   sentence: "I borrowed a ___ from the school library.",   mob: "spider" },
    { word: "fish", translation: "鱼",   hint: "生活在水中的动物",     sentence: "We saw colourful ___ at the aquarium trip.",  mob: "spider" },
    { word: "jump", translation: "跳",   hint: "离地腾空的动作",       sentence: "___ rope is a popular sport at recess.",      mob: "spider" },
    { word: "blue", translation: "蓝色", hint: "天空和海洋的颜色",     sentence: "The ___ sky reflects on the calm river.",     mob: "spider" },
    { word: "play", translation: "玩耍", hint: "娱乐活动",             sentence: "We ___ basketball in the school yard.",       mob: "spider" },
    { word: "rain", translation: "雨",   hint: "从云中落下的水",       sentence: "Bring an umbrella when it starts to ___.",    mob: "zombie" },
    { word: "wind", translation: "风",   hint: "流动的空气",           sentence: "The ___ blows the leaves off the trees.",     mob: "zombie" },
    { word: "milk", translation: "牛奶", hint: "白色的营养饮料",       sentence: "Drink a glass of ___ every day to grow.",     mob: "zombie" },
    { word: "door", translation: "门",   hint: "进出房间的入口",       sentence: "Open the classroom ___ for your teacher.",    mob: "spider" },
    { word: "hand", translation: "手",   hint: "人体上肢末端",         sentence: "Raise your ___ if you know the answer.",      mob: "zombie" },
    { word: "food", translation: "食物", hint: "可以吃的东西",         sentence: "Healthy ___ helps us stay strong and fit.",   mob: "spider" },
    { word: "song", translation: "歌曲", hint: "有节奏有旋律的声音",   sentence: "Our class learned a new English ___ today.",  mob: "zombie" },
    { word: "time", translation: "时间", hint: "小时、分钟、秒",       sentence: "It is ___ for class — please sit down now.",  mob: "spider" },
  ],
  // ── Level 3  初中7年级 ── 主题：家庭、学校生活、环境、健康、运动
  3: [
    { word: "house", translation: "房子", hint: "人们居住的建筑",       sentence: "My ___ has three bedrooms and a garden.",     mob: "skeleton" },
    { word: "water", translation: "水",   hint: "生命之源，无色无味",   sentence: "Drink enough ___ to stay healthy each day.",  mob: "skeleton" },
    { word: "grass", translation: "草",   hint: "绿色的植物，覆盖地面", sentence: "The ___ on the sports field turns green in spring.", mob: "skeleton" },
    { word: "stone", translation: "石头", hint: "坚硬的矿物",           sentence: "The ancient city wall is made of ___ blocks.", mob: "skeleton" },
    { word: "sport", translation: "运动", hint: "体育锻炼活动",         sentence: "Basketball is my favourite ___ after school.", mob: "skeleton" },
    { word: "class", translation: "班级", hint: "同学一起上课的地方",   sentence: "Our English ___ starts at eight o'clock.",    mob: "skeleton" },
    { word: "clean", translation: "打扫", hint: "清洁、擦干净",         sentence: "We ___ the classroom together before going home.", mob: "skeleton" },
    { word: "night", translation: "夜晚", hint: "太阳落山后的时段",     sentence: "Study in the daytime and rest well at ___.",  mob: "skeleton" },
    { word: "light", translation: "光",   hint: "照明能源",             sentence: "Turn on the ___ when the room gets dark.",    mob: "creeper" },
    { word: "music", translation: "音乐", hint: "用声音表达情感的艺术", sentence: "She plays piano and loves classical ___.",     mob: "skeleton" },
    { word: "world", translation: "世界", hint: "地球上所有地方",       sentence: "Shenzhen is one of the fastest-growing cities in the ___.", mob: "skeleton" },
    { word: "river", translation: "河流", hint: "流动的淡水水体",       sentence: "We saw many fish in the clear mountain ___.", mob: "skeleton" },
    { word: "build", translation: "建造", hint: "把材料组合成建筑",     sentence: "We want to ___ a better future for ourselves.", mob: "creeper" },
    { word: "apple", translation: "苹果", hint: "红色或绿色的水果",     sentence: "An ___ a day keeps the doctor away.",         mob: "skeleton" },
    { word: "horse", translation: "马",   hint: "古代重要的交通工具",   sentence: "She learned to ride a ___ during summer camp.", mob: "skeleton" },
  ],
  // ── Level 4  初中8年级 ── 主题：地理、科技、社会、自然科学
  4: [
    { word: "dragon", translation: "龙",   hint: "中国文化中的神话生物",   sentence: "The ___ is an important symbol in Chinese culture.", mob: "creeper" },
    { word: "castle", translation: "城堡", hint: "古代贵族的居所",         sentence: "We visited an old ___ during the history trip.",   mob: "creeper" },
    { word: "forest", translation: "森林", hint: "密集的树木地带",         sentence: "A healthy ___ provides a home for many animals.",  mob: "creeper" },
    { word: "market", translation: "市场", hint: "买卖商品的地方",         sentence: "My mother goes to the ___ every weekend.",         mob: "blaze"   },
    { word: "battle", translation: "战斗", hint: "战争中的激烈对抗",       sentence: "The heroes won the ___ after fighting bravely.",   mob: "blaze"   },
    { word: "garden", translation: "花园", hint: "种植花草的地方",         sentence: "We grow vegetables in the school ___.",            mob: "creeper" },
    { word: "rocket", translation: "火箭", hint: "用于太空旅行的飞行器",   sentence: "China launched a ___ to the moon this year.",      mob: "blaze"   },
    { word: "jungle", translation: "丛林", hint: "热带密林",               sentence: "The ___ in Yunnan is full of rare plants.",        mob: "creeper" },
    { word: "desert", translation: "沙漠", hint: "干燥少雨的地区",         sentence: "The Gobi ___ is one of the largest in Asia.",      mob: "creeper" },
    { word: "island", translation: "岛屿", hint: "被水环绕的陆地",         sentence: "Hainan ___ is a beautiful place to visit.",        mob: "blaze"   },
    { word: "spider", translation: "蜘蛛", hint: "八条腿的节肢动物",       sentence: "A ___ uses its silk web to catch insects.",        mob: "creeper" },
    { word: "system", translation: "系统", hint: "由多个部分组成的整体",   sentence: "The subway ___ in Shenzhen is very modern.",       mob: "blaze"   },
    { word: "shield", translation: "盾牌", hint: "防御用的器具",           sentence: "A helmet and a ___ protect a soldier in battle.",  mob: "creeper" },
    { word: "planet", translation: "星球", hint: "围绕恒星运转的天体",     sentence: "Earth is the only ___ known to support life.",     mob: "blaze"   },
    { word: "bridge", translation: "桥",   hint: "连接两岸的建筑物",       sentence: "The ___ over the Pearl River is lit up at night.", mob: "creeper" },
  ],
  // ── Level 5  初中9年级 ── 主题：文化、环境、科学、社会责任
  5: [
    { word: "culture",   translation: "文化",   hint: "一个民族的传统和风俗",   sentence: "Chinese ___ has a history of five thousand years.",      mob: "enderman" },
    { word: "survival",  translation: "生存",   hint: "在困难中活下去",         sentence: "___ skills are important when you go camping.",          mob: "enderman" },
    { word: "science",   translation: "科学",   hint: "研究自然规律的学科",     sentence: "___ helps us understand the world around us.",           mob: "enderman" },
    { word: "treasure",  translation: "宝藏",   hint: "珍贵的财富或事物",       sentence: "Books are the greatest ___ of human knowledge.",         mob: "enderman" },
    { word: "darkness",  translation: "黑暗",   hint: "没有光的状态",           sentence: "Courage means walking forward even in ___.",             mob: "enderman" },
    { word: "freedom",   translation: "自由",   hint: "不受限制地做自己的事",   sentence: "Education gives us the ___ to choose our own future.",   mob: "enderman" },
    { word: "material",  translation: "材料",   hint: "制作物品所需的物质",     sentence: "Recycle waste ___ to help protect our environment.",     mob: "enderman" },
    { word: "mountain",  translation: "山脉",   hint: "高大连绵的地形",         sentence: "We hiked up the ___ to enjoy the sunrise view.",         mob: "enderman" },
    { word: "powerful",  translation: "强大的", hint: "有很强的力量或影响力",   sentence: "A well-written speech can be very ___.",                 mob: "enderman" },
    { word: "champion",  translation: "冠军",   hint: "竞赛中的最终获胜者",     sentence: "She trained hard and became the school running ___.",    mob: "enderman" },
    { word: "explorer",  translation: "探险家", hint: "探索未知地方的人",       sentence: "An ___ never stops asking questions about the world.",   mob: "enderman" },
    { word: "climate",   translation: "气候",   hint: "某地区长期的天气特征",   sentence: "___ change is one of the biggest challenges we face.",   mob: "enderman" },
    { word: "develop",   translation: "发展",   hint: "成长、进步、扩展",       sentence: "Shenzhen continues to ___ into a global tech city.",     mob: "enderman" },
    { word: "history",   translation: "历史",   hint: "过去发生的事情",         sentence: "We can learn many important lessons from ___.",          mob: "enderman" },
    { word: "creative",  translation: "有创意的", hint: "善于创新和想象",       sentence: "Being ___ helps you solve problems in new ways.",        mob: "enderman" },
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
