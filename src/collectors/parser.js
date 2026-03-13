function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizePrice(value) {
  const text = String(value || "").replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(text);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function absoluteURL(baseURL, value) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }
  if (text.startsWith("http://") || text.startsWith("https://")) {
    return text;
  }
  if (text.startsWith("//")) {
    return `https:${text}`;
  }
  return new URL(text, baseURL).toString();
}

function normalizeShopType(value, shopName, selfOperated) {
  if (selfOperated) {
    return "self_operated";
  }

  const direct = normalizeText(value).toLowerCase();
  const shop = normalizeText(shopName);
  if (direct.includes("self_operated")) {
    return "self_operated";
  }
  if (shop.includes("京东自营")) {
    return "self_operated";
  }
  if (shop.includes("旗舰店")) {
    return "flagship";
  }
  if (shop.includes("专营店") || shop.includes("专卖店")) {
    return "marketplace";
  }
  return "unknown";
}

export function extractSearchResults(rawItems, limit, baseURL) {
  return rawItems
    .map((item, index) => {
      const title = normalizeText(item.title);
      if (!title) {
        return null;
      }

      const skuID = normalizeText(item.sku_id || item.data_sku || "");
      const shopName = normalizeText(item.shop_name);
      const shopType = normalizeShopType(item.shop_type, shopName, Boolean(item.self_operated));
      return {
        external_id: skuID || `jd-search-${index + 1}`,
        sku_id: skuID,
        title,
        subtitle: normalizeText(item.subtitle),
        url: absoluteURL(baseURL, item.url),
        image_url: absoluteURL(baseURL, item.image_url),
        shop_name: shopName,
        shop_type: shopType,
        price: normalizePrice(item.price),
        currency: "CNY",
        availability: item.price ? "in_stock" : "unknown",
      };
    })
    .filter(Boolean)
    .slice(0, limit);
}
