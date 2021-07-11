import React, { useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { searchContact } from "../Contacts/contactHelperFunctions.js";
import getToken from "../getToken";
import Client from "@twilio/conversations";
import { removeHiddenContacts } from "./contactHelperFunctions";

export default function ContactSearch({
  contacts,
  addContact,
  client,
  username,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState("");

  const textInput = useRef(null);

  const handleChange = (e) => {
    setSearchQuery(e.target.value.trim());
  };
  let onlyUnhiddenContacts = removeHiddenContacts(contacts);
  async function handleSearchContact(e) {
    e.preventDefault();
    const searchResponse = await searchContact(searchQuery);
    if (searchResponse) {
      if (searchResponse.username) {
        if (
          onlyUnhiddenContacts.some(
            (contact) => contact.username === searchResponse.username
          )
        ) {
          setSearchResult("That user is already a contact");
        } else {
          setSearchResult(searchResponse);
        }
      } else {
        setSearchResult("User not found.");
      }
    } else {
      setSearchResult("");
    }
  }

  async function handleAddSearchContact(contactName, sid) {
    if (sid === "") {
      let newConvo = await client.createConversation();
      let contactToken = await getToken(contactName);
      let contactClient = await Client.create(contactToken);
      client.on("connectionStateChanged", () => {
        contactClient.shutdown();
      });

      newConvo.add(contactName);
      newConvo.add(username);
      addContact(contactName, newConvo.sid);
      setSearchResult("");
      setSearchQuery("");
    } else {
      await addContact(contactName);
      setSearchResult("");
      setSearchQuery("");
    }
  }

  const searchPromptDiv = (
    <div className="searchPromptDiv">
      <Form className="searchPromptForm">
        <Form.Group>
          <Form.Label>
            <h1>Search Contact</h1>
          </Form.Label>
          <Form.Control
            type="search"
            placeholder="Example: 'lmayliffe'"
            ref={textInput}
            onChange={handleChange}
            value={searchQuery}
          />
        </Form.Group>

        <Button
          variant="outline-primary"
          type="submit"
          value="Search"
          id="contactSearchButton"
          onClick={handleSearchContact}
          style={{ marginBottom: "15px" }}
        >
          Search
        </Button>
      </Form>
    </div>
  );

  const addNewContactButton = (
    <div className="addContactButtonDiv">
      <Button
        variant="outline-primary"
        type="submit"
        id="addContactButton"
        style={{ marginBottom: "5px" }}
        onClick={() =>
          handleAddSearchContact(
            searchResult.username,
            searchResult.conversation_sid
          )
        }
      >
        Add Contact
      </Button>
    </div>
  );

  return searchResult.username && searchResult.username !== username ? (
    <div className="searchContactDiv">
      {searchPromptDiv}
      <div className="searchResultsDiv">
        <img src={searchResult.avatar} alt="" height="110" width="110"></img>
        <br></br>
        <h2>{searchResult.username}</h2>
        <br></br>
      </div>
      {addNewContactButton}
    </div>
  ) : searchResult.username && searchResult.username === username ? (
    <div className="searchContactDiv">
      {searchPromptDiv}
      <h4>You can't add yourself as a contact, silly.</h4>
    </div>
  ) : searchResult === "That user is already a contact" ? (
    <div className="searchContactDiv">
      {searchPromptDiv}
      <h4>That user is already a contact.</h4>
    </div>
  ) : searchResult === "User not found." ? (
    <div className="searchContactDiv">
      {searchPromptDiv}
      <h4>User not found.</h4>
    </div>
  ) : (
    <div className="searchContactDiv">{searchPromptDiv}</div>
  );
}
