import { frames } from "../../assets/frame";

type Direction = "LEFT" | "RIGHT";
// 💡 전역 변수가 아닌, 개별 패턴 제어를 위해 배열을 비웁니다.
let activeTimers: ReturnType<typeof setTimeout>[] = [];

export const stopCurrentPattern = () => {
  activeTimers.forEach(clearTimeout);
  activeTimers = [];
};

const playFrameSequence = (sequence: HTMLImageElement[], draw: (img: HTMLImageElement) => void, onComplete: () => void, frameDelay: number) => {
  let index = 0;
  
  const playNext = () => {
    if (index >= sequence.length) {
      onComplete();
      return;
    }
    
    // 💡 화면 멈춤 방지: 이미지가 존재할 때만 그리기
    if (sequence[index]) {
      draw(sequence[index]);
    }
    
    index++;
    const timer = setTimeout(playNext, frameDelay);
    activeTimers.push(timer);
  };

  playNext();
};

const playLoopSequence = (sequence: HTMLImageElement[], draw: (img: HTMLImageElement) => void, frameDelay: number) => {
  let index = 0;
  const playNext = () => {
    if (sequence[index]) {
      draw(sequence[index]);
    }
    index = (index + 1) % sequence.length;
    const timer = setTimeout(playNext, frameDelay);
    activeTimers.push(timer);
  };
  playNext();
};

// 이하 함수들은 동일하게 유지
export const playSuccessEffect = (draw: any, onComplete: any, speed: number) => {
  stopCurrentPattern();
  playFrameSequence(frames.parry.success, draw, onComplete, Math.max(50, speed * 0.5));
};

export const playFailEffect = (draw: any, onComplete: any) => {
  stopCurrentPattern();
  playFrameSequence(frames.parry.fail, draw, onComplete, 150);
};

export const parryPattern = (dir: Direction, draw: any, onFail: any, speed: number) => 
  playFrameSequence(frames.parry.pre[dir], draw, onFail, speed);

export const fakeParryPattern = (dir: Direction, draw: any, onSuccess: any, speed: number) => 
  playFrameSequence(frames.fakeParry.pre[dir], draw, onSuccess, speed);

export const chainParryStep = (dir: Direction, draw: any, onFail: any, speed: number) => 
  playFrameSequence(frames.chainParry.pre[dir], draw, onFail, speed);

export const starCatchPattern = (draw: any, speed: number) => 
  playLoopSequence(frames.starforce, draw, speed);