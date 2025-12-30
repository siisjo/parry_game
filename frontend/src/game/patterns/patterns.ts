import { frames } from "../../assets/frame";

type Direction = "LEFT" | "RIGHT";

let currentTimer: ReturnType<typeof setTimeout> | null = null;

export const stopCurrentPattern = () => {
  if (currentTimer) {
    clearTimeout(currentTimer);
    currentTimer = null;
  }
};

// 프레임 재생 공통 함수
const playFrameSequence = (sequence: string[], setFrame: (src: string) => void, onComplete: () => void, frameDelay: number) => {
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

// 무한 반복 프레임 (스타캐치용)
const playLoopSequence = (sequence: string[], setFrame: (src: string) => void, frameDelay: number) => {
  let index = 0;
  const playNext = () => {
    setFrame(sequence[index]);
    index = (index + 1) % sequence.length;
    currentTimer = setTimeout(playNext, frameDelay);
  };
  playNext();
};

export const playSuccessEffect = (setFrame: any, onComplete: any, speed: number) => {
  stopCurrentPattern();
  playFrameSequence(frames.parry.success, setFrame, onComplete, Math.max(50, speed * 0.5));
};

export const playFailEffect = (setFrame: any, onComplete: any) => {
  stopCurrentPattern();
  playFrameSequence(frames.parry.fail, setFrame, onComplete, 150);
};

// 패턴 함수들
export const parryPattern = (dir: Direction, setFrame: any, onFail: any, speed: number) => 
  playFrameSequence(frames.parry.pre[dir], setFrame, onFail, speed);

export const fakeParryPattern = (dir: Direction, setFrame: any, onSuccess: any, speed: number) => 
  playFrameSequence(frames.fakeParry.pre[dir], setFrame, onSuccess, speed);

export const chainParryStep = (dir: Direction, setFrame: any, onFail: any, speed: number) => 
  playFrameSequence(frames.chainParry.pre[dir], setFrame, onFail, speed);

// 스타캐치 전용 프레임 재생
export const starCatchPattern = (setFrame: any, speed: number) => {
  // starforce_1, starforce_2 이미지가 frames에 정의되어 있어야 함
  const starFrames = (frames as any).starforce || []; 
  playLoopSequence(starFrames, setFrame, speed);
};