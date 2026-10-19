import json
import os
import re
from utils.similarity import calculate_cosine_similarity, concept_coverage_score
from utils.text_processing import clean_text

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

class InterviewEngine:
    def __init__(self):
        with open(os.path.join(DATA_DIR, "interview_questions.json"), "r") as f:
            self.questions = json.load(f)

    def get_questions_for_session(self, career: str, category: str = "All", limit: int = 5) -> list[dict]:
        """Filters questions based on user's target career and desired category."""
        matched = []
        for q in self.questions:
            career_match = (
                q["career"] == "General" or 
                q["career"].lower() in career.lower() or 
                career.lower() in q["career"].lower()
            )
            cat_match = (category == "All" or q["category"].lower() == category.lower())
            if career_match and cat_match:
                matched.append(q)

        if not matched:
            matched = self.questions
        return matched[:limit]

    def evaluate_answer(self, question_id: str, user_answer: str) -> dict:
        """
        Deterministic NLP Evaluation Pipeline:
        1. Text cleaning & normalization
        2. Keyword extraction & concept coverage
        3. TF-IDF Cosine Similarity against reference answer
        4. Behavioral STAR structural indicator inspection
        5. Multi-criteria rubric scoring
        """
        q = next((item for item in self.questions if item["id"] == question_id), None)
        if not q:
            # Fallback question structure if custom ID
            q = self.questions[0]

        cleaned_user = clean_text(user_answer)
        word_count = len(cleaned_user.split())

        # If answer is practically empty
        if word_count < 5:
            return {
                "technical_score": 10.0,
                "relevance_score": 10.0,
                "communication_score": 15.0,
                "structure_score": 10.0,
                "overall_score": 11.2,
                "verdict": "Insufficient Response",
                "missing_concepts": q.get("reference_concepts", []),
                "matched_concepts": [],
                "improvement_areas": ["Please provide a detailed, substantive response elaborating on the core technical concepts."],
                "feedback": "The submitted response is too brief to evaluate meaningful domain knowledge or communication competency."
            }

        ref_answer = q.get("sample_reference_answer", "")
        ref_concepts = q.get("reference_concepts", [])

        # 1. Cosine similarity
        cos_sim = calculate_cosine_similarity(cleaned_user, clean_text(ref_answer))

        # 2. Concept coverage
        coverage_ratio, matched_concepts, missing_concepts = concept_coverage_score(cleaned_user, ref_concepts)

        # 3. Technical Score (combines concept coverage 60% and cosine similarity 40%)
        tech_score = round(min(100.0, (coverage_ratio * 65.0) + (cos_sim * 35.0)), 1)
        tech_score = max(20.0, tech_score)

        # 4. Relevance Score
        relevance_score = round(min(100.0, max(25.0, (cos_sim * 60.0) + (coverage_ratio * 40.0) + (10.0 if word_count >= 25 else 0))), 1)

        # 5. Communication Score (sentence count, clarity, vocabulary diversity, lack of fluff)
        unique_words = len(set(cleaned_user.split()))
        lexical_diversity = unique_words / max(1, word_count)
        comm_score = round(min(100.0, max(30.0, (lexical_diversity * 40.0) + (min(50, word_count) * 1.0) + 10.0)), 1)

        # 6. Structure Score
        # If behavioral, check STAR indicators
        structure_score = 65.0
        improvement_areas = []

        if q.get("category") == "Behavioral":
            star_cues = {
                "Situation": ["when", "during", "at my", "in my", "project", "scenario", "context", "time"],
                "Task": ["responsible", "goal", "needed to", "task", "objective", "required", "challenge"],
                "Action": ["i decided", "implemented", "i analyzed", "resolved", "action", "built", "debugged", "refactored"],
                "Result": ["result", "outcome", "improved", "reduced", "delivered", "successfully", "impact", "metric"]
            }
            detected_star = []
            for component, keywords in star_cues.items():
                if any(kw in cleaned_user for kw in keywords):
                    detected_star.append(component)

            star_ratio = len(detected_star) / 4.0
            structure_score = round(min(100.0, max(30.0, star_ratio * 95.0 + 5.0)), 1)

            missing_star = [c for c in ["Situation", "Task", "Action", "Result"] if c not in detected_star]
            if missing_star:
                improvement_areas.append(f"Structure your behavioral answer with the STAR framework (missing explicit {', '.join(missing_star)}).")
        else:
            # Technical structure: checks transition connectors and logical flow
            connectors = ["because", "therefore", "firstly", "in contrast", "for example", "specifically", "as a result"]
            conn_count = sum(1 for c in connectors if c in cleaned_user)
            structure_score = round(min(100.0, max(40.0, 50.0 + (conn_count * 12.0) + (15.0 if word_count >= 30 else 0))), 1)
            if conn_count == 0:
                improvement_areas.append("Include logical connectors (e.g. 'for example', 'specifically', 'in contrast') to articulate technical trade-offs.")

        if missing_concepts:
            improvement_areas.append(f"Incorporate key technical concepts: {', '.join(missing_concepts[:3])}.")

        # 7. Overall Weighted Score
        overall_score = round(
            (0.40 * tech_score) + 
            (0.25 * relevance_score) + 
            (0.20 * comm_score) + 
            (0.15 * structure_score), 
            1
        )

        if overall_score >= 80:
            verdict = "Excellent Response"
        elif overall_score >= 65:
            verdict = "Competent Response"
        elif overall_score >= 50:
            verdict = "Needs Refinement"
        else:
            verdict = "Developing"

        return {
            "question_id": question_id,
            "overall_score": overall_score,
            "technical_score": tech_score,
            "relevance_score": relevance_score,
            "communication_score": comm_score,
            "structure_score": structure_score,
            "verdict": verdict,
            "matched_concepts": matched_concepts,
            "missing_concepts": missing_concepts,
            "improvement_areas": improvement_areas,
            "word_count": word_count
        }
