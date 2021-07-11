export default async function changePasswordFunct(passwordData) {
  try {
    const resp = await fetch("api/changePassword", {
      method: "PUT",
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
