"""
Embeddings AI Service - Generate and manage vector embeddings
"""
import openai
import os
import uuid
import hashlib
import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from database import SessionLocal
from models.embeddings import EmbeddingRecord, SemanticSearchCache

openai.api_key = os.getenv("OPENAI_API_KEY")


def embed(text: str, model: str = "text-embedding-3-small") -> List[float]:
    """Generate embedding vector for text"""
    response = openai.embeddings.create(
        model=model,
        input=text
    )
    return response.data[0].embedding


def store_embedding(
    user_id: str,
    text: str,
    source_type: str = "proposal",
    source_id: Optional[str] = None,
    proposal_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    db: Optional[Session] = None
) -> EmbeddingRecord:
    """Store embedding in database"""
    should_close = db is None
    if db is None:
        db = SessionLocal()
    
    try:
        vector = embed(text)
        
        embedding_record = EmbeddingRecord(
            id=str(uuid.uuid4()),
            user_id=user_id,
            proposal_id=proposal_id,
            source_type=source_type,
            source_id=source_id or str(uuid.uuid4()),
            text_content=text[:5000],  # Store first 5000 chars
            embedding_model="text-embedding-3-small",
            vector=vector,
            metadata=metadata
        )
        
        db.add(embedding_record)
        db.commit()
        db.refresh(embedding_record)
        
        print(f"✅ Embedding generated for {source_type} {source_id}")
        return embedding_record
    finally:
        if should_close:
            db.close()


def rebuild_all_embeddings(user_id: Optional[str] = None, db: Optional[Session] = None):
    """
    Rebuild all embeddings for proposals and opportunities
    Used for maintenance and after model updates
    """
    should_close = db is None
    if db is None:
        db = SessionLocal()
    
    try:
        from models.proposal import Proposal
        
        # Query proposals
        query = db.query(Proposal)
        if user_id:
            query = query.filter(Proposal.user_id == user_id)
        
        proposals = query.all()
        
        rebuilt_count = 0
        for proposal in proposals:
            if proposal.generated_text or proposal.raw_text:
                text = proposal.generated_text or proposal.raw_text
                store_embedding(
                    user_id=proposal.user_id,
                    text=text,
                    source_type="proposal",
                    source_id=proposal.id,
                    proposal_id=proposal.id,
                    db=db
                )
                rebuilt_count += 1
        
        print(f"✅ Rebuilt {rebuilt_count} embeddings")
        return rebuilt_count
    finally:
        if should_close:
            db.close()


def semantic_search(
    query: str,
    source_type: Optional[str] = None,
    user_id: Optional[str] = None,
    top_k: int = 10,
    use_cache: bool = True,
    db: Optional[Session] = None
) -> List[Dict[str, Any]]:
    """
    Perform semantic search using embeddings
    """
    should_close = db is None
    if db is None:
        db = SessionLocal()
    
    try:
        # Check cache first
        query_hash = hashlib.md5(query.encode()).hexdigest()
        
        if use_cache:
            cached = db.query(SemanticSearchCache).filter(
                SemanticSearchCache.query_hash == query_hash
            ).first()
            
            if cached:
                cached.hit_count += 1
                db.commit()
                return json.loads(cached.results)
        
        # Generate query embedding
        query_vector = embed(query)
        
        # Get all embeddings (in production, use vector similarity search)
        query_obj = db.query(EmbeddingRecord)
        if source_type:
            query_obj = query_obj.filter(EmbeddingRecord.source_type == source_type)
        if user_id:
            query_obj = query_obj.filter(EmbeddingRecord.user_id == user_id)
        
        all_embeddings = query_obj.all()
        
        # Calculate cosine similarity (simplified - use pgvector in production)
        results = []
        for emb in all_embeddings:
            # Simple dot product for similarity
            similarity = sum(a * b for a, b in zip(query_vector, emb.vector))
            results.append({
                "id": emb.id,
                "source_type": emb.source_type,
                "source_id": emb.source_id,
                "text": emb.text_content,
                "similarity": similarity,
                "metadata": emb.metadata
            })
        
        # Sort by similarity and get top k
        results = sorted(results, key=lambda x: x["similarity"], reverse=True)[:top_k]
        
        # Cache results
        if use_cache and results:
            cache_entry = SemanticSearchCache(
                id=str(uuid.uuid4()),
                query_text=query,
                query_hash=query_hash,
                results=json.dumps(results),
                hit_count=1
            )
            db.add(cache_entry)
            db.commit()
        
        return results
    finally:
        if should_close:
            db.close()
