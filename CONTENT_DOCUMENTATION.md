# Documentación para Agregar Contenido Educativo

## Introducción

Esta aplicación educativa de matemáticas tiene una estructura jerárquica completa para grados 7-12. Actualmente, el **7mo grado** tiene contenido completo como ejemplo, y los demás grados están preparados para que agregues contenido fácilmente.

## Estructura Jerárquica

```
Grados (7-12)
├── Temas por Grado
    ├── Módulos por Tema
        ├── 5 Tipos de Contenido por Módulo:
            ├── 1. Glosario
            ├── 2. Teoría
            ├── 3. Ejercicios de Aprendizaje
            ├── 4. Ejercicios de Práctica
            └── 5. Quiz
```

## Cómo Agregar Contenido

### 1. Acceder a la Base de Datos

El contenido se maneja a través de MongoDB. Puedes agregar contenido de dos maneras:

**Opción A: Usando la API (Recomendado)**
- Usa endpoints POST para crear contenido
- Formato JSON estructurado

**Opción B: Directamente en MongoDB**
- Accede a las colecciones: `grades`, `topics`, `modules`, `content`

### 2. Estructura de las Colecciones

#### Colección: `grades`
```json
{
  "_id": "ObjectId",
  "grade_number": 8,
  "grade_name": "8vo Grado",
  "description": "Descripción del grado",
  "is_active": true,
  "created_at": "fecha"
}
```

#### Colección: `topics`
```json
{
  "_id": "ObjectId",
  "grade_id": "id_del_grado",
  "name": "Nombre del tema",
  "description": "Descripción del tema",
  "icon": "nombre_del_icono", // Ver iconos disponibles abajo
  "order": 1,
  "is_active": true,
  "created_at": "fecha"
}
```

#### Colección: `modules`
```json
{
  "_id": "ObjectId",
  "topic_id": "id_del_tema",
  "name": "Nombre del módulo",
  "description": "Descripción del módulo",
  "order": 1,
  "is_active": true,
  "created_at": "fecha"
}
```

#### Colección: `content`
```json
{
  "_id": "ObjectId",
  "module_id": "id_del_modulo",
  "content_type": "glossary|theory|learning_exercises|practice_exercises|quiz",
  "title": "Título del contenido",
  
  // Para Glosario:
  "glossary_terms": [
    {
      "term": "Término",
      "definition": "Definición del término",
      "example": "Ejemplo opcional"
    }
  ],
  
  // Para Teoría:
  "theory_content": "Contenido de teoría en formato markdown",
  
  // Para Ejercicios:
  "exercises": [
    {
      "problem": "Enunciado del problema",
      "options": [
        {
          "option_text": "Opción A",
          "is_correct": false
        },
        {
          "option_text": "Opción B",
          "is_correct": true
        }
      ],
      "difficulty": "easy|medium|hard",
      "explanation": "Explicación de la respuesta"
    }
  ],
  
  // Para Quiz:
  "quiz_questions": [
    {
      "question": "Pregunta del quiz",
      "options": [
        {
          "option_text": "Opción A",
          "is_correct": false
        },
        {
          "option_text": "Opción B",
          "is_correct": true
        }
      ],
      "explanation": "Explicación de la respuesta correcta"
    }
  ],
  
  "created_at": "fecha"
}
```

## Paso a Paso: Agregar un Grado Completo

### Paso 1: Identificar el Grado
Los grados 8-12 ya están creados en la base de datos. Puedes verificar con:
```bash
curl http://localhost:8001/api/grades
```

### Paso 2: Crear Temas para el Grado

1. **Obtén el ID del grado**:
```bash
curl http://localhost:8001/api/grades
# Busca el grado que quieres (ej: 8vo grado) y copia su "_id"
```

2. **Reemplaza los temas placeholder**:
Los grados 8-12 tienen temas genéricos que puedes reemplazar. Por ejemplo, para 8vo grado:

