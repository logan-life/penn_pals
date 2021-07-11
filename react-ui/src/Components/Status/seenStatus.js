export default async function seenStatus(statusData) {
  try {
    const response = await fetch("api/status", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(statusData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw new Error(error);
  }
}
