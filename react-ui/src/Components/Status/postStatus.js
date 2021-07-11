export default async function postText(statusData) {
  try {
    const response = await fetch("api/status", {
      method: "PUT",
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
