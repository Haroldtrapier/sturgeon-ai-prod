import os
import json
import logging
from typing import List, Dict, Any, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer

# Optional OpenAI import – only needed for summary generation
try:
    import openai
except ImportError:  # pragma: no cover
    openai = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OpportunityMatcher:
    """
    Matches opportunities to candidates based on textual and numeric features.

    The matcher builds TF‑IDF vectors for the textual description of each
    opportunity and candidate, then computes cosine similarity.  Additional
    numeric features (e.g., years of experience, location score) can be
    concatenated to the TF‑IDF vectors.

    Example
    -------
    >>> matcher = OpportunityMatcher()
    >>> matcher.fit(opportunities_df, candidates_df)
    >>> matches = matcher.match(candidate_id=42, top_k=5)
    """

    def __init__(self, text_column: str = "description", numeric_columns: Optional[List[str]] = None):
        self.text_column = text_column
        self.numeric_columns = numeric_columns or []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.opportunity_vectors: Optional[np.ndarray] = None
        self.opportunity_ids: List[Any] = []

    def _prepare_texts(self, df: pd.DataFrame) -> List[str]:
        return df[self.text_column].fillna("").astype(str).tolist()

    def _prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        """Combine TF‑IDF vectors with numeric columns."""
        texts = self._prepare_texts(df)
        tfidf = self.vectorizer.transform(texts)

        if self.numeric_columns:
            numeric = df[self.numeric_columns].fillna(0).to_numpy()
            # Normalize numeric features to unit variance
            numeric = (numeric - numeric.mean(axis=0)) / (numeric.std(axis=0) + 1e-8)
            features = np.hstack([tfidf.toarray(), numeric])
        else:
            features = tfidf.toarray()
        return features

    def fit(self, opportunities: pd.DataFrame, candidates: pd.DataFrame) -> None:
        """
        Fit the matcher on the provided data.

        Parameters
        ----------
        opportunities: DataFrame with at least an ``id`` column and a text column.
        candidates: DataFrame with at least an ``id`` column and a text column.
        """
        # Build TF‑IDF on the combined corpus to ensure same vocabulary
        corpus = pd.concat([opportunities, candidates], ignore_index=True)
        self.vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        self.vectorizer.fit(self._prepare_texts(corpus))

        # Store opportunity vectors for later similarity look‑ups
        self.opportunity_vectors = self._prepare_features(opportunities)
        self.opportunity_ids = opportunities["id"].tolist()
        logger.info("OpportunityMatcher fitted with %d opportunities.", len(self.opportunity_ids))

    def match(self, candidate_id: Any, candidates: pd.DataFrame, top_k: int = 5) -> List[Tuple[Any, float]]:
        """
        Return the top‑k matching opportunity IDs for a given candidate.

        Parameters
        ----------
        candidate_id: Identifier of the candidate in the ``candidates`` DataFrame.
        candidates: DataFrame containing the candidate records (must include ``id``).
        top_k: Number of matches to return.

        Returns
        -------
        List of tuples ``(opportunity_id, similarity_score)`` sorted descending.
        """
        if self.opportunity_vectors is None or self.vectorizer is None:
            raise RuntimeError("Matcher has not been fitted yet.")

        candidate_row = candidates[candidates["id"] == candidate_id]
        if candidate_row.empty:
            raise ValueError(f"Candidate with id {candidate_id} not found.")

        candidate_vec = self._prepare_features(candidate_row)[0].reshape(1, -1)
        sims = cosine_similarity(candidate_vec, self.opportunity_vectors).flatten()
        top_idx = np.argsort(sims)[::-1][:top_k]
        matches = [(self.opportunity_ids[i], float(sims[i])) for i in top_idx]
        logger.debug("Matches for candidate %s: %s", candidate_id, matches)
        return matches


class RecommendationEngine:
    """
    Simple content‑based recommendation system using nearest neighbours.

    The engine learns a vector representation for items (e.g., products,
    opportunities) and can recommend similar items for a given item ID.
    """

    def __init__(self, n_neighbors: int = 10, metric: str = "cosine"):
        self.n_neighbors = n_neighbors
        self.metric = metric
        self.model: Optional[NearestNeighbors] = None
        self.item_ids: List[Any] = []
        self.item_vectors: Optional[np.ndarray] = None

    def fit(self, items: pd.DataFrame, text_column: str = "description",
            numeric_columns: Optional[List[str]] = None) -> None:
        """
        Fit the recommendation model.

        Parameters
        ----------
        items: DataFrame with at least an ``id`` column.
        text_column: Column containing free‑text description.
        numeric_columns: Optional list of numeric feature columns.
        """
        vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        tfidf = vectorizer.fit_transform(items[text_column].fillna("").astype(str))

        if numeric_columns:
            numeric = items[numeric_columns].fillna(0).to_numpy()
            numeric = (numeric - numeric.mean(axis=0)) / (numeric.std(axis=0) + 1e-8)
            vectors = np.hstack([tfidf.toarray(), numeric])
        else:
            vectors = tfidf.toarray()

        self.model = NearestNeighbors(n_neighbors=self.n_neighbors,
                                      metric=self.metric,
                                      algorithm="auto")
        self.model.fit(vectors)
        self.item_ids = items["id"].tolist()
        self.item_vectors = vectors
        logger.info("RecommendationEngine fitted on %d items.", len(self.item_ids))

    def recommend(self, item_id: Any, top_k: Optional[int] = None) -> List[Tuple[Any, float]]:
        """
        Recommend items similar to the given ``item_id``.

        Parameters
        ----------
        item_id: Identifier of the reference item.
        top_k: Number of recommendations to return (defaults to ``n_neighbors``).

        Returns
        -------
        List of tuples ``(recommended_item_id, distance)`` sorted by increasing distance.
        """
        if self.model is None or self.item_vectors is None:
            raise RuntimeError("RecommendationEngine has not been fitted yet.")

        try:
            idx = self.item_ids.index(item_id)
        except ValueError as exc:
            raise ValueError(f"Item id {item_id} not found in fitted data.") from exc

        vector = self.item_vectors[idx].reshape(1, -1)
        distances, indices = self.model.kneighbors(vector, n_neighbors=top_k or self.n_neighbors)
        # Exclude the query item itself (distance == 0)
        recs = []
        for dist, i in zip(distances[0], indices[0]):
            if i == idx:
                continue
            recs.append((self.item_ids[i], float(dist)))
        logger.debug("Recommendations for item %s: %s", item_id, recs)
        return recs


class OpenAISummary:
    """
    Wrapper around OpenAI's ChatCompletion API to generate concise summaries.

    The class expects the ``OPENAI_API_KEY`` environment variable to be set.
    """

    def __init__(self, model: str = "gpt-4o-mini", temperature: float = 0.2):
        if openai is None:
            raise ImportError("openai package is required for OpenAISummary.")
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise EnvironmentError("OPENAI_API_KEY environment variable not set.")
        openai.api_key = api_key
        self.model = model
        self.temperature = temperature

    def summarize(self, text: str, max_tokens: int = 150) -> str:
        """
        Generate a summary for the supplied ``text``.

        Parameters
        ----------
        text: The raw text to be summarized.
        max_tokens: Maximum number of tokens in the generated summary.

        Returns
        -------
        Summary string.
        """
        if not text.strip():
            return ""

        prompt = (
            "Summarize the following text in a concise, professional tone. "
            "Focus on key points, outcomes, and actionable items.\n\n"
            f"Text:\n{text}\n\nSummary:"
        )
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                max_tokens=max_tokens,
                n=1,
                stop=None,
            )
            summary = response.choices[0].message.content.strip()
            logger.debug("Generated summary: %s", summary)
            return summary
        except Exception as exc:  # pragma: no cover
            logger.error("OpenAI API error: %s", exc)
            raise


def _load_example_data() -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Helper to generate synthetic data for quick testing.
    Returns (opportunities, candidates) DataFrames.
    """
    opportunities = pd.DataFrame({
        "id": [f"opp_{i}" for i in range(1, 6)],
        "description": [
            "Data science role focusing on predictive modeling and NLP.",
            "Frontend developer needed for React and TypeScript projects.",
            "Senior backend engineer with experience in microservices.",
            "Marketing analyst with strong Excel and SQL skills.",
            "Product manager for AI-driven SaaS platform."
        ],
        "years_experience": [2, 3, 5, 1, 4],
        "location_score": [0.8, 0.5, 0.9, 0.6, 0.7],
    })
    candidates = pd.DataFrame({
        "id": [f"cand_{i}" for i in range(1, 4)],
        "description": [
            "Experienced data scientist skilled in machine learning, NLP, and Python.",
            "Frontend engineer proficient in React, JavaScript, and UI/UX design.",
            "Backend developer with expertise in microservices, Docker, and Go."
        ],
        "years_experience": [3, 2, 4],
        "location_score": [0.7, 0.6, 0.85],
    })
    return opportunities, candidates


def main() -> None:
    # Load example data
    opportunities, candidates = _load_example_data()

    # --- Opportunity Matching ---
    matcher = OpportunityMatcher(
        text_column="description",
        numeric_columns=["years_experience", "location_score"]
    )
    matcher.fit(opportunities, candidates)

    # Example: match first candidate to top 3 opportunities
    candidate_id = candidates.iloc[0]["id"]
    matches = matcher.match(candidate_id, candidates, top_k=3)
    print(f"Top matches for candidate {candidate_id}:")
    for opp_id, score in matches:
        print(f"  {opp_id} (similarity: {score:.4f})")

    # --- Recommendation Engine ---
    recommender = RecommendationEngine(n_neighbors=3)
    recommender.fit(opportunities, text_column="description",
                    numeric_columns=["years_experience", "location_score"])

    # Recommend similar opportunities for the first opportunity
    ref_opp_id = opportunities.iloc[0]["id"]
    recommendations = recommender.recommend(ref_opp_id)
    print(f"\nRecommendations similar to opportunity {ref_opp_id}:")
    for opp_id, distance in recommendations:
        print(f"  {opp_id} (distance: {distance:.4f})")

    # --- OpenAI Summary ---
    # Only run if the OpenAI key is present
    if os.getenv("OPENAI_API_KEY"):
        summarizer = OpenAISummary()
        sample_text = opportunities.iloc[0]["description"]
        summary = summarizer.summarize(sample_text)
        print(f"\nSummary of opportunity {ref_opp_id}:\n{summary}")
    else:
        print("\nOpenAI API key not set – skipping summary generation.")


if __name__ == "__main__":
    main()