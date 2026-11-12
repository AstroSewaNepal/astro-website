import { describe, expect, it } from 'vitest';

import { blockConfirmText, REPORT_REASONS, reportBody, reportProblem } from '@/lib/moderation';

describe('reportProblem', () => {
  it('needs a reason', () => {
    expect(reportProblem(null, '')).toMatch(/reason/);
    expect(reportProblem('SPAM', '')).toBeNull();
  });

  it('needs details for "Something else" only', () => {
    expect(reportProblem('OTHER', '  ')).toBe('Please describe the issue');
    expect(reportProblem('OTHER', 'asked for my bank PIN')).toBeNull();
  });
});

describe('reportBody', () => {
  const target = {
    targetType: 'CHAT_MESSAGE' as const,
    targetId: 'm1',
    reportedUserId: 'a1',
    contentSnapshot: '  hello  ',
    chatId: 'c1',
  };

  it('trims, and leaves out empty optional text', () => {
    expect(reportBody(target, 'SPAM', '   ')).toEqual({
      ...target,
      contentSnapshot: 'hello',
      reason: 'SPAM',
      description: undefined,
    });
    expect(reportBody({ ...target, contentSnapshot: '' }, 'SPAM', 'x').contentSnapshot).toBe(
      undefined,
    );
  });

  it('stays inside the backend limits', () => {
    const body = reportBody(
      { ...target, contentSnapshot: 'a'.repeat(5000) },
      'OTHER',
      'b'.repeat(3000),
    );
    expect(body.contentSnapshot).toHaveLength(2000);
    expect(body.description).toHaveLength(1000);
  });
});

it('lists the app reasons with "Something else" last', () => {
  expect(REPORT_REASONS).toHaveLength(8);
  expect(REPORT_REASONS.at(-1)).toEqual({ value: 'OTHER', label: 'Something else' });
});

it('names who is blocked', () => {
  expect(blockConfirmText('Rohan').title).toBe('Block Rohan?');
  expect(blockConfirmText(' ').title).toBe('Block this user?');
});
