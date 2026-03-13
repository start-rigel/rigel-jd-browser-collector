import test from "node:test";
import assert from "node:assert/strict";

import { SearchService } from "../src/services/searchService.js";

test("SearchService filters to self-operated items by default", async () => {
  const service = new SearchService({
    mode: "mock",
    fallbackToMock: true,
    selfOperatedOnly: true,
  });

  const result = await service.search({ keyword: "RTX 4060", category: "GPU", limit: 5 });
  assert.equal(result.products.length, 1);
  assert.equal(result.products[0].shop_type, "self_operated");
});

test("SearchService keeps mixed items when self-operated filter is disabled", async () => {
  const service = new SearchService({
    mode: "mock",
    fallbackToMock: true,
    selfOperatedOnly: false,
  });

  const result = await service.search({ keyword: "RTX 4060", category: "GPU", limit: 5 });
  assert.equal(result.products.length, 3);
});
