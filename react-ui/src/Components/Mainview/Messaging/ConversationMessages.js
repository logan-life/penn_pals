import MessageBubble from "./MessageBubble";
import React, { useEffect, useState } from "react";


export default function ConversationMessages({ identity, messages }) {
  return (
    <div className="conversationMessagesListDiv" id="messages">
      <ul>
        {messages.map((m) => {
          if (m.author === identity)
            return (
              <MessageBubble key={m.index} direction="outgoing" message={m} />
            );
          else {
            return (
              <MessageBubble key={m.index} direction="incoming" message={m} />
            );
          }
        })}
      </ul>
    </div>
  );
}
