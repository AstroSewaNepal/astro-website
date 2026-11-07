// Leave a Review on a completed consultation, as the app's FeedbackModal (ap src/components/AstroFeedback).

/** GET /ratings/topics (public; admins can change how many there are). */
export type RatingTopic = { _id: string; name: string; description?: string | null };

export const REVIEW_MESSAGE_MAX = 500;

/** Every topic needs 1-5 stars before Submit (the backend requires a rating for each active topic). */
export function allRated(topics: RatingTopic[], stars: Record<string, number>): boolean {
  return topics.length > 0 && topics.every(t => (stars[t._id] ?? 0) >= 1 && stars[t._id] <= 5);
}

/** POST /ratings body for a booking. */
export function reviewPayload(input: {
  astrologerId: string;
  bookingId: string;
  topics: RatingTopic[];
  stars: Record<string, number>;
  message: string;
  hideProfile: boolean;
}) {
  return {
    astrologer: input.astrologerId,
    connectionScheduleId: input.bookingId,
    topicRatings: input.topics.map(t => ({ topicId: t._id, rating: input.stars[t._id] })),
    message: input.message.trim().slice(0, REVIEW_MESSAGE_MAX),
    hideProfileInformation: input.hideProfile,
  };
}
