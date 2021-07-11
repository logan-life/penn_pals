import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
const initialData = Object.freeze({
  firstname: "",
  lastname: "",
  username: "",
  password: "",
  security_question:
    "What is your oldest sibling’s birthday month and year? (e.g., January 1900)",
  security_answer: "",
  email: "",
});

export default function Register() {
  const [regData, updateRegdata] = useState(initialData);
  const handleChange = (e) => {
    updateRegdata({
      ...regData,
      [e.target.name]: e.target.value.trim(),
    });
  };

  const handleRegister = (e) => {
    fetch("api/register", {
      method: "POST",
      body: JSON.stringify(regData),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 201) {
          document.getElementById("status").innerHTML =
            "Registered successfully";
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch((err) => {
        // console.error(err);
        document.getElementById("status").innerHTML =
          "Error - Try again please!";
      });
  };

  return (
    <div className="Register">
      <h1 id="status">Please Register</h1>
      {/* ControlID sets ID on Form.Control and htmlFor on Form.Label         */}

      <Form className="RegisterForm">
        <Form.Group controlID="fn">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            id = "fn"
            type="text"
            placeholder="Enter first name"
            name="firstname"
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlID="ln">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            id = "ln"
            type="text"
            placeholder="Enter last name"
            name="lastname"
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlID="email">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            id = "email"
            type="email"
            placeholder="Enter email address"
            name="email"
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlID="un">
          <Form.Label>Username</Form.Label>
          <Form.Control
            id = "un"
            type="text"
            placeholder="Enter username"
            name="username"
            onChange={handleChange}
          />
          <Form.Text className="text-muted">
            TODO username requirements here
          </Form.Text>
        </Form.Group>

        <Form.Group controlID="pwd">
          <Form.Label>Password</Form.Label>
          <Form.Control
            id = "pwd"
            type="password"
            placeholder="Enter password"
            name="password"
            onChange={handleChange}
          />
          <Form.Text className="text-muted">
            TODO password requirements here
          </Form.Text>
        </Form.Group>

        <Form.Group controlID="sq">
          <Form.Label>Secret Question</Form.Label>
          <Form.Control
            as="select"
            name="security_question"
            onChange={handleChange}
          >
            <option value="What is your oldest sibling’s birthday month and year? (e.g., January 1900)">
              What is your oldest sibling’s birthday month and year? (e.g.,
              January 1900)
            </option>
            <option value="What was the name of your first stuffed animal?">
              What was the name of your first stuffed animal?
            </option>
            <option value="What is your maternal grandmother's maiden name?">
              What is your maternal grandmother's maiden name?
            </option>
            <option value="What street did you live on in third grade?">
              What street did you live on in third grade?
            </option>
            <option value="What school did you attend for sixth grade?">
              What school did you attend for sixth grade?
            </option>
          </Form.Control>
        </Form.Group>

        <Form.Group controlID="sa">
          <Form.Label>Secret Answer</Form.Label>
          <Form.Control
            id = "sa"
            type="text"
            placeholder="Secret Answer"
            name="security_answer"
            onChange={handleChange}
          />
        </Form.Group>
        <Button
          onClick={handleRegister}
          type="button"
          variant="primary"
          id="regBtn"
        >
          Submit
        </Button>
      </Form>
    </div>
  );
}
