var express = require("express");
// const req = require("express/lib/request");
var router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const e = require("express");
const saltRounds = 14;

router.get("/all-users", (req, res) => {
  User.find().then((results) => {
    res.render("../views/users/all-users", {
      user: results,
    });
  });
});

router.get("/signup", (req, res) => {
  res.render("../views/users/sign-up");
});

router.post("/signup", (req, res) => {
  if (!req.body.username) {
    res.json("You need a username");
  } else if (!req.body.password) {
    res.json("You need a password");
  }

  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPass = bcrypt.hashSync(req.body.password, salt);
  console.log("This is a session", req.session);

  User.create({
    username: req.body.username,
    password: hashedPass,
  })
    .then((createdUser) => {
      console.log("User was created", createdUser);
      //   Adding sessions here

      req.session.user = createdUser;
      console.log(req.session.user);
      res.json(createdUser);
    })
    .catch((err) => {
      console.log("Something went wrong", err.errors);
    });
});

router.get("/login", (req, res) => {
  res.render("../views/users/log-in");
});

router.post("/login", (req, res) => {
  // Check for fields being filled out
  if (!req.body.username) {
    res.json("You need a username");
  } else if (!req.body.password) {
    res.json("You need a password");
  }
  // Veryify username
  User.findOne({ username: req.body.username })
    .then((foundUser) => {
      if (!foundUser) {
        return res.json("Username not found");
      } else {
        const match = bcrypt.compareSync(req.body.password, foundUser.password);
        if (!match) {
          return res.json("Incorrect password");
        } else {
          req.session.user = foundUser;
          console.log(req.session.user);
          res.json(`Welcome to our website, ${req.session.user.username}`);
        }
      }
    })
    .catch((err) => {
      console.log("Something went wrong", err);
      res.json(err);
    });
});

module.exports = router;
