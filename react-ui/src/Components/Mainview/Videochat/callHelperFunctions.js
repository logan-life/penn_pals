export async function checkIfCanCallContact(contactName) {
  const request = {
    contactName: contactName,
  };
  try {
    const response = await fetch("api/outgoingcall", {
      method: "POST",
      body: JSON.stringify(request),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
}

export async function setOutgoingCallBoolean(bool, username) {
  const request = {
    username: username,
  };
  if (bool === true) {
    try {
      const response = await fetch("api/outgoingcall", {
        method: "PUT",
        body: JSON.stringify(request),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response;
    } catch (error) {
      throw new Error(error);
    }
  } else if (bool === false) {
    try {
      const response = await fetch("api/outgoingcall", {
        method: "DELETE",
        body: JSON.stringify(request),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response;
    } catch (error) {
      throw new Error(error);
    }
  } else {
    throw new Error("you didn't supply a boolean value");
  }
}

export async function pollOutgoingCallBoolean() {
  try {
    const response = await fetch("api/outgoingcall", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
}

export async function setIncomingCallRequest(callerName, calleeName) {
  const request = {
    callerName: callerName,
    calleeName: calleeName,
  };
  try {
    const response = await fetch("api/incomingcall", {
      method: "POST",
      body: JSON.stringify(request),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
}

export async function cancelIncomingCallRequest(userToClear) {
  const request = {
    userToClear: userToClear,
  };
  try {
    const response = await fetch("api/incomingcall", {
      method: "DELETE",
      body: JSON.stringify(request),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
}

/**
 * @params - none. the current user is identified through the jwt stored in the cookie.
 * @returns - `200` returns a string that is name of the caller
 * @returns - `404` if there's no string stored in the incoming_call field
 * @returns `500` means server error
 */
export async function pollIncomingCallRequest() {
  try {
    const response = await fetch("api/incomingcall", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getVideoChatToken(username, roomname) {
  const request = {
    identity: username,
    room: roomname,
  };

  try {
    const response = await fetch("api/twilio", {
      method: "POST",
      body: JSON.stringify(request),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
}
