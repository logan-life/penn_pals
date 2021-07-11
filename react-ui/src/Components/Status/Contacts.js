import { Button } from "react-bootstrap";
import React, { Component }  from 'react';

export default function ContactsStatus(props) {
  const contacts = props.contacts;
  const curr = Date.now();
  const listItems = Object.keys(contacts).map((key) => (
    <div className="contactsnippets" id="contactsnippets">
      <div key={contacts[key].username}>
      <p id = "userName">{contacts[key].username}</p>
      <br></br>
      <p id = "update"> Last update: {Math.round(((curr-Date.parse(contacts[key].upload_time))/1000/60/60),2)}  hours ago </p>
      </div>
    </div>
  ));

  return (
    <div className="contactListDiv" id="contactlist">
      {listItems}
    </div>
  );
  
}
