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
    # 💡 models.Ranking.score -> models.Ranking.best_score 로 수정
    ranks = db.query(models.Ranking).order_by(models.Ranking.best_score.desc()).limit(10).all()
    return ranks

# main.py 에 추가 (상단 schemas 확인 필수)

# 랭킹 등록 API
@app.post("/api/ranking")
async def register_ranking(rank_data: schemas.RankingCreate, db: Session = Depends(get_db)):
    try:
        # 1. 기존 유저 확인 (모델의 nickname 컬럼 사용)
        existing_user = db.query(models.Ranking).filter(models.Ranking.nickname == rank_data.nickname).first()
        
        if existing_user:
            # 💡 모델의 password_hash 컬럼과 비교
            if existing_user.password_hash != rank_data.password:
                raise HTTPException(status_code=401, detail="이미 존재하는 닉네임 또는 비밀번호가 틀립니다.")
            
            # 💡 모델의 best_score 컬럼 업데이트
            if rank_data.score > existing_user.best_score:
                existing_user.best_score = rank_data.score
                db.commit()
                return {"message": "Score updated"}
            return {"message": "Existing score is higher"}
        
        # 2. 신규 등록 (모델의 컬럼명 password_hash, best_score에 맞춰서 대입)
        new_rank = models.Ranking(
            session_id=rank_data.session_id,
            nickname=rank_data.nickname,
            password_hash=rank_data.password, # 👈 rank_data.password를 password_hash 칸에 넣음
            best_score=rank_data.score        # 👈 rank_data.score를 best_score 칸에 넣음
        )
        db.add(new_rank)
        db.commit()
        return {"message": "Rank registered"}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        print(f"Server Error: {e}") # 터미널에서 에러 확인용
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # 서버 실행 (포트 8000번)
    uvicorn.run(app, host="0.0.0.0", port=8000)