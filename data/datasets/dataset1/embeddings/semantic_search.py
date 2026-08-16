import psycopg2
from sentence_transformers import SentenceTransformer

MODEL_NAME = "BAAI/bge-m3"

print("Loading BGE-M3...")
model = SentenceTransformer(MODEL_NAME)

query = "bharat samay"

print(f"Searching for: {query}")

query_vector = model.encode(
    query,
    normalize_embeddings=True
)

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    dbname="dataset1",
    user="pruthv"
)

cur = conn.cursor()

cur.execute(
    """
    SELECT
        title_id,
        title,
        language_normalized,
        1 - (embedding <=> %s::vector) AS similarity
    FROM titles
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> %s::vector
    LIMIT 10;
    """,
    (query_vector.tolist(), query_vector.tolist())
)

results = cur.fetchall()

print("\nSemantic results:")
print("-" * 80)

for title_id, title, language, similarity in results:
    print(
        f"{title_id:<8} "
        f"{title:<40} "
        f"{str(language):<20} "
        f"{similarity * 100:.2f}%"
    )

cur.close()
conn.close()