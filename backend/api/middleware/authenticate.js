const jwt = require('jsonwebtoken');

// gets jwt from cookie, authenticates it (or not) then sends user on to next() call
module.exports = function(req, res, next) {
  // get the token. traditionally custom headers start with x
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