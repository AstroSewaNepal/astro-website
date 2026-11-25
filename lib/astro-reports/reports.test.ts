import { describe, expect, it } from 'vitest';

import {
  formatTime12h,
  historyPath,
  kundaliPrefill,
  kundaliToStored,
  matchPrefill,
  matchScoreLabel,
  matchToStored,
  nextHistoryPage,
  reportEditPath,
  reportPath,
  toKundaliRow,
  toMatchRow,
  type SavedKundali,
  type SavedMatch,
} from './reports';

// Shapes as the backend answered them on 2026-11-25 (local run against the test DB).
const kundali: SavedKundali = {
  _id: 'k1',
  userInfo: { fullName: 'Report Tester' },
  query: {
    lat: 27.7172 as unknown as string,
    lon: 85.324 as unknown as string,
    time: '15:10',
    date: '25-10-2002',
    offset: '+05:45',
    location: 'Kathmandu, Bagmati, Nepal',
    fullName: 'Rani Maya',
    gender: 'FEMALE',
  },
  createdAt: '2026-11-25T04:19:20.549Z',
};

const match: SavedMatch = {
  _id: 'm1',
  query: {
    manLat: 27.7172,
    manLon: 85.324,
    manDate: '25-10-1992',
    manTime: '14:30',
    manOffset: '+05:45',
    manLocation: 'Kathmandu, Bagmati, Nepal',
    manName: 'Raja Babu',
    manGender: 'male',
    womanLat: 28.2096,
    womanLon: 83.9856,
    womanDate: '11-03-1994',
    womanTime: '11:15',
    womanOffset: '+05:45',
    womanLocation: 'Pokhara, Gandaki, Nepal',
    womanName: 'Rani Maiya',
    womanGender: 'female',
  },
  result: {
    matchReport: {
      KutaScore: 40,
      Summary: { ScoreSummary: 'Average relationship, equal good and bad' },
    },
  },
};

describe('history paths', () => {
  it('always asks for the light summary list', () => {
    expect(historyPath('kundali', 2, '')).toBe(
      '/vedastro/free-kundali/bundle/history?page=2&limit=10&view=summary',
    );
    expect(historyPath('match', 1, '  rani ')).toBe(
      '/vedastro/kundali-matching/bundle/history?page=1&limit=10&view=summary&search=rani',
    );
  });

  it('stops after a short page (the routes send no total)', () => {
    expect(nextHistoryPage(10, 1)).toBe(2);
    expect(nextHistoryPage(3, 2)).toBeUndefined();
    expect(nextHistoryPage(0, 1)).toBeUndefined();
  });

  it('builds report links', () => {
    expect(reportPath('match', 'm1')).toBe('/client/reports/match/m1');
    expect(reportEditPath('kundali', 'k1')).toBe('/client/reports/kundali/k1/edit');
  });
});

