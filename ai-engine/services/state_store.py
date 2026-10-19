import json
import os
import datetime

STORE_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "app_store.json")

class AppStateStore:
    def __init__(self):
        self.data = {
            "users": {
                "default_user": {
                    "id": "usr-1",
                    "email": "candidate@example.com",
                    "name": "Alex Mercer",
                    "role": "candidate",
                    "created_at": "2026-03-01T10:00:00Z"
                }
            },
            "profile": {
                "name": "Alex Mercer",
                "email": "candidate@example.com",
                "target_career": "Full Stack Developer",
                "education_level": "Undergraduate B.Tech Computer Science",
                "institution": "University Institute of Technology",
                "cgpa": 8.4,
                "certifications_count": 2,
                "skills": {
                    "javascript": 8,
                    "react": 8,
                    "nodejs": 6,
                    "sql": 7,
                    "mongodb": 6,
                    "python": 5,
                    "git": 7,
                    "rest_api": 5,
                    "docker": 3
                },
                "interests": "Web Development",
                "work_style": "Collaborative Teamwork",
                "career_values": "Continuous Learning & Growth"
            },
            "assessment_completed": True,
            "roadmap": [],
            "proofs": [
                {
                    "id": "proof-1",
                    "title": "E-Commerce Microservices Storefront",
                    "type": "GitHub Repository",
                    "url": "https://github.com/alex-mercer/ecommerce-api-store",
                    "verified": True,
                    "badge": "Verified Implementation",
                    "date": "2026-03-15",
                    "skills_verified": ["React", "Node.js", "Express", "PostgreSQL"],
                    "metrics": {"commits": 42, "tests_passed": 18, "has_readme": True, "has_dockerfile": True}
                }
            ],
            "interviews": [
                {
                    "id": "int-1",
                    "question_id": "q-1",
                    "date": "2026-03-20",
                    "overall_score": 82.5,
                    "technical_score": 85.0,
                    "relevance_score": 80.0,
                    "verdict": "Competent Response"
                }
            ],
            "timeline": [
                {
                    "id": "ev-1",
                    "type": "assessment",
                    "title": "Multi-Dimensional Career Assessment Completed",
                    "description": "Computed 10 technical and behavioral indicators.",
                    "date": "2026-03-01"
                },
                {
                    "id": "ev-2",
                    "type": "model",
                    "title": "Top Career Recommendation Generated",
                    "description": "Full Stack Developer matched with 91.4% confidence via custom ML model.",
                    "date": "2026-03-02"
                },
                {
                    "id": "ev-3",
                    "type": "proof",
                    "title": "Proof of Skill Verified: E-Commerce API Store",
                    "description": "Deterministic repository inspection passed all 4 quality checks.",
                    "date": "2026-03-15"
                },
                {
                    "id": "ev-4",
                    "type": "interview",
                    "title": "Mock Technical Interview Evaluated",
                    "description": "Scored 82.5/100 on JavaScript Event Loop architecture.",
                    "date": "2026-03-20"
                }
            ],
            "latest_dataset_analysis": None
        }
        self.load()

    def load(self):
        if os.path.exists(STORE_FILE):
            try:
                with open(STORE_FILE, "r") as f:
                    saved = json.load(f)
                    self.data.update(saved)
            except Exception as e:
                print(f"Error loading state store: {e}")

    def save(self):
        try:
            with open(STORE_FILE, "w") as f:
                json.dump(self.data, f, indent=2)
        except Exception as e:
            print(f"Error saving state store: {e}")

    def add_timeline_event(self, event_type: str, title: str, description: str):
        event = {
            "id": f"ev-{len(self.data['timeline']) + 1}",
            "type": event_type,
            "title": title,
            "description": description,
            "date": datetime.date.today().isoformat()
        }
        self.data["timeline"].insert(0, event)
        self.save()
        return event

state_store = AppStateStore()
