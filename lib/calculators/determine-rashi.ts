export function determineRashi(month: number, day: number) {
  const ranges = [
    { sign: 'Mesha', start: [3, 21], end: [4, 19] },
    { sign: 'Vrishabha', start: [4, 20], end: [5, 20] },
    { sign: 'Mithuna', start: [5, 21], end: [6, 20] },
    { sign: 'Karka', start: [6, 21], end: [7, 22] },
    { sign: 'Simha', start: [7, 23], end: [8, 22] },
    { sign: 'Kanya', start: [8, 23], end: [9, 22] },
    { sign: 'Tula', start: [9, 23], end: [10, 22] },
    { sign: 'Vrishchika', start: [10, 23], end: [11, 21] },
    { sign: 'Dhanu', start: [11, 22], end: [12, 21] },
    { sign: 'Makara', start: [12, 22], end: [1, 19] },
    { sign: 'Kumbha', start: [1, 20], end: [2, 18] },
    { sign: 'Meena', start: [2, 19], end: [3, 20] },
  ];

  for (const range of ranges) {
    const [startMonth, startDay] = range.start;
    const [endMonth, endDay] = range.end;
    const afterStart = month > startMonth || (month === startMonth && day >= startDay);
    const beforeEnd = month < endMonth || (month === endMonth && day <= endDay);
    if (range.start[0] === 12 && range.end[0] === 1) {
      if (month === 12 || month === 1) {
        const inRange =
          (month === 12 && day >= startDay) || (month === 1 && day <= endDay);
        if (inRange) return range.sign;
      }
      continue;
    }
    if (afterStart && beforeEnd) return range.sign;
  }

  return 'Unknown';
}
