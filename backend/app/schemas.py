# schemas.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# 이벤트 로그 수신용
class LogCreate(BaseModel):
    event_time: datetime
    event_name: str
    session_id: str
    game_index: int
    user_id: Optional[str] = "noname"
    stage: str
    pattern_type: str
    direction: Optional[str] = None
    sequence_order: int
    delay_ms: int
    reaction_time_ms: Optional[int] = None
    fail_reason: Optional[str] = None
    score: Optional[int] = None
    star_speed: Optional[float] = None

# 랭킹 등록용
class RankingCreate(BaseModel):
    session_id: str
    nickname: str
    password: str
    score: int