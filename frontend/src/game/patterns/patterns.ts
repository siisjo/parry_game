import { frames } from "../../assets/frame";

type Direction = "LEFT" | "RIGHT";

let currentTimer: ReturnType<typeof setTimeout> | null = null;

// 진행 중인 애니메이션 강제 중단
export const stopCurrentPattern = () => {
  if (currentTimer) {
    clearTimeout(currentTimer);
    currentTimer = null;
  }
};

// 공통 함수: 프레임 시퀀스 재생
const playFrameSequence = (
  sequence: string[],
  setFrame: (src: string) => void,
  onComplete: () => void,
  frameDelay: number = 150
) => {
  let index = 0;

  const playNext = () => {
    if (index < sequence.length) {
      setFrame(sequence[index]);
      index++;
      currentTimer = setTimeout(playNext, frameDelay);
    } else {
      currentTimer = null;
      onComplete();
    }
  };

  playNext();
};

// 성공/실패 이펙트 재생
export const playSuccessEffect = (setFrame: (src: string) => void, onComplete: () => void) => {
  stopCurrentPattern();
  playFrameSequence(frames.parry.success, setFrame, onComplete, 80);
};

export const playFailEffect = (setFrame: (src: string) => void, onComplete: () => void) => {
  stopCurrentPattern();
  playFrameSequence(frames.parry.fail, setFrame, onComplete, 150);
};

// 패턴 정의
export const parryPattern = (direction: Direction, setFrame: (s: string) => void, onFail: () => void) => {
  playFrameSequence(frames.parry.pre[direction], setFrame, onFail);
};

export const fakeParryPattern = (direction: Direction, setFrame: (s: string) => void, onSuccess: () => void) => {
  playFrameSequence(frames.fakeParry.pre[direction], setFrame, onSuccess);
};

export const chainParryStep = (direction: Direction, setFrame: (s: string) => void, onFail: () => void) => {
  playFrameSequence(frames.chainParry.pre[direction], setFrame, onFail);
};