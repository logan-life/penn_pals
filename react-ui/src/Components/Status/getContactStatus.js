export default async function getContactStatus() {
  try {
    const response = await fetch("api/status", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
}
