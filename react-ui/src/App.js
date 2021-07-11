import { Link, Route, Switch } from "react-router-dom";

import React from "react";
import Register from "./Components/Register/Register";
import Login from "./Components/Login/Login";
import Profile from "./Components/Profile/Profile";
import Mainview from "./Components/Mainview/Mainview";
// import VideoChat from "./Components/Mainview/VideoChat/VideoChat";
// import ContactView from "./Components/Contacts/ContactView";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import StatusView from "./Components/Status/Status";

function App() {
  return (
    <div className="App">
      <Navbar bg="light" expand="lg">
        <Navbar.Brand as={Link} to="/MainView">
          PennPals
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link id="reg" as={Link} to="/Register" className="nav-link">
              Register
            </Nav.Link>
            <Nav.Link id="log" as={Link} to="/Login" className="nav-link">
              Login
            </Nav.Link>
            <Nav.Link as={Link} to="/MainView" className="nav-link">
              Main
            </Nav.Link>
            {/* <Nav.Link as={Link} to="/Videochat" className="nav-link">
              Videochat
            </Nav.Link> */}
            <Nav.Link as={Link} to="/Profile" className="nav-link">
              Profile
            </Nav.Link>
            {/* <Nav.Link as={Link} to="/ContactView" className="nav-link">
              Contacts
  </Nav.Link>*/}
            <Nav.Link as={Link} to="/StatusView" className="nav-link">
              Status
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Switch>
        <Route path="/Register" component={Register} />
        <Route path="/Login" component={Login} />
        <Route path="/MainView" component={Mainview} />
        <Route path="/Profile" component={Profile} />
        <Route path="/StatusView" component={StatusView} />
        {/* <Route path="/Videochat" component={VideoChat} /> */}
        {/* IMPORTANT this is a catch-all for any weird URLS and therefore must be LAST in the route tree */}
        <Route path="/" component={Mainview} />
      </Switch>
    </div>
  );
}

export default App;
