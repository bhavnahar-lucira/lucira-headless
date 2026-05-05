export async function agentFetch(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (response.status === 401) {
    const refreshRes = await fetch("/api/agent-auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      response = await fetch(url, {
        ...options,
        credentials: "include",
      });
    } else {
      await fetch("/api/agent-auth/logout", { method: "POST" });
      window.location.href = "/admin";
      return;
    }
  }

  return response;
}