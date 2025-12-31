# main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import SessionLocal, engine

# DB 테이블 생성 (이미 생성되어 있다면 생략 가능하지만 안전하게 유지)
models.Base.metadata.create_all(bind=engine)

# 앱 초기화
app = FastAPI(title="Parry Game API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB 세션 획득용 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API 엔드포인트 ---

@app.get("/")
def read_root():
    return {"message": "Server is running!"}

# [기존] 단일 로그 수신 (유지 - 필요한 경우를 위해)
@app.post("/api/logs")
async def create_log(log: schemas.LogCreate, db: Session = Depends(get_db)):
    try:
        new_log = models.GameEventLog(**log.dict())
        db.add(new_log)
        db.commit()
        return {"status": "success", "detail": f"Log {log.event_name} saved"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# 💡 [새로 추가] 로그 배치 수신 (성능 최적화용)
@app.post("/api/logs/batch")
async def create_log_batch(logs: List[schemas.LogCreate], db: Session = Depends(get_db)):
    try:
        # 받은 리스트를 DB 모델 객체 리스트로 변환
        db_logs = [models.GameEventLog(**log.dict()) for log in logs]
        
        # add_all을 통해 한 번의 트랜잭션으로 대량 삽입
        db.add_all(db_logs)
        db.commit()
        
        return {
            "status": "success", 
            "detail": f"Successfully saved {len(db_logs)} logs in batch"
        }
    except Exception as e:
        db.rollback()
        # 에러 발생 시 로그를 확인하기 위해 에러 출력
        print(f"Batch Insert Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during batch insert")

# 랭킹 조회
@app.get("/api/ranking")
def get_ranking(db: Session = Depends(get_db)):
    # 점수 높은 순으로 10개 가져오기
    # models.Ranking.score (혹은 필드명) 확인 필요
    ranks = db.query(models.Ranking).order_by(models.Ranking.score.desc()).limit(10).all()
    return ranks

if __name__ == "__main__":
    import uvicorn
    # 서버 실행 (포트 8000번)
    uvicorn.run(app, host="0.0.0.0", port=8000)