from scrapers.shopify_suggest import fetch_products


def scrape_ndure(query):
    return fetch_products("https://ndure.com", query, "Ndure", max_items=10)
