import test from "node:test";
import assert from "node:assert/strict";

import { detectRiskControl, detectSessionRequired } from "../src/collectors/risk.js";

test("detectRiskControl returns true for jd risk page markers", () => {
  assert.equal(
    detectRiskControl(
      "https://cfe.m.jd.com/privatedomain/risk_handler/03101900/",
      "<html>验证后继续访问</html>",
    ),
    true,
  );
});

test("detectSessionRequired returns true for login markers", () => {
  assert.equal(
    detectSessionRequired("https://passport.jd.com/new/login.aspx", "<html>请登录</html>"),
    true,
  );
});

test("detectSessionRequired returns true for jd welcome login page", () => {
  assert.equal(
    detectSessionRequired(
      "https://search.jd.com/Search?keyword=RTX%204060&enc=utf-8",
      "<html><title>京东-欢迎登录</title><body>账号登录</body></html>",
    ),
    true,
  );
});
