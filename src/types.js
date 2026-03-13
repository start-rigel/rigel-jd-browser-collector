export function normalizeRequest(payload = {}) {
  return {
    keyword: String(payload.keyword || "").trim(),
    category: String(payload.category || "").trim(),
    brand: String(payload.brand || "").trim(),
    limit: normalizeLimit(payload.limit),
  };
}

function normalizeLimit(value) {
  const parsed = Number.parseInt(value ?? "3", 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 3;
  }
  if (parsed > 20) {
    return 20;
  }
  return parsed;
}
