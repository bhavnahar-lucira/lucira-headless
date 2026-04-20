export function normalizeUserId(userId) {
  if (userId === null || userId === undefined) return null;

  const value = String(userId).trim();
  if (!value || value === "null" || value === "undefined") {
    return null;
  }

  return value;
}

export function buildCartLookup({ userId, sessionId }) {
  const normalizedUserId = normalizeUserId(userId);
  const conditions = [];

  if (normalizedUserId) {
    const numericUserId = Number(normalizedUserId);
    if (Number.isSafeInteger(numericUserId)) {
      conditions.push({ userId: normalizedUserId });
      conditions.push({ userId: numericUserId });
    } else {
      conditions.push({ userId: normalizedUserId });
    }
  }

  if (sessionId) {
    conditions.push({ sessionId });
  }

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];

  return { $or: conditions };
}
