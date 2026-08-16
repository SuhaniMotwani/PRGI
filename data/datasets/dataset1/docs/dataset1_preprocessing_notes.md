# PRGI Dataset 1 — Title Preprocessing & ML Feature Notes

## 1. What are we building?

We have the cleaned PRGI registered-title dataset:

```text
data/processed/title_master.csv
```

It contains about **82,713 records**.

We created:

```text
data/processed/title_features.csv
```

The purpose of this second file is **not to replace the original title**.

It creates consistent, machine-readable representations that can later be used for:

- exact title matching
- lexical/fuzzy matching
- cross-script comparison
- phonetic similarity
- semantic similarity
- ML candidate ranking
- PRGI rule checks
- RAG/agent workflow

The most important principle is:

> **Never destroy the original title. Create derived representations alongside it.**

---

# 2. The complete title-processing pipeline

For a title such as:

```text
आज समाज
```

the pipeline is:

```text
Original Title
      ↓
Unicode Normalization
      ↓
title_normalized
      ↓
Script Detection
      ↓
script = Devanagari
      ↓
Transliteration
      ↓
title_transliterated = aaj samaaj
      ↓
title_core
```

Each step has a different purpose.

---

# 3. Original Title

### What does it mean?

This is the **exact title obtained from the PRGI dataset**.

Example:

```text
आज समाज
```

It is the source-of-truth representation.

### Why keep it?

Because we may need to:

- display it to the user
- show it to an officer
- cite the original registration
- audit our processing
- verify ML results
- reproduce decisions

### In Python

We explicitly preserve it:

```python
df["title_original"] = df["Title"]
```

The original `Title` column is also never overwritten.

### Important

We do **not** do:

```python
df["Title"] = cleaned_title
```

because that would destroy source information.

---

# 4. Unicode Normalization

## Meaning

Unicode is the standard way computers represent characters from different writing systems.

Two visually identical strings can sometimes have different underlying Unicode representations.

For example, a character can sometimes be represented as:

```text
single precomposed character
```

or as:

```text
base character + combining mark
```

They may look identical to a human but behave differently during string comparison.

Unicode normalization converts equivalent representations into a **consistent Unicode form**.

### What we use

Our code uses:

```python
unicodedata.normalize("NFKC", text)
```

### Why NFKC?

NFKC performs compatibility normalization as well as canonical normalization. For title matching, this helps make visually/compatibly equivalent text more consistent before later comparisons.

### We also normalize zero-width characters

Our code removes:

```python
\u200c
\u200d
```

These are zero-width Unicode characters that can interfere with string matching.

### We also normalize whitespace

```python
text = re.sub(r"\s+", " ", text)
```

So multiple spaces become one.

### Example

Conceptually:

```text
"आज   समाज"
        ↓
"आज समाज"
```

### Important

Unicode normalization **does not translate the title**.

It only makes the computer representation more consistent.

---

# 5. `title_normalized`

## Meaning

`title_normalized` is a **search-friendly normalized version of the original title**.

For:

```text
आज समाज
```

the normalized value remains:

```text
आज समाज
```

For an English title:

```text
A New-Chapter
```

we may get:

```text
a new chapter
```

### What our Python code does

```python
text = unicodedata.normalize("NFKC", text)

text = text.replace("\u200c", "")
text = text.replace("\u200d", "")

text = re.sub(r"\s+", " ", text)

text = text.casefold()

text = re.sub(r"[-_/|]+", " ", text)

text = re.sub(r"\s+", " ", text)
```

### Why `casefold()`?

It makes case differences consistent.

For example:

```text
A NEW CHAPTER
a new chapter
A New Chapter
```

become comparable:

```text
a new chapter
```

`casefold()` is preferable to simple `.lower()` for robust Unicode-aware case normalization.

### Why replace separators?

We want:

```text
A-New-Chapter
A/New/Chapter
A_New_Chapter
```

to become approximately:

```text
a new chapter
```

This improves lexical matching.

### What it does NOT do

It does not:

- translate
- transliterate
- remove words
- determine meaning
- calculate similarity

---

# 6. Script Detection

## Meaning

A **language** and a **script** are not the same thing.

Language answers:

> What language is the publication/title associated with?

Script answers:

> What writing system are the actual characters in the title using?

Example:

```text
Language:
Marathi

Title:
आज समाज

Script:
Devanagari
```

### Why is this important?

Our PRGI dataset contains titles where the `Language` metadata and the actual writing system of the title do not necessarily match.

For example:

```text
Language = Gujarati
Title = A D NEWS
```

The language metadata is Gujarati, but the actual title characters are Latin.

Therefore we should **not simply do**:

```text
Gujarati → Gujarati script
```

Instead:

```text
PRGI Language metadata
        +
actual characters in Title
        ↓
actual script
```

---

# 7. How our Python script detects the script

We define Unicode ranges.

For example:

```python
"Devanagari": [
    (0x0900, 0x097F),
]
```

Devanagari characters fall in this Unicode block.

Similarly we have ranges for:

```text
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
Meetei Mayek
Ol Chiki
```

