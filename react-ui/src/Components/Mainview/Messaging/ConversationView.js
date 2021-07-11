import React, { useState, useEffect } from "react";
import Conversation from "./Conversation";
import Spinner from "react-bootstrap/Spinner";

export default function ConversationView({ sid, client, username }) {
  const [conversationObject, setConversationObject] = useState(null);

  useEffect(() => {
    client.getConversationBySid(sid).then((convo) => {
      setConversationObject(convo);
    });
  }, [client, sid]);

  let conversationContent;

  if (conversationObject) {
    conversationContent = (
      <Conversation
        conversationObject={conversationObject}
        myIdentity={username}
      />
    );
  } else {
    conversationContent = "";
  }

  return !conversationObject ? (
    <Spinner animation="border" role="status">
      <span className="sr-only">Loading Conversation</span>
    </Spinner>
  ) : (
    <div className="conversations-window-container">
      <div id="SelectedConversation">{conversationContent}</div>
    </div>
  );
}
