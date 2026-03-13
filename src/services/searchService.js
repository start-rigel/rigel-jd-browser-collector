import { MockCollector } from "../collectors/mock.js";
import { PublicSearchCollector } from "../collectors/publicSearch.js";
import { RiskControlError, SessionRequiredError } from "../collectors/base.js";

function newCollector(config) {
  switch (config.mode) {
    case "public_search":
      return new PublicSearchCollector(config);
    case "mock":
      return new MockCollector(config);
    default:
      throw new Error(`unsupported RIGEL_JD_BROWSER_COLLECTOR_MODE: ${config.mode}`);
  }
}

export class SearchService {
  constructor(config) {
    this.config = config;
    this.collector = newCollector(config);
    this.mockCollector = new MockCollector(config);
  }

  async search(request) {
    try {
      const result = await this.collector.search(request);
      return this.applyFilters(result, request.limit);
    } catch (error) {
      if (this.config.mode === "mock") {
        throw error;
      }
      if (!this.config.fallbackToMock) {
        throw error;
      }
      if (!(error instanceof RiskControlError) && !(error instanceof SessionRequiredError)) {
        throw error;
      }

      const fallback = await this.mockCollector.search(request);
      return this.applyFilters({
        ...fallback,
        mode: "mock_fallback",
        risk_detected: error instanceof RiskControlError,
        session_required: error instanceof SessionRequiredError,
        fallback_reason: error.message,
        fallback_details: error.details || {},
      }, request.limit);
    }
  }

  applyFilters(result, limit) {
    let products = Array.isArray(result.products) ? result.products : [];
    if (this.config.selfOperatedOnly) {
      products = products.filter((item) => item.shop_type === "self_operated");
    }
    if (limit > 0) {
      products = products.slice(0, limit);
    }
    return { ...result, products };
  }
}
