import React, { useEffect, useState } from "react";
import styles from "../assets/MessageBubble.module.css";
import Media from "./Media";
import Button from "react-bootstrap/Button";

export default function MessageBubble({ direction, message }) {
  const [hasMedia, setHasMedia] = useState(message.type === "media");
  const [mediaDownloadFailed, setMediaDownloadFailed] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  useEffect(() => {
    async function handleMedia() {
      if (hasMedia) {
        try {
          const url = await message.media.getContentTemporaryUrl();
          const mediatype = message.media.contentType;

          setMediaUrl(url);
          setMediaType(mediatype);
        } catch (e) {
          setMediaDownloadFailed(true);
        }
      }
    }
    handleMedia();
    document.getElementById(message.sid).scrollIntoView({ behavior: "smooth" });
  }, [hasMedia, message.media, message.sid]);

  useEffect(() => {
    async function updateReadStatus() {
      if (direction === "incoming") {
        try {
          await message.updateAttributes(["delivered:false", "read:true"]);
        } catch (error) {
          throw new Error(error);
        }
      }
    }
    updateReadStatus();
  }, []);

  const { itemStyle, divStyle } =
    direction === "incoming"
      ? {
          itemStyle: styles.received_msg,
          divStyle: styles.received_withd_msg,
        }
      : { itemStyle: styles.outgoing_msg, divStyle: styles.sent_msg };

  const { deleteButton } =
    direction === "incoming"
      ? {
          deleteButton: <div>{""}</div>,
        }
      : direction === "outgoing"
      ? {
          deleteButton: (
            <Button variant="outline-danger" onClick={handleRemoveMessage}>
              Delete Message
            </Button>
          ),
        }
      : {
          deleteButton: "",
        };

  const m = message;

  const { delivered, read } =
    m.attributes[0] === "delivered:false" &&
    m.attributes[1] === "read:true" &&
    direction === "outgoing"
      ? {
          delivered: " Delivered |",
          read: " Read",
        }
      : m.attributes[0] === "delivered:false" &&
        m.attributes[1] === "read:false" &&
        direction === "outgoing"
      ? {
          delivered: " Delivered |",
          read: " Unread",
        }
      : { delivered: " Delivered", read: "" };

  function handleRemoveMessage(event) {
    event.preventDefault();
    message.remove();
  }

  return mediaType === "image/jpeg" ? (
    <li id={m.sid} className={itemStyle}>
      <div className={divStyle}>
        <div className={styles.medias}>
          {hasMedia && <Media hasFailed={mediaDownloadFailed} url={mediaUrl} />}
        </div>

        {m.body}

        <span className={styles.time_date} style={{ textAlign: "right" }}>
          <h6>{m.author}</h6>
          {m.state.timestamp.toLocaleString()} {delivered}
          <h6>{read}</h6>
          <br></br>
          {deleteButton}
        </span>
      </div>
    </li>
  ) : mediaType === "audio/mp3" ? (
    <li id={m.sid} className={itemStyle}>
      <div className={divStyle}>
        <div className={styles.medias}></div>
        <audio controls="controls">
          <source src={mediaUrl} type="audio/mp3"></source>
        </audio>
        {m.body}
        <span className={styles.time_date}>
          <h6>{m.author}</h6>
          {m.state.timestamp.toLocaleString()}
          {delivered}
          <h6>{read}</h6>
          <br></br>
          {deleteButton}
        </span>
      </div>
    </li>
  ) : mediaType === "video/quicktime" ? (
    <li id={m.sid} className={itemStyle}>
      <div className={divStyle}>
        <div className={styles.medias}></div>
        <video width="320" height="240" controls>
          <source src={mediaUrl} type="video/quicktime"></source>
        </video>
        {m.body}
        <span className={styles.time_date} style={{ textAlign: "right" }}>
          <h6>{m.author}</h6>
          {m.state.timestamp.toLocaleString()} {delivered}
          <h6>{read}</h6>
          <br></br>
          {deleteButton}
        </span>
      </div>
    </li>
  ) : (
    <li id={m.sid} className={itemStyle}>
      <div className={divStyle}>
        <div className={styles.medias}></div>
        {m.body}
        <span className={styles.time_date} style={{ textAlign: "right" }}>
          <h6>{m.author}</h6>
          {m.state.timestamp.toLocaleString()}
          {delivered}
          <h6>{read}</h6>
          <br></br>
          {deleteButton}
        </span>
      </div>
    </li>
  );
}
