import os
import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from dotenv import load_dotenv

load_dotenv()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Verify Supabase JWT token locally using PyJWT.
    This bypasses GoTrue API rate limits and 'session_id does not exist' errors.
    Returns a dict with user id (sub) and email.
    """
    if not SUPABASE_JWT_SECRET:
        raise HTTPException(status_code=500, detail="Missing SUPABASE_JWT_SECRET environment variable")

    token = credentials.credentials
    try:
        # Supabase uses HS256 algorithm and the signing secret
        # Audience is "authenticated" for logged-in users
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        
        user_id = payload.get("sub")
        email = payload.get("email", "")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Token invalid: missing subject claim")
            
        return {"id": user_id, "email": email}
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
    except jwt.InvalidTokenError as e:
        error_details = {
            "error_type": type(e).__name__,
            "error_msg": str(e)
        }
        raise HTTPException(status_code=401, detail=error_details)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")
