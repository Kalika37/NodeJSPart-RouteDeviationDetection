// middleware/auth.js

const admin = require("../config/firebase");

const verifyUser = async (
  req,
  res,
  next
) => {
  try {
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

module.exports = verifyUser;