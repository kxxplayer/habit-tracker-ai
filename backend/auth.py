import os
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client for auth verification
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Verify token by calling Supabase's auth.get_user() API.
    Returns a tuple of (user_id, email).
    """
    token = credentials.credentials
    try:
        response = supabase.auth.get_user(token)
        user = response.user
        if not user or not user.id:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return {"id": str(user.id), "email": user.email or ""}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
