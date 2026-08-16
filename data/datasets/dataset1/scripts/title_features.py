"""
Dataset 1 - PRGI Title Feature Generation

Input:
    data/processed/title_master.csv

Output:
    data/processed/title_features.csv

Purpose:
    Create deterministic, ML/search-ready representations of PRGI titles
    while preserving the original dataset.

Important:
    - Original Title is never modified.
    - Original Language is never modified.
    - Missing titles are retained for provenance.
    - Unsupported transliteration is never guessed.
    - Similarity scores are NOT generated here.
      They belong to the later candidate-pair/search stage.
"""

from pathlib import Path
import re
import unicodedata

import pandas as pd


# ============================================================
# FILE PATHS
# ============================================================

INPUT_FILE = Path("data/processed/title_master.csv")
OUTPUT_FILE = Path("data/processed/title_features.csv")


# ============================================================
# LANGUAGE NORMALIZATION
# ============================================================
#
# This is ONLY metadata normalization.
#
# It does NOT decide the script of a title.
# Script is detected separately from the actual Unicode characters.
#

LANGUAGE_ALIASES = {
    "Oriya": "Odia",
    "Santhali": "Santali",
    "Sindhi Devnagri": "Sindhi",
    "Meetei Mayek": "Manipuri",
    "Avadhi": "Awadhi",
}


def normalize_language(value):
    """
    Normalize known variations in the PRGI Language field.

    Original Language value is preserved separately.
    """

    if pd.isna(value):
        return ""

    language = normalize_unicode(value)

    return LANGUAGE_ALIASES.get(language, language)


# ============================================================
# UNICODE SCRIPT RANGES
# ============================================================

SCRIPT_RANGES = {

    "Latin": [
        (0x0041, 0x005A),
        (0x0061, 0x007A),
        (0x00C0, 0x024F),
    ],

    "Devanagari": [
        (0x0900, 0x097F),
    ],

    "Bengali": [
        (0x0980, 0x09FF),
    ],

    "Gurmukhi": [
        (0x0A00, 0x0A7F),
    ],

    "Gujarati": [
        (0x0A80, 0x0AFF),
    ],

    "Odia": [
        (0x0B00, 0x0B7F),
    ],

    "Tamil": [
        (0x0B80, 0x0BFF),
    ],

    "Telugu": [
        (0x0C00, 0x0C7F),
    ],

    "Kannada": [
        (0x0C80, 0x0CFF),
    ],

    "Malayalam": [
        (0x0D00, 0x0D7F),
    ],

    "Arabic": [
        (0x0600, 0x06FF),
    ],

    "Arabic_Extended": [
        (0x0750, 0x077F),
        (0x08A0, 0x08FF),
    ],

    "Meetei_Mayek": [
        (0xABC0, 0xABFF),
    ],

    "Ol_Chiki": [
        (0x1C50, 0x1C7F),
    ],
}


# ============================================================
# UNICODE NORMALIZATION
# ============================================================

def normalize_unicode(value):
    """
    Normalize Unicode representation and whitespace.
    """

    if pd.isna(value):
        return ""

    text = str(value)

    # Canonical Unicode normalization
    text = unicodedata.normalize("NFKC", text)

    # Remove zero-width characters that can interfere with matching
    text = text.replace("\u200c", "")
    text = text.replace("\u200d", "")

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ============================================================
# TITLE NORMALIZATION
# ============================================================

def normalize_title(value):
    """
    Create a normalized representation of the title.

    Does NOT remove meaningful words.
    """

    text = normalize_unicode(value)

    if not text:
        return ""

    # Unicode-aware lowercase
    text = text.casefold()

    # Treat common separators consistently
    text = re.sub(r"[-_/|]+", " ", text)

    # Normalize spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ============================================================
# SCRIPT DETECTION
# ============================================================

def code_in_ranges(codepoint, ranges):
    """
    Check whether a Unicode codepoint belongs to a script range.
    """

    for start, end in ranges:

        if start <= codepoint <= end:
            return True

    return False


