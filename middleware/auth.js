// middleware/auth.js

const admin = require("../config/firebase");
const jwt = require("jsonwebtoken");

const verifyUser = async (
  req,
  res,
  next
) => {
  try {
    if (!req.headers.origin) {
      await React_Native_Request(req, res, next)
      return
    }
    if (process.env.IS_WEP_NATIVE) {
      // if (req.session.userId) {
      req.uid = "decoded.uid";
      req.user = {}
      next();
      return
      // }
    }
    const sessionCookie =
      req.cookies.session;

    if (!sessionCookie) {
      next()
      return
    }

    const decoded =
      await admin
        .auth()
        .verifySessionCookie(
          sessionCookie,
          true
        );
    req.uid = decoded.uid;
    req.user = decoded
    next();

  } catch (error) {
    console.log(error)
    next()
  }
  return
};

async function React_Native_Request(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET
      );

      req.user = decoded;
    } catch (err) {

    }
    
  }
  next();
}

module.exports = verifyUser;