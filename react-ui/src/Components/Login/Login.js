import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useHistory } from "react-router-dom";
import ResetPassword from "./ForgotPassword";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";

export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();

  const validateForm = (e) => {
    e.preventDefault();
    const logindata = Object.freeze({
      username: user,
      password: password,
    });
    fetch("api/login", {
      method: "POST",
      body: JSON.stringify(logindata),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 200) {
          res.json().then((value) => {
            // The below get element Id breaks testing since the page directs on successful login
            // document.getElementById("status").innerHTML = "Login successful";
            //saving username to localStorage
            localStorage.setItem("currentUser", logindata.username);
            history.push("/profile");
          });
        } else {
          res.json().then(function (json) {
            let message = "";
            for (let index = 0; index < json.errors.length; index++) {
              message = message + "<br></br>" + json.errors[index].msg;
            }
            document.getElementById("status").innerHTML = message;
          });
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch((err) => {
        console.error(err);
        document.getElementById("status").innerHTML = err;
      });
  };

  return (
    <div className="Login">
      <h1 id="status">Please login</h1>

      <div className="LoginForm">
        <Form>
          {/* ControlID sets ID on Form.Control and htmlFor on Form.Label         */}
          <Form.Group controlID="loginUser">
            <Form.Label>Username</Form.Label>
            <Form.Control
              id = "loginUser"
              type="text"
              name="user"
              placeholder="Enter username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlID="formBasicPassword">
            <Form.Label htmlFor="password">Password</Form.Label>
            <Form.Control
              id = "formBasicPassword"
              type="password"
              value={password}
              name="password"
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Form.Text className="text-muted">
              <Router>
                <Link id="reset" to="/ResetPassword">
                  Reset Password
                </Link>
                <Switch>
                  <Route path="/ResetPassword">
                    <ResetPassword />
                  </Route>
                </Switch>
              </Router>
            </Form.Text>
          </Form.Group>

          <br></br>
          <Button
            onClick={validateForm}
            type="submit"
            id="loginBtn"
            variant="outline-primary"
          >
            Submit
          </Button>
        </Form>
      </div>
    </div>
  );
}
