function slugify(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

export class MockCollector {
  async search(request) {
    const keyword = request.keyword;
    if (!keyword) {
      throw new Error("keyword must not be empty");
    }

    const base = [
      {
        external_id: `${slugify(keyword)}-jd-browser-001`,
        sku_id: `${slugify(keyword)}001`,
        title: `${keyword} 官方自营 标准版`,
        subtitle: `${request.category || "UNKNOWN"} 浏览器采集 mock 结果`,
        url: `https://mock.jd.local/item/${slugify(keyword)}-001`,
        image_url: "https://img.mock.jd.local/browser-1.jpg",
        shop_name: "京东自营",
        shop_type: "self_operated",
        price: 1999,
        currency: "CNY",
        availability: "in_stock",
      },
      {
        external_id: `${slugify(keyword)}-jd-browser-002`,
        sku_id: `${slugify(keyword)}002`,
        title: `${keyword} 旗舰店 超频版`,
        subtitle: `${keyword} 第二候选`,
        url: `https://mock.jd.local/item/${slugify(keyword)}-002`,
        image_url: "https://img.mock.jd.local/browser-2.jpg",
        shop_name: "品牌旗舰店",
        shop_type: "flagship",
        price: 2099,
        currency: "CNY",
        availability: "in_stock",
      },
      {
        external_id: `${slugify(keyword)}-jd-browser-003`,
        sku_id: `${slugify(keyword)}003`,
        title: `${keyword} 第三方店铺 促销版`,
        subtitle: `${keyword} 更低价格候选`,
        url: `https://mock.jd.local/item/${slugify(keyword)}-003`,
        image_url: "https://img.mock.jd.local/browser-3.jpg",
        shop_name: "数码专营店",
        shop_type: "marketplace",
        price: 1899,
        currency: "CNY",
        availability: "limited",
      },
    ];

    return {
      mode: "mock",
      risk_detected: false,
      session_required: false,
      page_url: `https://mock.jd.local/search?keyword=${encodeURIComponent(keyword)}`,
      products: base.slice(0, request.limit),
    };
  }
}
