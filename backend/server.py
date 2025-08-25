from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
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
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

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
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    module_id: str
    content_type: str  # "glossary", "theory", "learning_exercises", "practice_exercises", "quiz"
    title: str
    glossary_terms: Optional[List[GlossaryTerm]] = []
    theory_content: Optional[str] = None
    exercises: Optional[List[Exercise]] = []
    quiz_questions: Optional[List[QuizQuestion]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Module(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    topic_id: str
    name: str
    description: str
    order: int
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Topic(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    grade_id: str
    name: str
    description: str
    icon: str
    order: int
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Grade(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    grade_number: int
    grade_name: str
    description: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class User(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str
    current_grade: int
    progress: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# API Endpoints

@api_router.get("/")
async def root():
    return {"message": "Math Education App API"}

# Grade endpoints
@api_router.get("/grades", response_model=List[Grade])
async def get_grades():
    grades = await db.grades.find({"is_active": True}).sort("grade_number", 1).to_list(100)
    return [Grade(**grade) for grade in grades]

@api_router.get("/grades/{grade_id}", response_model=Grade)
async def get_grade(grade_id: str):
    if not ObjectId.is_valid(grade_id):
        raise HTTPException(status_code=400, detail="Invalid grade ID")
    
    grade = await db.grades.find_one({"_id": ObjectId(grade_id)})
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    return Grade(**grade)

# Topic endpoints
@api_router.get("/grades/{grade_id}/topics", response_model=List[Topic])
async def get_topics_by_grade(grade_id: str):
    if not ObjectId.is_valid(grade_id):
        raise HTTPException(status_code=400, detail="Invalid grade ID")
    
    topics = await db.topics.find({"grade_id": grade_id, "is_active": True}).sort("order", 1).to_list(100)
    return [Topic(**topic) for topic in topics]

@api_router.get("/topics/{topic_id}", response_model=Topic)
async def get_topic(topic_id: str):
    if not ObjectId.is_valid(topic_id):
        raise HTTPException(status_code=400, detail="Invalid topic ID")
    
    topic = await db.topics.find_one({"_id": ObjectId(topic_id)})
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return Topic(**topic)

# Module endpoints
@api_router.get("/topics/{topic_id}/modules", response_model=List[Module])
async def get_modules_by_topic(topic_id: str):
    if not ObjectId.is_valid(topic_id):
        raise HTTPException(status_code=400, detail="Invalid topic ID")
    
    modules = await db.modules.find({"topic_id": topic_id, "is_active": True}).sort("order", 1).to_list(100)
    return [Module(**module) for module in modules]

@api_router.get("/modules/{module_id}", response_model=Module)
async def get_module(module_id: str):
    if not ObjectId.is_valid(module_id):
        raise HTTPException(status_code=400, detail="Invalid module ID")
    
    module = await db.modules.find_one({"_id": ObjectId(module_id)})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return Module(**module)

# Content endpoints
@api_router.get("/modules/{module_id}/content", response_model=List[Content])
async def get_content_by_module(module_id: str):
    if not ObjectId.is_valid(module_id):
        raise HTTPException(status_code=400, detail="Invalid module ID")
    
    content = await db.content.find({"module_id": module_id}).to_list(100)
    return [Content(**c) for c in content]

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
    return Content(**content)

# User progress endpoints
@api_router.post("/users", response_model=User)
async def create_user(user: User):
    user_dict = user.dict(exclude={"id"})
    result = await db.users.insert_one(user_dict)
    user.id = result.inserted_id
    return user

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

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
            {"grade_number": 7, "grade_name": "7mo Grado", "description": "Séptimo grado - Fundamentos de álgebra y geometría"},
            {"grade_number": 8, "grade_name": "8vo Grado", "description": "Octavo grado - Álgebra intermedia y funciones"},
            {"grade_number": 9, "grade_name": "9no Grado", "description": "Noveno grado - Álgebra avanzada y geometría analítica"},
            {"grade_number": 10, "grade_name": "10mo Grado", "description": "Décimo grado - Funciones y trigonometría"},
            {"grade_number": 11, "grade_name": "11mo Grado", "description": "Undécimo grado - Precálculo y estadística"},
            {"grade_number": 12, "grade_name": "12mo Grado", "description": "Duodécimo grado - Cálculo y matemáticas avanzadas"}
        ]

        # Insert grades
        grades_result = await db.grades.insert_many(grades_data)
        grade_7_id = str(grades_result.inserted_ids[0])

        # Create topics for 7th grade (complete)
        topics_7_data = [
            {
                "grade_id": grade_7_id,
                "name": "Números Enteros",
                "description": "Operaciones con números enteros, propiedades y aplicaciones",
                "icon": "calculator",
                "order": 1
            },
            {
                "grade_id": grade_7_id,
                "name": "Fracciones y Decimales",
                "description": "Operaciones con fracciones y números decimales",
                "icon": "pie-chart",
                "order": 2
            },
            {
                "grade_id": grade_7_id,
                "name": "Introducción al Álgebra",
                "description": "Variables, expresiones algebraicas y ecuaciones simples",
                "icon": "function",
                "order": 3
            },
            {
                "grade_id": grade_7_id,
                "name": "Geometría Básica",
                "description": "Figuras geométricas, área y perímetro",
                "icon": "triangle",
                "order": 4
            },
            {
                "grade_id": grade_7_id,
                "name": "Proporciones y Porcentajes",
                "description": "Razones, proporciones y cálculo de porcentajes",
                "icon": "percent",
                "order": 5
            }
        ]

        # Create placeholder topics for grades 8-12
        for i, grade_id in enumerate(grades_result.inserted_ids[1:], 8):
            grade_topics = [
                {
                    "grade_id": str(grade_id),
                    "name": f"Tema 1 - Grado {i}",
                    "description": f"Primer tema del grado {i} - Por completar",
                    "icon": "book",
                    "order": 1
                },
                {
                    "grade_id": str(grade_id),
                    "name": f"Tema 2 - Grado {i}",
                    "description": f"Segundo tema del grado {i} - Por completar",
                    "icon": "book",
                    "order": 2
                },
                {
                    "grade_id": str(grade_id),
                    "name": f"Tema 3 - Grado {i}",
                    "description": f"Tercer tema del grado {i} - Por completar",
                    "icon": "book",
                    "order": 3
                }
            ]
            topics_7_data.extend(grade_topics)

        # Insert all topics
        topics_result = await db.topics.insert_many(topics_7_data)
        
        # Get 7th grade topic IDs
        grade_7_topic_ids = [str(topic_id) for topic_id in topics_result.inserted_ids[:5]]

        # Create modules for 7th grade first topic (Números Enteros) - Complete
        integers_modules = [
            {
                "topic_id": grade_7_topic_ids[0],
                "name": "Definición y Clasificación",
                "description": "Qué son los números enteros y cómo se clasifican",
                "order": 1
            },
            {
                "topic_id": grade_7_topic_ids[0],
                "name": "Suma y Resta",
                "description": "Operaciones de suma y resta con números enteros",
                "order": 2
            },
            {
                "topic_id": grade_7_topic_ids[0],
                "name": "Multiplicación y División",
                "description": "Operaciones de multiplicación y división con números enteros",
                "order": 3
            },
            {
                "topic_id": grade_7_topic_ids[0],
                "name": "Orden y Comparación",
                "description": "Cómo ordenar y comparar números enteros",
                "order": 4
            }
        ]

        # Create placeholder modules for other 7th grade topics
        placeholder_modules = []
        for i, topic_id in enumerate(grade_7_topic_ids[1:], 1):
            topic_modules = [
                {
                    "topic_id": topic_id,
                    "name": f"Módulo 1",
                    "description": f"Primer módulo del tema {i+1} - Por completar",
                    "order": 1
                },
                {
                    "topic_id": topic_id,
                    "name": f"Módulo 2",
                    "description": f"Segundo módulo del tema {i+1} - Por completar",
                    "order": 2
                }
            ]
            placeholder_modules.extend(topic_modules)

        # Insert modules
        all_modules = integers_modules + placeholder_modules
        modules_result = await db.modules.insert_many(all_modules)
        
        # Get first module ID (Definición y Clasificación)
        first_module_id = str(modules_result.inserted_ids[0])

        # Create complete content for first module
        content_data = [
            # Glossary
            {
                "module_id": first_module_id,
                "content_type": "glossary",
                "title": "Glosario - Números Enteros",
                "glossary_terms": [
                    {
                        "term": "Número Entero",
                        "definition": "Conjunto de números que incluye los naturales, sus opuestos negativos y el cero",
                        "example": "..., -3, -2, -1, 0, 1, 2, 3, ..."
                    },
                    {
                        "term": "Números Naturales",
                        "definition": "Números positivos que se usan para contar",
                        "example": "1, 2, 3, 4, 5, ..."
                    },
                    {
                        "term": "Números Negativos",
                        "definition": "Números menores que cero, representados con el signo menos",
                        "example": "-1, -2, -3, -4, ..."
                    },
                    {
                        "term": "Valor Absoluto",
                        "definition": "Distancia de un número entero al cero, siempre positiva",
                        "example": "|−3| = 3, |5| = 5"
                    },
                    {
                        "term": "Opuesto",
                        "definition": "Número que tiene el mismo valor absoluto pero signo contrario",
                        "example": "El opuesto de 7 es -7"
                    }
                ]
            },
            # Theory
            {
                "module_id": first_module_id,
                "content_type": "theory",
                "title": "Teoría - Definición y Clasificación de Números Enteros",
                "theory_content": """
# Números Enteros - Definición y Clasificación

## ¿Qué son los números enteros?

Los números enteros son una extensión de los números naturales que incluye:
- Los números naturales: 1, 2, 3, 4, 5, ...
- El cero: 0
- Los números negativos: -1, -2, -3, -4, -5, ...

**Conjunto de números enteros**: Z = {..., -3, -2, -1, 0, 1, 2, 3, ...}

## Clasificación de los números enteros

### 1. Números enteros positivos
Son los números naturales: 1, 2, 3, 4, 5, ...
- También se pueden escribir como +1, +2, +3, ...
- Se ubican a la derecha del cero en la recta numérica

### 2. El cero (0)
- Es neutro, no es positivo ni negativo
- Separa los números positivos de los negativos
- Es el centro de la recta numérica

### 3. Números enteros negativos  
Son: -1, -2, -3, -4, -5, ...
- Se ubican a la izquierda del cero en la recta numérica
- Representan cantidades menores que cero

## La recta numérica

En la recta numérica, los números enteros se ordenan de menor a mayor:
- Los números negativos están a la izquierda del cero
- Los números positivos están a la derecha del cero
- Mientras más a la derecha, mayor es el número
- Mientras más a la izquierda, menor es el número

## Valor absoluto

El valor absoluto de un número entero es su distancia al cero, sin considerar el signo.
- Se representa con barras verticales: |a|
- Siempre es positivo o cero
- |5| = 5, |-5| = 5, |0| = 0

## Números opuestos

Dos números son opuestos si tienen el mismo valor absoluto pero signos diferentes.
- El opuesto de 7 es -7
- El opuesto de -3 es 3  
- El opuesto de 0 es 0
                """
            },
            # Learning Exercises
            {
                "module_id": first_module_id,
                "content_type": "learning_exercises",
                "title": "Ejercicios de Aprendizaje - Números Enteros",
                "exercises": [
                    {
                        "problem": "¿Cuál de los siguientes números NO es un número entero?",
                        "options": [
                            {"option_text": "-5", "is_correct": False},
                            {"option_text": "0", "is_correct": False},
                            {"option_text": "3.5", "is_correct": True},
                            {"option_text": "7", "is_correct": False}
                        ],
                        "difficulty": "easy",
                        "explanation": "3.5 no es un número entero porque tiene parte decimal. Los números enteros son: ..., -2, -1, 0, 1, 2, ..."
                    },
                    {
                        "problem": "¿Cuál es el valor absoluto de -8?",
                        "options": [
                            {"option_text": "-8", "is_correct": False},
                            {"option_text": "8", "is_correct": True},
                            {"option_text": "0", "is_correct": False},
                            {"option_text": "16", "is_correct": False}
                        ],
                        "difficulty": "easy",
                        "explanation": "El valor absoluto de -8 es 8, porque representa la distancia de -8 al cero en la recta numérica."
                    },
                    {
                        "problem": "¿Cuál es el opuesto de -12?",
                        "options": [
                            {"option_text": "-12", "is_correct": False},
                            {"option_text": "12", "is_correct": True},
                            {"option_text": "0", "is_correct": False},
                            {"option_text": "24", "is_correct": False}
                        ],
                        "difficulty": "easy",
                        "explanation": "El opuesto de -12 es 12, porque tienen el mismo valor absoluto pero signos contrarios."
                    }
                ]
            },
            # Practice Exercises
            {
                "module_id": first_module_id,
                "content_type": "practice_exercises",
                "title": "Ejercicios de Práctica - Números Enteros",
                "exercises": [
                    {
                        "problem": "Ordena de menor a mayor: -3, 5, -1, 0, 2",
                        "options": [
                            {"option_text": "-3, -1, 0, 2, 5", "is_correct": True},
                            {"option_text": "5, 2, 0, -1, -3", "is_correct": False},
                            {"option_text": "-1, -3, 0, 2, 5", "is_correct": False},
                            {"option_text": "-3, -1, 2, 0, 5", "is_correct": False}
                        ],
                        "difficulty": "medium",
                        "explanation": "En la recta numérica, de izquierda a derecha (menor a mayor): -3, -1, 0, 2, 5"
                    },
                    {
                        "problem": "Si |x| = 7 y x es negativo, ¿cuál es el valor de x?",
                        "options": [
                            {"option_text": "7", "is_correct": False},
                            {"option_text": "-7", "is_correct": True},
                            {"option_text": "0", "is_correct": False},
                            {"option_text": "14", "is_correct": False}
                        ],
                        "difficulty": "medium",
                        "explanation": "Si |x| = 7 y x es negativo, entonces x = -7, porque |-7| = 7"
                    },
                    {
                        "problem": "¿Entre qué números enteros consecutivos está ubicado el cero?",
                        "options": [
                            {"option_text": "Entre -1 y 1", "is_correct": True},
                            {"option_text": "Entre 0 y 1", "is_correct": False},
                            {"option_text": "Entre -2 y 2", "is_correct": False},
                            {"option_text": "No está entre números consecutivos", "is_correct": False}
                        ],
                        "difficulty": "hard",
                        "explanation": "El cero está entre -1 y 1, que son números enteros consecutivos."
                    }
                ]
            },
            # Quiz
            {
                "module_id": first_module_id,
                "content_type": "quiz",
                "title": "Quiz - Números Enteros: Definición y Clasificación",
                "quiz_questions": [
                    {
                        "question": "Los números enteros incluyen:",
                        "options": [
                            {"option_text": "Solo números positivos", "is_correct": False},
                            {"option_text": "Solo números negativos", "is_correct": False},
                            {"option_text": "Números positivos, negativos y el cero", "is_correct": True},
                            {"option_text": "Solo números decimales", "is_correct": False}
                        ],
                        "explanation": "Los números enteros incluyen los números positivos (1,2,3...), negativos (-1,-2,-3...) y el cero."
                    },
                    {
                        "question": "En la recta numérica, ¿dónde se ubican los números negativos?",
                        "options": [
                            {"option_text": "A la derecha del cero", "is_correct": False},
                            {"option_text": "A la izquierda del cero", "is_correct": True},
                            {"option_text": "En el mismo lugar que el cero", "is_correct": False},
                            {"option_text": "No se pueden ubicar", "is_correct": False}
                        ],
                        "explanation": "Los números negativos se ubican a la izquierda del cero en la recta numérica."
                    },
                    {
                        "question": "¿Cuál es el valor de |-15|?",
                        "options": [
                            {"option_text": "-15", "is_correct": False},
                            {"option_text": "15", "is_correct": True},
                            {"option_text": "0", "is_correct": False},
                            {"option_text": "30", "is_correct": False}
                        ],
                        "explanation": "El valor absoluto de -15 es 15, porque representa la distancia de -15 al cero."
                    },
                    {
                        "question": "Dos números son opuestos cuando:",
                        "options": [
                            {"option_text": "Tienen diferente valor absoluto", "is_correct": False},
                            {"option_text": "Tienen el mismo valor absoluto y diferentes signos", "is_correct": True},
                            {"option_text": "Son ambos positivos", "is_correct": False},
                            {"option_text": "Son ambos negativos", "is_correct": False}
                        ],
                        "explanation": "Dos números son opuestos cuando tienen el mismo valor absoluto pero signos diferentes, como 5 y -5."
                    },
                    {
                        "question": "¿Cuál número es mayor: -10 o -5?",
                        "options": [
                            {"option_text": "-10", "is_correct": False},
                            {"option_text": "-5", "is_correct": True},
                            {"option_text": "Son iguales", "is_correct": False},
                            {"option_text": "No se pueden comparar", "is_correct": False}
                        ],
                        "explanation": "-5 es mayor que -10 porque está más cerca del cero y más a la derecha en la recta numérica."
                    }
                ]
            }
        ]

        # Insert content
        await db.content.insert_many(content_data)

        return {"message": "Database initialized successfully with complete 7th grade content structure!"}

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