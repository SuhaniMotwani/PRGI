import os
import pandas as pd
import unicodedata
import re


INPUT_FILE = "data/raw/prgi_titles_raw.csv"

OUTPUT_DIR = "data/processed"

MASTER_FILE = os.path.join(
    OUTPUT_DIR,
    "title_master.csv"
)

ISSUES_FILE = os.path.join(
    OUTPUT_DIR,
    "data_quality_issues.csv"
)


# --------------------------------------------------
# SETUP
# --------------------------------------------------

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)


# --------------------------------------------------
# NORMALIZATION HELPERS
# --------------------------------------------------

def normalize_text(value):
    """
    Basic metadata normalization.

    We are NOT creating the final searchable title here.
    This is only cleaning obvious formatting differences.
    """

    if pd.isna(value):
        return pd.NA

    value = str(value)

    # Unicode normalization
    value = unicodedata.normalize(
        "NFKC",
        value
    )

    # Normalize whitespace
    value = re.sub(
        r"\s+",
        " ",
        value
    ).strip()

    if value == "":
        return pd.NA

    return value


def normalize_language(value):

    if pd.isna(value):
        return pd.NA

    value = normalize_text(value)

    if pd.isna(value):
        return pd.NA

    # Only standardize casing here.
    # Do NOT map languages into our own categories yet.
    return value.title()


# --------------------------------------------------
# LOAD RAW DATA
# --------------------------------------------------

print("Loading raw dataset...")

df = pd.read_csv(
    INPUT_FILE
)

print(
    f"Raw rows: {len(df)}"
)


# --------------------------------------------------
# DROP UI-ONLY COLUMN
# --------------------------------------------------

if "Action" in df.columns:

    df = df.drop(
        columns=["Action"]
    )


# --------------------------------------------------
# BASIC TEXT CLEANING
# --------------------------------------------------

text_columns = [
    "Title",
    "Registration Number",
    "Publisher",
    "Owner",
    "Publication State",
    "Publication District",
    "Periodicity"
]

for column in text_columns:

    if column in df.columns:

        df[column] = df[column].apply(
            normalize_text
        )


if "Language" in df.columns:

    df["Language"] = df["Language"].apply(
        normalize_language
    )


# --------------------------------------------------
# DATA QUALITY ISSUES
# --------------------------------------------------

issues = []


# --------------------------------------------------
# MISSING REGISTRATION NUMBERS
# --------------------------------------------------

missing_registration = df[
    df["Registration Number"].isna()
]

for idx, row in missing_registration.iterrows():

    issues.append({
        "row_index": idx,
        "registration_number": None,
        "issue_type": "MISSING_REGISTRATION",
        "details": "Registration number is missing"
    })


# --------------------------------------------------
# DUPLICATE REGISTRATION GROUPS
# --------------------------------------------------

valid = df[
    df["Registration Number"].notna()
].copy()


duplicate_groups = (
    valid[
        valid["Registration Number"].duplicated(
            keep=False
        )
    ]
    .groupby("Registration Number")
)


comparison_columns = [
    "Title",
    "Registration Date",
    "Language",
    "Periodicity",
    "Publisher",
    "Owner",
    "Publication State",
    "Publication District"
]


for registration_number, group in duplicate_groups:

    # --------------------------------------------------
    # Check whether rows are identical after cleaning
    # --------------------------------------------------

    deduped = group.drop_duplicates(
        subset=comparison_columns
    )

    if len(deduped) == 1:

        issues.append({
            "row_index": None,
            "registration_number": registration_number,
            "issue_type": "EXACT_DUPLICATE",
            "details": (
                f"{len(group)} identical source records; "
                "one canonical record retained"
            )
        })

    else:

        issues.append({
            "row_index": None,
            "registration_number": registration_number,
            "issue_type": "CONFLICTING_METADATA",
            "details": (
                f"{len(group)} records share the same "
                "registration number but contain "
                "different metadata"
            )
        })


# --------------------------------------------------
# DEDUPLICATION
# --------------------------------------------------

canonical_rows = []

for registration_number, group in valid.groupby(
    "Registration Number",
    sort=False
):

    if len(group) == 1:

        canonical_rows.append(
            group.iloc[0]
        )

        continue


    # ----------------------------------------------
    # Remove exact duplicates
    # ----------------------------------------------

    unique_group = group.drop_duplicates(
        subset=comparison_columns
    )


    if len(unique_group) == 1:

        # Exact duplicate
        canonical_rows.append(
            unique_group.iloc[0]
        )

    else:

        # ------------------------------------------
        # Conflicting records
        #
        # Prefer the row containing more metadata.
        # ------------------------------------------

        metadata_columns = [
            c for c in comparison_columns
            if c != "Registration Number"
        ]

        unique_group = unique_group.copy()

        unique_group["_filled_fields"] = (
            unique_group[metadata_columns]
            .notna()
            .sum(axis=1)
        )

        best_index = (
            unique_group["_filled_fields"]
            .idxmax()
        )

        canonical_rows.append(
            unique_group.loc[best_index]
            .drop(labels=["_filled_fields"])
        )


# --------------------------------------------------
# RECORDS WITHOUT REGISTRATION NUMBER
# --------------------------------------------------

missing_registration_rows = df[
    df["Registration Number"].isna()
]

for _, row in missing_registration_rows.iterrows():

    canonical_rows.append(
        row
    )


# --------------------------------------------------
# CREATE MASTER DATASET
# --------------------------------------------------

master = pd.DataFrame(
    canonical_rows
).reset_index(
    drop=True
)


# --------------------------------------------------
# CREATE INTERNAL TITLE ID
# --------------------------------------------------

master.insert(
    0,
    "title_id",
    range(
        1,
        len(master) + 1
    )
)


# --------------------------------------------------
# DATA QUALITY STATUS
# --------------------------------------------------

conflicting_registrations = set(
    issue["registration_number"]
    for issue in issues
    if issue["issue_type"] == "CONFLICTING_METADATA"
)


def quality_status(row):

    registration = row["Registration Number"]

    if pd.isna(registration):

        return "MISSING_REGISTRATION"

    if registration in conflicting_registrations:

        return "CONFLICTING_METADATA"

    return "VALID"


master["data_quality_status"] = master.apply(
    quality_status,
    axis=1
)


# --------------------------------------------------
# SAVE
# --------------------------------------------------

master.to_csv(
    MASTER_FILE,
    index=False
)


issues_df = pd.DataFrame(
    issues
)

issues_df.to_csv(
    ISSUES_FILE,
    index=False
)


# --------------------------------------------------
# SUMMARY
# --------------------------------------------------

print("\n" + "=" * 50)
print("CLEANING COMPLETE")
print("=" * 50)

print(
    f"Raw rows:       {len(df)}"
)

print(
    f"Master rows:    {len(master)}"
)

print(
    f"Rows removed:   {len(df) - len(master)}"
)

print(
    f"Quality issues: {len(issues_df)}"
)

print("\nQuality status:")

print(
    master[
        "data_quality_status"
    ].value_counts()
)

print(
    f"\nSaved master dataset:\n{MASTER_FILE}"
)

print(
    f"Saved quality report:\n{ISSUES_FILE}"
)