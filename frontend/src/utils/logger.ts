// src/utils/logger.ts

let logQueue: any[] = [];
const BATCH_SIZE = 20; // 20개가 쌓이면 전송
const FLUSH_INTERVAL = 5000; // 혹은 5초마다 전송

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
    await fetch('http://localhost:8000/api/logs/batch', { // 엔드포인트를 batch로 변경 제안
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logsToSend),
    });
  } catch (e) {
    console.error("Batch log failed", e);
    // 실패 시 다시 큐에 넣거나 버림 (여기서는 일단 유지)
    logQueue = [...logsToSend, ...logQueue];
  }
};

export const sendLog = (eventName: string, payload: any) => {
  const logData = {
    event_time: new Date().toISOString(),
    event_name: eventName,
    session_id: `session_${localStorage.getItem('current_game_index') || '1'}`,    game_index: gameIndex,
    user_id: "noname",
    stage: "infinite",
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