// Утилиты для расчета матрицы судьбы

export interface MatrixPoint {
  value: number;
  locked?: boolean;
}

export interface MatrixData {
  points: MatrixPoint[];
  purposes: {
    skypoint: number;
    earthpoint: number;
    perspurpose: number;
    femalepoint: number;
    malepoint: number;
    socialpurpose: number;
    generalpurpose: number;
    planetarypurpose: number;
  };
  chartHeart: {
    sahphysics: number;
    ajphysics: number;
    vishphysics: number;
    anahphysics: number;
    manphysics: number;
    svadphysics: number;
    mulphysics: number;
    sahenergy: number;
    ajenergy: number;
    vishenergy: number;
    anahenergy: number;
    manenergy: number;
    svadenergy: number;
    mulenergy: number;
    sahemotions: number;
    ajemotions: number;
    vishemotions: number;
    anahemotions: number;
    manemotions: number;
    svademotions: number;
    mulemotions: number;
  };
}

// Приводит число к диапазону 1-22
export const reduceNumber = (number: number): number => {
  let num = number;
  if (number > 22) {
    num = (number % 10) + Math.floor(number / 10);
  }
  return num;
};

// Вычисляет сумму цифр года
export const calculateYear = (year: number): number => {
  let y = 0;
  while (year > 0) {
    y += year % 10;
    year = Math.floor(year / 10);
  }
  y = reduceNumber(y);
  return y;
};

// Основная функция расчета матрицы судьбы
export const calculateDestinyMatrix = (birthDate: string): MatrixData => {
  const [year, month, day] = birthDate.split('-').map(Number);
  
  const apoint = reduceNumber(day);
  const bpoint = month;
  const cpoint = calculateYear(year);
  
  const dpoint = reduceNumber(apoint + bpoint + cpoint);
  const epoint = reduceNumber(apoint + bpoint + cpoint + dpoint);
  const fpoint = reduceNumber(apoint + bpoint);
  const gpoint = reduceNumber(bpoint + cpoint);
  const hpoint = reduceNumber(dpoint + apoint);
  const ipoint = reduceNumber(cpoint + dpoint);
  const jpoint = reduceNumber(dpoint + epoint);
  
  const npoint = reduceNumber(cpoint + epoint);
  const lpoint = reduceNumber(jpoint + npoint);
  const mpoint = reduceNumber(lpoint + npoint);
  const kpoint = reduceNumber(jpoint + lpoint);
  
  const qpoint = reduceNumber(npoint + cpoint);
  const rpoint = reduceNumber(jpoint + dpoint);
  const spoint = reduceNumber(apoint + epoint);
  const tpoint = reduceNumber(bpoint + epoint);
  
  const opoint = reduceNumber(apoint + spoint);
  const ppoint = reduceNumber(bpoint + tpoint);
  
  const upoint = reduceNumber(fpoint + gpoint + hpoint + ipoint);
  const vpoint = reduceNumber(epoint + upoint);
  const wpoint = reduceNumber(spoint + epoint);
  const xpoint = reduceNumber(tpoint + epoint);
  
  const f2point = reduceNumber(fpoint + upoint);
  const f1point = reduceNumber(fpoint + f2point);
  const g2point = reduceNumber(gpoint + upoint);
  const g1point = reduceNumber(gpoint + g2point);
  const i2point = reduceNumber(ipoint + upoint);
  const i1point = reduceNumber(ipoint + i2point);
  const h2point = reduceNumber(hpoint + upoint);
  const h1point = reduceNumber(hpoint + h2point);
  
  // Предназначения
  const skypoint = reduceNumber(bpoint + dpoint);
  const earthpoint = reduceNumber(apoint + cpoint);
  const perspurpose = reduceNumber(skypoint + earthpoint);
  const femalepoint = reduceNumber(gpoint + hpoint);
  const malepoint = reduceNumber(fpoint + ipoint);
  const socialpurpose = reduceNumber(femalepoint + malepoint);
  const generalpurpose = reduceNumber(perspurpose + socialpurpose);
  const planetarypurpose = reduceNumber(socialpurpose + generalpurpose);
  
  // Чакры сердца
  const chartHeart = {
    sahphysics: apoint,
    ajphysics: opoint,
    vishphysics: spoint,
    anahphysics: wpoint,
    manphysics: epoint,
    svadphysics: jpoint,
    mulphysics: cpoint,
    
    sahenergy: bpoint,
    ajenergy: ppoint,
    vishenergy: tpoint,
    anahenergy: xpoint,
    manenergy: epoint,
    svadenergy: npoint,
    mulenergy: dpoint,
    
    sahemotions: reduceNumber(apoint + bpoint),
    ajemotions: reduceNumber(opoint + ppoint),
    vishemotions: reduceNumber(spoint + tpoint),
    anahemotions: reduceNumber(wpoint + xpoint),
    manemotions: reduceNumber(epoint + epoint),
    svademotions: reduceNumber(jpoint + npoint),
    mulemotions: reduceNumber(cpoint + dpoint),
  };
  
  // Массив точек матрицы (индексы соответствуют позициям в SVG)
  const points: MatrixPoint[] = [
    { value: epoint }, // 0 - E (центр)
    { value: apoint }, // 1 - A (день)
    { value: bpoint }, // 2 - B (месяц)
    { value: cpoint }, // 3 - C (год)
    { value: dpoint }, // 4 - D
    { value: fpoint }, // 5 - F
    { value: gpoint }, // 6 - G
    { value: ipoint }, // 7 - I
    { value: hpoint }, // 8 - H
    { value: spoint }, // 9 - S
    { value: tpoint }, // 10 - T
    { value: npoint }, // 11 - N
    { value: jpoint }, // 12 - J
    { value: wpoint }, // 13 - W
    { value: xpoint }, // 14 - X
    { value: lpoint }, // 15 - L
    { value: kpoint }, // 16 - K
    { value: opoint }, // 17 - O
    { value: ppoint }, // 18 - P
    { value: qpoint }, // 19 - Q
    { value: rpoint }, // 20 - R
    { value: mpoint }, // 21 - M (не используется в текущей версии)
    { value: vpoint }, // 22 - V (не используется в текущей версии)
    { value: upoint }, // 23 - U (не используется в текущей версии)
    { value: 0 }, // 24 - заполнитель
    { value: mpoint }, // 25 - M
    { value: f1point }, // 26 - F1
    { value: f2point }, // 27 - F2
    { value: g1point }, // 28 - G1
    { value: g2point }, // 29 - G2
    { value: i1point }, // 30 - I1
    { value: i2point }, // 31 - I2
    { value: h1point }, // 32 - H1
    { value: h2point }, // 33 - H2
    { value: upoint }, // 34 - U
    { value: vpoint }, // 35 - V
  ];
  
  return {
    points,
    purposes: {
      skypoint,
      earthpoint,
      perspurpose,
      femalepoint,
      malepoint,
      socialpurpose,
      generalpurpose,
      planetarypurpose,
    },
    chartHeart,
  };
};
