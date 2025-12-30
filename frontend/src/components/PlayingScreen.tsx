import { useEffect, useState, useRef, useCallback } from "react";
import { 
  parryPattern, 
  fakeParryPattern, 
  chainParryStep, 
  stopCurrentPattern, 
  playSuccessEffect, 
  playFailEffect 
} from "../game/patterns/patterns";

type Props = {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  onGameOver: () => void;
};

export default function PlayingScreen({ score, setScore, onGameOver }: Props) {
  const [frame, setFrame] = useState<string>("");
  const [currentPattern, setCurrentPattern] = useState<string>("");
  const [direction, setDirection] = useState<"LEFT" | "RIGHT">("LEFT");
  
  const chainCountRef = useRef(0);
  const isInputActive = useRef(false);

  // 공통 성공 처리 함수
  const handlePatternSuccess = useCallback(() => {
    isInputActive.current = false;
    // 함수형 업데이트로 점수 누락 방지
    setScore(prev => prev + 100);
    // 다음 패턴까지의 여유 시간
    setTimeout(startNextPattern, 400);
  }, [setScore]);

  // 공통 실패 처리 함수
  const handlePatternFail = useCallback(() => {
    isInputActive.current = false;
    stopCurrentPattern();
    playFailEffect(setFrame, onGameOver);
  }, [onGameOver]);

  const startNextPattern = () => {
    stopCurrentPattern();
    const types = ["parry", "fakeParry", "chainParry"];
    const type = types[Math.floor(Math.random() * types.length)];
    const dir = Math.random() > 0.5 ? "LEFT" : "RIGHT";

    setCurrentPattern(type);
    setDirection(dir);
    isInputActive.current = true;

    if (type === "parry") {
      parryPattern(dir, setFrame, handlePatternFail);
    } else if (type === "fakeParry") {
      // 페이크는 끝까지 안 눌러야 성공 -> handlePatternSuccess 실행
      fakeParryPattern(dir, setFrame, handlePatternSuccess);
    } else if (type === "chainParry") {
      chainCountRef.current = Math.random() > 0.5 ? 2 : 3;
      chainParryStep(dir, setFrame, handlePatternFail);
    }
  };

  const handleInput = (clientX: number) => {
    if (!isInputActive.current) return;

    const mid = window.innerWidth / 2;
    const inputDir = clientX < mid ? "LEFT" : "RIGHT";

    // 1. 페이크 패링 처리
    if (currentPattern === "fakeParry") {
      handlePatternFail();
      return;
    }

    // 2. 패링 및 연속 패링 처리
    if (inputDir === direction) {
      if (currentPattern === "chainParry") {
        chainCountRef.current -= 1;
        if (chainCountRef.current <= 0) {
          playSuccessEffect(setFrame, handlePatternSuccess);
        } else {
          // 연속패링 중간 성공: 다음 단계 재생
          stopCurrentPattern();
          const nextDir = Math.random() > 0.5 ? "LEFT" : "RIGHT";
          setDirection(nextDir);
          chainParryStep(nextDir, setFrame, handlePatternFail);
        }
      } else {
        // 일반 패링 성공
        playSuccessEffect(setFrame, handlePatternSuccess);
      }
    } else {
      // 방향 틀림
      handlePatternFail();
    }
  };

  useEffect(() => {
    startNextPattern();
    return () => stopCurrentPattern();
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "#111",
        position: "relative"
      }}
      onMouseDown={e => handleInput(e.clientX)}
      onTouchStart={e => handleInput(e.touches[0].clientX)}
    >
      <img 
        src={frame} 
        alt="attack" 
        style={{ width: 300, userSelect: "none", pointerEvents: "none" }} 
      />
      <div style={{ 
        position: "absolute", 
        top: 40, 
        fontSize: "2.5rem", 
        color: "white", 
        fontWeight: "bold",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
      }}>
        SCORE: {score}
      </div>
    </div>
  );
}