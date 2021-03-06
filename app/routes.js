const user = require("./models/user");

module.exports = function (app, passport, db, multer, ObjectId) {
  
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images/uploads");
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "-" + Date.now() + ".png");
    },
  });
  var upload = multer({ storage: storage });

  // console.log(db)

  app.get("/", function (req, res) {
    res.render("index.ejs");
  });

  app.get("/login", function (req, res) {
    res.render("login.ejs", { message: req.flash("loginMessage") });
  });

  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  app.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/home", // redirect to the secure profile section
      failureRedirect: "/login", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );

  app.get("/signup", function (req, res) {
    res.render("signup.ejs", { message: req.flash("signupMessage") });
  });

  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/home", // redirect to the secure profile section
      failureRedirect: "/signup", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );

  app.get("/home", isLoggedIn, function (req, res) {
    res.render("home.ejs", {
      user: req.user,
    });
  });

  app.get("/room", isLoggedIn, function (req, res) {
    console.log(req.query.room);
    db.collection("connections")
      .find({ _id: ObjectId(req.query.room) })
      .toArray((err, result) => {
        res.render("room.ejs", {
          user: req.user,
          connections: result,
        });
      });
  });

  app.get("/student", isLoggedIn, function (req, res) {
    res.render("student.ejs", {
      user: req.user,
    });
  });

  app.post(
    "/student",
    isLoggedIn,
    upload.single("file-to-upload"),
    (req, res) => {
      let userID = ObjectId(req.user._id);
      db.collection("mentee").findOneAndUpdate(
        { postedBy: userID },
        {
          $set: {
            name: req.user.local.name,
            stack: req.body.stack,
            goals: req.body.goals,
            postedBy: req.user._id,
            img: "images/uploads/" + req.file.filename,
          },
        },
        {
          sort: { _id: -1 },
          upsert: true,
        },
        (err, result) => {
          if (err) return res.send(err);
          res.redirect("/network");
        }
      );
    }
  );

  app.get("/mentor", isLoggedIn, function (req, res) {
    res.render("mentor.ejs", {
      user: req.user,
    });
  });

  app.post(
    "/mentor",
    isLoggedIn,
    upload.single("file-to-upload"),
    (req, res) => {
      let userID = ObjectId(req.user._id);
      db.collection("mentor").findOneAndUpdate(
        { postedBy: userID },
        {
          $set: {
            name: req.user.local.name,
            link: req.body.link,
            special: [req.body.special],
            postedBy: req.user._id,
            img: "images/uploads/" + req.file.filename,
          },

        },
        {
          sort: { _id: -1 },
          upsert: true,
        },
        (err, result) => {
          if (err) return res.send(err);
          res.redirect("/mentornetwork");
        }
      );
    }
  );

  app.get("/network", isLoggedIn, function (req, res) {
    db.collection("mentor")
      .find()
      .toArray((err, result1) => {
        db.collection("mentee")
          .find({ postedBy: req.user._id })
          .toArray((err, result2) => {
            db.collection("connections")
              .find({ mentee: req.user.local.name })
              .toArray((err, result3) => {
                if (err) return console.log(err);
                res.render("network.ejs", {
                  user: req.user,
                  mentor: result1,
                  mentee: result2,
                  connections: result3,
                });
              });
          });
      });
  });

  app.put("/requestConnection", (req, res) => {
    let testID = ObjectId(req.body.id);
    console.log(testID);
    db.collection("connections").findOneAndUpdate(
      { mentorID: req.body.id, requestFrom: req.body.user },
      {
        $set: {
          mentorID: req.body.id,
          mentorName: req.body.mentorName,
          mentee: req.body.user,
          status: "pending",
          img: req.body.menteePic,
          menteeGoals: req.body.goals,
          menteeStack: req.body.stack,
          personalMessage: [],
        },
      },
      {
        sort: { _id: -1 },
        upsert: true,
      },
      (err, result) => {
        if (err) return res.send(err);
        res.redirect("/mentornetwork");
      }
    );
  });

  app.post("/personalMessage", (req, res) => {
    db.collection("connections").findOneAndUpdate(
      { _id: ObjectId(req.body.id) },
      {
        $push: {
          personalMessage: [req.body.personalMessage, req.body.name],
       

        },
      },
      {
        sort: { _id: -1 },
        upsert: true,
      },
      (err, result) => {
        if (err) return res.send(err);
        res.redirect("back");
      }
    );
  });

  app.get("/mentornetwork", isLoggedIn, function (req, res) {
    db.collection("mentee")
      .find()
      .toArray((err, result1) => {
        db.collection("mentor")
          .find({ postedBy: req.user._id })
          .toArray((err, result2) => {
            if (err) return console.log(err);
            res.render("mentornetwork.ejs", {
              user: req.user,
              mentee: result1,
              mentor: result2,
            });
          });
      });
  });

  app.get("/mission", isLoggedIn, function (req, res) {
    res.render("mission.ejs", {
      user: req.user,
    });
  });

  app.get("/chat.ejs", isLoggedIn, function (req, res) {
    console.log(req.query.room)
    db.collection("messages")
      .find({room: req.query.room})
      .toArray((err, result) => {
            if (err) return console.log(err);
            res.render("chat.ejs", {
              user: req.user,
              messages: result
            });
          });
      });
     
  

  app.get("/chatform", isLoggedIn, function (req, res) {
    res.render("chatform.ejs", {
      user: req.user,
    });
  });

  app.get("/connections", isLoggedIn, function (req, res) {
    console.log(req.user.local.name);
    db.collection("connections")
      .find({ mentorName: req.user.local.name })
      .toArray((err, result) => {
        db.collection("mentor")
          .find({ postedBy: req.user._id })
          .toArray((err, result1) => {
            if (err) return console.log(err);
            res.render("connections.ejs", {
              user: req.user,
              connections: result,
              mentor: result1,
            });
          });
      });
  });

  app.put("/acceptRequest", (req, res) => {
    db.collection("connections").findOneAndUpdate(
      { _id: ObjectId(req.body.test) },
      {
        $set: {
          status: "accepted",
        },
      },
      {
        sort: { _id: -1 },
        upsert: false,
      },
      (err, result) => {
        if (err) return res.send(err);
      }
    );
    db.collection("mentor").findOneAndUpdate(
      { postedBy: req.user._id },
      {
        $push: {
          connections: req.body.name,
        },
      },
      {
        sort: { _id: -1 },
        upsert: false,
      },
      (err, result) => {
        if (err) return res.send(err);
        res.send(result);
      }
    );
  });

  app.delete("/declineRequest", (req, res) => {
    db.collection("connections").findOneAndDelete(
      { _id: ObjectId(req.body.id) },
      (err, result) => {
        if (err) return res.send(err);
        res.send("Request Declined");
      }
    );
  });

  app.get("/menteeconnections", isLoggedIn, function (req, res) {
    db.collection("connections")
      .find({ mentee: req.user.local.name })
      .toArray((err, result) => {
        db.collection("mentor")
          .find()
          .toArray((err, result1) => {
            if (err) return console.log(err);
            res.render("menteeconnections.ejs", {
              user: req.user,
              connections: result,
              mentor: result1,
            });
          });
      });
  });

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
  }
};
