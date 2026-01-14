// src/utils/logger.ts

let logQueue: any[] = [];
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getOrCreateSessionId = (): string => {
  const SESSION_KEY = 'game_persistent_session_id';
  const EXPIRY_KEY = 'game_session_expiry';
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const now = new Date().getTime();
  const storedId = localStorage.getItem(SESSION_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);

  if (!storedId || !expiry || now > parseInt(expiry)) {
    const newId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, newId);
    localStorage.setItem(EXPIRY_KEY, (now + THIRTY_DAYS_MS).toString());
    return newId;
  }
  return storedId;
};

const persistentSessionId = getOrCreateSessionId();

// ★ 추가: GA4에 커스텀 세션 ID 설정
if (typeof window !== 'undefined' && (window as any).gtag) {
  (window as any).gtag('config', 'GA_MEASUREMENT_ID', { // 본인의 GA 측정 ID로 교체
    'user_id': persistentSessionId,           // GA 기본 유저 식별자로 활용
    'game_session_id': persistentSessionId    // 커스텀 파라미터로 활용
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
  logQueue = []; // 전송 시작과 동시에 큐를 비워 메모리 확보

  try {
    await fetch(`${API_BASE_URL}/api/logs/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logsToSend),
    });
    console.log(`[Logger] ${logsToSend.length}개 로그 전송 완료 및 클리어.`);
  } catch (e) {
    console.error("Batch log failed", e);
    // 실패 시에만 다시 큐에 넣어 다음 게임 종료 시 재시도
    logQueue = [...logsToSend, ...logQueue];
  }
};

// 로그를 메모리에 쌓기만 함
export const sendLog = (eventName: string, payload: any) => {
  const logData = {
    event_time: new Date().toISOString(),
    event_name: eventName,
    session_id: persistentSessionId,
    game_index: gameIndex,
    ...payload
  };
  logQueue.push(logData);
};

// 게임 오버 시 호출할 함수
export const forceFlush = () => flushLogs();