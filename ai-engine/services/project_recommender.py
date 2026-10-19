import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

class ProjectRecommender:
    def __init__(self):
        with open(os.path.join(DATA_DIR, "projects.json"), "r") as f:
            self.projects = json.load(f)

    def recommend_projects(self, target_career: str, user_skills: dict[str, int], missing_skills: list[str]) -> list[dict]:
        """
        Ranks project catalog items using weighted relevance of target career match,
        gap-closure potential, and current skill readiness.
        """
        scored_projects = []
        user_skills_lower = {k.lower().replace("-", "_"): v for k, v in user_skills.items()}
        missing_lower = [m.lower() for m in missing_skills]

        for p in self.projects:
            score = 0.0
            reasons = []

            # Career match weight (40%)
            if p["career"].lower() in target_career.lower() or target_career.lower() in p["career"].lower():
                score += 40.0
                reasons.append(f"Direct match for {target_career} portfolio requirements")

            # Missing skill closure (35%)
            gap_closed = []
            for dev_skill in p["skills_developed"]:
                dev_lower = dev_skill.lower()
                if any(m in dev_lower or dev_lower in m for m in missing_lower):
                    gap_closed.append(dev_skill)
            
            if gap_closed:
                gap_score = min(35.0, len(gap_closed) * 12.0)
                score += gap_score
                reasons.append(f"Directly closes skill gaps in: {', '.join(gap_closed)}")

            # Readiness from current skills (25%)
            ready_skills = [
                s for s in p["skills_developed"] 
                if user_skills_lower.get(s.lower().replace(" ", "_"), 0) >= 5
            ]
            if ready_skills:
                readiness_score = min(25.0, len(ready_skills) * 8.0)
                score += readiness_score
                reasons.append(f"Leverages existing foundation in: {', '.join(ready_skills)}")

            scored_projects.append({
                **p,
                "relevance_score": min(98.0, round(max(30.0, score), 1)),
                "gap_skills_addressed": gap_closed,
                "recommendation_reasons": reasons
            })

        scored_projects.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_projects
