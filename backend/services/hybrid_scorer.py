import re


# =========================================================
# TEXT NORMALIZATION
# =========================================================

def normalize(text):
    """
    Normalize text for reliable comparison.
    """

    if not text:
        return ""

    text = text.lower().strip()

    text = re.sub(
        r"[^a-z0-9+#.\- ]",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text


# =========================================================
# SKILL NORMALIZATION
# =========================================================

def normalize_skill(skill):
    return normalize(skill)


# =========================================================
# DETERMINISTIC SKILL SCORE
# =========================================================

def calculate_skill_score(
    candidate_skills,
    matching_skills,
    missing_skills
):
    """
    Calculate deterministic skill coverage.

    Formula:

        matching skills
        ------------------------- × 100
        matching + missing skills
    """

    matching_skills = [
        normalize_skill(skill)
        for skill in matching_skills
        if skill
    ]

    missing_skills = [
        normalize_skill(skill)
        for skill in missing_skills
        if skill
    ]

    total_required = (
        len(matching_skills)
        + len(missing_skills)
    )

    if total_required == 0:
        return 0

    score = (
        len(matching_skills)
        / total_required
    ) * 100

    return round(
        score,
        2
    )


# =========================================================
# CHROMA SEMANTIC RELEVANCE
# =========================================================

def calculate_retrieval_score(candidates):
    """
    Calculate semantic relevance using ChromaDB distance.

    ChromaDB distance:
        Lower = more relevant.

    Instead of assigning:

        Rank #1 = 100
        Rank #2 = 50

    we compare every candidate against the best
    retrieved candidate.

    Example:

        Best distance = 0.9315
        Candidate distance = 0.9474

        Score =
            0.9315 / 0.9474 * 100

        ≈ 98.32%

    This prevents small distance differences from
    creating artificially large score differences.
    """

    if not candidates:
        return candidates

    # -----------------------------------------------------
    # Extract valid Chroma distances
    # -----------------------------------------------------

    valid_distances = []

    for candidate in candidates:

        distance = candidate.get(
            "chroma_distance"
        )

        if distance is None:
            continue

        try:

            distance = float(
                distance
            )

            if distance >= 0:
                valid_distances.append(
                    distance
                )

        except (
            ValueError,
            TypeError
        ):
            continue

    # -----------------------------------------------------
    # No distance available
    # -----------------------------------------------------

    if not valid_distances:

        for index, candidate in enumerate(
            candidates
        ):

            candidate[
                "retrieval_rank"
            ] = index + 1

            candidate[
                "retrieval_score"
            ] = 0

        return candidates

    # -----------------------------------------------------
    # Best semantic distance
    # -----------------------------------------------------

    best_distance = min(
        valid_distances
    )

    # -----------------------------------------------------
    # Calculate relative relevance
    # -----------------------------------------------------

    for index, candidate in enumerate(
        candidates
    ):

        candidate[
            "retrieval_rank"
        ] = index + 1

        distance = candidate.get(
            "chroma_distance"
        )

        try:

            distance = float(
                distance
            )

        except (
            ValueError,
            TypeError
        ):

            candidate[
                "retrieval_score"
            ] = 0

            continue

        # -------------------------------------------------
        # Avoid division by zero
        # -------------------------------------------------

        if distance <= 0:

            score = 100

        elif best_distance <= 0:

            score = 0

        else:

            score = (
                best_distance
                / distance
            ) * 100

        # -------------------------------------------------
        # Keep score within 0-100
        # -------------------------------------------------

        score = max(
            0,
            min(
                100,
                score
            )
        )

        candidate[
            "retrieval_score"
        ] = round(
            score,
            2
        )

    return candidates


# =========================================================
# FINAL HYBRID SCORE
# =========================================================

def calculate_hybrid_score(
    candidate,
    match
):
    """
    Calculate final HirePilot ranking score.

    Weighting:

        40% → Gemini JD evaluation
        35% → Deterministic skill coverage
        25% → Semantic retrieval relevance
    """

    ai_score = float(
        match.get(
            "overall_match",
            0
        )
    )

    skill_score = calculate_skill_score(
        candidate.get(
            "skills",
            []
        ),
        match.get(
            "matching_skills",
            []
        ),
        match.get(
            "missing_skills",
            []
        )
    )

    retrieval_score = float(
        candidate.get(
            "retrieval_score",
            0
        )
    )

    final_score = (
        (ai_score * 0.40)
        + (skill_score * 0.35)
        + (retrieval_score * 0.25)
    )

    return round(
        final_score,
        2
    )


# =========================================================
# APPLY HYBRID SCORE
# =========================================================

def apply_hybrid_score(
    candidate,
    match
):
    """
    Attach all scoring components to the candidate.
    """

    skill_score = calculate_skill_score(
        candidate.get(
            "skills",
            []
        ),
        match.get(
            "matching_skills",
            []
        ),
        match.get(
            "missing_skills",
            []
        )
    )

    retrieval_score = candidate.get(
        "retrieval_score",
        0
    )

    final_score = calculate_hybrid_score(
        candidate,
        match
    )

    return {
        "final_score": final_score,

        "ai_score": match.get(
            "overall_match",
            0
        ),

        "skill_score": skill_score,

        "retrieval_score": retrieval_score
    }