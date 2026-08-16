import psycopg2
from sentence_transformers import SentenceTransformer

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "dataset1",
    "user": "pruthv",
}

MODEL_NAME = "BAAI/bge-m3"
BATCH_SIZE = 64


def main():
    print("Loading BGE-M3...")
    model = SentenceTransformer(MODEL_NAME)

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    cur.execute("""
        SELECT title_id, title_normalized
        FROM titles
        WHERE embedding IS NULL
          AND title_normalized IS NOT NULL
          AND title_normalized <> ''
        ORDER BY title_id
    """)

    rows = cur.fetchall()
    total = len(rows)

    print(f"Titles requiring embeddings: {total}")

    for start in range(0, total, BATCH_SIZE):
        batch = rows[start:start + BATCH_SIZE]

        ids = [row[0] for row in batch]
        titles = [row[1] for row in batch]

        embeddings = model.encode(
            titles,
            batch_size=BATCH_SIZE,
            normalize_embeddings=True,
            show_progress_bar=False
        )

        for title_id, embedding in zip(ids, embeddings):
            cur.execute(
                """
                UPDATE titles
                SET embedding = %s
                WHERE title_id = %s
                """,
                (embedding.tolist(), title_id)
            )

        conn.commit()

        completed = start + len(batch)
        print(
            f"Progress: {completed}/{total} "
            f"({completed / total * 100:.1f}%)"
        )

    cur.close()
    conn.close()

    print("Embedding generation complete.")


if __name__ == "__main__":
    main()