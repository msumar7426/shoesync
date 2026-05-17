from scrapers.shopify_suggest import fetch_products


def scrape_servis(query):
    return fetch_products("https://www.servis.pk", query, "Servis", max_items=10)
