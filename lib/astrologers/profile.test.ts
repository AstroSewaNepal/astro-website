import { describe, expect, it } from 'vitest';

import {
  averageRating,
  profileShareUrl,
  type RatingReview,
  reviewDate,
  tagNames,
  tierLabel,
  topicAverages,
} from './profile';

const review = (overall: number, topics: [string, number][], extra: Partial<RatingReview> = {}) =>
  ({
    reviewId: String(Math.random()),
    user: {},
    overallRating: overall,
    topicRatings: topics.map(([topicName, rating]) => ({ topicName, rating })),
    ...extra,
  }) as RatingReview;

describe('ratings', () => {
  it('averages overall and per topic', () => {
    const reviews = [
      review(5, [
        ['Accuracy', 5],
        ['Empathy', 4],
      ]),
      review(3, [['Accuracy', 3]]),
    ];
    expect(averageRating(reviews)).toBe(4);
    expect(topicAverages(reviews)).toEqual([
      { topic: 'Accuracy', rating: 4 },
      { topic: 'Empathy', rating: 4 },
    ]);
  });
  it('keeps a topic repeated in one review within 5', () => {
    expect(
      topicAverages([
        review(5, [
          ['Accuracy', 5],
          ['Accuracy', 5],
        ]),
      ]),
    ).toEqual([{ topic: 'Accuracy', rating: 5 }]);
  });
  it('handles no reviews', () => {
    expect(averageRating([])).toBe(0);
    expect(topicAverages([])).toEqual([]);
  });
});

describe('review dates', () => {
  it('hides day and month for private reviewers', () => {
    const at = '2026-06-19T14:45:06.979Z';
    expect(reviewDate(review(5, [], { createdAt: at, user: { hideProfile: true } }))).toBe(
      '**-**-2026',
    );
    expect(reviewDate(review(5, [], { createdAt: at }))).toBe('19 Jun 2026');
    expect(reviewDate(review(5, []))).toBe('');
  });
});

it('shows tier names as words', () => {
  expect(tierLabel('TOP_CHOICE')).toBe('Top Choice');
  expect(tierLabel('TOP RATED')).toBe('Top Rated');
  expect(tierLabel(' ')).toBeNull();
});

it('reads tags of one type', () => {
  const tags = [
    { type: 'skill', name: 'Vedic' },
    { type: 'expertise', name: 'Love' },
    { type: 'Skill', name: ' Tarot ' },
  ];
  expect(tagNames(tags, 'skill')).toEqual(['Vedic', 'Tarot']);
});

it('builds the share link', () => {
  expect(profileShareUrl('https://www.astrosewa.com/', 'abc')).toBe(
    'https://www.astrosewa.com/astrologer-profile/abc',
  );
});