The code checks each character:

```python
for character in text:

    codepoint = ord(character)

    for script, ranges in SCRIPT_RANGES.items():

        if code_in_ranges(codepoint, ranges):

            counts[script] += 1
            break
```

Then:

```text
one detected script
        ↓
that script

multiple detected scripts
        ↓
Mixed

nothing recognized
        ↓
Unknown
```

### Example

```text
आज समाज
```

contains Devanagari characters.

Therefore:

```text
script = Devanagari
```

---

# 8. `script_components`

This is an additional diagnostic feature.

While:

```text
script
```

gives us one final classification:

```text
Devanagari
```

`script_components` tells us all scripts detected.

For example:

```text
Latin
```

or:

```text
Latin;Devanagari
```

This is useful for identifying mixed-script titles.

### Why keep it?

Because a title might contain:

```text
Hindi text + English text
```

or:

```text
Devanagari + Latin
```

That information can later become useful for ML/search features.

---

# 9. Transliteration

## Most important distinction

### Translation

Translation changes the **language/meaning**.

Example:

```text
आज समाज
```

could be translated conceptually into:

```text
Today's society
```

That is a meaning-based transformation.

### Transliteration

Transliteration changes the **writing system/representation**, while attempting to preserve pronunciation.

Example:

```text
आज समाज
        ↓
aaj samaaj
```

The title has not been translated into English.

It has been represented using Latin characters.

---

# 10. Why transliteration is useful for our project

Suppose our database contains:

```text
आज समाज
```

and a new application contains:

```text
Aaj Samaj
```

A raw string comparison sees:

```text
आज समाज
≠
Aaj Samaj
```

But after transliteration:

```text
आज समाज
↓
aaj samaaj

Aaj Samaj
↓
aaj samaj
```

Now a later similarity model can recognize a strong relationship.

This is especially useful for:

- phonetic comparison
- cross-script lexical comparison
- candidate retrieval
- ML ranking

---

# 11. How transliteration works in our Python code

We use:

```python
indic_transliteration
```

for explicitly supported Indic scripts.

For example:

```python
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
```

Then:

```python
result = transliterate(
    text,
    mapping[script],
    sanscript.ITRANS,
)
```

The result is normalized again before being stored.

---

# 12. Which scripts are currently transliterated?

The current implementation explicitly supports:

```text
Devanagari
Bengali
Gujarati
Gurmukhi
Odia
Tamil
Telugu
Kannada
Malayalam
```

Latin does not need transliteration:

```text
Latin title
    ↓
NOT_REQUIRED
```

### Important distinction

Our script **detects** more scripts than it currently **transliterates**.

It can detect:

```text
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
Meetei Mayek
Ol Chiki
```

But we do not generate an unreliable transliteration for every one of them.

---

# 13. Why don't we transliterate every language?

Because a bad transliteration can become **bad ML training data**.

Suppose:

```text
Original title
      ↓
incorrect transliteration
      ↓
phonetic feature
      ↓
wrong similarity score
      ↓
wrong ML decision
```

That is worse than explicitly saying:

```text
UNSUPPORTED
```

Therefore our pipeline records:

```text
transliteration_status
```

---

# 14. `transliteration_status`

Possible values:

```text
SUCCESS
NOT_REQUIRED
UNSUPPORTED
FAILED
MIXED_SCRIPT
EMPTY
LIBRARY_UNAVAILABLE
```

### Example

```text
English title
    ↓
Latin
    ↓
NOT_REQUIRED
```

```text
Hindi title
    ↓
Devanagari
    ↓
successful transliteration
    ↓
SUCCESS
```

```text
Unsupported script
    ↓
UNSUPPORTED
```

```text
Mixed-script title
    ↓
MIXED_SCRIPT
```

This makes the ML input explicit instead of silently hiding preprocessing failures.

---

# 15. How Marathi is handled

Example:

```text
Language:
Marathi

Title:
आज समाज
```

Pipeline:

```text
Original
आज समाज

        ↓

Unicode normalization
आज समाज

        ↓

title_normalized
आज समाज

        ↓

script detection
Devanagari

        ↓

transliteration
aaj samaaj

        ↓

title_core
आज समाज
```

The important point is that **Marathi is not translated**.

It remains Marathi.

Only the representation changes:

```text
Devanagari
      ↓
Latin transliteration
```

The original title is still preserved.

---

# 16. Why is `title_core` still `आज समाज`?

This can initially seem confusing.

You might expect:

```text
आज समाज
    ↓
aaj samaaj
```

for `title_core`.

But `title_core` is deliberately **not our transliteration field**.

We keep:

```text
title_transliterated = aaj samaaj
```

and:

```text
title_core = आज समाज
```

### Why?

Because `title_core` currently means:

> A conservative punctuation/format-normalized representation that preserves the original title tokens.

We do NOT remove words such as:

```text
News
Samachar
Times
Daily
India
Today
Express
```

because these words may matter for PRGI rule evaluation.

So:

```text
title_core
```

is not supposed to be "the shortest possible title."

---

