# main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import SessionLocal, engine
from auth_utils import hash_password, verify_password

# DB 테이블 생성
models.Base.metadata.create_all(bind=engine)

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

@app.get("/")
def read_root():
    return {"message": "Server is running!"}

# --- 로그 관련 API ---

@app.post("/api/logs/batch")
async def create_log_batch(logs: List[schemas.LogCreate], db: Session = Depends(get_db)):
    try:
        db_logs = [models.GameEventLog(**log.dict()) for log in logs]
        db.add_all(db_logs)
        db.commit()
        return {"status": "success", "detail": f"Saved {len(db_logs)} logs"}
    except Exception as e:
        db.rollback()
        print(f"Batch Insert Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# --- 랭킹 관련 API ---

# 1. 랭킹 조회 (GET) - 보안을 위해 필요한 정보만 추출해서 반환
@app.get("/api/ranking")
def get_ranking(db: Session = Depends(get_db)):
    ranks = db.query(models.Ranking).order_by(models.Ranking.best_score.desc()).limit(10).all()
    
    # 💡 password_hash 같은 민감 정보는 제외하고 응답함
    return [
        {
            "nickname": r.nickname, 
            "best_score": r.best_score, 
            "updated_at": r.updated_at
        } for r in ranks
    ]

# 2. 랭킹 등록 및 수정 (POST)
@app.post("/api/ranking")
async def register_ranking(rank_data: schemas.RankingCreate, db: Session = Depends(get_db)):
    try:
        # 기존 유저 확인
        existing_user = db.query(models.Ranking).filter(models.Ranking.nickname == rank_data.nickname).first()
        
        if existing_user:
            # 💡 비밀번호 검증 (해시 비교)
            if not verify_password(rank_data.password, existing_user.password_hash):
                raise HTTPException(
                    status_code=401, 
                    detail="이미 존재하는 닉네임입니다. 비밀번호를 확인해주세요."
                )
            
            # 기존 점수보다 높을 때만 갱신
            if rank_data.score > existing_user.best_score:
                existing_user.best_score = rank_data.score
                db.commit()
                return {"message": "Score updated"}
            return {"message": "Existing score is higher"}
        
        # 신규 유저 등록
        new_rank = models.Ranking(
            session_id=rank_data.session_id,
            nickname=rank_data.nickname,
            password_hash=hash_password(rank_data.password), # 💡 해싱 저장
            best_score=rank_data.score
        )
        db.add(new_rank)
        db.commit()
        return {"message": "Rank registered"}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)