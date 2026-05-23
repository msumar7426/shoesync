import requests
from urllib.parse import urljoin


# Shopify's /search/suggest.json is hard-capped at 10 results by the platform
# regardless of resources[limit]. We supplement it with /products.json which
# returns up to 250 products per page and supports client-side keyword filtering.
DEFAULT_HEADERS = {
    "Accept": "application/json",
}


def _parse_suggest(base: str, q: str, site_label: str, max_items: int):
    """Phase 1: Shopify predictive suggest — fast but capped at 10 by Shopify."""
    results = []
    url = f"{base}/search/suggest.json"
    params = {
        "q": q,
        "resources[type]": "product",
        "resources[limit]": "10",
    }
    try:
        r = requests.get(url, params=params, headers=DEFAULT_HEADERS, timeout=10)
        if r.status_code == 403:
            r = requests.get(url, params=params, timeout=10)
        r.raise_for_status()
        products = r.json().get("resources", {}).get("results", {}).get("products", [])
    except Exception as e:
        print(f"{site_label} suggest error:", e)
        return results

    for product in products[:max_items]:
        title = (product.get("title") or "").strip()
        path = product.get("url") or ""
        if not path and product.get("handle"):
            path = f"/products/{product['handle']}"
        price_raw = product.get("price")
        if not title or not path:
            continue
        try:
            price = int(float(price_raw))
        except (TypeError, ValueError):
            continue
        image_url = product.get("image") or ""
        results.append({
            "name": title,
            "price": price,
            "url": urljoin(base + "/", path),
            "image": image_url,
            "site": site_label,
        })
    return results


def _parse_catalog(base: str, q: str, site_label: str, seen_urls: set, needed: int):
    """Phase 2: Walk /products.json pages and filter by keyword to fill the gap."""
    results = []
    q_lower = q.lower()
    page = 1

    while len(results) < needed:
        try:
            r = requests.get(
                f"{base}/products.json",
                params={"limit": 250, "page": page},
                headers=DEFAULT_HEADERS,
                timeout=12,
            )
            r.raise_for_status()
            products = r.json().get("products", [])
        except Exception as e:
            print(f"{site_label} catalog error (page {page}):", e)
            break

        if not products:
            break  # no more pages

        for p in products:
            title = (p.get("title") or "").strip()
            handle = p.get("handle") or ""
            product_type = (p.get("product_type") or "").lower()
            tags = " ".join(p.get("tags") or []).lower()

            # keyword must appear in title, product_type or tags
            if q_lower not in title.lower() and q_lower not in product_type and q_lower not in tags:
                continue

            product_url = f"{base}/products/{handle}"
            if product_url in seen_urls:
                continue

            # get first variant price
            variants = p.get("variants") or []
            if not variants:
                continue
            try:
                price = int(float(variants[0].get("price", 0)))
            except (TypeError, ValueError):
                continue

            # get first image
            images = p.get("images") or []
            image_url = images[0].get("src", "") if images else ""

            if not title or not handle:
                continue

            results.append({
                "name": title,
                "price": price,
                "url": product_url,
                "image": image_url,
                "site": site_label,
            })
            seen_urls.add(product_url)

            if len(results) >= needed:
                break

        page += 1
        # Shopify /products.json pages beyond what exists return empty lists,
        # so the `if not products: break` above handles termination.

    return results


def fetch_products(origin: str, query: str, site_label: str, max_items: int = 10):
    """Fetch up to max_items products from a Shopify store matching the query.

    Strategy:
      1. Hit /search/suggest.json (fast, but Shopify caps it at 10).
      2. If we still need more results, walk /products.json pages and
         filter by keyword client-side until we have max_items.
    """
    q = (query or "").strip()
    if not q:
        return []

    base = origin.rstrip("/")

    # Phase 1 — suggest (up to 10)
    results = _parse_suggest(base, q, site_label, max_items)
    seen_urls = {item["url"] for item in results}

    # Phase 2 — catalog top-up if still below max_items
    needed = max_items - len(results)
    if needed > 0:
        extra = _parse_catalog(base, q, site_label, seen_urls, needed)
        results.extend(extra)

    return results