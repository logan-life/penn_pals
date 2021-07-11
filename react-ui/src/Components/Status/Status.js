import React, { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import getUser from "./../Profile/getUser.js";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ContactsStatus from "./Contacts";
import getContactStatus from "./getContactStatus";
import seenStatus from "./seenStatus";
import postText from "./postStatus";
import postImage from "./postImage";
import "./Status.css";

import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
export default function StatusView() {
  const [isLoggedIn, setLogIn] = useState(false);
  const [userName, setUser] = useState("");
  const [picture, setPicture] = useState("");
  const [contactList, setContactList] = useState([]);
  const [status, setStatus] = useState("");
  const [file, setFile] = useState();
  const [myStatusText, setMyStatus] = useState();
  const [myStatusImage, setMyStatusImage] = useState();
  const [media, setMedia] = useState();
  const [statusText, setStatusText] = useState();

  async function getUserData() {
    const res = await getUser();
    if (res.status === 200) {
      setLogIn(true);
      let imageDisplay = document.getElementById("userStatusImg");
      let statusDisplay = document.getElementById("userStatus");

      res.json().then(function (json) {
        setUser(json.username);
        setPicture(json.avatar);
        if (json.status !== undefined) {
          if (json.status.type === "text") {
            imageDisplay.style.display = "none";
            setMyStatus(json.status.text);
          } else {
            imageDisplay.style.display = "block";
            setMyStatusImage(json.status.image);
            statusDisplay.style.display = "none";
          }
        }
      });
    }
  }

  async function fetchContactStatus() {
    const response = await getContactStatus();
    if (response.status === 200) {
      response.json().then(function (json) {
        setContactList(json);
      });
    }
  }
  //posting text status
  async function handleAddText() {
    const statusData = Object.freeze({
      contact_name: userName,
      status_id: 1,
      type: "text",
      text: status,
      image: "",
      url: "",
    });
    postText(statusData);
    setStatus("");
    let statusDisplay = document.getElementById("userStatus");
    document.getElementById("userStatusImg").style.display = "none";
    statusDisplay.style.display = "block";
    statusDisplay.innerHTML = status;
  }
  //player for the statuses
  async function handlePlayer() {
    if (contactList.length !== 0) {
      let contacts = contactList;
      let timer = null;
      let index = 0;
      let playerPic = document.getElementById("picStatus");
      async function play() {
        if (index <= contacts.length - 1) {
          let stat = contacts[index].text;
          const statusData = Object.freeze({
            contact_username: contacts[index].username,
            status_id: contacts[index]._id,
          });
          const res = await seenStatus(statusData);
          let contactlist = document.getElementById("contactlist");
          if (index > 0) {
            contactlist.children[index - 1].style.display = "none";
          }
          contactlist.children[index].style.color = "red";
          if (stat !== "") {
            setMedia();
            playerPic.style.display = "none";
            setStatusText(stat);
          } else {
            setStatusText("");
            // document.getElementById("textStatus").style.display = "none";
            playerPic.style.display = "block";
            setMedia(contacts[index].image);
          }
          index++;
        } else {
          document.getElementById("contactlist").children[
            index - 1
          ].style.display = "none";
          document.getElementById("textStatus").style.display = "none";
          document.getElementById("picStatus").style.display = "none";
          clearInterval(timer);
        }
      }
      timer = setInterval(play, 3000);
    }
  }

  //function for the images upload
  async function upploadFile() {
    postImage(file, userName, "image");
    const res = await getUser();
    res.json().then(function (json) {
      setMyStatus(json.status.text);
      setMyStatusImage(json.status.image);
    });
    let imageDisplay = document.getElementById("userStatusImg");
    let statusDisplay = document.getElementById("userStatus");
    statusDisplay.style.display = "none";
    window.location.reload(false);
    imageDisplay.src = file;
  }
  const onChangeHandler = (event) => {
    setFile(event.target.files[0]);
  };

  useEffect(() => {
    getUserData();
    fetchContactStatus();
    // handleAddText();
  }, [myStatusText, myStatusImage]);

  return isLoggedIn ? (
    <div id="userStatusWhole">
        <div id="userProfInfo">
          <img
            id="pic"
            src={picture}
            alt="User Avatar"
            width="150"
            height="150"
            style={{ borderRadius: 150 / 2 }}
          ></img>
          <p id="useName">{userName}</p>
        </div>
        <div
          id="statusField"
          width="100"
          style={{
            borderStyle: "solid",
            borderColor: "#ff8c00",
            width: "250px",
            height: "250px",
            // position: "relative",
            // left: "170px",
          }}
        >
          <div id="userStatus">{myStatusText}</div>
          <br></br>
          <img
            id="userStatusImg"
            src={myStatusImage}
            alt="userImageStatus"
            width="200"
            height="200"
          ></img>
      </div>
      <br></br>
      <div id="uploadStatusButtons">
        <input
          id="answer"
          name="answer"
          type="text"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <Button
          variant="outline-primary"
          type="submit"
          value="Search"
          id="contactSearchButton"
          onClick={handleAddText}
        >
          Status Text
        </Button>
        <input type="file" onChange={onChangeHandler} />
        <Button
          variant="outline-primary"
          type="submit"
          value="upload"
          id="fileUpload"
          onClick={upploadFile}
        >
          Upload
        </Button>
      </div>
      <br></br>
      <Container fluid>
        <div
          className="contactsStatus"
          id="contactsStatus"
          style={{ display: "inline-block" }}
        >
          <ContactsStatus contacts={contactList} />
        </div>
      </Container>
      <div
        className="Player"
        id="Player"
        height="300"
        width="300"
        style={{
          borderStyle: "solid",
          borderColor: "red",
          height: "150px",
          width: "350px",
        }}
      >
        <div id="textStatus">{statusText}</div>
        <img
          id="picStatus"
          src={media}
          alt="picStatus"
          width="150"
          height="150"
          style={{ display: "none" }}
        ></img>
      </div>
      <Button
        variant="outline-primary"
        type="submit"
        value="Play"
        id="playerButton"
        onClick={handlePlayer}
      >
        Play
      </Button>
    </div>
  ) : (
    <Alert id="alertContactViewNotLoggedIn" variant="danger">
      Please{" "}
      <Alert.Link as={Link} to="/Login">
        login
      </Alert.Link>{" "}
      to see your status.
    </Alert>
  );
}
