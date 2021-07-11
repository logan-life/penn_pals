import React, { useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import ContactList from "./ContactList";
import ContactSearch from "./ContactSearch";
import ContactSuggestions from "./ContactSuggestions";
import CallStatusView from "../Videochat/CallStatusView";
import updateLatestConvo from "../Messaging/updateLatestConvo";
// import Timer from "timeit" ;

import useInterval from "../Videochat/useInterval";
import {
  getVideoChatToken,
  setOutgoingCallBoolean,
  cancelIncomingCallRequest,
  setIncomingCallRequest,
  pollOutgoingCallBoolean,
} from "../Videochat/callHelperFunctions";
import {
  addContact,
  removeContact,
  getCurrentUserContactArray,
  getContactSuggestion,
} from "./contactHelperFunctions";
import Modal from "react-bootstrap/Modal";
import Room from "../Videochat/Room";
import Button from "react-bootstrap/Button";

const POLL_REFRESH_INTERVAL = 3000; //3 seconds, in milliseconds
let timerInterval;

export default function ContactView({ username, client }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [contactList, setContactList] = useState([]);
  const [contactSuggestion, setContactSuggestion] = useState([]);

  const [videochatToken, setVideochatToken] = useState(null);
  const [videochatConversationSid, setVideochatConversationSid] = useState(
    null
  );
  const [userToCall, setUserToCall] = useState("");
  const [chatActive, setChatActive] = useState(false);
  const [showModal, setShowModal] = useState(true);
  useEffect(() => {
    setIsUpdating(true);
    fetchContactList();
    fetchContactSuggestion();
    setIsUpdating(false);
  }, [chatActive]);

  async function handleRemoveContact(contactToRemove) {
    await removeContact(contactToRemove);
    await fetchContactList();
    await fetchContactSuggestion();
  }

  async function handleAddContact(contactToAdd, sid) {
    await addContact(contactToAdd, sid);
    await fetchContactList();
    await fetchContactSuggestion();
  }

  async function fetchContactList() {
    const response = await getCurrentUserContactArray();

    if (response.status === 200) {
      const data = await response.json();
      let sorted = data.sort((a, b) => {
        let time_a = a.last_interaction,
          time_b = b.last_interaction;
        if (time_a < time_b) {
          return 1;
        }
        if (time_a > time_b) {
          return -1;
        }
        return 0;
      });
      setContactList(sorted);
    } else {
      setContactList([]);
    }
  }

  async function fetchContactSuggestion() {
    const response = await getContactSuggestion();
    if (response.status === 200) {
      const data = await response.json();
      setContactSuggestion(data);
    } else {
      setContactSuggestion([]);
    }
  }
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
  //this polls our outgoing call boolean. the purpose of this is to check and see if the other person declined our call.
  useInterval(async () => {
    try {
      let callAccepted = await pollOutgoingCallBoolean();
      callAccepted = await callAccepted.json();
      //we enter this condition if we have a current active chat (our initiated call) but our outgoingcall is false (they declined the call, updated our boolean, and cleared their own incoming_call field)
      if (!callAccepted.outgoing_call_active && chatActive) {
        setChatActive(false);
        //set call declined?
      }
    } catch (error) {
      throw new Error(error);
    }
  }, POLL_REFRESH_INTERVAL);

  //this is passed as a prop to <ContactList/> and called when a user clicks the VideoCall button next to one of their contacts
  async function handleCallContact(usernameToCall, conversationSID) {
    setChatActive(false);
    try {
      startTimer();
      let token = await getVideoChatToken(username, username); //we get a token signed with our username and with a "roomname" that is also our username.
      token = await token.json();
      await setIncomingCallRequest(username, usernameToCall); //we update the user we are trying to call's user doc with our name
      await setOutgoingCallBoolean(true, username); //we set our outgoing call to true
      setVideochatToken(token.token);
      setVideochatConversationSid(conversationSID); //we store the conversationSID of the convo we have with this user. used to send messages to that convo which reflect call activity per user story requirements.
      let convo = await client.getConversationBySid(conversationSID);
      await convo.sendMessage(
        `Call with ${usernameToCall} initiated by ${username}.`,
        ["delivered:true", "read:false"]
      );
      setUserToCall(usernameToCall); //we store the person we are calling. this is passed to the Room.
      setShowModal(true); //we show the call modal and update chat status
      setChatActive(true);
      //update the latest interaction
      let time = Date.now();
      const userDataOne = Object.freeze({
        date: time,
        user: username,
        receiver: usernameToCall,
      });
      await updateLatestConvo(userDataOne);
      const userDataTwo = Object.freeze({
        date: time,
        user: usernameToCall,
        receiver: username,
      });
      await updateLatestConvo(userDataTwo);
    } catch (error) {
      throw new Error(error);
    }
  }

  //this is used when we are in an active call and wish to end it (for both parties!)
  async function handleEndCall() {
    try {
      clearInterval(timerInterval);
      setShowModal(false); //we hide the modal
      await cancelIncomingCallRequest(userToCall); //clear our name from the other person's user doc
      await setOutgoingCallBoolean(false, username); //update our outgoingcall to reflect end of call
      let convo = await client.getConversationBySid(videochatConversationSid);
      convo.sendMessage(`Call ended by ${username}.`); //update the conversation per user story requirements
      setVideochatToken(null); //clear out our videochat token
      setVideochatConversationSid(null); //clear out the conversationSID
      setUserToCall(""); //clear out name
      setChatActive(false); //update chat status
    } catch (error) {
      throw new Error(error);
    }
  }

  return isUpdating ? (
    <Spinner animation="border" role="status" variant="danger">
      <span className="sr-only">Loading...</span>
    </Spinner>
  ) : videochatToken !== null && chatActive ? (
    <div>
      <Modal size="lg" centered show={showModal} onHide={handleEndCall}>
        <Modal.Header closeButton>
          <Modal.Title>{/* <h1>Call with {otherUsername}</h1> */}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="videochatdiv">
            <Room
              token={videochatToken}
              callerName={userToCall}
              username={username}
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
    <div className="contactViewDiv">
      <ContactList
        contacts={contactList}
        removeContact={handleRemoveContact}
        username={username}
        client={client}
        callContact={handleCallContact}
      />
      <ContactSuggestions
        contact={contactSuggestion}
        addContact={handleAddContact}
        client={client}
        username={username}
      />
      <ContactSearch
        addContact={handleAddContact}
        client={client}
        username={username}
        contacts={contactList}
      />
      <CallStatusView currentUser={username} client={client} />
    </div>
  );
}
