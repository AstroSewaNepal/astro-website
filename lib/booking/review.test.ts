import { describe, expect, it } from 'vitest';

import { allRated, reviewPayload } from '@/lib/booking/review';

const topics = [
  { _id: 't1', name: 'Accuracy' },
  { _id: 't2', name: 'Empathy' },
];

describe('review', () => {
  it('needs stars on every topic', () => {
    expect(allRated(topics, {})).toBe(false);
    expect(allRated(topics, { t1: 4 })).toBe(false);
    expect(allRated(topics, { t1: 4, t2: 0 })).toBe(false);
    expect(allRated(topics, { t1: 4, t2: 5 })).toBe(true);
    // No topics loaded yet: nothing to submit.
    expect(allRated([], {})).toBe(false);
  });

  it('builds the backend body for a booking', () => {
    expect(
      reviewPayload({
        astrologerId: 'a1',
        bookingId: 'b1',
        topics,
        stars: { t1: 4, t2: 5 },
        message: '  Great reading  ',
        hideProfile: true,
      }),
    ).toEqual({
      astrologer: 'a1',
      connectionScheduleId: 'b1',
      topicRatings: [
        { topicId: 't1', rating: 4 },
        { topicId: 't2', rating: 5 },
      ],
      message: 'Great reading',
      hideProfileInformation: true,
    });
  });
});