# 17. How `title_core` is created in Python

The code is:

```python
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
```

Meaning:

```text
punctuation
    ↓
removed/replaced with spaces

multiple spaces
    ↓
single spaces
```

But Unicode letters and words are preserved.

### Example

```text
A & S INDIA
```

becomes approximately:

```text
a s india
```

We do not turn it into:

```text
a
```

or remove `india`.

---

# 18. Language normalization

This is completely different from transliteration.

Our dataset contains different labels referring to the same language convention.

We currently normalize selected metadata aliases:

```text
Oriya
  ↓
Odia

Santhali
  ↓
Santali

Avadhi
  ↓
Awadhi

Sindhi Devnagri
  ↓
Sindhi

Meetei Mayek
  ↓
Manipuri
```

### Why?

Machine-learning systems treat category values as different unless we explicitly normalize them.

Without normalization:

```text
Oriya
Odia
```

could become two separate categories.

With normalization:

```text
language_normalized = Odia
```

But we retain:

```text
Language = original PRGI value
```

so provenance is not lost.

---

# 19. Important: Language and Script remain separate

Our final data can legitimately contain:

```text
Language:
Gujarati

script:
Latin
```

or:

```text
Language:
Hindi

script:
Latin
```

because the publication language and the characters used in the registered title are different pieces of information.

This is why we have both:

```text
language_normalized
```

and:

```text
script
```

---

# 20. Why we don't create similarity scores here

`title_features.csv` describes **one title**.

For example:

```text
title_id = 123
title = आज समाज
```

It can have:

```text
script = Devanagari
title_transliterated = aaj samaaj
```

But:

```text
semantic_similarity = 0.82
```

does not make sense without another title.

Similarity belongs to:

```text
Title A
   ↕
Title B
```

Therefore it will be generated later.

---

# 21. Next-stage pairwise features

Later, when a new application title is compared with an existing PRGI title, we can calculate:

```text
exact_match
normalized_match
token_similarity
character/edit_similarity
phonetic_similarity
transliterated_similarity
semantic_similarity
language_match
state_match
```

Conceptually:

```text
New title
    +
Candidate title
    ↓
pairwise feature extraction
    ↓
ML/search score
```

This is separate from the title-level preprocessing we have completed.

---

# 22. Why multiple representations are necessary

No single representation is sufficient.

### Exact representation

Useful for:

```text
Aaj Samaj
=
Aaj Samaj
```

### Normalized representation

Handles:

```text
Aaj-Samaj
Aaj Samaj
AAJ SAMAJ
```

### Script representation

Handles:

```text
Devanagari
Latin
Bengali
Tamil
...
```

### Transliteration

Helps compare:

```text
आज समाज
Aaj Samaj
```

### Phonetic representation

Can identify titles that sound similar.

### Semantic representation

Can identify meaning/context similarity.

Therefore:

```text
Title
 ├── original
 ├── normalized
 ├── language
 ├── script
 ├── transliterated
 └── core
        ↓
later pairwise features
        ↓
ML/search
```

---

# 23. What we have completed

```text
Raw PRGI scraping
        ↓
82,730 raw rows
        ↓
cleaning/deduplication
        ↓
82,713 master rows
        ↓
title_features.py
        ↓
82,713 feature rows
```

The feature dataset now contains:

```text
Original title
Normalized title
Original language
Normalized language
Detected script
Script components
Transliteration
Transliteration status
Conservative core title
```

---

# 24. What we have NOT completed yet

These are the next stages, not part of this preprocessing script:

```text
Pair generation
       ↓
Exact similarity
       ↓
Fuzzy/edit similarity
       ↓
Token similarity
       ↓
Phonetic similarity
       ↓
Semantic embeddings
       ↓
Hybrid candidate retrieval
       ↓
Top-K candidates
       ↓
ML ranking/classification
```

Do not add those scores into `title_features.csv`.

---

# 25. Final mental model

Remember this:

```text
TITLE-LEVEL DATA
─────────────────────────────

Original Title
      ↓
Normalized Title
      ↓
Script
      ↓
Transliteration
      ↓
Core representation


PAIR-LEVEL DATA
─────────────────────────────

New Title
      +
Existing Title
      ↓
Exact similarity
Edit similarity
Token similarity
Phonetic similarity
Semantic similarity
      ↓
ML / ranking
```

### One-line explanation for a teammate

> **We preserve the original PRGI title and generate deterministic normalized, language, script, transliteration and core representations so that downstream search and ML models can consistently compare titles across formatting, scripts and languages without losing the original source data.**

---

# 26. Current Dataset 1 files

```text
prgi_scraper/
│
├── data/
│   ├── raw/
│   │   └── page_*.csv
│   │
│   └── processed/
│       ├── data_quality_issues.csv
│       ├── title_master.csv
│       └── title_features.csv
│
├── clean_titles.py
├── scrape.py
└── title_features.py
```

`title_master.csv` is the **canonical cleaned source**.

`title_features.csv` is the **derived ML/search feature layer**.

The raw scraped files remain untouched for provenance.