```json
{
  "grade_id": "ID_DEL_8VO_GRADO",
  "name": "Ecuaciones Lineales",
  "description": "Resolución de ecuaciones de primer grado",
  "icon": "calculator",
  "order": 1
}
```

### Paso 3: Crear Módulos para cada Tema

Para cada tema, crea módulos específicos:

```json
{
  "topic_id": "ID_DEL_TEMA",
  "name": "Ecuaciones de una variable",
  "description": "Introducción a ecuaciones con una incógnita",
  "order": 1
}
```

### Paso 4: Crear los 5 Tipos de Contenido

Para cada módulo, debes crear exactamente **5 documentos de contenido**:

1. **Glosario** (`content_type: "glossary"`)
2. **Teoría** (`content_type: "theory"`)
3. **Ejercicios de Aprendizaje** (`content_type: "learning_exercises"`)
4. **Ejercicios de Práctica** (`content_type: "practice_exercises"`)
5. **Quiz** (`content_type: "quiz"`)

## Iconos Disponibles

Para los temas, puedes usar estos iconos (campo `icon`):
- `calculator` - Calculadora
- `pie-chart` - Gráfico circular
- `function` - Funciones (se mapea a git-branch)
- `triangle` - Triángulo
- `percent` - Porcentaje (se mapea a stats-chart)
- `book` - Libro (por defecto)

## Ejemplo Completo: 8vo Grado - Álgebra

### 1. Tema: "Ecuaciones Lineales"
```json
{
  "grade_id": "ID_DEL_8VO_GRADO",
  "name": "Ecuaciones Lineales",
  "description": "Resolución y aplicación de ecuaciones de primer grado",
  "icon": "calculator",
  "order": 1
}
```

### 2. Módulo: "Ecuaciones con una variable"
```json
{
  "topic_id": "ID_DEL_TEMA_ECUACIONES",
  "name": "Ecuaciones con una variable",
  "description": "Fundamentos de ecuaciones de primer grado con una incógnita",
  "order": 1
}
```

### 3. Contenido del Módulo:

#### A. Glosario
```json
{
  "module_id": "ID_DEL_MODULO",
  "content_type": "glossary",
  "title": "Glosario - Ecuaciones Lineales",
  "glossary_terms": [
    {
      "term": "Ecuación",
      "definition": "Igualdad matemática que contiene una o más incógnitas",
      "example": "2x + 3 = 7"
    },
    {
      "term": "Incógnita",
      "definition": "Variable cuyo valor se debe encontrar",
      "example": "En 2x + 3 = 7, la incógnita es x"
    }
  ]
}
```

#### B. Teoría
```json
{
  "module_id": "ID_DEL_MODULO",
  "content_type": "theory",
  "title": "Teoría - Ecuaciones con una variable",
  "theory_content": "# Ecuaciones con una variable\n\nUna ecuación lineal es una igualdad que contiene variables de primer grado.\n\n## Forma general\nax + b = c\n\nDonde:\n- a, b, c son números conocidos\n- x es la incógnita\n- a ≠ 0\n\n## Pasos para resolver:\n1. Aislar los términos con variable a un lado\n2. Aislar los términos constantes al otro lado\n3. Dividir entre el coeficiente de la variable\n\n**Ejemplo:**\n2x + 3 = 7\n2x = 7 - 3\n2x = 4\nx = 2"
}
```

#### C. Ejercicios de Aprendizaje
```json
{
  "module_id": "ID_DEL_MODULO",
  "content_type": "learning_exercises",
  "title": "Ejercicios de Aprendizaje - Ecuaciones",
  "exercises": [
    {
      "problem": "Resuelve la ecuación: x + 5 = 8",
      "options": [
        {"option_text": "x = 3", "is_correct": true},
        {"option_text": "x = 13", "is_correct": false},
        {"option_text": "x = -3", "is_correct": false},
        {"option_text": "x = 2", "is_correct": false}
      ],
      "difficulty": "easy",
      "explanation": "Para resolver x + 5 = 8, restamos 5 de ambos lados: x = 8 - 5 = 3"
    }
  ]
}
```

