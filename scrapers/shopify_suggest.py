import requests
from urllib.parse import urljoin


DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
}


def fetch_products(origin: str, query: str, site_label: str, max_items: int = 5):
    """Shopify predictive search JSON — HTML scraping breaks when themes change."""
    results = []
    q = (query or "").strip()
    if not q:
        return results

    base = origin.rstrip("/")
    url = f"{base}/search/suggest.json"
    params = {
        "q": q,
        "resources[type]": "product",
        "resources[limit]": "20",
    }

    try:
        response = requests.get(url, params=params, headers=DEFAULT_HEADERS, timeout=10)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"{site_label} Scraper Error:", e)
        return results

    products = (
        data.get("resources", {})
        .get("results", {})
        .get("products", [])
    )

    for product in products[:max_items]:
        title = (product.get("title") or "").strip()
        path = product.get("url") or ""
        price_raw = product.get("price")
        if not title or not path:
            continue
        try:
            price = int(float(price_raw))
        except (TypeError, ValueError):
            continue

        product_url = urljoin(base + "/", path)
        image_url = product.get("image") or ""
        
        results.append(
            {
                "name": title,
                "price": price,
                "url": product_url,
                "image": image_url,
                "site": site_label,
            }
        )

    return results
