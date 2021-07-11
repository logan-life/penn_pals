/**
 *
 * @param {string} username - this is the linkage between PennPals and Twilio. username for Pennpals === identity in Twilio
 */

export default async function getToken(username) {
  try {
    const token = await fetch(`api/twilio?username=${username}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return token.text();
  } catch (error) {
    throw new Error(error);
  }
}
