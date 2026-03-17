from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Алиасы для совместимости с разными названиями
get_password_hash = hash_password
hash_password_func = hash_password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Можно добавить функцию для проверки сложности пароля
def validate_password_strength(password: str) -> bool:
    """Проверяет минимальные требования к паролю"""
    if len(password) < 6:
        return False, "Пароль должен содержать минимум 6 символов"
    return True, ""