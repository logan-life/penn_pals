import styles from "../assets/MessageBubble.module.css";
import PropTypes from "prop-types";
import { Spin } from "antd";
import Icon from "@ant-design/icons";
import React, { Component }  from 'react';

export default function Media(props) {
  const { hasFailed, url } = props;

  return (
    <div
      className={`${styles.media}${!url ? " " + styles.placeholder : ""}`}
      onClick={() => {
        window.open(url, "_blank");
      }}
    >
      {!url && !hasFailed && <Spin />}

      {hasFailed && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Icon type={"warning"} style={{ fontSize: "5em" }} />
          <p>Failed to load media</p>
        </div>
      )}

      {!hasFailed && url && (
        <div className={styles.media_icon}>
          <div style={{ zIndex: 123, position: "absolute" }}>
            <Icon type={"eye"} style={{ fontSize: "5em", opacity: 0.3 }} />
          </div>
          <div
            className={styles.picture_preview}
            style={{ backgroundImage: `url(${url})`, zIndex: 122 }}
          ></div>
        </div>
      )}
    </div>
  );
}

Media.propTypes = {
  hasFailed: PropTypes.bool.isRequired,
  url: PropTypes.string,
};
