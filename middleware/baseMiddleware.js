// middleware/auth.js

const admin = require("../config/firebase");

const BaseMiddleware = async (
  req,
  res,
  next
) => {
  await next()
  console.log("Request ",req.path, req.method,  res.statusCode, req.headers.origin)
  
};

module.exports = BaseMiddleware;