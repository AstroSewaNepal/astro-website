import type { ReportStatus, ReportTargetType } from '@/lib/content-reports-api';

export const TARGET_LABELS: Record<ReportTargetType, string> = {
  USER: 'User',
  ASTROLOGER: 'Astrologer',
  CHAT_MESSAGE: 'Chat message',
  LIVE_COMMENT: 'Live comment',
  LIVE_STREAM: 'Live stream',
  REVIEW: 'Review',
};

export const REASON_LABELS: Record<string, string> = {
  SPAM: 'Spam',
  HARASSMENT: 'Harassment or bullying',
  HATE_SPEECH: 'Hate speech',
  SEXUAL_CONTENT: 'Sexual or explicit content',
  VIOLENCE: 'Violence or threats',
  SCAM_OR_FRAUD: 'Scam or fraud',
  IMPERSONATION: 'Impersonation',
  OTHER: 'Other',
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: 'Pending',
  RESOLVED: 'Resolved',
  DISMISSED: 'Dismissed',
};

export const STATUS_STYLES: Record<ReportStatus, { pill: string; dot: string }> = {
  PENDING: { pill: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500' },
  RESOLVED: { pill: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  DISMISSED: { pill: 'bg-neutral-100 text-neutral-600', dot: 'bg-neutral-400' },
};
