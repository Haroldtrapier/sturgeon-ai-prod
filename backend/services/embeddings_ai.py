import openai
import os
from database import SessionLocal
# from models.embeddings import EmbeddingRecord  # TODO: create model

openai.api_key = os.getenv("OPENAI_API_KEY")

def embed(text: str):
    response = openai.embeddings.create(
        model="text-embedding-3-large",
        input=text
    )
    return response.data[0].embedding

def store_embedding(user_id: str, proposal_id: str, text: str):
    vector = embed(text)
    db = SessionLocal()
    # TODO: Uncomment when EmbeddingRecord model is created
    # db.add(EmbeddingRecord(
    #     user_id=user_id,
    #     proposal_id=proposal_id,
    #     vector=vector
    # ))
    # db.commit()
    print(f"✅ Embedding generated for proposal {proposal_id}")
    return vector
