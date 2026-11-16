'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

import { useBackendClient } from '@/hooks/use-backend-client';
import { createLiveKitLiveRoom, createLiveKitTracks } from '@/lib/call/livekit-room';
import { liveApi, liveErrorText } from '@/lib/live/api';
import { LiveSession, type LiveState } from '@/lib/live/session';

export type LiveRoomKey = {
  roomId: string;
  roomName: string;
  astrologerId: string;
};

type Snapshot = { session: LiveSession | null; state: LiveState | null };
const EMPTY: Snapshot = { session: null, state: null };

/**
 * Holds the one live session of the page outside React: the session is created and ended by effects, never during a
 * render, and React only reads its state. Changing room (swipe) ends the old session and opens a new one in the same
 * mounted page, so the video elements never remount.
 */
class SessionStore {
  private snapshot: Snapshot = EMPTY;
  private readonly listeners = new Set<() => void>();
  private unsubscribe: (() => void) | null = null;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  open(session: LiveSession) {
    this.close();
    this.unsubscribe = session.subscribe(() => this.publish(session));
    this.publish(session);
    void session.start();
  }

  close() {
    this.unsubscribe?.();
    this.unsubscribe = null;
    const old = this.snapshot.session;
    if (old) void old.end();
    this.snapshot = EMPTY;
    this.emit();
  }

  private publish(session: LiveSession) {
    if (this.snapshot.session !== session && this.snapshot.session) return;
    this.snapshot = { session, state: session.getState() };
    this.emit();
  }

  private emit() {
    for (const l of this.listeners) l();
  }
}

/**
 * The live session for a room, started when the room is known and ended when it changes or the page goes. `again`
 * bumps to rejoin after a lost connection (a tap = one new session, never a retry loop).
 */
export function useLiveSession(
  room: LiveRoomKey | null,
  me: { id: string; name: string },
  countryCode: string | null,
  again = 0,
): Snapshot {
  const backend = useBackendClient();
  // One store for the life of the page (the lazy initialiser runs once; building it has no side effects).
  const [current] = useState(() => new SessionStore());

  const roomId = room?.roomId ?? null;
  const roomName = room?.roomName ?? null;
  const astrologerId = room?.astrologerId ?? null;
  useEffect(() => {
    if (!roomId || !roomName || !astrologerId) {
      current.close();
      return;
    }
    const session = new LiveSession({
      roomId,
      roomName,
      astrologerId,
      me,
      countryCode,
      api: liveApi(backend),
      createRoom: createLiveKitLiveRoom,
      createTracks: createLiveKitTracks,
      describeError: liveErrorText,
    });
    current.open(session);
    // Leaving the page (close, reload, another site): leave the room at once instead of after LiveKit's timeout.
    const onPageHide = () => void session.end();
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      current.close();
    };
    // `me` is the signed-in person (stable for the page); a later country goes through setCountry below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, roomName, astrologerId, me.id, backend, current, again]);

  const snapshot = useSyncExternalStore(current.subscribe, current.getSnapshot, () => EMPTY);
  useEffect(() => {
    snapshot.session?.setCountry(countryCode);
  }, [snapshot.session, countryCode]);
  return snapshot;
}
