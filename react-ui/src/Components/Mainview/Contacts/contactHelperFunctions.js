import Client from "@twilio/conversations";

export async function getContactSuggestion() {
  try {
    const response = await fetch("api/contactsuggest", {
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
/**
 * @params - none. the current user is identified through the jwt stored in the cookie.
 * @returns - `200` returns an array with the current user's contacts and the following key value pairs
 *   firstname: contact_obj[i].firstname,
 *   lastname: contact_obj[i].lastname,
 *   username: contact_obj[i].username,
 *   avatar: contact_obj[i].avatar,
 *   conversation_sid: contact_obj[i].conversation_sid,
 *   hidden: contact_obj[i].hidden,
 *
 * @returns `500` means server error
 */
export async function getCurrentUserContactArray() {
  try {
    const response = await fetch("api/contacts", {
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

export async function initializeConversationsClient(twilioToken) {
  let conversationsClient = Client;
  conversationsClient = await Client.create(twilioToken);
  return conversationsClient;
}

/**
 * This function goes into the current user's contact array and
 * sets the `hidden` flag to true on the requested username.
 *
 * Doesn't actually delete the contact so that we don't lose the SID.
 * We just flip the `hidden` boolean again if we re-add this person as a contact
 * @param {string} contactUsernameToRemove - name of the contact we wish to remove.
 * @returns 200 if sucessfull
 * @returns 400 if the contact searched for didn't exist
 * @returns 500 if server error
 */
export async function removeContact(contactUsernameToRemove) {
  const request = {
    contactToRemove: contactUsernameToRemove,
  };

  try {
    const response = await fetch("api/contacts", {
      method: "DELETE",
      body: JSON.stringify(request),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.status;
  } catch (error) {
    throw new Error(error);
  }
}
/**
 *
 * @param {string} usernameToSearchFor
 * @returns a JSON object with the following fields (default values shown)
 *
 *     searchresult_contactExists = false
 *     searchresult_userName = "";
 *     searchresult_firstName = "";
 *     searchresult_lastName = "";
 *     searchresult_avatar = "";
 *     searchresult_active_status = false;
 *     searchresult_current_contact = false;
 *     searchresult_conversationSid = "";
 *     searchresult_hidden = false;
 *
 *
 * if the contact was found and has already added the current user as a contact, we return the stuff we need to add the contact and load the conversations
 *     searchresult_current_contact = true;
 *     searchresult_conversationSid = "(conversationSID)";
 *     searchresult_hidden = false;
 *
 *
 */
export async function searchContact(usernameToSearchFor) {
  const contactToSearch = {
    contactToSearch: usernameToSearchFor,
  };

  try {
    const response = await fetch("api/contacts", {
      method: "POST",
      body: JSON.stringify(contactToSearch),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const responseJson = await response.json();
      return responseJson;
    }
  } catch (error) {
    throw new Error(error);
  }
}
/**
 *
 * @param {string} usernameToAddAsContact
 * @param {string} [newConversationSID] - optional. If empty, we are adding a current hidden contact. If present, we are adding a new contact and associating them with a new conversationSid.
 *
 * @return `200` We added the contact by simply unhiding it in our current array.
 * @return `201` We added the contact by creating a whole new one with the provided SID and created a shadow version of ourselves in THEIR contact array with the same sid stored.
 * @return `400` means we tried to call this without a SID, but the contact we tried to add wasn't a hidden one. This condition should never actually come up, if it did you did something wrong.
 * @return `404` means that no user with the name we are trying to add exists. This condition should never actually come up, if it did you did something wrong.
 * @return `500` means server error.
 */
export async function addContact(usernameToAddAsContact, newConversationSID) {
  const contactRequest = {
    contactToAdd: usernameToAddAsContact,
    conversationSid: newConversationSID || "",
  };

  try {
    const response = await fetch("api/contacts", {
      method: "PUT",
      body: JSON.stringify(contactRequest),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      return response.status;
    }
  } catch (error) {
    throw new Error(error);
  }
}

export function removeHiddenContacts(contactArray) {
  const onlyUnhiddenContacts = new Array();
  //extract the username from the contact objects, and look up relevant details
  for (let i = 0; i < contactArray.length; i++) {
    if (contactArray[i].hidden === false) {
      let elem = {
        firstname: contactArray[i].firstname,
        lastname: contactArray[i].lastname,
        username: contactArray[i].username,
        avatar: contactArray[i].avatar,
        conversation_sid: contactArray[i].conversation_sid,
        hidden: contactArray[i].hidden,
      };
      onlyUnhiddenContacts.push(elem);
    }
  }
  return onlyUnhiddenContacts;
}
