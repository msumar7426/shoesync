from concurrent.futures import ThreadPoolExecutor
from scrapers.bata_scraper import scrape_bata
from scrapers.servis_scraper import scrape_servis
from scrapers.ndure_scraper import scrape_ndure

def search_all_sites(query):

    all_results = []

    with ThreadPoolExecutor(max_workers=3) as executor:

        futures = [
            executor.submit(scrape_bata, query),
            executor.submit(scrape_servis, query),
            executor.submit(scrape_ndure, query)
        ]

        for future in futures:
            try:
                result = future.result(timeout=10)
                all_results.extend(result or [])
            except Exception as e:
                print("Worker Error:", e)

    # remove duplicates safely
    seen = set()
    unique = []

    for item in all_results:
        key = (item["name"], item["site"])
        if key not in seen:
            seen.add(key)
            unique.append(item)

    # sort by price
    unique.sort(key=lambda x: x["price"])

    return unique