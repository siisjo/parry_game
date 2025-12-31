import { useEffect, useState, useRef, useCallback } from "react";
import { 
  parryPattern, fakeParryPattern, chainParryStep, 
  starCatchPattern, stopCurrentPattern, 
  playSuccessEffect, playFailEffect 
} from "../game/patterns/patterns";
import { soundManager } from "../utils/SoundManager"; // 사운드 매니저 임포트

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

  // --- [난이도 및 사운드 가속 변수] ---
  const currentSpeed = Math.max(60, 150 - Math.floor(score / 1000) * 7.5);
  const nextPatternDelay = Math.max(150, 400 - Math.floor(score / 1000) * 15);
  // 점수 10000점당 사운드 속도 10% 증가 (최대 1.5배속 권장)
  const soundRate = Math.min(1.5, 1 + (score / 10000) * 0.5);

  const stopStarMovement = useCallback(() => {
    if (starIntervalRef.current) {
      clearInterval(starIntervalRef.current);
      starIntervalRef.current = null;
    }
    soundManager.stop("star_move"); // 별 이동 소리 중지
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
    soundManager.play("game_over"); // 죽음 사운드 재생
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

      // 별 이동 루프 사운드 시작
      soundManager.playLoop("star_move", soundRate);

      starIntervalRef.current = setInterval(() => {
        setStarPos(prev => {
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
  }, [currentPattern, patternId, score, stopStarMovement, soundRate]);

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

    // 패턴 전조 사운드 재생
    if (type === "parry" || type === "chainParry") {
      soundManager.play("parry_ready", soundRate);
    } else if (type === "fakeParry") {
      soundManager.play("fake_ready", soundRate);
    }

    if (type === "parry") parryPattern(dir, setFrame, handlePatternFail, currentSpeed);
    else if (type === "fakeParry") fakeParryPattern(dir, setFrame, handlePatternSuccess, currentSpeed);
    else if (type === "chainParry") {
      chainCountRef.current = Math.random() > 0.5 ? 2 : 3;
      chainParryStep(dir, setFrame, handlePatternFail, currentSpeed);
    }
    else if (type === "starCatch") starCatchPattern(setFrame, 200);
  }, [currentSpeed, handlePatternFail, handlePatternSuccess, stopStarMovement, soundRate]);

  const handleInput = (clientX: number) => {
    if (!isInputActive.current) return;

    if (currentPattern === "starCatch") {
      stopStarMovement();
      if (starRef.current >= 40 && starRef.current <= 60) {
        soundManager.play("star_success", soundRate); // 스타포스 성공 사운드
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
      // 패링 클릭 랜덤 사운드 (3종 중 랜덤)
      soundManager.playParryClick(soundRate);

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
        width: "100vw", height: "100vh", display: "flex", flexDirection: "column", 
        justifyContent: "center", alignItems: "center", backgroundColor: "#111", overflow: "hidden" 
      }}
      onMouseDown={e => handleInput(e.clientX)}
    >
      <div style={{ position: "absolute", top: 40, fontSize: "2rem", color: "white", fontWeight: "bold", zIndex: 10 }}>
        SCORE: {score}
      </div>

      <div style={{ position: "relative", width: "300px", display: "flex", justifyContent: "center" }}>
        <img src={frame} alt="action" style={{ width: "100%", pointerEvents: "none", userSelect: "none" }} />

        {currentPattern === "starCatch" && (
          <div style={{ 
            position: "absolute", bottom: "10%", left: "50%", transform: "translateX(-50%)", 
            textAlign: 'center', width: "85%", backgroundColor: "rgba(0, 0, 0, 0.75)", 
            padding: "15px 10px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.2)", zIndex: 5
          }}>
            <div style={{ 
              color: bounceCount >= 3 ? "#ff4d4d" : "#ffd700", marginBottom: 10, 
              fontWeight: "bold", fontSize: "0.9rem", letterSpacing: "1px" 
            }}>
              STAR CATCH: {"★".repeat(Math.max(0, 4 - bounceCount))}{"☆".repeat(Math.min(4, bounceCount))}
            </div>
            
            <div style={{ 
              width: "100%", height: "20px", backgroundColor: "#222", border: "1px solid #555", 
              position: "relative", borderRadius: "10px", overflow: "hidden" 
            }}>
              <div style={{ 
                position: "absolute", left: "40%", width: "20%", height: "100%", 
                backgroundColor: "rgba(255, 221, 0, 0.5)", boxShadow: "inset 0 0 10px #ffdd00" 
              }} />
              
              <div style={{ 
                position: "absolute", left: `${starPos}%`, top: "50%", transform: "translate(-50%, -50%)",
                zIndex: 6, fontSize: "24px", color: "#fff", textShadow: "0 0 10px #fff, 0 0 20px #ffdd00"
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