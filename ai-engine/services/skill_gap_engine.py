import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

class SkillGapEngine:
    def __init__(self):
        with open(os.path.join(DATA_DIR, "career_skills.json"), "r") as f:
            self.career_skills = json.load(f)
        with open(os.path.join(DATA_DIR, "skills.json"), "r") as f:
            self.all_skills = {s["id"]: s for s in json.load(f)}

    def analyze_gap(self, target_career_id: str, candidate_skills: dict[str, int]) -> dict:
        """
        Analyzes gap between target career benchmarks and candidate skills.
        Categorizes into MASTERED, DEVELOPING, and CRITICAL GAP.
        Calculates Estimated Preparation Time.
        """
        target_norm = target_career_id.lower().replace(" ", "-")
        career_reqs = self.career_skills.get(target_norm, {}).get("required_skills", {})

        if not career_reqs:
            # Try fuzzy key match
            for k in self.career_skills:
                if k in target_norm or target_norm in k:
                    career_reqs = self.career_skills[k]["required_skills"]
                    break

        mastered = []
        developing = []
        critical_gap = []

        total_learning_hours = 0
        total_project_hours = 0
        total_practice_hours = 0

        for skill_id, req in career_reqs.items():
            skill_info = self.all_skills.get(skill_id, {
                "name": skill_id.replace("-", " ").title(),
                "difficulty": "Intermediate",
                "estimated_hours": 35,
                "prerequisites": []
            })

            user_level = candidate_skills.get(skill_id, candidate_skills.get(skill_id.replace("-", "_"), 0))
            min_level = req.get("min_level", 6)
            is_critical = req.get("critical", False)

            skill_entry = {
                "skill_id": skill_id,
                "name": skill_info["name"],
                "category": skill_info.get("category", "Technical"),
                "current_level": user_level,
                "target_level": min_level,
                "difficulty": skill_info["difficulty"],
                "prerequisites": skill_info.get("prerequisites", []),
                "critical": is_critical,
                "description": skill_info.get("description", "")
            }

            if user_level >= min_level:
                mastered.append(skill_entry)
            elif user_level > 0:
                developing.append(skill_entry)
                # Needs partial hours
                ratio = (min_level - user_level) / min_level
                hours = int(skill_info.get("estimated_hours", 30) * ratio)
                total_learning_hours += hours
                total_project_hours += int(hours * 0.4)
                total_practice_hours += int(hours * 0.3)
            else:
                # 0 proficiency
                critical_gap.append(skill_entry)
                base_hours = skill_info.get("estimated_hours", 35)
                total_learning_hours += base_hours
                total_project_hours += int(base_hours * 0.5)
                total_practice_hours += int(base_hours * 0.4)

        total_readiness_hours = total_learning_hours + total_project_hours + total_practice_hours
        total_req_count = len(career_reqs) if career_reqs else 1
        coverage_pct = round((len(mastered) * 1.0 + len(developing) * 0.5) / total_req_count * 100, 1)

        return {
            "target_career": target_career_id,
            "skill_coverage_percentage": coverage_pct,
            "mastered_skills": mastered,
            "developing_skills": developing,
            "critical_gaps": critical_gap,
            "estimated_preparation_time": {
                "total_readiness_hours": total_readiness_hours,
                "learning_hours": total_learning_hours,
                "project_hours": total_project_hours,
                "practice_hours": total_practice_hours,
                "estimated_weeks_part_time": round(total_readiness_hours / 15, 1),
                "estimated_weeks_full_time": round(total_readiness_hours / 35, 1)
            }
        }
