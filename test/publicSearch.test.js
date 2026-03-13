import test from "node:test";
import assert from "node:assert/strict";

import { buildSearchURL, parseCookieHeader } from "../src/collectors/publicSearch.js";

test("buildSearchURL builds jd search target", () => {
  const target = buildSearchURL("https://search.jd.com", "RTX 4060");
  assert.equal(
    target,
    "https://search.jd.com/Search?keyword=RTX+4060&enc=utf-8",
  );
});

test("parseCookieHeader parses simple cookie header", () => {
  assert.deepEqual(parseCookieHeader("pt_key=abc; pt_pin=user123"), [
    { name: "pt_key", value: "abc" },
    { name: "pt_pin", value: "user123" },
  ]);
});
