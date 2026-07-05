require("dotenv").config();

// importing basic server requirements
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// app base setup
const app = express();
const server = http.createServer(app);

// handling session
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

//middleware importing 
const io = require('./config/socket')(server);
const verifyUser = require("./middleware/auth");
const BaseMiddleware = require("./middleware/baseMiddleware");


//loading controllers
const { login, register, updateDevice, Logout, CheckAuthorization, loginWithGoogle } = require("./controllers/authController");
const { GetProfule , ProfileDashboard,ProfileDashboardSelectionUpdate,ProfilePictureUpload} = require("./controllers/profileController");

const authMiddleware = require('./middleware/authenticate');
const upload = require("./middleware/upload");




//middlewares setups
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),

    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);
const allowedOrigins = [
  "http://localhost:8081",
  "http://localhost:5173",
  "https://snack-runtime.eascdn.net",

];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps and tools with no Origin header
      if (!origin) {
        return callback(null, true);
      }

      const allowed =
        allowedOrigins.includes(origin) ||
        origin.includes(".expo.app") ||
        origin.includes(".expo.dev") ||
        origin.includes(".ngrok-free.app") ||
        origin.includes(".ngrok.io");

      if (allowed) {
        callback(null, true);
      } else {
        console.log("Blocked Origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//muler upload 
app.use(upload.any())
app.use(BaseMiddleware)


//public domain 
app.post("/login", login)
app.post("/register", register)
app.post("/google-login", loginWithGoogle)
app.use('/uploads', express.static('uploads'));

//protecteds routes
app.use(verifyUser)
app.use(authMiddleware)

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);
app.set('views', path.join(__dirname, 'views'));
app.use('/admin', require('./routes/admin-routes'));
app.use('', require('./routes/devices'));
app.use('', require('./routes/alerts'));
app.use('/api/route', require('./routes/route_deviation.js'));
app.use('', require('./routes/users'));
app.set('view engine', 'ejs');
app.post("/update", updateDevice)
app.post("/logout", Logout)
app.post("/profile", GetProfule)
app.post("/profileDashboard", ProfileDashboard)
app.post("/uploadProfilePicture", ProfilePictureUpload)
app.post("/profileDashboard/select", ProfileDashboardSelectionUpdate)
app.post("/auth", CheckAuthorization)


app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.render('index');
});

const PORT = process.env.PORT || 3000;


//mongoose db conection 

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    server.listen(process.env.SERVER_PORT, () => {
      console.log("Server running");
    });
  })
  .catch(console.error);