def detect_script(value):
    """
    Detect the script from the actual characters in the title.

    Returns:

        Latin
        Devanagari
        Bengali
        Gurmukhi
        Gujarati
        Odia
        Tamil
        Telugu
        Kannada
        Malayalam
        Arabic
        Meetei_Mayek
        Ol_Chiki
        Mixed
        Unknown
    """

    text = normalize_unicode(value)

    if not text:
        return "Unknown"

    counts = {}

    for script in SCRIPT_RANGES:
        counts[script] = 0

    for character in text:

        codepoint = ord(character)

        for script, ranges in SCRIPT_RANGES.items():

            if code_in_ranges(codepoint, ranges):

                counts[script] += 1

                break

    active_scripts = []

    for script, count in counts.items():

        if count > 0:
            active_scripts.append(script)

    if len(active_scripts) == 0:
        return "Unknown"

    if len(active_scripts) == 1:
        return active_scripts[0]

    return "Mixed"


# ============================================================
# SCRIPT COMPONENTS
# ============================================================

def detect_script_components(value):
    """
    Return all detected scripts.

    Example:

        Latin;Devanagari

    This is useful for debugging mixed-script titles.
    """

    text = normalize_unicode(value)

    if not text:
        return "Unknown"

    found_scripts = []

    for script, ranges in SCRIPT_RANGES.items():

        for character in text:

            if code_in_ranges(ord(character), ranges):

                found_scripts.append(script)

                break

    if not found_scripts:
        return "Unknown"

    return ";".join(found_scripts)


# ============================================================
# TRANSLITERATION
# ============================================================

def transliterate_indic(text, script):
    """
    Transliterate only scripts for which we have an explicit
    deterministic mapping.

    Unsupported scripts are NOT guessed.
    """

    if not text:
        return "", "EMPTY"

    # Latin does not need transliteration
    if script == "Latin":
        return text, "NOT_REQUIRED"

    try:

        from indic_transliteration import sanscript
        from indic_transliteration.sanscript import transliterate

    except ImportError:

        return text, "LIBRARY_UNAVAILABLE"

    mapping = {

        "Devanagari": sanscript.DEVANAGARI,

        "Bengali": sanscript.BENGALI,

        "Gujarati": sanscript.GUJARATI,

        "Gurmukhi": sanscript.GURMUKHI,

        "Odia": sanscript.ORIYA,

        "Tamil": sanscript.TAMIL,

        "Telugu": sanscript.TELUGU,

        "Kannada": sanscript.KANNADA,

        "Malayalam": sanscript.MALAYALAM,
    }

    if script not in mapping:

        return text, "UNSUPPORTED"

    try:

        result = transliterate(
            text,
            mapping[script],
            sanscript.ITRANS,
        )

        result = normalize_title(result)

        return result, "SUCCESS"

    except Exception:

        # Never replace valid source data with failed transliteration
        return text, "FAILED"


def create_transliteration(normalized_title, script):
    """
    Generate transliteration and an explicit status.
    """

    if not normalized_title:
        return "", "EMPTY"

    if script == "Mixed":

        return normalized_title, "MIXED_SCRIPT"

    return transliterate_indic(
        normalized_title,
        script,
    )


# ============================================================
# TITLE CORE
# ============================================================

def create_title_core(normalized_title):
    """
    Create a conservative core representation.

    Important:
    We DO NOT remove words such as:

        News
        Samachar
        Times
        Daily
        India
        Today
        Express

    Those words may be required later for PRGI rule checks.

    Therefore this function only removes punctuation while
    preserving the title's tokens.
    """

    if not normalized_title:
        return ""

    text = re.sub(
        r"[^\w\s]",
        " ",
        normalized_title,
        flags=re.UNICODE,
    )

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


# ============================================================
# VALIDATION
# ============================================================

def validate_features(df):
    """
    Validate the generated feature dataset.

    Missing titles are warnings, not fatal errors.
    """

    required_columns = {
        "title_id",
        "Title",
        "Language",
        "title_normalized",
        "language_normalized",
        "script",
        "script_components",
        "title_transliterated",
        "transliteration_status",
        "title_core",
    }

    missing_columns = required_columns - set(df.columns)

    if missing_columns:

        raise ValueError(
            f"Missing expected feature columns: "
            f"{sorted(missing_columns)}"
        )

    if len(df) == 0:

        raise ValueError(
            "Feature dataset is empty."
        )

    # title_id must remain unique
    if df["title_id"].duplicated().any():

        raise ValueError(
            "title_id must remain unique."
        )

    # --------------------------------------------------------
    # Missing titles
    # --------------------------------------------------------
    #
    # Do NOT delete them.
    #
    # They are retained for provenance but cannot participate
    # in title search or ML similarity calculations.
    #

    missing_titles = (
        df["Title"].isna()
        |
        (
            df["Title"]
            .fillna("")
            .astype(str)
            .str.strip()
            == ""
        )
    )

    if missing_titles.any():

        print(
            f"WARNING: "
            f"{missing_titles.sum()} rows have "
            f"missing/empty titles."
        )

        print(
            "These rows are retained for provenance "
            "but must be excluded from ML/search."
        )

    # --------------------------------------------------------
    # Transliteration status validation
    # --------------------------------------------------------

    allowed_statuses = {
        "SUCCESS",
        "NOT_REQUIRED",
        "UNSUPPORTED",
        "FAILED",
        "MIXED_SCRIPT",
        "EMPTY",
        "LIBRARY_UNAVAILABLE",
    }

    actual_statuses = set(
        df["transliteration_status"]
        .dropna()
        .unique()
    )

    unexpected_statuses = (
        actual_statuses - allowed_statuses
    )

    if unexpected_statuses:

        raise ValueError(
            "Unexpected transliteration statuses: "
            f"{sorted(unexpected_statuses)}"
        )


