import React, { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import ChangePassword from "./ChangePassword";
import Deactivate from "./Deactivate";
import ResetPassword from "../Login/ForgotPassword";
import getUser from "./getUser";

export default function Profile() {
  const [userName, setUser] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [picture, setPicture] = useState(
    "https://s.gravatar.com/avatar/5811b64ffd2fa7116580dafa02d9bb7b?s=200&r=pg&d=mp"
  );
  const [email, setEmail] = useState("");
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [isLoggedIn, setLogIn] = useState(false);

  async function getUserData() {
    const res = await getUser();
    if (res.status === 200) {
      setLogIn(true);
      res.json().then(function (json) {
        setUser(json.username);setPicture(json.avatar);setEmail(json.email);
        setFName(json.firstname);setLName(json.lastname);
        let date = new Date(json.register_time);
        setJoinDate(date.toLocaleDateString());
      });
    }
  }

  useEffect(() => {
    getUserData();
  }, []);

  return isLoggedIn ? (
    <div id="userProf">
      <img
        id="pic"
        src={picture}
        alt="User Avatar"
        width="150"
        height="150"
      ></img>
      <div className="Profile Person">
        <p id="name">
          {fName} {lName}
        </p>
        <p id="useName">{userName}</p>
        <p id="date">{joinDate}</p>
        <p id="email">{email}</p>
      </div>
      <div id="personalView">
        <Router>
          <Link id="changepwd" to="/ChangePassword">
            Change Password
          </Link>
          <Switch>
            <Route path="/ChangePassword">
              <ChangePassword />
            </Route>
          </Switch>
        </Router>
        <br></br>
        <Router>
          <Link id="deactivate" to="/Deactivate">
            Deactivate Account
          </Link>
          <Switch>
            <Route path="/Deactivate">
              <Deactivate />
            </Route>
          </Switch>
        </Router>
        <br></br>
        {/* <Router>
                <Link id="reset" to="/ResetPassword">Reset Password</Link>
                <Switch>
                <Route path='/ResetPassword'>
                  <ResetPassword />
                  </Route>
                </Switch>
                </Router> */}
      </div>
    </div>
  ) : (
    <Alert id="alertContactViewNotLoggedIn" variant="danger">
      Please{" "}
      <Alert.Link as={Link} to="/Login">
        login
      </Alert.Link>{" "}
      to see your profile.
    </Alert>
  );
}
