// src/utils/logger.ts

let logQueue: any[] = [];
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * index.html에서 생성한 세션 ID를 가져옵니다.
 * 만약의 상황(index.html 로직 누락 등)을 대비해 fallback 로직은 유지합니다.
 */
const getPersistentSessionId = (): string => {
  const SESSION_KEY = 'game_persistent_session_id';
  const storedId = localStorage.getItem(SESSION_KEY);
  
  if (storedId) {
    return storedId;
  }

  // index.html에서 생성이 안 되었을 경우를 대비한 최소한의 방어 로직
  const newId = crypto.randomUUID();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  localStorage.setItem(SESSION_KEY, newId);
  localStorage.setItem('game_session_expiry', (new Date().getTime() + THIRTY_DAYS_MS).toString());
  return newId;
};

const persistentSessionId = getPersistentSessionId();

// ★ 수정: GA4 중복 config 제거 및 'set'으로 ID 동기화 보강
if (typeof window !== 'undefined' && (window as any).gtag) {
  // 이미 index.html에서 실행되었겠지만, 다시 한번 ID를 확정해줍니다.
  (window as any).gtag('set', {
    'user_id': persistentSessionId,
    'game_session_id': persistentSessionId
  });
}

let gameIndex = parseInt(localStorage.getItem('current_game_index') || '1');

export const incrementGameIndex = () => {
  gameIndex += 1;
  localStorage.setItem('current_game_index', gameIndex.toString());
};

// 서버로 실제 전송하는 함수
export const flushLogs = async () => {
  if (logQueue.length === 0) return;

  const logsToSend = [...logQueue];
  logQueue = [];

  try {
    await fetch(`${API_BASE_URL}/api/logs/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logsToSend),
    });
    console.log(`[Logger] ${logsToSend.length}개 로그 전송 완료 및 클리어.`);
  } catch (e) {
    console.error("Batch log failed", e);
    logQueue = [...logsToSend, ...logQueue];
  }
};

// 로그를 메모리에 쌓기만 함
export const sendLog = (eventName: string, payload: any) => {
  const logData = {
    event_time: new Date().toISOString(),
    event_name: eventName,
    session_id: persistentSessionId, // 여기서 사용되는 ID가 GA4와 동일한 UUID임
    game_index: gameIndex,
    ...payload
  };
  logQueue.push(logData);
};

export const forceFlush = () => flushLogs();