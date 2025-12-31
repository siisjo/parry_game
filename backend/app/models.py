from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

# 1. 랭킹 테이블
class Ranking(Base):
    __tablename__ = "rankings"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True) # 유저 식별용
    nickname = Column(String, unique=True, index=True)
    password_hash = Column(String) # 비밀번호
    best_score = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 2. 이벤트 로그 테이블 (텍소노미 반영)
class GameEventLog(Base):
    __tablename__ = "game_event_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_time = Column(DateTime, index=True) # 분석용 인덱스
    event_name = Column(String) # pattern_spawn, pattern_success, pattern_fail
    session_id = Column(String, index=True)
    game_index = Column(Integer)
    user_id = Column(String, default="noname")
    stage = Column(String)
    pattern_type = Column(String)
    direction = Column(String, nullable=True)
    sequence_order = Column(Integer)
    delay_ms = Column(Integer)
    
    # 결과/실패 관련 (nullable=True)
    reaction_time_ms = Column(Integer, nullable=True)
    fail_reason = Column(String, nullable=True)
    score = Column(Integer, nullable=True)
    
    # 패턴별 특수 데이터 (스타포스 속도 등)
    star_speed = Column(Float, nullable=True)
    
    # 혹시 모를 추가 데이터 저장용
    extra_meta = Column(JSON, nullable=True)

# Airflow 분석 속도를 위해 복합 인덱스 추가 (선택사항)
Index('idx_event_name_time', GameEventLog.event_name, GameEventLog.event_time)