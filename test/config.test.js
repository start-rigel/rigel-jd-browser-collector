import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { loadConfig } from "../src/config.js";

test("loadConfig reads cookie from file when env cookie is empty", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rigel-jd-browser-collector-"));
  const cookieFile = path.join(tempDir, "cookie.txt");
  fs.writeFileSync(cookieFile, "pt_key=abc; pt_pin=user1");

  process.env.RIGEL_HTTP_PORT = "18086";
  process.env.RIGEL_JD_COOKIE = "";
  process.env.RIGEL_JD_COOKIE_FILE = cookieFile;

  const config = loadConfig();
  assert.equal(config.cookie, "pt_key=abc; pt_pin=user1");
  assert.equal(config.cookieFile, cookieFile);

  fs.rmSync(tempDir, { recursive: true, force: true });
  delete process.env.RIGEL_JD_COOKIE_FILE;
});
