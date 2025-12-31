import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base  # models.py에서 Base를 가져옴

load_dotenv()

# DB 연결 정보 조합
DB_USER = os.getenv("DB_USER")
DB_PW = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PW}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 💡 이 파일을 직접 실행하면 테이블이 생성되게 합니다.
if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("✅ 테이블 생성 완료!")