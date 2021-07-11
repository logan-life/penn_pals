export default async function deactivateAccount(passwordData) {
  try {
    const res = await fetch("api/profile", {
      method: "PUT",
      body: JSON.stringify(passwordData),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res;
  } catch (error) {
    throw new Error(error);
  }
}
