import fs from "node:fs/promises";
import path from "node:path";

import { extractSearchResults } from "./parser.js";
import { RiskControlError, SessionRequiredError } from "./base.js";
import { detectRiskControl, detectSessionRequired } from "./risk.js";

function buildSearchURL(baseURL, keyword) {
  const url = new URL("/Search", baseURL);
  url.searchParams.set("keyword", keyword);
  url.searchParams.set("enc", "utf-8");
  return url.toString();
}

function parseCookieHeader(rawCookie) {
  return String(rawCookie || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [name, ...rest] = item.split("=");
      return { name: name.trim(), value: rest.join("=").trim() };
    })
    .filter((cookie) => cookie.name && cookie.value);
}

async function ensureDir(targetDir) {
  await fs.mkdir(targetDir, { recursive: true });
}

export class PublicSearchCollector {
  constructor(config) {
    this.config = config;
  }

  async search(request) {
    if (!request.keyword) {
      throw new Error("keyword must not be empty");
    }

    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: this.config.headless });

    try {
      const contextOptions = {
        extraHTTPHeaders: {
          Referer: this.config.referer,
        },
      };
      if (this.config.userAgent) {
        contextOptions.userAgent = this.config.userAgent;
      }
      if (this.config.storageStatePath) {
        contextOptions.storageState = this.config.storageStatePath;
      }

      const context = await browser.newContext(contextOptions);
      const cookies = parseCookieHeader(this.config.cookie);
      if (cookies.length > 0) {
        await context.addCookies(
          cookies.map((cookie) => ({
            ...cookie,
            domain: ".jd.com",
            path: "/",
          })),
        );
      }

      const page = await context.newPage();
      page.setDefaultNavigationTimeout(this.config.navTimeoutMs);
      const targetURL = buildSearchURL(this.config.baseURL, request.keyword);
      await page.goto(targetURL, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);

      const pageURL = page.url();
      const html = await page.content();
      if (detectRiskControl(pageURL, html)) {
        if (this.config.screenshotOnRisk) {
          await ensureDir(this.config.screenshotDir);
          await page.screenshot({
            path: path.join(this.config.screenshotDir, `risk-${Date.now()}.png`),
            fullPage: true,
          });
        }
        throw new RiskControlError("jd public search was redirected to risk-control", {
          page_url: pageURL,
        });
      }
      if (detectSessionRequired(pageURL, html)) {
        throw new SessionRequiredError("jd public search requires a valid login session", {
          page_url: pageURL,
        });
      }

      const rawItems = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('[data-sku].plugin_goodsCardWrapper, [data-sku][class*="goodsCardWrapper"], [data-sku]'));
        return cards.map((card) => {
          const titleNode =
            card.querySelector('[title][class*="_text_"]') ||
            card.querySelector('[class*="goods_title"] [title]') ||
            card.querySelector('[title]');
          const priceNode =
            card.querySelector('[class*="_price_"]') ||
            card.querySelector('[class*="price"]');
          const shopNode =
            card.querySelector('[class*="_shopFloor_"] [class*="_name_"]') ||
            card.querySelector('[class*="shop"] [class*="name"]');
          const selfOperatedNode =
            card.querySelector('img[alt="自营"]') ||
            card.querySelector('[alt*="自营"]');
          const imageNode =
            card.querySelector("img");
          const linkNode = card.querySelector('a[href*="item.jd.com"]');
          const sku = card.getAttribute("data-sku") || "";
          const title = titleNode?.getAttribute("title") || titleNode?.textContent || "";
          return {
            data_sku: sku,
            title,
            price: priceNode?.textContent || "",
            shop_name: shopNode?.textContent || "",
            image_url: imageNode?.getAttribute("data-lazy-img") || imageNode?.getAttribute("src") || "",
            url: linkNode?.getAttribute("href") || (sku ? `https://item.jd.com/${sku}.html` : ""),
            shop_type: "",
            subtitle: "",
            self_operated: Boolean(selfOperatedNode),
          };
        });
      });

      const products = extractSearchResults(rawItems, request.limit, this.config.baseURL);
      return {
        mode: "public_search",
        risk_detected: false,
        session_required: false,
        page_url: pageURL,
        products,
      };
    } finally {
      await browser.close();
    }
  }
}

export { buildSearchURL, parseCookieHeader };
