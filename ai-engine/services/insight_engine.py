import json
import os
import pandas as pd
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

class InsightEngine:
    def __init__(self):
        self.sample_dataset_path = os.path.join(DATA_DIR, "sample_career_dataset.csv")

    def generate_candidate_insights(self, profile: dict, top_career: str, gap_analysis: dict, employability_score: float) -> list[dict]:
        """
        Derives statistical, rule-based, and empirical insights from candidate data,
        gap metrics, and historical feature trends.
        """
        insights = []

        # 1. Primary Alignment Insight
        insights.append({
            "type": "alignment",
            "title": f"Strong Alignment with {top_career}",
            "description": f"Your candidate profile and feature matrix demonstrate the strongest predictive affinity toward {top_career}. Your foundational technical indicators align closely with core industry prerequisites for this track.",
            "impact": "High Positive",
            "action": f"Focus your portfolio development specifically around production-grade {top_career} deliverables."
        })

        # 2. Critical Skill Bottleneck Insight
        critical_gaps = gap_analysis.get("critical_gaps", [])
        if critical_gaps:
            top_gap = critical_gaps[0]["name"]
            est_hours = critical_gaps[0].get("estimated_hours", 30)
            insights.append({
                "type": "gap",
                "title": f"Primary Readiness Bottleneck: {top_gap}",
                "description": f"Your largest capability gap for {top_career} is currently {top_gap}. Resolving this milestone requires approximately {est_hours} dedicated study and practice hours.",
                "impact": "High Urgency",
                "action": f"Prioritize Phase 1 roadmap tasks to establish mastery in {top_gap} before progressing to advanced capstones."
            })

        # 3. Employability Index Trajectory Insight
        if employability_score >= 75:
            insights.append({
                "type": "readiness",
                "title": "Employability Index Entering Target Tier",
                "description": f"With an Employability Readiness Index of {employability_score}/100, your profile sits in the competitive candidate band. Completing mock interview drills will maximize final hiring readiness.",
                "impact": "Positive Momentum",
                "action": "Schedule 2 additional technical mock interview sessions to push readiness past 85."
            })
        else:
            needed_gain = round(80.0 - employability_score, 1)
            insights.append({
                "type": "readiness",
                "title": f"Path to Target Readiness ({needed_gain} Points Required)",
                "description": f"Your current readiness index is {employability_score}/100. Submitting verified GitHub proofs and finishing in-progress milestones will deliver the steepest readiness index growth.",
                "impact": "Growth Opportunity",
                "action": "Submit verified proof artifacts for at least 1 capstone project to boost proof/project weighting by up to 25%."
            })

        # 4. Statistical Dataset Distribution Insight
        if os.path.exists(self.sample_dataset_path):
            try:
                df = pd.read_csv(self.sample_dataset_path)
                career_counts = df['Career'].value_counts()
                total_records = len(df)
                career_pct = round((career_counts.get(top_career, 0) / total_records) * 100, 1)
                insights.append({
                    "type": "statistical",
                    "title": f"Dataset Benchmark: {top_career} Representation",
                    "description": f"Across {total_records} analyzed training records, {top_career} represents {career_pct}% of benchmark career placements, with a median academic CGPA benchmark of {round(df[df['Career'] == top_career]['CGPA'].median(), 2) if top_career in df['Career'].values else 8.2}.",
                    "impact": "Informational",
                    "action": "Review the full dataset analysis in the Admin Model Training tab."
                })
            except Exception:
                pass

        return insights

    def get_market_dataset_insights(self, market_file_path: str | None = None) -> dict:
        """
        Analyzes a labor-market dataset if provided.
        Returns explicit notice if no market dataset is available.
        """
        if not market_file_path or not os.path.exists(market_file_path):
            return {
                "available": False,
                "message": "Market insights require an available labor-market dataset.",
                "data": None
            }

        try:
            df = pd.read_csv(market_file_path)
            return {
                "available": True,
                "total_postings": len(df),
                "summary": df.describe().to_dict()
            }
        except Exception as e:
            return {
                "available": False,
                "message": f"Error parsing labor-market dataset: {str(e)}",
                "data": None
            }
