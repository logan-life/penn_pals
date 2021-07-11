export default async function updateLatestConvo(userData) {
    try {
      const resp = await fetch("api/latestconvo", {
        method: "PUT",
        body: JSON.stringify(userData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return resp;
    } catch (error) {
      throw new Error(error);
    }
  }
  
  