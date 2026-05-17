from scrapers.shopify_suggest import fetch_products


def scrape_bata(query):
    return fetch_products("https://www.bata.com.pk", query, "Bata", max_items=10)
