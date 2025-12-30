"""
Brixaurea SaaS API - FastAPI Backend
ISO 27001 compliant security configuration
"""

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import os
import time
from typing import Optional

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# JWT validation
from jose import jwt, JWTError

load_dotenv()

# Environment configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Allowed origins for CORS
ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "https://brixaurea.com",
    "https://www.brixaurea.com",
    "https://app.brixaurea.com",
]

# Add localhost for development
if ENVIRONMENT == "development":
    ALLOWED_ORIGINS.extend([
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ])

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print(f"🚀 Brixaurea API starting in {ENVIRONMENT} mode")
    print(f"📡 Allowed CORS origins: {ALLOWED_ORIGINS}")
    yield
    # Shutdown
    print("👋 Brixaurea API shutting down")


app = FastAPI(
    title="Brixaurea SaaS API",
    description="Real Estate Investment Viability Analysis Platform",
    version="0.1.0",
    docs_url="/docs" if ENVIRONMENT == "development" else None,  # Disable docs in production
    redoc_url="/redoc" if ENVIRONMENT == "development" else None,
    lifespan=lifespan,
)

# Add rate limit exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware - MUST be added before other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],
    expose_headers=[
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
    ],
    max_age=600,  # Cache preflight for 10 minutes
)


# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    
    # Remove server information
    response.headers["Server"] = "Brixaurea"
    
    return response


# Request timing middleware (for monitoring)
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Track request processing time"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(round(process_time * 1000, 2))
    return response


# JWT Token validation
def verify_jwt(token: str) -> Optional[dict]:
    """Verify Supabase JWT token"""
    if not SUPABASE_JWT_SECRET:
        return None
    
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except JWTError:
        return None


# Authentication dependency
async def get_current_user(request: Request) -> dict:
    """Extract and validate user from Authorization header"""
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header"
        )
    
    token = auth_header.split(" ")[1]
    payload = verify_jwt(token)
    
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )
    
    return payload


# Optional authentication (for endpoints that work with or without auth)
async def get_optional_user(request: Request) -> Optional[dict]:
    """Extract user if token present, otherwise None"""
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.split(" ")[1]
    return verify_jwt(token)


# ============================================
# Public Endpoints
# ============================================

@app.get("/")
async def root():
    """Root endpoint - public"""
    return {"message": "Welcome to Brixaurea SaaS API", "status": "online"}


@app.get("/health")
@limiter.limit("60/minute")
async def health_check(request: Request):
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "environment": ENVIRONMENT,
    }


# ============================================
# Protected Endpoints (require authentication)
# ============================================

@app.get("/api/v1/me")
@limiter.limit("30/minute")
async def get_me(request: Request, user: dict = Depends(get_current_user)):
    """Get current user info"""
    return {
        "user_id": user.get("sub"),
        "email": user.get("email"),
        "role": user.get("role"),
    }


# ============================================
# Error Handlers
# ============================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler with generic messages"""
    # Map specific errors to generic messages for security
    generic_messages = {
        401: "Authentication required",
        403: "Access denied",
        404: "Resource not found",
        429: "Too many requests",
        500: "Internal server error",
    }
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": generic_messages.get(exc.status_code, "An error occurred"),
            "status_code": exc.status_code,
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler - never expose internal errors"""
    # Log the actual error (in production, send to monitoring service)
    print(f"Unhandled exception: {exc}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
        }
    )
