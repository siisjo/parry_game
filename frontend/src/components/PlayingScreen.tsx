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
  const [patternId, setPatternId] = useState<number>(0); 
  const [direction, setDirection] = useState<"LEFT" | "RIGHT">("LEFT");
  
  const [starPos, setStarPos] = useState(0); 
  const [bounceCount, setBounceCount] = useState(0);
  const starDirRef = useRef(1); 
  const starIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const starRef = useRef<number>(0); 

  const chainCountRef = useRef(0);
  const isInputActive = useRef(false);

  // --- [난이도 조절 변수: 50% 완화 버전] ---
  // 기본 속도 150에서 1000점당 7.5씩 감소 (기존 15)
  const currentSpeed = Math.max(60, 150 - Math.floor(score / 1000) * 7.5);
  // 대기 시간 400에서 1000점당 15씩 감소 (기존 30)
  const nextPatternDelay = Math.max(150, 400 - Math.floor(score / 1000) * 15);

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

  // 스타캐치 애니메이션 로직
  useEffect(() => {
    if (currentPattern === "starCatch" && isInputActive.current) {
      stopStarMovement(); 
      setStarPos(0);
      setBounceCount(0);
      starDirRef.current = 1;
      starRef.current = 0;

      starIntervalRef.current = setInterval(() => {
        setStarPos(prev => {
          // 공 속도: 1000점당 0.5씩 증가 (기존 1.0)
          const moveSpeed = 3 + (score / 1000) * 0.5;
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
  }, [currentPattern, patternId, score, stopStarMovement]);

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
    setPatternId(Date.now()); 
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
      style={{ 
        width: "100vw", 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "#111", 
        overflow: "hidden" 
      }}
      onMouseDown={e => handleInput(e.clientX)}
    >
      <div style={{ position: "absolute", top: 40, fontSize: "2rem", color: "white", fontWeight: "bold", zIndex: 10 }}>
        SCORE: {score}
      </div>

      {/* 캐릭터 프레임과 UI를 감싸는 컨테이너 */}
      <div style={{ position: "relative", width: "300px", display: "flex", justifyContent: "center" }}>
        
        {/* 캐릭터 이미지 */}
        <img 
          src={frame} 
          alt="action" 
          style={{ width: "100%", pointerEvents: "none", userSelect: "none" }} 
        />

        {/* 스타캐치 UI를 이미지 하단에 겹치기 */}
        {currentPattern === "starCatch" && (
          <div style={{ 
            position: "absolute", 
            bottom: "10%", 
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: 'center',
            width: "85%", 
            // --- 배경 박스 스타일 추가 ---
            backgroundColor: "rgba(0, 0, 0, 0.75)", // 진한 검정 반투명
            padding: "15px 10px", 
            borderRadius: "10px", 
            border: "1px solid rgba(255, 255, 255, 0.2)", // 은은한 테두리
            boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
            zIndex: 5
          }}>
            {/* LIFE 표시 */}
            <div style={{ 
              color: bounceCount >= 3 ? "#ff4d4d" : "#ffd700", // 위급할 때 빨강, 평소엔 금색
              marginBottom: 10, 
              fontWeight: "bold", 
              fontSize: "0.9rem",
              letterSpacing: "1px"
            }}>
              STAR CATCH: {"★".repeat(Math.max(0, 4 - bounceCount))}{"☆".repeat(Math.min(4, bounceCount))}
            </div>
            
            {/* 스타캐치 바 컨테이너 */}
            <div style={{ 
              width: "100%", 
              height: "20px", 
              backgroundColor: "#222", 
              border: "1px solid #555", 
              position: "relative", 
              borderRadius: "10px",
              overflow: "hidden" // 영역 밖으로 별이 나가지 않게
            }}>
              {/* 성공 영역 (노란색) */}
              <div style={{ 
                position: "absolute", 
                left: "40%", 
                width: "20%", 
                height: "100%", 
                backgroundColor: "rgba(255, 221, 0, 0.5)",
                boxShadow: "inset 0 0 10px #ffdd00" 
              }} />
              
              {/* 움직이는 별 (포인터) */}

              <div style={{ 
                position: "absolute", 
                left: `${starPos}%`, 
                top: "50%", 
                transform: "translate(-50%, -50%)",
                zIndex: 6,
                // 원(background) 대신 텍스트 스타일 적용
                fontSize: "24px", // 별 크기
                color: "#fff",
                textShadow: "0 0 10px #fff, 0 0 20px #ffdd00", // 별이 반짝이는 느낌
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                userSelect: "none"
              }}>
                ★
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}