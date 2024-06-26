const User = require("../models/user");
const jwt = require("jsonwebtoken");
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddlewares');


const maxAge = 30 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, "secret", {
    expiresIn: maxAge,
  });
};

module.exports.signup_get = (req, res) => {
  res.render("signup");
};

const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = {
    email: "",
    password: "",
  };

  if (err.message === "incorrect email") {
    errors.email = "That email is not registered";
  }

  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
  }

  if (err.message === "incorrect password" || err.message === "Old password is incorrect") {
    errors.password = "Password is incorrect";
  }

  if (err.code === 11000) {
    errors.email = "that email is already registered";
    return errors;
  }

  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }


  return errors;
};

module.exports.signup_post = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.create({
      name,
      email,
      password,
    });

    const token = createToken(user._id);

    res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge})

    res.status(201).json({user:user._id});

  } catch (err) {
    console.log(err);
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);


    const token = createToken(user._id);

    res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge})

    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};




module.exports.logout_get =(req,res) => {
res.cookie("jwt",'',{maxAge:1})
res.redirect('/')
}

module.exports.login_get = (req, res) => {
  res.render("login");
};