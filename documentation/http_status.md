| Code | Meaning | Description | Example|
|:---|:---|:---|:---|
| 200 | OK | Sent when a request is successful but does not involve creating a new resource | ```/login``` POST endpoint in ```/backend/api/routes/login.js``` indicating that a user has been successful in logging in |
| 201 | Created | Sent when a request is successful and involves creating a new resource|```/register``` POST endpoint in ```/backend/api/routes/register.js``` indicating that a user has been successfully registered by creating a new user document in the database|
| 400 | Bad request | Sent when a user sends a malformed request|```/register``` POST endpoint in ```/backend/api/routes/register.js``` when the input to a registration field does not meet a validation criterion|
| 401 | Unauthorized | Sent when a user tries to access a secure resource when they are not logged in| When the user tries to log in without a valid token, the user is denied access to secure end-points by ```/backend/api/middleware/authenticate.js``` |
| 404 | Not found | Sent when a requested resource cannot be found | Any route that does not exist |
| 409 | Conflict | Sent when the user tries to create an account with a username that is already in use |```/register``` POST endpoint in ```/backend/api/routes/register.js``` when a username is already in use|
| 413 | Request entity too large | Sent when a user-provided file is too large|```/status``` PUT endpoint in ```/backend/api/routes/status.js``` when the file being uploaded  exceeds 1MB. The file size check is performed in ```/backend/api/middleware/upload.js```|
| 500     | Server error | Error code to handle all backend errors not caught by more specific error codes | Most endpoints have this |
| 550 | Database error | Sent when there is a problem with a database request (other than when a resource cannot be found) | ```/register``` POST endpoint in ```/backend/api/routes/register.js``` |
| 551 | File processing error | Sent when a user-provided file could not be read | ```/status``` PUT endpoint in ```/backend/api/routes/status.js``` |
