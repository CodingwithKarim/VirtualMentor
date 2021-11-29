// const { resourceLimits } = require("worker_threads");

const user = require("./models/user");

module.exports = function (app, passport, db, multer, ObjectId) {
  //app is express dependency in server js, passport is dependecny in server js, db is database that is connected from server js

  // normal routes ===============================================================
// console.log(db)
  // show the home page (will also have our login links)
  //renders the index.ejs file
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + ".png")
    }
  });
  var upload = multer({storage: storage}); 

  // console.log(db)

  app.get("/", function (req, res) {
    res.render("index.ejs");
  });

  app.get("/login", function (req, res) {
    res.render("login.ejs", { message: req.flash("loginMessage") });
  });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/home', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

  app.get("/signup", function (req, res) {
    res.render("signup.ejs", { message: req.flash("signupMessage") });
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/home', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.get('/home', isLoggedIn, function(req, res) {
      res.render('home.ejs', {
        user : req.user,
       
      })
});

app.get('/student', isLoggedIn, function(req, res) {
      res.render('student.ejs', {
        user : req.user,
      })
    })

  app.post('/student', isLoggedIn, upload.single('file-to-upload'), (req, res) => {
    let userID = ObjectId(req.user._id)
    db.collection('mentee')
    .findOneAndUpdate({postedBy: userID}, {
      $set: {
        name: req.user.local.name,
        // stack: req.body.stack,
        goals: req.body.goals,
        postedBy: req.user._id,
        img: 'images/uploads/' + req.file.filename
      },

      $push: {
        stack: req.body.stack
      },
    }, {
      sort: {_id: -1},
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.redirect('/network')
    })
  })

  app.get('/mentor', isLoggedIn, function(req, res) {
      res.render('mentor.ejs', {
        user : req.user,
      })
    })


  app.post('/mentor', isLoggedIn, upload.single('file-to-upload'), (req, res) => {
    let userID = ObjectId(req.user._id)
    db.collection('mentor')
    .findOneAndUpdate({postedBy: userID}, {
      $set: {
        name: req.user.local.name,
        link: req.body.link,
        special: req.body.special,
        postedBy: req.user._id,
        img: 'images/uploads/' + req.file.filename
      }
    }, {
      sort: {_id: -1},
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.redirect('/mentornetwork')
    })
  })



app.get('/network', isLoggedIn, function(req, res) {
    db.collection('mentor').find().toArray((err, result1) => {
      if (err) return console.log(err)
      db.collection('mentee').find({postedBy: req.user._id}).toArray((err, result2) => {
        if (err) return console.log(err)
      res.render('network.ejs', {
        user : req.user,
        mentor: result1,
        mentee: result2,
      })
    })
  })
})
    

app.get('/mentornetwork', isLoggedIn, function(req, res) {
  db.collection('mentee').find().toArray((err, result1) => {
    db.collection('mentor').find({postedBy: req.user._id}).toArray((err, result2) => {
    if (err) return console.log(err)
    res.render('mentornetwork.ejs', {
      user : req.user,
      mentee: result1,
      mentor: result2
    })
  })
})
});


app.get('/mission', isLoggedIn, function(req, res) {
    res.render('mission.ejs', {
      user : req.user,
     
    })
});

app.get("/chat.ejs", isLoggedIn, function (req, res) {
  db.collection('messages').find().toArray((err, result) => {
    db.collection('test').find({name: req.user.local.name}).toArray((err, result1) => {
    if (err) return console.log(err)
  res.render("chat.ejs",{
    user : req.user,
    messages: result,
    room: result1
  })
})
})
})

app.get("/chatform", isLoggedIn, function (req, res) {
  res.render("chatform.ejs",{
    user : req.user
  })
 
});

// app.post("/test", (req, res) => {
//   db.collection('test')
//   .save({name: req.body.msg}, (err, result) => {
//     if (err) return console.log(err)
//     console.log('saved to database')
//     res.redirect('/chat.ejs')
//   })
// })

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}
};
