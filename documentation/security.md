# Access control

On Pennpals, server side authentication is performed using [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#readme)(JWT). A token is generated when a user logs in, and this is stored in a http cookie. For any api call made by a user, the browser adds the cookies to the header. The back-end then, for every call a logged in user makes, verifies the token signature stored in the http cookie.

The authentication function is defined in ```backend/middleware/authenticate.js```, and used in every secure route in ```backend/api/routes```. All routes except ```backend/api/register``` and ```backend/api/login``` are secure.

If the user is not logged in, accessing any part of Pennpals that requires the user to be logged in directs the user to the login page.

# Input validation

Pennpals uses [express-validator](https://express-validator.github.io/docs/) for input validation. 

The first form of input validation a Pennpals user encounters is during registration. Lines 14 to 29 in ```backend/api/routes/register.js``` contain the rules. Pennpals enforces the following rules during registration.
- username should be alphanumeric and between 4 and 20 characters
- password should be alphanumeric and between 8 and 20 characters
- email should have the format of a typical email address
- firstname and lastname should contain only letters and cannot be empty
- security question and answer cannot be empty

During login, the username and password are validated to be non-empty. Lines 30 to 33 in ```backend/api/routes/login.js``` contain the rules.

When an input fails a test, the server responds with a 400 status code and a JSON array with information on each failed test. It does not enter the route. These error messages are displayed on the front-end in a notification box.

Regarding file size for media used in messages, we have gone with the default twilio implementation of a max size of 150MB. For images uploaded as a status, we have a max file size of 1MB.

# Account lockout policy

If any user attempts to log in with an incorrect password 3 times in succession, they are locked out of Pennpals for 5 minutes. Each attempt to login even with a correct password before the 5 minute lock out period has expired restarts the 5 minute lockout counter.

The lockout policy is designed to counter brute force attacks. Brute force programs work at such high speeds that a lock out period of 5 minutes is adequate.

The code for the lockout login can be found in ```backend/api/routes/login.js```

# HTTP status codes used and reasoning

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


# Exception handling

Pennpals uses try-catch blocks and .catch() lines for exception handling. All caught exceptions are handled with an appropriate status code and message.

Execption handling is extensively implemented across the backend, and with all the fetch requests in the frontend.

# User tokens/cookies
Pennpals uses [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#readme)(JWT) for securely transmitting information from the frontend to the backend as a JSON object.

We store the user id of a registered user as a payload (see below) when the user successfully logs in. The payload is signed with a secret to create a signed token (see below). The signed token is sent to the user's browser as a http cookie (see below). 

The below code is from ```backend/api/routes/login.js```

```
const payload = {
    user: {
        id: user.id
    }
};
//sign the token, story it in a cookie and return the cookie
jwt.sign(
    payload, 'this is a secret', { expiresIn: '3h' }, (err, token) => {
        if (err) throw err;
        res.cookie('token', token, { httpOnly: true, maxAge: 10800000});
        res.json({ token });
    }
);
```

The http cookie is sent in the request header for all api calls made by a logged in user. If the cookie has a valid token (see validation login below), the user is given access to the secure api end-point. For users with valid tokens, the cookie is decoded to get the user id which is the MongoDB document id of the user.

The below code is from ```backend/middleware/authenticate.js```.
```
  const token = req.cookies.token;

  // if no token was supplied, deny access
  if (!token) {
    return res.status(401).json({ msg: 'No token. Authorization denied' });
  }
  try {
      //check to see if token is correct
    const decoded = jwt.verify(token, 'this is a secret');
    //if so, update the request user 
    req.user = decoded.user;
    //middleware method next() sends control back to calling function with req updated
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token.' });
  }
};
```

# For MongoDB: filtering origin IP addresses in Atlas
