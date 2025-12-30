import { useEffect, useState, useRef, useCallback } from "react";
import { 
  parryPattern, fakeParryPattern, chainParryStep, 
  starCatchPattern, stopCurrentPattern, 
  playSuccessEffect, playFailEffect 
} from "../game/patterns/patterns";

type Props = {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  onGameOver: () => void;
};

export default function PlayingScreen({ score, setScore, onGameOver }: Props) {
  const [frame, setFrame] = useState<string>("");
  const [currentPattern, setCurrentPattern] = useState<string>("");
  const [patternId, setPatternId] = useState<number>(0); // 연속 패턴 구분을 위한 고유 ID 추가
  const [direction, setDirection] = useState<"LEFT" | "RIGHT">("LEFT");
  
  const [starPos, setStarPos] = useState(0); 
  const [bounceCount, setBounceCount] = useState(0);
  const starDirRef = useRef(1); 
  const starIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const starRef = useRef<number>(0); 

  const chainCountRef = useRef(0);
  const isInputActive = useRef(false);

  const currentSpeed = Math.max(60, 150 - Math.floor(score / 1000) * 15);
  const nextPatternDelay = Math.max(150, 400 - Math.floor(score / 1000) * 30);

  const stopStarMovement = useCallback(() => {
    if (starIntervalRef.current) {
      clearInterval(starIntervalRef.current);
      starIntervalRef.current = null;
    }
  }, []);

  const handlePatternSuccess = useCallback(() => {
    isInputActive.current = false;
    stopStarMovement();
    setScore(prev => prev + 100);
    setTimeout(startNextPattern, nextPatternDelay);
  }, [setScore, nextPatternDelay, stopStarMovement]);

  const handlePatternFail = useCallback(() => {
    isInputActive.current = false;
    stopCurrentPattern();
    stopStarMovement();
    playFailEffect(setFrame, onGameOver);
  }, [onGameOver, stopStarMovement]);

  // 스타캐치 애니메이션 로직 (patternId를 감시하여 강제 재시작)
  useEffect(() => {
    if (currentPattern === "starCatch" && isInputActive.current) {
      stopStarMovement(); // 이전 인터벌 제거
      
      // 상태 초기화
      setStarPos(0);
      setBounceCount(0);
      starDirRef.current = 1;
      starRef.current = 0;

      // 인터벌 생성
      starIntervalRef.current = setInterval(() => {
        setStarPos(prev => {
          const moveSpeed = 3 + (score / 1000);
          let next = prev + (starDirRef.current * moveSpeed);

          if (next >= 100) {
            starDirRef.current = -1;
            next = 100;
            setBounceCount(b => b + 1);
          } else if (next <= 0) {
            starDirRef.current = 1;
            next = 0;
            setBounceCount(b => b + 1);
          }
          starRef.current = next;
          return next;
        });
      }, 20);

      return () => stopStarMovement();
    }
  }, [currentPattern, patternId, score, stopStarMovement]); // patternId가 바뀌면 무조건 재실행

  // 4번 바운스 시 실패
  useEffect(() => {
    if (currentPattern === "starCatch" && bounceCount >= 4) {
      handlePatternFail();
    }
  }, [bounceCount, currentPattern, handlePatternFail]);

  const startNextPattern = useCallback(() => {
    stopCurrentPattern();
    stopStarMovement();
    
    const types = ["parry", "fakeParry", "chainParry", "starCatch"];
    const type = types[Math.floor(Math.random() * types.length)];
    const dir = Math.random() > 0.5 ? "LEFT" : "RIGHT";

    setCurrentPattern(type);
    setPatternId(Date.now()); // 패턴을 뽑을 때마다 고유 ID 부여
    setDirection(dir);
    isInputActive.current = true;

    if (type === "parry") parryPattern(dir, setFrame, handlePatternFail, currentSpeed);
    else if (type === "fakeParry") fakeParryPattern(dir, setFrame, handlePatternSuccess, currentSpeed);
    else if (type === "chainParry") {
      chainCountRef.current = Math.random() > 0.5 ? 2 : 3;
      chainParryStep(dir, setFrame, handlePatternFail, currentSpeed);
    }
    else if (type === "starCatch") starCatchPattern(setFrame, 200);
  }, [currentSpeed, handlePatternFail, handlePatternSuccess, stopStarMovement]);

  const handleInput = (clientX: number) => {
    if (!isInputActive.current) return;

    if (currentPattern === "starCatch") {
      stopStarMovement();
      if (starRef.current >= 40 && starRef.current <= 60) {
        playSuccessEffect(setFrame, handlePatternSuccess, currentSpeed);
      } else {
        handlePatternFail();
      }
      return;
    }

    if (currentPattern === "fakeParry") {
      handlePatternFail();
      return;
    }

    const mid = window.innerWidth / 2;
    const inputDir = clientX < mid ? "LEFT" : "RIGHT";

    if (inputDir === direction) {
      if (currentPattern === "chainParry") {
        chainCountRef.current -= 1;
        if (chainCountRef.current <= 0) {
          playSuccessEffect(setFrame, handlePatternSuccess, currentSpeed);
        } else {
          stopCurrentPattern();
          const nextDir = Math.random() > 0.5 ? "LEFT" : "RIGHT";
          setDirection(nextDir);
          chainParryStep(nextDir, setFrame, handlePatternFail, currentSpeed);
        }
      } else {
        playSuccessEffect(setFrame, handlePatternSuccess, currentSpeed);
      }
    } else {
      handlePatternFail();
    }
  };

  useEffect(() => {
    startNextPattern();
    return () => { stopCurrentPattern(); stopStarMovement(); };
  }, []);

  return (
    <div
      style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#111", overflow: "hidden" }}
      onMouseDown={e => handleInput(e.clientX)}
    >
      <div style={{ position: "absolute", top: 40, fontSize: "2rem", color: "white", fontWeight: "bold" }}>SCORE: {score}</div>
      <img src={frame} alt="action" style={{ width: 300, pointerEvents: "none", userSelect: "none" }} />

      {currentPattern === "starCatch" && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <div style={{ color: bounceCount >= 3 ? "#ff4d4d" : "white", marginBottom: 5, fontWeight: "bold", fontSize: "1.2rem" }}>
            LIFE: {"★".repeat(Math.max(0, 4 - bounceCount))}{"☆".repeat(Math.min(4, bounceCount))}
          </div>
          <div style={{ width: "250px", height: "30px", backgroundColor: "#333", border: "2px solid #fff", position: "relative", borderRadius: "15px" }}>
            <div style={{ position: "absolute", left: "40%", width: "20%", height: "100%", backgroundColor: "yellow", opacity: 0.6 }} />
            <div style={{ 
              position: "absolute", left: `${starPos}%`, width: "22px", height: "22px", 
              backgroundColor: "white", borderRadius: "50%", top: "50%", transform: "translate(-50%, -50%)",
              boxShadow: "0 0 10px #fff"
            }} />
          </div>
        </div>
      )}
    </div>
  );
}