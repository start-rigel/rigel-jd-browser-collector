import fs from "node:fs";

function env(name, fallback = "") {
  return process.env[name] || fallback;
}

function boolEnv(name, fallback = false) {
  const value = process.env[name];
  if (value === undefined || value === "") {
    return fallback;
  }
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function intEnv(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === "") {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function loadConfig() {
  const cookieFile = env("RIGEL_JD_COOKIE_FILE", "");
  let cookie = env("RIGEL_JD_COOKIE", "");
  if (!cookie && cookieFile && fs.existsSync(cookieFile)) {
    cookie = fs.readFileSync(cookieFile, "utf8").trim();
  }

  const config = {
    serviceName: env("RIGEL_SERVICE_NAME", "rigel-jd-browser-collector"),
    port: intEnv("RIGEL_HTTP_PORT", 18086),
    logLevel: env("RIGEL_LOG_LEVEL", "info"),
    mode: env("RIGEL_JD_BROWSER_COLLECTOR_MODE", "mock"),
    fallbackToMock: boolEnv("RIGEL_JD_FALLBACK_TO_MOCK", true),
    headless: boolEnv("RIGEL_JD_HEADLESS", true),
    navTimeoutMs: intEnv("RIGEL_JD_NAV_TIMEOUT_MS", 30000),
    userAgent: env("RIGEL_JD_USER_AGENT", ""),
    cookie,
    cookieFile,
    storageStatePath: env("RIGEL_JD_STORAGE_STATE_PATH", "state/jd-storage-state.json"),
    referer: env("RIGEL_JD_REFERER", "https://www.jd.com/"),
    baseURL: env("RIGEL_JD_BASE_URL", "https://search.jd.com"),
    screenshotOnRisk: boolEnv("RIGEL_JD_SCREENSHOT_ON_RISK", false),
    screenshotDir: env("RIGEL_JD_SCREENSHOT_DIR", "screenshots"),
    selfOperatedOnly: boolEnv("RIGEL_JD_SELF_OPERATED_ONLY", true),
  };

  if (!Number.isInteger(config.port) || config.port <= 0) {
    throw new Error("RIGEL_HTTP_PORT must be a positive integer");
  }
  if (!config.mode) {
    throw new Error("RIGEL_JD_BROWSER_COLLECTOR_MODE must not be empty");
  }

  if (config.storageStatePath && fs.existsSync(config.storageStatePath) === false) {
    // Missing storage state is allowed. The collector will run without it and may hit risk-control.
  }

  return config;
}
