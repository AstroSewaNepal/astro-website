// An astrologer's online state as the backend reports it (`status` on the astrologer-details responses).

/** The backend's values (AstrologerStatus): AVAILABLE and BUSY (in a session now) are both online. */
export type AstrologerStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

/** Green dot or not. Like the app (`status !== "OFFLINE"`), except that a missing status counts as offline. */
export function isAstrologerOnline(status: string | null | undefined): boolean {
  return !!status && status !== 'OFFLINE';
}
