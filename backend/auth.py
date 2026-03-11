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
    This is the recommended approach - no JWT secret format issues.
    Returns the Supabase user ID (UUID string).
    """
    token = credentials.credentials
    try:
        response = supabase.auth.get_user(token)
        user = response.user
        if not user or not user.id:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return str(user.id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
