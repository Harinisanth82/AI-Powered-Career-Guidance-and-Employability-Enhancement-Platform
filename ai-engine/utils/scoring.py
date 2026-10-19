def calculate_employability_index(
    skill_mastery: float,
    roadmap_completion: float,
    proof_projects: float,
    interview_performance: float
) -> dict:
    """
    Calculates transparent Employability Readiness Index:
    Readiness = 0.35 * Skill Mastery + 0.25 * Roadmap Completion + 0.25 * Proof/Projects + 0.15 * Interview Performance
    """
    # Clamp components between 0 and 100
    sm = max(0.0, min(100.0, float(skill_mastery)))
    rc = max(0.0, min(100.0, float(roadmap_completion)))
    pp = max(0.0, min(100.0, float(proof_projects)))
    ip = max(0.0, min(100.0, float(interview_performance)))

    index = (0.35 * sm) + (0.25 * rc) + (0.25 * pp) + (0.15 * ip)
    score = round(index, 1)

    if score >= 80:
        category = "Highly Ready"
        readiness_badge = "Target Role Qualified"
        recommendation = "Candidate demonstrates strong readiness across key criteria. Focus on specialized mock interview drills and portfolio presentation."
    elif score >= 60:
        category = "Moderately Ready"
        readiness_badge = "Competitive Candidate"
        recommendation = "Candidate exhibits solid core knowledge with targeted gaps in capstone deliverables or advanced interview coverage."
    elif score >= 40:
        category = "Developing"
        readiness_badge = "Active Skill Builder"
        recommendation = "Progressing well. Prioritize closing critical skill gaps and submitting verified project artifacts to accelerate readiness."
    else:
        category = "Early Stage"
        readiness_badge = "Foundational Stage"
        recommendation = "Focus on foundational milestone completion and core technical coursework before moving to advanced capstone projects."

    return {
        "score": score,
        "category": category,
        "readiness_badge": readiness_badge,
        "recommendation": recommendation,
        "breakdown": {
            "skill_mastery": {"weight": 35, "score": sm, "contribution": round(0.35 * sm, 1)},
            "roadmap_completion": {"weight": 25, "score": rc, "contribution": round(0.25 * rc, 1)},
            "proof_projects": {"weight": 25, "score": pp, "contribution": round(0.25 * pp, 1)},
            "interview_performance": {"weight": 15, "score": ip, "contribution": round(0.15 * ip, 1)}
        }
    }
