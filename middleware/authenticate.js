const jwt = require("jsonwebtoken");
const User = require("../db/User");

const authMiddleware = async (req, res, next) => {
  // console.log("Middleware Start");

  try {
    if(!req.headers.origin && process.env.IS_WEP_NATIVE_TESTING){
       const users = await User.find();
       const user=users[0]

      if (user) {
        req.dbUser = user;
      }
      return next();
    }
    if ((process.env.IS_WEP_NATIVE || req.uid) && req.session?.userId) {
      const user = await User.findById(req.session.userId);

      if (user) {
        req.dbUser = user;
      }
    }
    console.log("Request Authenticated");
    return next();
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
module.exports = authMiddleware;