#### D. Ejercicios de Práctica
```json
{
  "module_id": "ID_DEL_MODULO",
  "content_type": "practice_exercises",
  "title": "Ejercicios de Práctica - Ecuaciones",
  "exercises": [
    {
      "problem": "Resuelve: 3x - 2 = 10",
      "options": [
        {"option_text": "x = 4", "is_correct": true},
        {"option_text": "x = 3", "is_correct": false},
        {"option_text": "x = 6", "is_correct": false},
        {"option_text": "x = 8", "is_correct": false}
      ],
      "difficulty": "medium",
      "explanation": "3x - 2 = 10 → 3x = 12 → x = 4"
    }
  ]
}
```

#### E. Quiz
```json
{
  "module_id": "ID_DEL_MODULO",
  "content_type": "quiz",
  "title": "Quiz - Ecuaciones con una variable",
  "quiz_questions": [
    {
      "question": "¿Cuál es la solución de 2x + 1 = 9?",
      "options": [
        {"option_text": "x = 4", "is_correct": true},
        {"option_text": "x = 5", "is_correct": false},
        {"option_text": "x = 3", "is_correct": false},
        {"option_text": "x = 10", "is_correct": false}
      ],
      "explanation": "2x + 1 = 9 → 2x = 8 → x = 4"
    }
  ]
}
```

## Herramientas para Agregar Contenido

### Opción 1: Usar endpoints API

Crea archivos JSON con el contenido y usa curl:

```bash
# Crear tema
curl -X POST http://localhost:8001/api/topics \
  -H "Content-Type: application/json" \
  -d @tema.json

# Crear módulo
curl -X POST http://localhost:8001/api/modules \
  -H "Content-Type: application/json" \
  -d @modulo.json

# Crear contenido
curl -X POST http://localhost:8001/api/content \
  -H "Content-Type: application/json" \
  -d @contenido.json
```

### Opción 2: Script de Inicialización

Puedes modificar la función `initialize_data()` en `/app/backend/server.py` para agregar más contenido automáticamente.

## Validación del Contenido

Una vez agregado el contenido, puedes verificar que funciona:

1. **Verificar que aparece en la app**: El grado debe mostrar contenido disponible
2. **Probar navegación**: Grado → Tema → Módulo → Contenido
3. **Probar cada tipo**: Glosario, Teoría, Ejercicios, Quiz

## Estructura Curricular Recomendada por Grado

### 8vo Grado
- **Ecuaciones Lineales**: Ecuaciones simples, sistemas básicos
- **Funciones**: Introducción a funciones, gráficas
- **Geometría**: Teorema de Pitágoras, áreas y volúmenes

### 9no Grado
- **Ecuaciones Cuadráticas**: Factorización, fórmula general
- **Funciones Cuadráticas**: Parábolas, vértice
- **Geometría Analítica**: Coordenadas, distancias

### 10mo Grado
- **Trigonometría**: Razones trigonométricas, identidades
- **Logaritmos**: Propiedades, ecuaciones logarítmicas
- **Geometría**: Círculos, polígonos

### 11mo Grado
- **Funciones Exponenciales**: Crecimiento exponencial
- **Estadística**: Medidas de tendencia, probabilidad
- **Secuencias**: Aritméticas, geométricas

### 12mo Grado
- **Límites**: Introducción al cálculo
- **Derivadas**: Conceptos básicos
- **Integrales**: Área bajo la curva

## Consideraciones Técnicas

1. **Orden**: Los `order` determinan el orden de aparición
2. **IDs**: Siempre usa los IDs correctos de MongoDB
3. **Activación**: Cambia `is_active` a `true` cuando el contenido esté listo
4. **Formato**: La teoría soporta markdown básico
5. **Ejercicios**: Siempre incluye explicaciones claras

## Soporte

Si necesitas ayuda:
1. Revisa el ejemplo del 7mo grado
2. Usa las APIs para verificar datos
3. Prueba el contenido en la app antes de finalizar

¡El sistema está diseñado para ser completamente escalable y fácil de usar!