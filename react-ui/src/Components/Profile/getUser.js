export default async function getUser() {
  try {
    const resp = await fetch("api/profile", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return resp;
  } catch (error) {
    throw new Error(error);
  }
}
