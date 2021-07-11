export default async function clearCookie() {
  try {
    const response = await fetch("api/logout", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      //removing username from localStorage
      localStorage.removeItem("currentUser");
      return response.status;
    } else {
      const error = new Error(response.error);
      throw error;
    }
  } catch (err) {
    console.error(err);
    // document.getElementById("statusMain").innerHTML = err;
  }
}
