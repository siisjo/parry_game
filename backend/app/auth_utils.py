# backend/app/auth_utils.py
from passlib.context import CryptContext

# bcrypt 알고리즘을 사용하는 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """비밀번호를 해시로 변환"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """입력한 비밀번호와 DB의 해시가 일치하는지 확인"""
    return pwd_context.verify(plain_password, hashed_password)