describe('kundali rows', () => {
  it('lists the saved person, not the account holder', () => {
    expect(toKundaliRow(kundali)).toEqual({
      id: 'k1',
      name: 'Rani Maya',
      date: '25-10-2002',
      time: '15:10',
      gender: 'female',
      place: 'Kathmandu, Bagmati, Nepal',
    });
  });

  it('falls back to the account holder for reports saved without a name (older ones, the app)', () => {
    const old: SavedKundali = {
      _id: 'k0',
      userInfo: { fullName: 'Nibar', gender: 'MALE' },
      query: { date: '01/02/1990', time: '06:05', location: 'Butwal' },
    };
    expect(toKundaliRow(old)).toMatchObject({ name: 'Nibar', gender: 'male', date: '01-02-1990' });
  });

  it('turns a saved kundali back into what the result page draws', () => {
    const full: SavedKundali = {
      ...kundali,
      result: { panchanga: { PanchangaTable: {} }, planetRows: [['Sun']], doshas: {} as never },
    };
    expect(kundaliToStored(full)).toMatchObject({
      fullName: 'Rani Maya',
      dateOfBirth: '25-10-2002',
      birthTime: '15:10',
      gender: 'female',
      latitude: '27.7172',
      longitude: '85.324',
      payload: { calculator: 'AllTimeData', payload: { PanchangaTable: {} } },
      planetRows: [['Sun']],
      savedId: 'k1',
    });
    expect(kundaliToStored(kundali)).toBeNull();
  });

  it('prefills the edit form, keeping the saved place coordinates', () => {
    expect(kundaliPrefill(kundali)).toEqual({
      fullName: 'Rani Maya',
      dateOfBirth: '25-10-2002',
      time: { hh: '03', mm: '10', ampm: 'pm' },
      birthPlace: 'Kathmandu, Bagmati, Nepal',
      gender: 'female',
      geo: {
        lat: '27.7172',
        lon: '85.324',
        offset: '+05:45',
        location: 'Kathmandu, Bagmati, Nepal',
      },
    });
  });

  it('drops the saved coordinates when the offset is missing (they would be geocoded again)', () => {
    const noOffset: SavedKundali = { ...kundali, query: { ...kundali.query, offset: undefined } };
    expect(kundaliPrefill(noOffset).geo).toBeNull();
  });
});

describe('match rows', () => {
  it('lists both names and the score', () => {
    const row = toMatchRow(match);
    expect(row).toEqual({
      id: 'm1',
      manName: 'Raja Babu',
      womanName: 'Rani Maiya',
      date: '25-10-1992',
      time: '14:30',
      place: 'Kathmandu, Bagmati, Nepal',
      score: 40,
      scoreSummary: 'Average relationship, equal good and bad',
    });
    expect(matchScoreLabel(row)).toBe('40% · 14.4/36 · Average relationship, equal good and bad');
  });

  it('shows no score when there is none', () => {
    expect(matchScoreLabel({ score: null, scoreSummary: 'x' })).toBe('');
    expect(matchScoreLabel({ score: 120, scoreSummary: '' })).toBe('100% · 36/36');
  });

  it('needs the full result to reopen a match', () => {
    expect(matchToStored(match)).toBeNull();
    const full: SavedMatch = {
      ...match,
      result: {
        ...match.result,
        man: { panchanga: 'm', planetRows: [], doshas: {} as never },
        woman: { panchanga: 'w', planetRows: [], doshas: {} as never },
        manChartSvg: '<svg/>',
        womanChartSvg: '<svg/>',
      },
    };
    expect(matchToStored(full)).toMatchObject({
      man: {
        fullName: 'Raja Babu',
        dateOfBirth: '25-10-1992',
        gender: 'male',
        latitude: '27.7172',
      },
      woman: { fullName: 'Rani Maiya', birthPlace: 'Pokhara, Gandaki, Nepal', gender: 'female' },
      manPayload: { calculator: 'AllTimeData', payload: 'm' },
      womanLagnaSvg: '<svg/>',
      savedId: 'm1',
    });
  });

  it('prefills both people', () => {
    const { man, woman } = matchPrefill(match);
    expect(man).toMatchObject({ fullName: 'Raja Babu', time: { hh: '02', mm: '30', ampm: 'pm' } });
    expect(woman).toMatchObject({
      gender: 'female',
      time: { hh: '11', mm: '15', ampm: 'am' },
      geo: {
        lat: '28.2096',
        lon: '83.9856',
        offset: '+05:45',
        location: 'Pokhara, Gandaki, Nepal',
      },
    });
  });
});

describe('formatTime12h', () => {
  it('formats like the app list', () => {
    expect(formatTime12h('03:10')).toBe('03:10 AM');
    expect(formatTime12h('12:00')).toBe('12:00 PM');
    expect(formatTime12h('00:05')).toBe('12:05 AM');
    expect(formatTime12h('23:59')).toBe('11:59 PM');
    expect(formatTime12h('soon')).toBe('soon');
  });
});
