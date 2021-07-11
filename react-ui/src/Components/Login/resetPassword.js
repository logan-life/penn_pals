export default async function resetPassword(passwordData) {
  try {
    const resp = await fetch("api/resetPassword", {
      method: "PUT",
      body: JSON.stringify(passwordData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return resp;
  } catch (error) {
    throw new Error(error);
  }
}
