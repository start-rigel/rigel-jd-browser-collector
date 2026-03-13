export function detectRiskControl(url, html) {
  const targetURL = String(url || "").toLowerCase();
  const body = String(html || "").toLowerCase();

  if (
    targetURL.includes("risk_handler") ||
    body.includes("risk_handler") ||
    body.includes("访问受限") ||
    body.includes("请求存在异常") ||
    body.includes("安全验证") ||
    body.includes("验证后继续访问")
  ) {
    return true;
  }

  return false;
}

export function detectSessionRequired(url, html) {
  const targetURL = String(url || "").toLowerCase();
  const body = String(html || "").toLowerCase();

  return (
    targetURL.includes("passport.jd.com") ||
    body.includes("京东-欢迎登录") ||
    body.includes("欢迎登录") ||
    body.includes("账号登录") ||
    body.includes("请登录") ||
    body.includes("登录后继续") ||
    body.includes("扫码登录")
  );
}
