import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { useHistory } from "react-router-dom";

import { Link } from "react-router-dom";
// import "./Contacts/ContactView.css";
import { initializeConversationsClient } from "../Mainview/Contacts/contactHelperFunctions.js";
import "./assets/mainview.css";
import React, { useEffect, useState } from "react";

import ContactView from "./Contacts/ContactView";
import clearCookie from "./clearCookie";
import getToken from "./getToken";

export default function Mainview() {
  const history = useHistory();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);
  const [twilioToken, setTwilioToken] = useState(null);

  const [client, setClient] = useState(null);

  const [clientConnectionState, setClientConnectionState] = useState(null);
  const [clientReady, setClientReady] = useState(false);

  //checks localStorage to see if user is logged in, updates state accordingly.
  useEffect(() => {
    let currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      setUsername(currentUser);
      setIsLoggedIn(true);
    } else {
      setUsername(null);
      setIsLoggedIn(false);
    }
  }, []);

  //gets a token for a logged in user and instantiates the twilio Client library instance
  useEffect(() => {
    if (isLoggedIn && !client) {
      getToken(username).then((token) => {
        setTwilioToken(token);
        if (token) {
          initializeConversationsClient(token).then((res) => {
            setClient(res);
            if (client) {
              setClientConnectionState(res.connectionState);
            }
          });
        }
      });
    }
  });

  //subscribes to the client connection state, listening for client to finish connecting
  useEffect(() => {
    if (client) {
      client.on("connectionStateChanged", (state) => {
        setClientConnectionState(state);
      });
      if (clientConnectionState === "connected") {
        setClientReady(true);
      }
    }
  }, [client, clientConnectionState]);

  //shuts down the client and resets state
  function handleLogOut() {
    if (client) {
      client.shutdown().then((res) => {
        setClient(null);
        setClientConnectionState(null);
        setClientReady(false);
      });
    }
    clearCookie();
    setIsLoggedIn(false);
    setTwilioToken(null);
    setUsername(null);
    history.push("/login");
  }

  const mainViewDiv = (
    <div className="mainviewTitleAndLogoutDiv">
      <h1 id="statusMain">Welcome!</h1>

      <div className="Logout">
        <Button id="logoutBtn" variant="primary" onClick={handleLogOut}>
          Logout
        </Button>
      </div>
    </div>
  );

  return !isLoggedIn ? (
    <Alert id="alertContactViewNotLoggedIn" variant="danger">
      Please{" "}
      <Alert.Link as={Link} to="/Login">
        login
      </Alert.Link>{" "}
      to see your contacts.
    </Alert>
  ) : isLoggedIn && !clientReady ? (
    <Spinner animation="border" role="status" variant="primary">
      <span className="sr-only">Loading...</span>
    </Spinner>
  ) : (
    <div>
      <div className="mainviewWrapperDiv">
        {mainViewDiv}
        <ContactView
          username={username}
          twilioToken={twilioToken}
          client={client}
        />
      </div>
    </div>
  );
}
