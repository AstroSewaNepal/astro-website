// Report and block (the app's Moderation components, useModeration + moderation.service). Doc 13 reuses these.

/** POST /reports `targetType` (backend ReportTargetType). */
export type ReportTargetType =
  | 'USER'
  | 'ASTROLOGER'
  | 'CHAT_MESSAGE'
  | 'LIVE_COMMENT'
  | 'LIVE_STREAM'
  | 'REVIEW';

export type ReportReason =
  | 'SPAM'
  | 'HARASSMENT'
  | 'HATE_SPEECH'
  | 'SEXUAL_CONTENT'
  | 'VIOLENCE'
  | 'SCAM_OR_FRAUD'
  | 'IMPERSONATION'
  | 'OTHER';

/** What is reported (the app's IReportTarget). */
export type ReportTarget = {
  targetType: ReportTargetType;
  targetId: string;
  reportedUserId: string;
  contentSnapshot?: string;
  chatId?: string;
};

/** The app's ReportSheet list, in its order and words. */
export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment or bullying' },
  { value: 'HATE_SPEECH', label: 'Hate speech' },
  { value: 'SEXUAL_CONTENT', label: 'Sexual or explicit content' },
  { value: 'VIOLENCE', label: 'Violence or threats' },
  { value: 'SCAM_OR_FRAUD', label: 'Scam or fraud' },
  { value: 'IMPERSONATION', label: 'Impersonation' },
  { value: 'OTHER', label: 'Something else' },
];

/** The backend's CreateReportDto limits. */
export const REPORT_DESCRIPTION_MAX = 1000;
const SNAPSHOT_MAX = 2000;

/** Why the report can't be sent yet, or null. "Something else" needs a few words, like the app. */
export function reportProblem(reason: ReportReason | null, description: string): string | null {
  if (!reason) return 'Choose a reason.';
  if (reason === 'OTHER' && !description.trim()) return 'Please describe the issue';
  return null;
}

/** POST /reports body. */
export function reportBody(target: ReportTarget, reason: ReportReason, description: string) {
  const text = description.trim().slice(0, REPORT_DESCRIPTION_MAX);
  const snapshot = target.contentSnapshot?.trim().slice(0, SNAPSHOT_MAX);
  return {
    ...target,
    contentSnapshot: snapshot || undefined,
    reason,
    description: text || undefined,
  };
}

/** GET /blocks items (people this user blocked). */
export type BlockedUser = {
  userId: string;
  fullName?: string | null;
  profilePicture?: string | null;
  blockedAt?: string | null;
};

/** React Query keys: everything block-related is refreshed together after a block or unblock. */
export const BLOCKS_KEY = ['blocks'] as const;
export const BLOCKED_IDS_KEY = ['blocks', 'ids'] as const;
export const BLOCKED_LIST_KEY = ['blocks', 'list'] as const;

/** The backend refuses chat messages either way once one side blocked the other (BLOCKED_INTERACTION_MESSAGE). */
export const BLOCKED_CHAT_TEXT =
  "You can't message each other because one of you has blocked the other.";

/** The app's block confirmation. */
export function blockConfirmText(name: string | undefined) {
  return {
    title: `Block ${name?.trim() || 'this user'}?`,
    message:
      "You won't be able to chat or join each other's live streams, and you won't see each other's comments or reviews. You can unblock anytime from Settings > Security > Blocked users.",
  };
}
