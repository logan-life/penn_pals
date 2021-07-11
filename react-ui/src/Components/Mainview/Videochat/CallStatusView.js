import React, { useState } from "react";
import useInterval from "./useInterval";
import { searchContact } from "../Contacts/contactHelperFunctions";
import {
  pollIncomingCallRequest,
  setOutgoingCallBoolean,
  cancelIncomingCallRequest,
  getVideoChatToken,
} from "./callHelperFunctions";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import Room from "./Room";

const POLL_REFRESH_INTERVAL = 3000; //3 seconds, in milliseconds
let timerInterval;
export default function CallStatusView({ currentUser, client }) {
  const [incomingCallerName, setIncomingCallerName] = useState("");
  const [callActive, setCallActive] = useState(false);
  const [callerConversationSid, setCallerConversationSid] = useState(null);
  const [token, setToken] = useState(null);
  const [showModal, setShowModal] = useState(true);

  function timeToString(timetoFormat) {
    let hours = timetoFormat / (60 * 60 * 1000);
    let formatHours = Math.floor(hours);

    let minutes = (hours - formatHours) * 60;
    let formatMin = Math.floor(minutes);

    let seconds = (minutes - formatMin) * 60;
    let formatSec = Math.floor(seconds);

    let finalHour = formatHours.toString().padStart(2, "0");
    let finalMin = formatMin.toString().padStart(2, "0");
    let finalSec = formatSec.toString().padStart(2, "0");

    return `${finalHour}:${finalMin}:${finalSec}`;
  }
  function startTimer() {
    try {
      let now = Date.now();
      timerInterval = setInterval(function printTime() {
        let elapsedTime = Date.now() - now;
        document.getElementById("timer").innerHTML = timeToString(elapsedTime);
      }, 1000);
    } catch (error) {
      throw new Error(error);
    }
  }

  //this polls our incoming_call field in our user doc. if someone calls us, they store their name in that field.
  useInterval(async () => {
    try {
      let call = await pollIncomingCallRequest();
      call = await call.json();
      let contact = await searchContact(call.incoming_call); //check if the incoming call is a mutual contact and if it is hidden
      //we enter this conditional if the call is legit and we aren't already on a call
      if (contact.current_contact && !contact.hidden) {
        setIncomingCallerName(call.incoming_call);
        setCallerConversationSid(contact.conversation_sid);
      } else if (call.incoming_call === "") {
        setIncomingCallerName("");
      }
    } catch (error) {
      throw new Error(error);
    }
  }, POLL_REFRESH_INTERVAL);

  async function handleAcceptCall() {
    try {
      startTimer();
      //the conversationSID is stored when we see a request in the polling function
      let convo = await client.getConversationBySid(callerConversationSid);
      convo.sendMessage(
        `Call from ${incomingCallerName} accepted by ${currentUser}`,
        ["delivered:true", "read:false"]
      );
      //we generate ourselves a token using our name and the roomname of the incomingcaller
      let token = await getVideoChatToken(currentUser, incomingCallerName);
      token = await token.json();
      setToken(token.token);
      setCallActive(true);
    } catch (error) {
      throw new Error(error);
    }
  }

  //this is used to decline a call and reset both parties' states appropriately
  async function handleDeclineCall() {
    try {
      //clear out our incoming call field
      await cancelIncomingCallRequest(currentUser);
      //set the caller's boolean, which essentially tells them that we have declined
      await setOutgoingCallBoolean(false, incomingCallerName);
      //send message to the conversation noting that we declines
      let convo = await client.getConversationBySid(callerConversationSid);
      convo.sendMessage(`Call was declined by ${currentUser}`, [
        "delivered:true",
        "read:false",
      ]);
      //reset our state
      setIncomingCallerName("");
      setCallActive(false);
      setCallerConversationSid(null);
      setToken(null);
      setShowModal(false);
    } catch (error) {
      throw new Error(error);
    }
  }

  async function handleEndCall() {
    setShowModal(false); //we hide the modal
    await cancelIncomingCallRequest(currentUser); //we clear out our incoming call request field
    await setOutgoingCallBoolean(false, incomingCallerName); //we clear out their outgoing_call boolean
    let convo = await client.getConversationBySid(callerConversationSid);
    convo.sendMessage(`Call ended by ${currentUser}`, [
      "delivered:true",
      "read:false",
    ]);
    //reset our state
    setIncomingCallerName("");
    setCallActive(false);
    setCallerConversationSid(null);
    setToken(null);
  }

  const incomingCallDiv = () => {
    if (incomingCallerName === "") {
      return <div>No incoming calls right now.</div>;
    } else
      return (
        <div>
          <div>Incoming call from: {incomingCallerName}</div>
          <div>
            <Button
              id="acceptCallBtn"
              variant="success"
              onClick={handleAcceptCall}
            >
              Accept
            </Button>
            <Button
              id="declineCallBtn"
              variant="danger"
              onClick={handleDeclineCall}
            >
              Decline
            </Button>
          </div>
        </div>
      );
  };

  return callActive === true && token ? (
    <div>
      <Modal size="lg" centered show={showModal} onHide={handleEndCall}>
        <Modal.Header closeButton>
          <Modal.Title>{/* <h1>Call with {otherUsername}</h1> */}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="videochatdiv">
            <Room
              token={token}
              callerName={incomingCallerName}
              username={currentUser}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div id="timer">00:00:00</div>
          <Button variant="danger" onClick={handleEndCall}>
            End Call
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  ) : (
    <div>
      <h3>Incoming Call Monitor</h3>
      {incomingCallDiv()}
    </div>
  );
}
