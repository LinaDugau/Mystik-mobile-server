export interface TarotCard {
  number: string;
  name: string;
  symbol: string;
  meaning: string;
  interpretation: string;
}

export interface TarotSpread {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  positions: string[];
  isPremium: boolean;
}

export const TAROT_SPREADS: TarotSpread[] = [
  {
    id: "daily",
    name: "Карта дня",
    description: "Одна карта, которая покажет энергию дня",
    cardCount: 1,
    positions: ["Энергия дня"],
    isPremium: false,
  },
  {
    id: "three",
    name: "Три карты",
    description: "Прошлое, настоящее и будущее",
    cardCount: 3,
    positions: ["Прошлое", "Настоящее", "Будущее"],
    isPremium: false,
  },
  {
    id: "love",
    name: "Любовный расклад",
    description: "Ваши чувства, чувства партнера, перспективы",
    cardCount: 3,
    positions: ["Ваши чувства", "Чувства партнера", "Перспективы отношений"],
    isPremium: true,
  },
  {
    id: "career",
    name: "Карьера",
    description: "Текущая ситуация, препятствия, совет",
    cardCount: 3,
    positions: ["Текущая ситуация", "Препятствия", "Совет"],
    isPremium: true,
  },
  {
    id: "decision",
    name: "Принятие решения",
    description: "Ситуация, вариант А, вариант Б, совет",
    cardCount: 4,
    positions: ["Ситуация", "Вариант А", "Вариант Б", "Совет"],
    isPremium: true,
  },
  {
    id: "celtic",
    name: "Кельтский крест",
    description: "Полный анализ ситуации из 10 карт",
    cardCount: 10,
    positions: [
      "Текущая ситуация",
      "Препятствие",
      "Далекое прошлое",
      "Недавнее прошлое",
      "Возможное будущее",
      "Ближайшее будущее",
      "Ваш подход",
      "Внешние влияния",
      "Надежды и страхи",
      "Итоговый результат"
    ],
    isPremium: true,
  },
];

export const TAROT_CARDS: TarotCard[] = [
  {
    number: "0",
    name: "Шут",
    symbol: "🃏",
    meaning: "Новые начинания",
    interpretation: "Время для смелых решений и новых приключений. Доверьтесь своей интуиции и не бойтесь рисковать.",
  },
  {
    number: "I",
    name: "Маг",
    symbol: "🎩",
    meaning: "Сила воли",
    interpretation: "У вас есть все необходимые ресурсы для достижения цели. Время действовать решительно.",
  },
  {
    number: "II",
    name: "Верховная Жрица",
    symbol: "🔮",
    meaning: "Интуиция",
    interpretation: "Прислушайтесь к внутреннему голосу. Ответы находятся внутри вас.",
  },
  {
    number: "III",
    name: "Императрица",
    symbol: "👑",
    meaning: "Изобилие",
    interpretation: "Период роста и процветания. Творческая энергия на пике.",
  },
  {
    number: "IV",
    name: "Император",
    symbol: "⚔️",
    meaning: "Стабильность",
    interpretation: "Время для структуры и порядка. Возьмите контроль над ситуацией.",
  },
  {
    number: "V",
    name: "Иерофант",
    symbol: "📿",
    meaning: "Традиции",
    interpretation: "Обратитесь к проверенным методам и мудрости предков.",
  },
  {
    number: "VI",
    name: "Влюбленные",
    symbol: "💕",
    meaning: "Выбор сердца",
    interpretation: "Важное решение в личной жизни. Следуйте зову сердца.",
  },
  {
    number: "VII",
    name: "Колесница",
    symbol: "🏇",
    meaning: "Победа",
    interpretation: "Преодоление препятствий и движение к цели. Успех близок.",
  },
  {
    number: "VIII",
    name: "Сила",
    symbol: "🦁",
    meaning: "Внутренняя сила",
    interpretation: "Мягкая сила побеждает грубую. Терпение и настойчивость приведут к успеху.",
  },
  {
    number: "IX",
    name: "Отшельник",
    symbol: "🕯️",
    meaning: "Поиск истины",
    interpretation: "Время для размышлений и самопознания. Уединение принесет ответы.",
  },
  {
    number: "X",
    name: "Колесо Фортуны",
    symbol: "☸️",
    meaning: "Перемены",
    interpretation: "Судьба поворачивается в вашу пользу. Будьте готовы к переменам.",
  },
  {
    number: "XI",
    name: "Справедливость",
    symbol: "⚖️",
    meaning: "Баланс",
    interpretation: "Время для честности и справедливых решений. Карма работает.",
  },
  {
    number: "XII",
    name: "Повешенный",
    symbol: "🙃",
    meaning: "Жертва",
    interpretation: "Смотрите на ситуацию под другим углом. Иногда нужно отпустить.",
  },
  {
    number: "XIII",
    name: "Смерть",
    symbol: "💀",
    meaning: "Трансформация",
    interpretation: "Конец одного цикла и начало нового. Не бойтесь перемен.",
  },
  {
    number: "XIV",
    name: "Умеренность",
    symbol: "🏺",
    meaning: "Гармония",
    interpretation: "Найдите золотую середину. Терпение и умеренность - ключ к успеху.",
  },
  {
    number: "XV",
    name: "Дьявол",
    symbol: "😈",
    meaning: "Искушение",
    interpretation: "Освободитесь от зависимостей и иллюзий. Вы сильнее, чем думаете.",
  },
  {
    number: "XVI",
    name: "Башня",
    symbol: "🏰",
    meaning: "Разрушение",
    interpretation: "Внезапные перемены освобождают путь для нового. Примите неизбежное.",
  },
  {
    number: "XVII",
    name: "Звезда",
    symbol: "⭐",
    meaning: "Надежда",
    interpretation: "После бури приходит ясность. Верьте в лучшее будущее.",
  },
  {
    number: "XVIII",
    name: "Луна",
    symbol: "🌙",
    meaning: "Иллюзии",
    interpretation: "Не все так, как кажется. Доверяйте интуиции в неясных ситуациях.",
  },
  {
    number: "XIX",
    name: "Солнце",
    symbol: "☀️",
    meaning: "Радость",
    interpretation: "Период счастья и успеха. Наслаждайтесь моментом.",
  },
  {
    number: "XX",
    name: "Суд",
    symbol: "🎺",
    meaning: "Возрождение",
    interpretation: "Время подвести итоги и начать с чистого листа.",
  },
  {
    number: "XXI",
    name: "Мир",
    symbol: "🌍",
    meaning: "Завершение",
    interpretation: "Цикл завершен успешно. Празднуйте достижения и готовьтесь к новому.",
  },
];