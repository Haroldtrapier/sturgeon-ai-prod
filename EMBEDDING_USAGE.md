# Embedding Storage Feature

This document describes how to use the embedding storage functionality in Sturgeon AI.

## Overview

The embedding storage feature provides functionality to generate and store text embeddings using OpenAI's `text-embedding-3-large` model. Embeddings are stored in PostgreSQL using the pgvector extension for efficient similarity search.

## Setup

### 1. Database Setup

First, ensure PostgreSQL is running with the pgvector extension:

```sql
-- Run this in your PostgreSQL database
CREATE EXTENSION IF NOT EXISTS vector;
```

Then, apply the schema:

```bash
psql -U your_user -d your_database -f backend/schema.sql
```

### 2. Environment Variables

Set the following environment variables:

```bash
# Required
export OPENAI_API_KEY="your-openai-api-key"

# Optional (defaults shown)
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sturgeon_ai"
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
# or
pip install -r backend/requirements.txt
```

## Usage

### Basic Usage

```python
from embeddings import embed, store_embedding

# Generate an embedding
text = "Government contract for software development services"
vector = embed(text)
print(f"Generated embedding with {len(vector)} dimensions")

# Store an embedding
store_embedding(
    user_id="user123",
    proposal_id="proposal456",
    text="This is the proposal text to embed and store"
)
```

### Backend Module Usage

If you prefer to use the backend modules directly:

```python
from backend.embeddings import embed, store_embedding
from backend.database import SessionLocal, get_db
from backend.models.embeddings import EmbeddingRecord

# Same usage as above
vector = embed("Some text")
store_embedding("user123", "proposal456", "Some text")
```

### Using with FastAPI

```python
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.embeddings import store_embedding

app = FastAPI()

@app.post("/api/embeddings")
async def create_embedding(
    user_id: str,
    proposal_id: str,
    text: str,
    db: Session = Depends(get_db)
):
    try:
        store_embedding(user_id, proposal_id, text)
        return {"success": True, "message": "Embedding stored successfully"}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

### Querying Embeddings

```python
from backend.database import SessionLocal
from backend.models.embeddings import EmbeddingRecord

db = SessionLocal()

# Get all embeddings for a user
user_embeddings = db.query(EmbeddingRecord).filter(
    EmbeddingRecord.user_id == "user123"
).all()

# Get embeddings for a specific proposal
proposal_embeddings = db.query(EmbeddingRecord).filter(
    EmbeddingRecord.proposal_id == "proposal456"
).all()

db.close()
```

### Vector Similarity Search

```python
from backend.database import SessionLocal
from backend.models.embeddings import EmbeddingRecord
from backend.embeddings import embed

db = SessionLocal()

# Generate query embedding
query_text = "software development services"
query_vector = embed(query_text)

# Find similar embeddings using cosine similarity
# Note: This requires pgvector's similarity operators
similar = db.execute(
    """
    SELECT id, user_id, proposal_id, 
           vector <=> CAST(:query_vector AS vector) AS distance
    FROM embeddings
    ORDER BY distance
    LIMIT 10
    """,
    {"query_vector": str(query_vector)}
).fetchall()

db.close()
```

## API Reference

### `embed(text: str) -> list[float]`

Generate embeddings for the given text.

**Parameters:**
- `text` (str): The input text to embed

**Returns:**
- `list[float]`: A list of 3072 floats representing the embedding vector

**Raises:**
- `ValueError`: If OPENAI_API_KEY is not set or response is invalid
- `Exception`: If the OpenAI API call fails

### `store_embedding(user_id: str, proposal_id: str, text: str) -> None`

Generate and store an embedding in the database.

**Parameters:**
- `user_id` (str): Identifier for the user
- `proposal_id` (str): Identifier for the proposal
- `text` (str): The text content to embed and store

**Raises:**
- `ValueError`: If embedding validation fails
- `Exception`: If embedding generation or database storage fails

## Database Schema

### `embeddings` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `user_id` | VARCHAR | User identifier (indexed) |
| `proposal_id` | VARCHAR | Proposal identifier (indexed) |
| `vector` | VECTOR(3072) | The embedding vector (indexed for similarity search) |
| `created_at` | TIMESTAMP WITH TIME ZONE | Record creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | Record update timestamp |

## Error Handling

The implementation includes comprehensive error handling:

- **API Errors**: OpenAI API failures are caught and wrapped with descriptive messages
- **Validation Errors**: Empty responses and incorrect dimensions are validated
- **Database Errors**: Failed transactions trigger automatic rollback
- **Missing API Key**: Clear error message if OPENAI_API_KEY is not set

## Performance Considerations

1. **Vector Index**: The schema includes an IVFFlat index on the vector column for fast similarity searches
2. **Connection Pooling**: Database connection pooling is configured with reasonable defaults
3. **Lazy Initialization**: The OpenAI client is initialized only when needed

## Security

- API keys are loaded from environment variables, never hardcoded
- Database credentials are managed through environment variables
- All database transactions include proper error handling and rollback
- Input validation prevents storage of malformed embeddings
