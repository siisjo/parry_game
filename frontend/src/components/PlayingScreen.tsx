import { useEffect, useState, useRef, useCallback } from "react";
import { 
  parryPattern, fakeParryPattern, chainParryStep, 
  starCatchPattern, stopCurrentPattern, 
  playSuccessEffect, playFailEffect 
} from "../game/patterns/patterns";
import { soundManager } from "../utils/SoundManager";
import { sendLog, incrementGameIndex, forceFlush } from "../utils/logger";

type Props = {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  onGameOver: () => void;
};

export default function PlayingScreen({ score, setScore, onGameOver }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPattern, setCurrentPattern] = useState<string>("");
  const [patternId, setPatternId] = useState<number>(0); 
  const [direction, setDirection] = useState<"LEFT" | "RIGHT">("LEFT");
  
  const [targetPos, setTargetPos] = useState(40); 
  const [starPos, setStarPos] = useState(0); 
  const [bounceCount, setBounceCount] = useState(0);

  const starIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const starRef = useRef<number>(0); 
  const starDirRef = useRef(1);
  const chainCountRef = useRef(0);
  const isInputActive = useRef(false);
  const scoreRef = useRef(score);

  const hasStarted = useRef(false);
  const currentPatternRef = useRef<string>("");
  const sequenceOrderRef = useRef(0);
  const patternStartTimeRef = useRef(0);

  const inputGraceUntilRef = useRef(0);
  const LOG_SOURCE = "client_web";

  useEffect(() => { scoreRef.current = score; }, [score]);

  const drawToCanvas = useCallback((img: HTMLImageElement) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
  }, []);

  const currentSpeed = Math.max(65, 150 - Math.floor(score / 1000) * 7.5);
  const nextPatternDelay = Math.max(150, 400 - Math.floor(score / 1000) * 15);
  const soundRate = Math.min(1.5, 1 + (score / 10000) * 0.5);

  const stopStarMovement = useCallback(() => {
    if (starIntervalRef.current) {
      clearInterval(starIntervalRef.current);
      starIntervalRef.current = null;
    }
    soundManager.stop("star_move");
  }, []);

  const startNextPattern = useCallback(() => {
    stopCurrentPattern();
    stopStarMovement();
    
    const types = ["parry", "fakeParry", "chainParry", "starCatch"];
    const type = types[Math.floor(Math.random() * types.length)];
    const dir = Math.random() > 0.5 ? "LEFT" : "RIGHT";

    currentPatternRef.current = type;
    sequenceOrderRef.current += 1;
    patternStartTimeRef.current = performance.now();

    setCurrentPattern(type);
    setPatternId(Date.now()); 
    setDirection(dir);
    
    sendLog("pattern_spawn", {
      source: LOG_SOURCE,
      pattern_type: type,
      direction: dir.toLowerCase(),
      sequence_order: sequenceOrderRef.current,
      delay_ms: nextPatternDelay
    });

    isInputActive.current = true;
    inputGraceUntilRef.current = performance.now() + 80;

    if (type === "parry" || type === "chainParry") soundManager.play("parry_ready", soundRate);
    else if (type === "fakeParry") soundManager.play("fake_ready", soundRate);

    setTimeout(() => {
      if (type === "parry") parryPattern(dir, drawToCanvas, () => handlePatternFail("timeout"), currentSpeed);
      else if (type === "fakeParry") fakeParryPattern(dir, drawToCanvas, handlePatternSuccess, currentSpeed);
      else if (type === "chainParry") {
        chainCountRef.current = Math.random() > 0.5 ? 2 : 3;
        chainParryStep(dir, drawToCanvas, () => handlePatternFail("timeout"), currentSpeed);
      }
      else if (type === "starCatch") starCatchPattern(drawToCanvas, 200);
    }, 0);
  }, [currentSpeed, soundRate, stopStarMovement, drawToCanvas, nextPatternDelay]);

  const handlePatternSuccess = useCallback(() => {
    const reactionTime = Math.floor(performance.now() - patternStartTimeRef.current);
    sendLog("pattern_success", {
      source: LOG_SOURCE,
      pattern_type: currentPatternRef.current,
      direction: direction.toLowerCase(),
      sequence_order: sequenceOrderRef.current,
      delay_ms: nextPatternDelay,
      reaction_time_ms: reactionTime,
      score: scoreRef.current + 100
    });
    isInputActive.current = false;
    stopStarMovement();
    setScore(prev => prev + 100);
    setTimeout(startNextPattern, nextPatternDelay);
  }, [direction, nextPatternDelay, setScore, stopStarMovement, startNextPattern]);

  const handlePatternFail = useCallback((reason: string = "wrong_input") => {
    const reactionTime = Math.floor(performance.now() - patternStartTimeRef.current);
    sendLog("pattern_fail", {
      source: LOG_SOURCE,
      pattern_type: currentPatternRef.current,
      direction: direction.toLowerCase(),
      sequence_order: sequenceOrderRef.current,
      delay_ms: nextPatternDelay,
      reaction_time_ms: reactionTime,
      fail_reason: reason,
      score: scoreRef.current,
      ...(currentPatternRef.current === "starCatch" ? { star_speed: 3 + (scoreRef.current / 1000) * 0.5 } : {})
    });
    incrementGameIndex();
    if (!isInputActive.current) return;
    isInputActive.current = false;

    setTimeout(() => {
      stopCurrentPattern();
      stopStarMovement();
      forceFlush();
      soundManager.stopAll();
      soundManager.play("game_over");
      playFailEffect(drawToCanvas, onGameOver);
    }, 50);
  }, [direction, nextPatternDelay, onGameOver, stopStarMovement, drawToCanvas]);

  useEffect(() => {
    if (currentPattern === "starCatch" && isInputActive.current) {
      stopStarMovement();

      setStarPos(0);
      setBounceCount(0);

      starDirRef.current = 1;
      starRef.current = 0;

      const randomPos = Math.floor(Math.random() * 81);
      setTargetPos(randomPos);

      soundManager.playLoop("star_move", soundRate);

      starIntervalRef.current = setInterval(() => {
        const moveSpeed = Math.min(7, 3 + (scoreRef.current / 2000) * 0.5);
        let next = starRef.current + starDirRef.current * moveSpeed;

        if (next >= 100 || next <= 0) {
          starDirRef.current *= -1;
          setBounceCount(b => b + 1); // ✔ bounce 때만 render
        }

        starRef.current = next;

        // ⭐ state는 최소한으로만
        setStarPos(next);
      }, 16);

      return () => stopStarMovement();
    }
  }, [currentPattern, patternId, soundRate, stopStarMovement]);

  useEffect(() => {
    if (currentPattern === "starCatch" && bounceCount >= 4) handlePatternFail("timeout");
  }, [bounceCount, currentPattern, handlePatternFail]);

  const handleInput = (clientX: number) => {
    const now = performance.now();
    if (now < inputGraceUntilRef.current) return;
    if (!isInputActive.current) return;
    if (currentPattern === "starCatch") {
      stopStarMovement();
      if (starRef.current >= targetPos && starRef.current <= targetPos + 20) {
        isInputActive.current = false;
        soundManager.play("star_success", soundRate);
        playSuccessEffect(drawToCanvas, handlePatternSuccess, currentSpeed);
      } else {
        handlePatternFail("wrong_timing");
      }
      return;
    }
    if (currentPattern === "fakeParry") {
      handlePatternFail("fake_tricked");
      return;
    }
    const mid = window.innerWidth / 2;
    const inputDir = clientX < mid ? "LEFT" : "RIGHT";
    if (inputDir === direction) {
      soundManager.playParryClick(soundRate);
      if (currentPattern === "chainParry") {
        chainCountRef.current -= 1;
        if (chainCountRef.current <= 0) {
          isInputActive.current = false;
          playSuccessEffect(drawToCanvas, handlePatternSuccess, currentSpeed);
        } else {
          stopCurrentPattern();
          const nextDir = Math.random() > 0.5 ? "LEFT" : "RIGHT";
          setDirection(nextDir);
          chainParryStep(nextDir, drawToCanvas, () => handlePatternFail("timeout"), currentSpeed);
        }
      } else {
        isInputActive.current = false;
        playSuccessEffect(drawToCanvas, handlePatternSuccess, currentSpeed);
      }
    } else {
      handlePatternFail("wrong_direction");
    }
  };

  useEffect(() => {
    const initGame = () => {
      if (canvasRef.current && !hasStarted.current) {
        hasStarted.current = true;
        startNextPattern();
      }
    };
    const timer = setTimeout(initGame, 150);
    return () => { 
      clearTimeout(timer);
      stopCurrentPattern(); 
      stopStarMovement(); 
      soundManager.stopAll(); 
    };
  }, [startNextPattern]);

  const isMaxSpeed = currentSpeed <= 65;

  return (
    <div 
      style={{ 
        width: "100vw", 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: isMaxSpeed ? "#1a0505" : "#111", 
        overflow: "hidden",
        transition: "all 0.5s ease-in-out",
        // 화면 전체 외곽 광원
        boxShadow: isMaxSpeed 
          ? "inset 0 0 100px rgba(255, 0, 0, 0.4)" 
          : "none"
      }} 
      onPointerDown={e => handleInput(e.clientX)}
    >
      {/* SCORE 레이아웃 */}
      <div style={{ 
        position: "absolute", 
        top: 40, 
        fontSize: "2rem", 
        color: isMaxSpeed ? "#ff4d4d" : "white", 
        fontWeight: "bold", 
        zIndex: 10,
        textShadow: isMaxSpeed ? "0 0 20px rgba(255, 0, 0, 0.8)" : "none",
        transition: "all 0.5s"
      }}>
        SCORE: {score} {isMaxSpeed && " [MAX]"}
      </div>

      {/* 게임 프레임 (이 부분이 사진처럼 빛나게 됨) */}
      <div style={{ 
        position: "relative", 
        width: "400px", 
        height: "400px", 
        display: "flex", 
        justifyContent: "center",
        borderRadius: "10px", // 프레임 모서리 살짝 곡선
        transition: "all 0.4s ease-in-out",
        // 최고 속도 시 캔버스 주변 강렬한 광원 효과
        boxShadow: isMaxSpeed 
          ? "0 0 40px rgba(255, 0, 0, 0.7), 0 0 80px rgba(255, 0, 0, 0.3)" 
          : "none",
        border: isMaxSpeed ? "2px solid rgba(255, 77, 77, 0.6)" : "2px solid transparent"
      }}>
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={400} 
          style={{ 
            width: "100%", 
            height: "100%", 
            objectFit: "contain",
            zIndex: 2,
            // 캔버스 내부 이미지도 살짝 붉은 빛이 감돌게 처리
            filter: isMaxSpeed ? "drop-shadow(0 0 8px rgba(255, 0, 0, 0.4))" : "none",
            transition: "filter 0.4s"
          }} 
        />
        
        {currentPattern === "starCatch" && (
          <div style={{ 
            position: "absolute", 
            bottom: "10%", 
            left: "50%", 
            transform: "translateX(-50%)", 
            textAlign: 'center', 
            width: "85%", 
            backgroundColor: "rgba(0, 0, 0, 0.85)", 
            padding: "15px 10px", 
            borderRadius: "10px", 
            border: isMaxSpeed ? "2px solid #ff4d4d" : "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: isMaxSpeed ? "0 0 15px rgba(255, 0, 0, 0.5)" : "none",
            zIndex: 5 
          }}>
            <div style={{ color: bounceCount >= 3 ? "#ff4d4d" : "#ffd700", marginBottom: 10, fontWeight: "bold", fontSize: "0.9rem", letterSpacing: "1px" }}>
              STAR CATCH: {"★".repeat(Math.max(0, 4 - bounceCount))}{"☆".repeat(Math.min(4, bounceCount))}
            </div>
            <div style={{ width: "100%", height: "20px", backgroundColor: "#222", border: "1px solid #555", position: "relative", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: `${targetPos}%`, width: "20%", height: "100%", backgroundColor: "rgba(255, 221, 0, 0.5)", boxShadow: "inset 0 0 10px #ffdd00" }} />
              <div style={{ position: "absolute", left: `${starPos}%`, top: "50%", transform: "translate(-50%, -50%)", zIndex: 6, fontSize: "24px", color: "#fff", textShadow: "0 0 10px #fff, 0 0 20px #ffdd00" }}>★</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}