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

  if (normalizedUserId) {
    const numericUserId = Number(normalizedUserId);

    if (Number.isSafeInteger(numericUserId)) {
      return {
        $or: [{ userId: normalizedUserId }, { userId: numericUserId }],
      };
    }

    return { userId: normalizedUserId };
  }

  return { sessionId };
}
