import { Button, Modal } from "react-bootstrap";
import React, { useState } from "react";
import ConversationView from "../../Mainview/Messaging/ConversationView.js";
import { removeHiddenContacts } from "./contactHelperFunctions";

export default function ContactList({
  contacts,
  removeContact,
  client,
  username,
  callContact,
}) {
  const [conversationSidSelected, setconversationSidSelected] = useState(null);
  const [showMessagingModal, setShowMessagingModal] = useState(false);

  const handleCloseMessagingModal = () => setShowMessagingModal(false);
  const handleShowMessagingModal = () => setShowMessagingModal(true);

  function handleMessageContact(sid) {
    setconversationSidSelected(sid);
    handleShowMessagingModal();
  }

  let onlyUnhiddenContacts = removeHiddenContacts(contacts);

  const listItems = Object.keys(onlyUnhiddenContacts).map((key) => (
    <div
      className="contactSnippetsDiv"
      id="contactsnippets"
      key={onlyUnhiddenContacts[key].username}
    >
      <div className="contactAvatarAndButtonsDiv">
        <img
          src={onlyUnhiddenContacts[key].avatar}
          alt=""
          width="110"
          height="110"
          style={{ marginRight: "10px" }}
        />
        <div className="contactListActionButtonsDiv">
          <Button
            variant="outline-success"
            onClick={(e) => handleMessageContact(e.target.id)}
            type="submit"
            id={onlyUnhiddenContacts[key].conversation_sid}
            style={{ marginBottom: "10px" }}
          >
            Message
          </Button>

          <Button
            variant="outline-primary"
            onClick={(e) => {
              // eslint-disable-next-line no-undef
              callContact(
                onlyUnhiddenContacts[key].username,
                onlyUnhiddenContacts[key].conversation_sid
              );
            }}
            type="submit"
            id={onlyUnhiddenContacts[key].username}
            style={{ marginBottom: "10px" }}
          >
            Video Call
          </Button>

          <Button
            variant="outline-danger"
            onClick={(e) => removeContact(e.target.id)}
            type="submit"
            id={onlyUnhiddenContacts[key].username}
          >
            Remove
          </Button>
        </div>
      </div>
      <div className="contactListMetadataDiv" style={{ marginBottom: "20px" }}>
        <h2> {onlyUnhiddenContacts[key].username} </h2>
      </div>
    </div>
  ));

  return !conversationSidSelected ? (
    <div className="contactListDiv" id="contactlist">
      <h1>Your Contacts</h1>
      {listItems}
    </div>
  ) : (
    <div className="contactListAndMessagingDiv">
      <div className="contactListDiv" id="contactlist">
        <h1>Your Contacts</h1>
        {listItems}
      </div>
      <Modal
        show={showMessagingModal}
        onHide={handleCloseMessagingModal}
        backdrop="static"
        keyboard={false}
        centered
        size="lg"
      >
        {" "}
        <Modal.Body>
          <div className="contactMessagingDiv" id="contactMessaging">
            <ConversationView
              sid={conversationSidSelected}
              client={client}
              username={username}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseMessagingModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
