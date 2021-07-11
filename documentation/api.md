See interactive version of API on [SwaggerHub](https://app.swaggerhub.com/apis-docs/cis_557/Pennpals_LDA/1)

# Routes for registration/login
| URI         | Method      | Description |Request Body           |Response|
| ----------- | ----------- | ----------- | ----------- | ----------- |
| '/register'     | POST       |Submits form data from registration page <br> to register user, and then redirects to login page.|{username,password,firstname,lastname}|Redirect|
| '/login'  | GET        |Takes a jwt and authenticates it, returns corresponding user document if valid| {} |{user}|
| '/login'  | POST        |Submits form data from login page, <br> authenticates user, and redirects to main view.|{username,password}|Redirect|
| '/logout'  | GET        |Clears the authentication cookie|{}|Redirect|
| '/resetPassword'  | POST       |Retrieve security question of a given user |{username}|{user}|
| '/resetPassword'  | PUT      |Change password of a user |{password,answer,username}|N/A|

# Routes for managing user profile
| URI         | Method      | Description |Request Body           |Response|
| ----------- | ----------- | ----------- | ----------- | ----------- |
|'/profile'|GET|Retrieves user info by the token from the cookie |{}|{user}|
|'/profile'|PUT|Changes status of users account to inactive |{password}|N/A|
| '/changePassword'  | PUT        |Change password of a user| {password,newPassword} |N/A|

# Routes for managing user status
| URI         | Method      | Description |Request Body           |Response|
| ----------- | ----------- | ----------- | ----------- | ----------- |
|'/status'|PUT|Uploads a status or replaces the existing status for a new user|{type,text,image,url}|N/A|
|'/status'|GET|Get's the list of unseen statuses from current user's active contacts|{}|[{username, firstname, lastname, type, text, image, url, upload_time}]|
|'/status'|POST|Marks a status as seen for a specific contact|{username,statius_id}|N/A|

# Routes for managing contacts
| URI         | Method      | Description |Request Body           |Response|
| ----------- | ----------- | ----------- | ----------- | ----------- |
|'/contacts'|PUT|Adds a contact to the current user's contact list|{contactToAdd,conversationSid}|N/A|
|'/contacts'|DELETE|Deletes a contact from the user's contact list|{contactToRemove}|N/A|
|'/contacts'|GET|Get's the full list of the current user's contacts|{}|[{username, firstname, lastname, avatar, conversation_sid, hidden, status_id, status_seen}]|
|'/contacts'|POST|Returns details of user if user exists|{contactToSearch}|{user}|
|'/contactsuggest'|GET| get a contact suggestion|{}|{firstname,lastname,username,avatar,conversation_sid}|
|'/latestconvo'|PUT| Update latest interaction field for both users after message or videocall |{username,receiver,date}|N/A|

# Routes for messaging (Twilio routes)
| URI         | Method      | Description |Request Body           |Response|
| ----------- | ----------- | ----------- | ----------- | ----------- |
|'/twilio'|GET|Returns a Twilio AccessToken with a ChatGrant, used to instantiate a Converstation Client.|{username}|{jwt_token}|
|'/twilio'|POST|Returns a Twilio AccessToken with a VideoGrant, used to instantiate a VideoChat Room|{identity, room}|{jwt_token}|

# Routes for handling calls
| URI         | Method      | Description |Request Body           |Response|
| ----------- | ----------- | ----------- | ----------- | ----------- |
|'/incomingcall'|GET| Polls the currentUser's userDocument|{}|{incoming_call}|
|'/incomingcall'|POST|Looks up the calleeName user document and saves the callerName string to the `incoming_call field`|{callerName, calleeName}|N/A|
|'/incomingcall'|DELETE|Looks up the username's user document and clears the `incoming_call field`|{username}|N/A|
|'/outgoingcall'|GET|polls the `outgoing_call_active` field for the currentUser (used to determine if the callee has declined to answer a call request)|{}|{outgoing_call_active}|
|'/outgoingcall'|POST|looks up the contact's user document and checks the `online` and `outgoing_call_active` fields.|{contactName}|{online,outgoing_call_active}|
|'/outgoingcall'|PUT|sets currentUser's `outgoing_call_active` boolean to `true`|{username}|{}|
|'/outgoingcall'|DELETE|sets currentUser's `outgoing_call_active` boolean to `false`|{username}|{}|
