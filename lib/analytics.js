const ALLOWED_PARAM_TYPES = new Set(["string", "number", "boolean"]);

export function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return false;
  }

  const safeParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => ALLOWED_PARAM_TYPES.has(typeof value))
  );

  try {
    window.gtag("event", name, safeParams);
    return true;
  } catch {
    return false;
  }
}
