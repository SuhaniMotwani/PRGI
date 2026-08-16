import os
import time
import requests
import pandas as pd
import io
from tqdm import tqdm
import urllib3


# ============================================================
# CONFIG
# ============================================================

BASE_URL = "https://prgi.gov.in/index.php/registration-title-details"

ITEMS_PER_PAGE = 500

OUTPUT_DIR = "data/raw"

REQUEST_TIMEOUT = 60

MAX_RETRIES = 3

DELAY_SECONDS = 1


# ============================================================
# SSL WARNING
# ============================================================

# Temporary workaround because PRGI's certificate chain
# is currently failing Python's certificate verification.
urllib3.disable_warnings(
    urllib3.exceptions.InsecureRequestWarning
)


# ============================================================
# SETUP
# ============================================================

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)

session = requests.Session()

session.headers.update({
    "User-Agent": (
        "Mozilla/5.0 "
        "(Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 "
        "(KHTML, like Gecko) "
        "Chrome/151.0 Safari/537.36"
    )
})


# ============================================================
# SCRAPE ONE PAGE
# ============================================================

def scrape_page(page):

    params = {
        "items_per_page": ITEMS_PER_PAGE
    }

    # First page:
    # no page parameter
    #
    # Second page:
    # page=1
    #
    # Third page:
    # page=2

    if page > 0:
        params["page"] = page

    for attempt in range(1, MAX_RETRIES + 1):

        try:

            response = session.get(
                BASE_URL,
                params=params,
                timeout=REQUEST_TIMEOUT,
                verify=False
            )

            response.raise_for_status()

            tables = pd.read_html(
                io.StringIO(response.text)
            )

            if not tables:
                raise ValueError(
                    "No table found on page"
                )

            df = tables[0]

            if df.empty:
                return None

            return df

        except Exception as e:

            print(
                f"\nPage {page} failed "
                f"(attempt {attempt}/{MAX_RETRIES})"
            )

            print(e)

            if attempt < MAX_RETRIES:
                time.sleep(5)

            else:
                raise


# ============================================================
# MAIN
# ============================================================

def main():

    page = 0

    total_rows = 0

    while True:

        output_file = os.path.join(
            OUTPUT_DIR,
            f"page_{page:05d}.csv"
        )

        # ----------------------------------------------------
        # RESUME
        # ----------------------------------------------------

        if os.path.exists(output_file):

            existing = pd.read_csv(
                output_file
            )

            rows = len(existing)

            print(
                f"Skipping page {page} "
                f"({rows} rows already downloaded)"
            )

            total_rows += rows

            # If an existing page is smaller than 500,
            # it was the last page.
            if rows < ITEMS_PER_PAGE:

                print(
                    "\nLast page already exists."
                )

                break

            page += 1

            continue

        # ----------------------------------------------------
        # SCRAPE
        # ----------------------------------------------------

        print(
            f"\nScraping page {page}"
        )

        df = scrape_page(page)

        if df is None:

            print(
                "No data returned. Stopping."
            )

            break

        rows = len(df)

        # ----------------------------------------------------
        # SAVE RAW PAGE
        # ----------------------------------------------------

        df.to_csv(
            output_file,
            index=False
        )

        total_rows += rows

        print(
            f"Downloaded: {rows} rows"
        )

        print(
            f"Saved: {output_file}"
        )

        print(
            f"Total rows: {total_rows}"
        )

        # ----------------------------------------------------
        # LAST PAGE
        # ----------------------------------------------------

        if rows < ITEMS_PER_PAGE:

            print(
                "\nLast page detected."
            )

            break

        page += 1

        # Be polite to the server.
        time.sleep(
            DELAY_SECONDS
        )

    # ========================================================
    # COMPLETE
    # ========================================================

    print("\n" + "=" * 50)
    print("SCRAPING COMPLETE")
    print("=" * 50)

    print(
        f"Total rows downloaded: {total_rows}"
    )

    print(
        f"Pages downloaded: {page + 1}"
    )


if __name__ == "__main__":
    main()