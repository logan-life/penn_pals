import { Button } from "react-bootstrap";
import Client from "@twilio/conversations";
import React from "react";
import getToken from "../getToken";

export default function ContactSuggestions({
  contact,
  addContact,
  client,
  username,
}) {
  const contactSuggestion = contact;
  let suggestionToShow;
  if (contactSuggestion.username === "") {
    suggestionToShow = (
      <div className="contactsuggest" id="contactsuggest">
        <h3>There are no contacts to suggest</h3>
      </div>
    );
  } else {
    suggestionToShow = (
      <div className="contactSuggestDiv" id="contactsuggest">
        <div id={contactSuggestion.username}>
          <img src={contactSuggestion.avatar} alt="" width="110" height="110" />
        </div>
        <div className="contactSuggestMetadataDiv">
          <h2> {contactSuggestion.username}</h2>

          <Button
            variant="outline-primary"
            onClick={(e) =>
              handleAddContact(
                contactSuggestion.username,
                contactSuggestion.conversation_sid
              )
            }
            type="submit"
            id={contactSuggestion.username}
          >
            Add Contact
          </Button>
        </div>
      </div>
    );
  }

  async function handleAddContact(contactName, sid) {
    if (sid === "") {
      let newConvo = await client.createConversation();
      let contactToken = await getToken(contactName);
      // eslint-disable-next-line no-unused-vars
      let contactClient = await Client.create(contactToken);
      await newConvo.add(contactName);
      await newConvo.add(username);
      await addContact(contactName, newConvo.sid);
    } else {
      await addContact(contactName);
    }
  }
  return (
    <div className="contactSuggestionsWrapperDiv" id="contactSuggestions">
      <h1>Suggested Contact</h1>
      {suggestionToShow}
    </div>
  );
}
