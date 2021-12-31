var express = require("express");
var app = express();
var port = process.env.PORT || 8080;
const MongoClient = require("mongodb").MongoClient;
var mongoose = require("mongoose");
var passport = require("passport");
var flash = require("connect-flash");
var ObjectId = require("mongodb").ObjectId;
var multer = require("multer");
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var configDB = require("./config/database.js");
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
const formatMessage = require("./utils/messages.js");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users.js");

var db;

// configuration ===============================================================
mongoose.connect(configDB.url, (err, database) => {
  if (err) return console.log(err);
  db = database;

  require("./app/routes.js")(app, passport, db, multer, ObjectId);
}); // connect to our database

require("./config/passport")(passport); // pass passport for configuration

// set up our express application
app.use(morgan("dev")); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const botName = "Bot";

io.on("connection", (socket) => {
  // console.log(db)
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    // console.log(user)
    socket.join(user.room);

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
  console.log("New Chat Connection");

  socket.on("join-room", ({ mentee, room }) => {
    console.log(mentee);
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));
    socket.broadcast.to(room).emit("user-connected", mentee);

    socket.on("disconnect", () => {
      socket.broadcast.to(room).emit("user-disconnected");
    });
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
    // console.log(user.room)
    db.collection("messages").insert(
      { message: formatMessage(user.username, msg), room: user.room },
      (err, result) => {
        if (err) return console.log(err);
        console.log("saved to database");
      }
    );
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

app.set("view engine", "ejs"); // set up ejs for templating

// required for passport
app.use(
  session({
    secret: "rcbootcamp2021b", // session secret
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// launch ======================================================================
server.listen(port);
console.log("The magic happens on port " + port);
