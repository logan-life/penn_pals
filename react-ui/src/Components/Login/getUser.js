export default async function getUser(passwordData) {
  try {
    const resp = await fetch("api/resetPassword", {
      method: "POST",
      body: JSON.stringify(passwordData),
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
