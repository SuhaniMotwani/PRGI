import psycopg2
from sentence_transformers import SentenceTransformer


MODEL_NAME = "BAAI/bge-m3"

LEXICAL_LIMIT = 10
SEMANTIC_LIMIT = 10


def main():
    query = "Times Now"

    print("Loading BGE-M3...")
    model = SentenceTransformer(MODEL_NAME)

    # ---------------------------------------------------------
    # 1. Generate embedding for the query
    # ---------------------------------------------------------

    query_vector = model.encode(
        query,
        normalize_embeddings=True
    )

    # ---------------------------------------------------------
    # 2. Connect to PostgreSQL
    # ---------------------------------------------------------

    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        dbname="dataset1",
        user="pruthv"
    )

    cur = conn.cursor()

    # ---------------------------------------------------------
    # 3. Lexical search using pg_trgm
    # ---------------------------------------------------------

    cur.execute(
        """
        SELECT
            title_id,
            title,
            language_normalized,
            similarity(title_normalized, %s) AS lexical_score
        FROM titles
        WHERE title_normalized %% %s
        ORDER BY similarity(title_normalized, %s) DESC
        LIMIT %s;
        """,
        (
            query.lower(),
            query.lower(),
            query.lower(),
            LEXICAL_LIMIT
        )
    )

    lexical_results = cur.fetchall()

    # ---------------------------------------------------------
    # 4. Semantic search using BGE-M3 + HNSW
    # ---------------------------------------------------------

    cur.execute(
        """
        SELECT
            title_id,
            title,
            language_normalized,
            1 - (embedding <=> %s::vector) AS semantic_score
        FROM titles
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> %s::vector
        LIMIT %s;
        """,
        (
            query_vector.tolist(),
            query_vector.tolist(),
            SEMANTIC_LIMIT
        )
    )

    semantic_results = cur.fetchall()

    # ---------------------------------------------------------
    # 5. Merge candidates
    # ---------------------------------------------------------

    candidates = {}

    for title_id, title, language, lexical_score in lexical_results:
        candidates[title_id] = {
            "title": title,
            "language": language,
            "lexical_score": lexical_score,
            "semantic_score": None
        }

    for title_id, title, language, semantic_score in semantic_results:
        if title_id not in candidates:
            candidates[title_id] = {
                "title": title,
                "language": language,
                "lexical_score": None,
                "semantic_score": semantic_score
            }
        else:
            candidates[title_id]["semantic_score"] = semantic_score

    # ---------------------------------------------------------
    # 6. Display combined candidate pool
    # ---------------------------------------------------------

    print("\nHybrid Candidate Pool")
    print("=" * 90)

    for title_id, data in candidates.items():
        lexical = (
            f"{data['lexical_score'] * 100:.2f}%"
            if data["lexical_score"] is not None
            else "-"
        )

        semantic = (
            f"{data['semantic_score'] * 100:.2f}%"
            if data["semantic_score"] is not None
            else "-"
        )

        print(
            f"{title_id:<8} "
            f"{data['title']:<40} "
            f"{str(data['language']):<18} "
            f"Lexical: {lexical:<8} "
            f"Semantic: {semantic}"
        )

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()