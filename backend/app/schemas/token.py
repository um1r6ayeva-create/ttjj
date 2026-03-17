from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str

class TokenPayload(BaseModel):
    sub: str  # phone пользователя
    exp: int
    iat: int
    type: str