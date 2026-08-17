import csv
from datetime import datetime
from pathlib import Path

import psycopg2
from psycopg2.extras import execute_values


BASE_DIR = Path(__file__).resolve().parent.parent
CSV_FILE = BASE_DIR / "data" / "processed" / "title_features.csv"

DB_CONFIG = {
    "dbname": "dataset1",
    "user": "pruthv",
    "host": "localhost",
    "port": 5432,
}


# CSV column → PostgreSQL column
COLUMN_MAPPING = {
    "title_id": "title_id",
    "SN.": "serial_number",
    "Title": "title",
    "Registration Number": "registration_number",
    "Registration Date": "registration_date",
    "Language": "language",
    "Periodicity": "periodicity",
    "Publisher": "publisher",
    "Owner": "owner",
    "Publication State": "publication_state",
    "Publication District": "publication_district",
    "data_quality_status": "data_quality_status",
    "title_original": "title_original",
    "title_normalized": "title_normalized",
    "language_normalized": "language_normalized",
    "script": "script",
    "script_components": "script_components",
    "title_transliterated": "title_transliterated",
    "transliteration_status": "transliteration_status",
    "title_core": "title_core",
}


DB_COLUMNS = list(COLUMN_MAPPING.values())


def clean_value(value):
    """Convert empty CSV cells to PostgreSQL NULL."""
    if value is None:
        return None

    value = value.strip()

    return value if value else None


def parse_date(value):
    """Convert DD-MM-YYYY from CSV into a Python date."""
    value = clean_value(value)

    if value is None:
        return None

    return datetime.strptime(value, "%d-%m-%Y").date()


def main():
    print(f"Loading: {CSV_FILE}")

    if not CSV_FILE.exists():
        raise FileNotFoundError(f"CSV not found: {CSV_FILE}")

    rows = []

    with open(CSV_FILE, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)

        # Verify that the CSV contains the columns we expect.
        missing = [
            column
            for column in COLUMN_MAPPING
            if column not in reader.fieldnames
        ]

        if missing:
            raise ValueError(f"Missing CSV columns: {missing}")

        for row in reader:

            values = []

            for csv_column in COLUMN_MAPPING:

                value = row[csv_column]

                if csv_column == "Registration Date":
                    value = parse_date(value)

                elif csv_column in {"title_id", "SN."}:
                    value = clean_value(value)
                    value = int(value) if value is not None else None

                else:
                    value = clean_value(value)

                values.append(value)

            rows.append(tuple(values))

    print(f"Rows read: {len(rows)}")

    insert_query = f"""
        INSERT INTO titles ({", ".join(DB_COLUMNS)})
        VALUES %s
        ON CONFLICT (title_id) DO NOTHING
    """

    with psycopg2.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:

            execute_values(
                cur,
                insert_query,
                rows,
                page_size=2000,
            )

        conn.commit()

    print("Data loading complete.")
    print(f"Rows processed: {len(rows)}")


if __name__ == "__main__":
    main()