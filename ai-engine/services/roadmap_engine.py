import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

class RoadmapEngine:
    def __init__(self):
        with open(os.path.join(DATA_DIR, "learning_resources.json"), "r") as f:
            self.resources = json.load(f)
        with open(os.path.join(DATA_DIR, "projects.json"), "r") as f:
            self.projects = json.load(f)
        with open(os.path.join(DATA_DIR, "skills.json"), "r") as f:
            self.skills_dict = {s["id"]: s for s in json.load(f)}

    def generate_roadmap(self, target_career: str, gap_analysis: dict) -> list[dict]:
        """
        Synthesizes a phased, milestone-based learning roadmap using topological
        ordering of skill prerequisites and gap urgency without any generative LLM.
        """
        needed_skills = []
        for s in gap_analysis.get("critical_gaps", []):
            needed_skills.append({"id": s["skill_id"], "urgency": "High", "info": s})
        for s in gap_analysis.get("developing_skills", []):
            needed_skills.append({"id": s["skill_id"], "urgency": "Medium", "info": s})

        # Order by prerequisites & difficulty
        ordered_skills = []
        visited = set()

        def visit(skill_id):
            if skill_id in visited:
                return
            visited.add(skill_id)
            meta = self.skills_dict.get(skill_id, {})
            for prereq in meta.get("prerequisites", []):
                if prereq in self.skills_dict:
                    visit(prereq)
            ordered_skills.append(skill_id)

        for ns in needed_skills:
            visit(ns["id"])

        if not ordered_skills:
            ordered_skills = ["javascript", "react", "nodejs", "sql", "rest-api"]

        # Group ordered skills into Phases (max 2 skills per milestone)
        milestones = []
        chunk_size = 2
        phase_num = 1

        for i in range(0, len(ordered_skills), chunk_size):
            chunk = ordered_skills[i:i + chunk_size]
            chunk_names = [self.skills_dict.get(cid, {}).get("name", cid.title()) for cid in chunk]
            total_est_hours = sum(self.skills_dict.get(cid, {}).get("estimated_hours", 30) for cid in chunk)

            # Match relevant resources
            matched_resources = [
                r for r in self.resources 
                if r["skill"] in chunk
            ]
            if not matched_resources:
                matched_resources = self.resources[:2]

            # Match suitable mini-project
            matched_project = next(
                (p for p in self.projects if any(sn.lower() in [s.lower() for s in chunk_names] for sn in p["skills_developed"])),
                self.projects[phase_num % len(self.projects)]
            )

            milestone = {
                "id": f"milestone-{phase_num}",
                "phase": f"PHASE {phase_num}",
                "title": f"Mastering {' & '.join(chunk_names)}",
                "objective": f"Develop production-level competency in {' and '.join(chunk_names)} with hands-on practice.",
                "skills": chunk_names,
                "skill_ids": chunk,
                "prerequisites": [
                    self.skills_dict.get(pr, {}).get("name", pr)
                    for cid in chunk for pr in self.skills_dict.get(cid, {}).get("prerequisites", [])
                ],
                "estimated_hours": total_est_hours,
                "learning_resources": matched_resources[:2],
                "task": {
                    "title": f"Deliverable: {matched_project['title']}",
                    "description": matched_project["description"],
                    "deliverables": matched_project.get("deliverables", ["Code repository", "Documentation"])
                },
                "status": "In Progress" if phase_num == 1 else "Pending"
            }
            milestones.append(milestone)
            phase_num += 1

        return milestones
