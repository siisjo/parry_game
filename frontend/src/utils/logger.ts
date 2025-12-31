// src/utils/logger.ts

let logQueue: any[] = [];
const BATCH_SIZE = 20; // 20개가 쌓이면 전송
const FLUSH_INTERVAL = 5000; // 혹은 5초마다 전송

/**
 * 💡 고유 세션 ID 관리 (30일 유지)
 * 브라우저에 저장된 ID가 없거나 만료되었다면 새로운 UUID를 생성합니다.
 */
const getOrCreateSessionId = (): string => {
  const SESSION_KEY = 'game_persistent_session_id';
  const EXPIRY_KEY = 'game_session_expiry';
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  
  const now = new Date().getTime();
  const storedId = localStorage.getItem(SESSION_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);

  // ID가 없거나 만료 시간이 지난 경우 새로 생성
  if (!storedId || !expiry || now > parseInt(expiry)) {
    const newId = crypto.randomUUID(); // 예: "550e8400-e29b-41d4-a716-446655440000"
    localStorage.setItem(SESSION_KEY, newId);
    localStorage.setItem(EXPIRY_KEY, (now + THIRTY_DAYS_MS).toString());
    return newId;
  }

  // 방문할 때마다 만료 시간을 30일 뒤로 연장하고 싶다면 아래 주석을 해제하세요.
  // localStorage.setItem(EXPIRY_KEY, (now + THIRTY_DAYS_MS).toString());

  return storedId;
};

// 세션 ID는 앱 로드 시점에 한 번만 확정하여 고정 사용
const persistentSessionId = getOrCreateSessionId();

let gameIndex = parseInt(localStorage.getItem('current_game_index') || '1');

export const incrementGameIndex = () => {
  gameIndex += 1;
  localStorage.setItem('current_game_index', gameIndex.toString());
};

// 서버로 실제 전송하는 함수
const flushLogs = async () => {
  if (logQueue.length === 0) return;

  const logsToSend = [...logQueue];
  logQueue = []; // 큐 비우기

  try {
    await fetch('http://localhost:8000/api/logs/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logsToSend),
    });
  } catch (e) {
    console.error("Batch log failed", e);
    // 실패 시 다시 큐 앞에 삽입하여 다음 주기에 재시도
    logQueue = [...logsToSend, ...logQueue];
  }
};

export const sendLog = (eventName: string, payload: any) => {
  const logData = {
    event_time: new Date().toISOString(),
    event_name: eventName,
    session_id: persistentSessionId, // 💡 단순 숫자가 아닌 고유 UUID 사용
    game_index: gameIndex,
    // 💡 user_id, stage 등은 포함하지 않음 (payload에 있으면 포함됨)
    ...payload
  };

  logQueue.push(logData);

  // 조건 1: 쌓인 개수가 기준치를 넘었을 때
  if (logQueue.length >= BATCH_SIZE) {
    flushLogs();
  }
};

// 조건 2: 개수가 안 차더라도 주기적으로 전송 (타이머)
setInterval(flushLogs, FLUSH_INTERVAL);

// 게임 종료 시 남은 로그 강제 전송
export const forceFlush = () => flushLogs();