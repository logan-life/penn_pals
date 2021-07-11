import * as FormData from "form-data";
export default async function postImage(file, userName, type) {
  try {
    const formData = new FormData();
    formData.append("image", file, "file");
    formData.append("contact_name", userName);
    formData.append("type", type);
    const response = await fetch("api/status", {
      method: "PUT",
      credentials: "include",
      body: formData,
    });
    return response;
  } catch (error) {
    throw new Error(error);
  }
}
