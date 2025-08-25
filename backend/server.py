from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any, Annotated
import uuid
from datetime import datetime
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic models for the educational content
class QuizOption(BaseModel):
    option_text: str
    is_correct: bool

class QuizQuestion(BaseModel):
    question: str
    options: List[QuizOption]
    explanation: str

class GlossaryTerm(BaseModel):
    term: str
    definition: str
    example: Optional[str] = None

class Exercise(BaseModel):
    problem: str
    options: List[QuizOption]
    difficulty: str  # "easy", "medium", "hard"
    explanation: str

class Content(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    
    id: Optional[str] = Field(default=None, alias="_id")
    module_id: str
    content_type: str  # "glossary", "theory", "learning_exercises", "practice_exercises", "quiz"
    title: str
    glossary_terms: Optional[List[GlossaryTerm]] = []
    theory_content: Optional[str] = None
    exercises: Optional[List[Exercise]] = []
    quiz_questions: Optional[List[QuizQuestion]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Module(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    
    id: Optional[str] = Field(default=None, alias="_id")
    topic_id: str
    name: str
    description: str
    order: int
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Topic(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    
    id: Optional[str] = Field(default=None, alias="_id")
    grade_id: str
    name: str
    description: str
    icon: str
    order: int
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Grade(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    
    id: Optional[str] = Field(default=None, alias="_id")
    grade_number: int
    grade_name: str
    description: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    current_grade: int
    progress: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Helper function to convert ObjectId to string
def str_object_id(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

def str_object_ids(docs):
    return [str_object_id(doc) for doc in docs]

# API Endpoints

@api_router.get("/")
async def root():
    return {"message": "Math Education App API"}

# Grade endpoints
@api_router.get("/grades", response_model=List[Grade])
async def get_grades():
    grades = await db.grades.find({"is_active": True}).sort("grade_number", 1).to_list(100)
    return [Grade(**str_object_id(grade)) for grade in grades]

@api_router.get("/grades/{grade_id}", response_model=Grade)
async def get_grade(grade_id: str):
    if not ObjectId.is_valid(grade_id):
        raise HTTPException(status_code=400, detail="Invalid grade ID")
    
    grade = await db.grades.find_one({"_id": ObjectId(grade_id)})
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    return Grade(**str_object_id(grade))

# Topic endpoints
@api_router.get("/grades/{grade_id}/topics", response_model=List[Topic])
async def get_topics_by_grade(grade_id: str):
    if not ObjectId.is_valid(grade_id):
        raise HTTPException(status_code=400, detail="Invalid grade ID")
    
    topics = await db.topics.find({"grade_id": grade_id, "is_active": True}).sort("order", 1).to_list(100)
    return [Topic(**str_object_id(topic)) for topic in topics]

@api_router.get("/topics/{topic_id}", response_model=Topic)
async def get_topic(topic_id: str):
    if not ObjectId.is_valid(topic_id):
        raise HTTPException(status_code=400, detail="Invalid topic ID")
    
    topic = await db.topics.find_one({"_id": ObjectId(topic_id)})
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return Topic(**str_object_id(topic))

# Module endpoints
@api_router.get("/topics/{topic_id}/modules", response_model=List[Module])
async def get_modules_by_topic(topic_id: str):
    if not ObjectId.is_valid(topic_id):
        raise HTTPException(status_code=400, detail="Invalid topic ID")
    
    modules = await db.modules.find({"topic_id": topic_id, "is_active": True}).sort("order", 1).to_list(100)
    return [Module(**str_object_id(module)) for module in modules]

@api_router.get("/modules/{module_id}", response_model=Module)
async def get_module(module_id: str):
    if not ObjectId.is_valid(module_id):
        raise HTTPException(status_code=400, detail="Invalid module ID")
    
    module = await db.modules.find_one({"_id": ObjectId(module_id)})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return Module(**str_object_id(module))

# Content endpoints
@api_router.get("/modules/{module_id}/content", response_model=List[Content])
async def get_content_by_module(module_id: str):
    if not ObjectId.is_valid(module_id):
        raise HTTPException(status_code=400, detail="Invalid module ID")
    
    content = await db.content.find({"module_id": module_id}).to_list(100)
    return [Content(**str_object_id(c)) for c in content]

@api_router.get("/modules/{module_id}/content/{content_type}")
async def get_content_by_type(module_id: str, content_type: str):
    if not ObjectId.is_valid(module_id):
        raise HTTPException(status_code=400, detail="Invalid module ID")
    
    valid_types = ["glossary", "theory", "learning_exercises", "practice_exercises", "quiz"]
    if content_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid content type")
    
    content = await db.content.find_one({"module_id": module_id, "content_type": content_type})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return Content(**str_object_id(content))

# User progress endpoints
@api_router.post("/users", response_model=User)
async def create_user(user: User):
    user_dict = user.model_dump(exclude={"id"})
    result = await db.users.insert_one(user_dict)
    user.id = str(result.inserted_id)
    return user

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**str_object_id(user))

# Test endpoint to check database connection
@api_router.get("/test-db")
async def test_db():
    try:
        # Try to count documents in grades collection
        count = await db.grades.count_documents({})
        return {"status": "success", "grades_count": count, "db_name": db.name}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Initialize database with sample data
@api_router.post("/initialize-data")
async def initialize_data():
    """Initialize the database with grade structure and 7th grade content"""
    try:
        # Clear existing data
        await db.grades.delete_many({})
        await db.topics.delete_many({})
        await db.modules.delete_many({})
        await db.content.delete_many({})

        # Create grades 7-12
        grades_data = [
            {"grade_number": 7, "grade_name": "7mo Grado", "description": "Séptimo grado - Fundamentos de álgebra y geometría", "is_active": True, "created_at": datetime.utcnow()},
            {"grade_number": 8, "grade_name": "8vo Grado", "description": "Octavo grado - Álgebra intermedia y funciones", "is_active": True, "created_at": datetime.utcnow()},
            {"grade_number": 9, "grade_name": "9no Grado", "description": "Noveno grado - Álgebra avanzada y geometría analítica", "is_active": True, "created_at": datetime.utcnow()},
            {"grade_number": 10, "grade_name": "10mo Grado", "description": "Décimo grado - Funciones y trigonometría", "is_active": True, "created_at": datetime.utcnow()},
            {"grade_number": 11, "grade_name": "11mo Grado", "description": "Undécimo grado - Precálculo y estadística", "is_active": True, "created_at": datetime.utcnow()},
            {"grade_number": 12, "grade_name": "12mo Grado", "description": "Duodécimo grado - Cálculo y matemáticas avanzadas", "is_active": True, "created_at": datetime.utcnow()}
        ]

        # Insert grades
        grades_result = await db.grades.insert_many(grades_data)
        grade_7_id = str(grades_result.inserted_ids[0])

        return {"message": f"Database initialized successfully! Created {len(grades_result.inserted_ids)} grades. Grade 7 ID: {grade_7_id}"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing database: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()