# ============================================================
# MAIN
# ============================================================

def main():

    print("Loading title master dataset...")

    df = pd.read_csv(
        INPUT_FILE
    )

    print(
        f"Input rows: {len(df)}"
    )

    # ========================================================
    # Preserve original title
    # ========================================================

    df["title_original"] = df["Title"]

    # ========================================================
    # Generate normalized title
    # ========================================================

    print(
        "Generating deterministic title features..."
    )

    df["title_normalized"] = (
        df["Title"]
        .map(normalize_title)
    )

    # ========================================================
    # Normalize language metadata
    # ========================================================

    df["language_normalized"] = (
        df["Language"]
        .map(normalize_language)
    )

    # ========================================================
    # Detect actual script
    # ========================================================

    df["script"] = (
        df["Title"]
        .map(detect_script)
    )

    # ========================================================
    # Store detailed script components
    # ========================================================

    df["script_components"] = (
        df["Title"]
        .map(detect_script_components)
    )

    # ========================================================
    # Transliteration
    # ========================================================

    transliteration_results = []

    for title, script in zip(
        df["title_normalized"],
        df["script"],
    ):

        result = create_transliteration(
            title,
            script,
        )

        transliteration_results.append(
            result
        )

    df["title_transliterated"] = [
        result[0]
        for result in transliteration_results
    ]

    df["transliteration_status"] = [
        result[1]
        for result in transliteration_results
    ]

    # ========================================================
    # Conservative title core
    # ========================================================

    df["title_core"] = (
        df["title_normalized"]
        .map(create_title_core)
    )

    # ========================================================
    # Validate
    # ========================================================

    validate_features(df)

    # ========================================================
    # Preserve original column order
    # ========================================================

    original_columns = list(
        pd.read_csv(
            INPUT_FILE,
            nrows=0,
        ).columns
    )

    derived_columns = [

        "title_original",

        "title_normalized",

        "language_normalized",

        "script",

        "script_components",

        "title_transliterated",

        "transliteration_status",

        "title_core",
    ]

    df = df[
        original_columns
        +
        derived_columns
    ]

    # ========================================================
    # Save
    # ========================================================

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    df.to_csv(
        OUTPUT_FILE,
        index=False,
        encoding="utf-8",
    )

    # ========================================================
    # REPORT
    # ========================================================

    print()
    print("=" * 60)
    print("TITLE FEATURE GENERATION COMPLETE")
    print("=" * 60)

    print(
        f"Rows: {len(df)}"
    )

    print(
        f"Columns: {len(df.columns)}"
    )

    print(
        f"Output: {OUTPUT_FILE}"
    )

    print()
    print("Script distribution:")
    print(
        df["script"]
        .value_counts(
            dropna=False
        )
        .to_string()
    )

    print()
    print("Transliteration status:")
    print(
        df["transliteration_status"]
        .value_counts(
            dropna=False
        )
        .to_string()
    )

    print()
    print("Language normalization changes:")

    changed_languages = (
        df["Language"]
        .fillna("")
        .astype(str)
        !=
        df["language_normalized"]
        .fillna("")
        .astype(str)
    )

    print(
        f"Changed rows: "
        f"{changed_languages.sum()}"
    )

    print()
    print("Sample:")

    print(
        df[
            [
                "Title",
                "Language",
                "language_normalized",
                "title_normalized",
                "script",
                "script_components",
                "title_transliterated",
                "transliteration_status",
                "title_core",
            ]
        ]
        .head(20)
        .to_string(index=False)
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()