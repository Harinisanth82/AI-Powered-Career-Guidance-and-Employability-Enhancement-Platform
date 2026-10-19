import re
import os
import json
import pymupdf

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

class ResumeAnalyzer:
    def __init__(self):
        with open(os.path.join(DATA_DIR, "career_skills.json"), "r") as f:
            self.career_skills = json.load(f)
        with open(os.path.join(DATA_DIR, "careers.json"), "r") as f:
            self.careers_catalog = json.load(f)

        # Comprehensive skill dictionary for entity matching
        self.skill_dictionary = {
            "python": ["python", "py", "pandas", "numpy", "scipy", "scikit-learn", "sklearn", "pytorch", "tensorflow"],
            "javascript": ["javascript", "js", "ecmascript", "es6", "vanilla js"],
            "typescript": ["typescript", "ts"],
            "react": ["react", "react.js", "reactjs", "next.js", "nextjs", "redux"],
            "nodejs": ["node.js", "nodejs", "node", "express", "express.js", "nest.js", "nestjs"],
            "java": ["java", "spring", "spring boot", "hibernate", "jpa", "maven", "gradle"],
            "cpp": ["c++", "cpp", "c programming", "stl"],
            "sql": ["sql", "postgresql", "postgres", "mysql", "sqlite", "relational database", "queries"],
            "mongodb": ["mongodb", "mongo", "nosql", "mongoose"],
            "docker": ["docker", "container", "containers", "docker-compose"],
            "kubernetes": ["kubernetes", "k8s", "helm", "minikube"],
            "linux": ["linux", "ubuntu", "debian", "bash", "shell scripting", "unix"],
            "git": ["git", "github", "gitlab", "bitbucket", "version control"],
            "rest-api": ["rest", "restful", "rest api", "apis", "fastapi", "endpoints", "json api"],
            "machine-learning": ["machine learning", "ml", "classification", "regression", "clustering", "random forest"],
            "deep-learning": ["deep learning", "neural networks", "cnn", "rnn", "transformers", "nlp", "llm"],
            "network-security": ["security", "cybersecurity", "penetration testing", "firewalls", "cryptography", "wireshark", "nmap"],
            "figma": ["figma", "ui", "ux", "wireframing", "prototyping", "design system", "user research"],
            "data-visualization": ["tableau", "power bi", "powerbi", "seaborn", "matplotlib", "data visualization"]
        }

    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extracts plain text from uploaded PDF using PyMuPDF."""
        doc = pymupdf.open(file_path)
        full_text = []
        for page in doc:
            full_text.append(page.get_text())
        doc.close()
        return "\n".join(full_text)

    def analyze_resume(self, file_path: str, target_career: str = "Full Stack Developer") -> dict:
        """
        Parses resume text using regex and skill entity extraction.
        Maps detected credentials against industry career profiles.
        """
        text = self.extract_text_from_pdf(file_path)
        text_lower = text.lower()

        # 1. Detected skills
        detected_skills = []
        for canon_skill, aliases in self.skill_dictionary.items():
            for alias in aliases:
                # Word boundary match
                pattern = r'(?<![a-zA-Z0-9])' + re.escape(alias) + r'(?![a-zA-Z0-9])'
                if re.search(pattern, text_lower):
                    detected_skills.append({
                        "id": canon_skill,
                        "name": canon_skill.replace("-", " ").title(),
                        "matched_term": alias
                    })
                    break

        detected_ids = {s["id"] for s in detected_skills}

        # 2. Extract sections: Education, Certifications, Experience, Projects
        education = self._extract_education(text)
        certifications = self._extract_certifications(text)
        projects = self._extract_projects(text)
        experience_summary = self._extract_experience(text)

        # 3. Match against Target Career
        target_norm = target_career.lower().replace(" ", "-")
        career_meta = self.career_skills.get(target_norm, self.career_skills.get("full-stack-developer", {}))
        req_skills = career_meta.get("required_skills", {})

        matched_for_career = []
        missing_for_career = []

        for req_id, details in req_skills.items():
            if req_id in detected_ids:
                matched_for_career.append({
                    "skill": req_id.replace("-", " ").title(),
                    "critical": details.get("critical", False)
                })
            else:
                missing_for_career.append({
                    "skill": req_id.replace("-", " ").title(),
                    "critical": details.get("critical", False)
                })

        total_req = len(req_skills) if req_skills else 1
        coverage_pct = round((len(matched_for_career) / total_req) * 100, 1)

        # 4. Multi-career match rankings
        career_matches = []
        for car_key, car_info in self.career_skills.items():
            reqs = car_info.get("required_skills", {})
            if not reqs:
                continue
            matched_count = sum(1 for rid in reqs if rid in detected_ids)
            pct = round((matched_count / len(reqs)) * 100, 1)
            display_name = car_key.replace("-", " ").title()
            career_matches.append({
                "career": display_name,
                "coverage_percentage": pct,
                "matched_count": matched_count,
                "total_required": len(reqs)
            })

        career_matches.sort(key=lambda x: x["coverage_percentage"], reverse=True)

        return {
            "detected_skills_count": len(detected_skills),
            "detected_skills": detected_skills,
            "target_career": target_career,
            "skill_coverage_percentage": coverage_pct,
            "matched_career_skills": matched_for_career,
            "missing_career_skills": missing_for_career,
            "extracted_education": education,
            "extracted_certifications": certifications,
            "extracted_projects": projects,
            "extracted_experience": experience_summary,
            "career_benchmark_rankings": career_matches[:5]
        }

    def _extract_education(self, text: str) -> list[str]:
        lines = text.split("\n")
        edu = []
        keywords = ["bachelor", "master", "b.tech", "m.tech", "b.s.", "m.s.", "computer science", "engineering", "university", "institute", "college", "gpa", "cgpa"]
        for line in lines:
            line_str = line.strip()
            if any(kw in line_str.lower() for kw in keywords) and len(line_str) > 5 and len(line_str) < 120:
                edu.append(line_str)
        return edu[:4] if edu else ["Bachelor of Science / Technology in Computer Science or Related Field (Inferred)"]

    def _extract_certifications(self, text: str) -> list[str]:
        lines = text.split("\n")
        certs = []
        keywords = ["certified", "certification", "aws certified", "coursera", "udemy", "credential", "license"]
        for line in lines:
            line_str = line.strip()
            if any(kw in line_str.lower() for kw in keywords) and len(line_str) > 5 and len(line_str) < 120:
                certs.append(line_str)
        return certs[:4]

    def _extract_projects(self, text: str) -> list[str]:
        lines = text.split("\n")
        projs = []
        keywords = ["project", "github", "application", "portal", "system", "dashboard", "engine", "developed", "built a"]
        for line in lines:
            line_str = line.strip()
            if any(kw in line_str.lower() for kw in keywords) and 10 < len(line_str) < 130:
                projs.append(line_str)
        return projs[:5]

    def _extract_experience(self, text: str) -> str:
        # Check years of experience mentions
        match = re.search(r'(\d+)\+?\s*years?\s*(?:of)?\s*experience', text, re.IGNORECASE)
        if match:
            return f"{match.group(1)} Years of Technical Experience"
        if re.search(r'intern|internship', text, re.IGNORECASE):
            return "Internship / Entry-Level Project Experience"
        return "Academic & Project Experience"
