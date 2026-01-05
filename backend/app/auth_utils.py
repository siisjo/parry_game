import bcrypt

def hash_password(password: str) -> str:
    """비밀번호를 해시로 변환 (Python 3.13 호환)"""
    # 1. 비밀번호 문자열을 바이트(bytes)로 인코딩
    pwd_bytes = password.encode('utf-8')
    # 2. 솔트(Salt) 생성 및 해싱
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    # 3. DB 저장을 위해 다시 문자열로 디코딩해서 반환
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """입력한 비밀번호와 DB의 해시가 일치하는지 확인"""
    # 1. 입력받은 평문과 저장된 해시를 바이트로 변환하여 비교
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )