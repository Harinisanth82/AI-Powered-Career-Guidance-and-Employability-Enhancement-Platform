import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_cosine_similarity(text_a: str, text_b: str) -> float:
    """Calculates TF-IDF Cosine Similarity between two text passages."""
    if not text_a.strip() or not text_b.strip():
        return 0.0
    try:
        vectorizer = TfidfVectorizer(stop_words='english', token_pattern=r'(?u)\b[a-zA-Z0-9\+\#\.]+\b')
        matrix = vectorizer.fit_transform([text_a, text_b])
        sim = cosine_similarity(matrix[0:1], matrix[1:2])[0][0]
        return float(np.round(sim, 4))
    except Exception:
        # Fallback to Jaccard word set similarity if single-word or empty vocabulary
        words_a = set(text_a.lower().split())
        words_b = set(text_b.lower().split())
        if not words_a or not words_b:
            return 0.0
        return float(len(words_a & words_b) / len(words_a | words_b))

def concept_coverage_score(user_text: str, key_concepts: list[str]) -> tuple[float, list[str], list[str]]:
    """Checks presence of reference concepts in user text. Returns coverage ratio, matched concepts, and missing concepts."""
    if not key_concepts:
        return 1.0, [], []
    user_lower = user_text.lower()
    matched = []
    missing = []
    for concept in key_concepts:
        c_lower = concept.lower()
        if c_lower in user_lower:
            matched.append(concept)
        else:
            missing.append(concept)
    coverage = len(matched) / len(key_concepts)
    return float(np.round(coverage, 3)), matched, missing
