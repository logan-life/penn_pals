import resetPassword from "./resetPassword";
import React, { useState } from "react";
import getUser from "./getUser";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export default function ResetPassword() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState("");
  const [reset, setReset] = useState(false);
  const status = document.getElementById("status");
  async function getQuestion() {
    const userName = Object.freeze({
      user: user,
    });
    const res = await getUser(userName);
    console.log(res);
    if (res.status === 200) {
      res.json().then(function (json) {
        setQuestion(json.security_question);
      });
      setReset(true);
    } else {
      const status = document.getElementById("status");
      status.innerHTML = "This user does not exist. Please try again.";
    }
  }
  async function ResetPassword(e) {
    e.preventDefault();
    let generator = require("generate-password");
    let pwd = generator.generate({
      length: 10,
      numbers: true,
    });
    const passwordData = Object.freeze({
      password: pwd,
      answer: answer,
      user: user,
    });
    const res = await resetPassword(passwordData);
    if (res.status === 200) {
      setPassword(pwd);
      status.innerHTML =
        "Password was reset successfully.Please log in and change your password.";
    } else {
      if (res.status === 400) {
        status.innerHTML = "Answer to security question is wrong.";
        // window.alert("Answer is wrong");
      } else {
        const error = new Error(res.error);
        throw error;
      }
    }
  }

  return reset ? (
    <div id="forgotPwd">
      <div className="Profile Person">
        <h3 id="question">{question}</h3>
        <Form.Group controlID="questionForm">
          <Form.Label htmlFor="question">
            Please answer security question to reset your password:
          </Form.Label>
          <Form.Control
            type="text"
            value={answer}
            name="answer"
            id="answer"
            placeholder="Security Answer"
            onChange={(e) => setAnswer(e.target.value)}
          />
        </Form.Group>
        <label htmlFor="password">Your new password:</label>
        <br></br>
        <h4 id="question">{password}</h4>
        <Button
          onClick={ResetPassword}
          type="button"
          id="changePswd"
          variant="outline-primary"
        >
          Reset Password
        </Button>
      </div>
    </div>
  ) : (
    <div>
      <Form.Group controlID="getDataForm">
        <Form.Label htmlFor="userName">
          Please provide your user name:
        </Form.Label>
        <Form.Control
          type="text"
          value={user}
          name="name"
          id="name"
          placeholder="User Name"
          onChange={(e) => setUser(e.target.value)}
        />
      </Form.Group>
      <br></br>
      <Button
        onClick={getQuestion}
        type="button"
        id="resetPswd"
        variant="outline-primary"
      >
        Reset Password
      </Button>
    </div>
  );
}
