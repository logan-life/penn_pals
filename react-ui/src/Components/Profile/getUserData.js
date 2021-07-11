import axios from "axios";
export const getUserData = async (userN, firstN, lastN, pswd) => {
  const resp = await axios.post("http://localhost:8080/api/users/", {
    username: userN,
    firstname: firstN,
    lastname: lastN,
    password: pswd,
  });
  const data = resp;

  return data;
};
