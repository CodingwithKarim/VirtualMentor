const { resourceLimits } = require("worker_threads");

module.exports = function (app, passport, db) {
  //app is express dependency in server js, passport is dependecny in server js, db is database that is connected from server js

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  //renders the index.ejs file
  app.get("/", function (req, res) {
    res.render("index.ejs");
  });

  app.get("/login", function (req, res) {
    res.render("login.ejs", { message: req.flash("loginMessage") });
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
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('student.ejs', {
        user : req.user,
        messages: result
      })
    })
});

app.post('/student', (req, res) => {
    db.collection('messages').insert({name: req.body.name, stack: req.body.stack, goals: req.body.goals}, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/network')
    })
  })

  app.get('/mentor', isLoggedIn, function(req, res) {
    db.collection('mentor').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('mentor.ejs', {
        user : req.user,
        mentor: result
      })
    })
});

app.post('/mentor', (req, res) => {
    db.collection('mentor').insert({name: req.body.name, link: req.body.link, special: req.body.special}, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/network')
    })
  })

app.get('/network', isLoggedIn, function(req, res) {
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('network.ejs', {
        user : req.user,
        messages: result,
      })
    })
});

app.get('/mission', isLoggedIn, function(req, res) {
    res.render('mission.ejs', {
      user : req.user,
     
    })
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}


};
