import React, { useEffect, useState } from "react";
import styles from "../assets/Conversation.module.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ConversationMessages from "./ConversationMessages";
import PropTypes from "prop-types";

import MicRecorder from 'mic-recorder-to-mp3';
import updateLatestConvo from './updateLatestConvo';

import { set } from "js-cookie";
const recorder = new MicRecorder({ bitRate: 128 });

export default function Conversation({ conversationObject, myIdentity }) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesReady, setMessagesReady] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [audioFile, setAudioFile] = useState();

  useEffect(() => {
    let isMounted = true;
    if (conversationObject && isMounted) {
      conversationObject.getMessages().then(
        (res) => {
          setMessages(res.items);
          setMessagesReady(true);
        },
        (rej) => {
          console.error("Could not fetch messages", rej);
          setMessagesReady(false);
        }
      );
    }
    return function cleanup() {
      isMounted = false;
    };
  }, [conversationObject, messages]);

  function onMessageChanged(event) {
    setNewMessage(event.target.value);
  }

  function onFileChange(event) {
    // Update the state
    setSelectedFile(event.target.files[0]);
  }
  function checkAudioSettings(event) {
    navigator.getUserMedia(
      { audio: true },
      () => {
        console.log("Permission to record audio is granted");
        setIsBlocked(false);
      },
      () => {
        console.log("Permission to record audio is denied");
        setIsBlocked(true);
      }
    );
  }
  function startRecording(event) {
    if (isBlocked) {
      console.log("Permission to record audio is denied");
    } else {
      recorder
        .start()
        .then(() => {
          setIsRecording(true);
        })
        .catch((e) => console.error(e));
    }
  }
  function stopRecording(event) {
    recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const blobURL = URL.createObjectURL(blob);
        const file = new File(buffer, "me-at-thevoice.mp3", {
          type: blob.type,
          lastModified: Date.now(),
        });
        setSelectedFile(file);
        setAudioFile(blobURL);
        setIsRecording(false);
      })
      .catch((e) => console.log(e));
  }

  function onFileUpload() {
    // Create an object of formData
    const formData = new FormData();

    // Update the formData object
    formData.append("myFile", selectedFile, selectedFile.name);
    formData.append("filename", selectedFile.name);
    formData.append("type", selectedFile.type);
    formData.append("size", selectedFile.size);
    conversationObject.sendMessage(formData);
  }

  async function handleSendMessage(event) {
    event.preventDefault();
    let participants = await conversationObject.getParticipants();
    let participantOne = participants[0].state.identity;
    let participantTwo = participants[1].state.identity;
    let time = Date.now();
    const userDataOne = Object.freeze({
      date: time,
      user: participantTwo,
      receiver:participantOne
    });
    await updateLatestConvo(userDataOne);
    const userDataTwo = Object.freeze({
      date: time,
      user:participantOne,
      receiver:participantTwo
    });
    await updateLatestConvo(userDataTwo);
    const message = newMessage;
    setNewMessage("");
    conversationObject.sendMessage(message, ["delivered:false", "read:false"]);
  }

  return !messagesReady ? (
    <div className="messagesNotReadyDiv">
      <p>Messages Aren't Ready</p>
    </div>
  ) : (
    <div>
      <div className="conversationMessagesWrapperDiv">
        <ConversationMessages identity={myIdentity} messages={messages} />
      </div>
      <div className="sendMessageDiv">
        <Form>
          <Form.Control
            style={{ flexBasis: "100%" }}
            placeholder={"Type your message here..."}
            type={"text"}
            name={"message"}
            id={styles["type-a-message"]}
            autoComplete={"off"}
            onChange={onMessageChanged}
            value={newMessage}
          />
          <Button onClick={handleSendMessage} icon="enter" variant="success">
            {" "}
            Send Message{" "}
          </Button>

          <div>
            <Form.File type="file" onChange={onFileChange} />
            <br></br>
            <p>Accepted files: .jpeg and .mov</p>
            <br></br>
            <p> Maximum file size: 150MB </p>

            <Button variant="outline-primary" onClick={onFileUpload}>
              Send File
            </Button>
            <Button
              variant="outline-primary"
              onClick={startRecording}
              disabled={isRecording}
            >
              Record
            </Button>
            <Button
              variant="outline-primary"
              onClick={stopRecording}
              disabled={!isRecording}
            >
              Stop
            </Button>
            <audio src={audioFile} controls="controls" />
          </div>
        </Form>
      </div>
    </div>
  );
}

Conversation.propTypes = {
  myIdentity: PropTypes.string.isRequired,
};
