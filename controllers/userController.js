require("dotenv").config();
const user = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

exports.login = [
  body("username", "Username should not be empty")
    .isLength({ min: 1 })
    .trim()
    .escape(),
  body("password", "Password should not be empty")
    .isLength({ min: 1 })
    .trim()
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        code: 400,
        status: "Bad request",
        title: "Please check errors",
        errors: errors.array(),
      });
    }

    user.findOne({ username: req.body.username }, (err, user) => {
      if (err) {
        return res.json({
          success: false,
          code: 400,
          status: "Bad request",
          title: "If you keep getting this error please contact us.",
        });
      }

      if (!user) {
        return res.json({
          success: false,
          code: 400,
          status: "Bad request",
          title: "Invalid username or password.",
        });
      }

      bcrypt.compare(req.body.password, user.password, (err, same) => {
        if (err) {
          return res.json({
            success: false,
            code: 500,
            status: "Internal server error",
            title: "Try again later.",
          });
        }

        if (same) {
          const accessToken = jwt.sign(
            { username: user.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
          );

          console.log(accessToken);

          const refreshToken = jwt.sign(
            { username: user.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "1d" }
          );

          res.cookie("jwt", accessToken);

          return res.json({ success: true, token: accessToken });
        } else {
          res.json({
            success: false,
            code: 400,
            status: "Bad request",
            title: "Invalid password or username.",
          });
        }
      });
    });
  },
];

exports.refresh = (req, res) => {
  if (req.cookies?.jwt) {
    const refreshToken = req.cookies.jwt;

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          res.json({
            success: false,
            code: 406,
            status: "Unauthorized",
          });
        }

        user.findOne({ username: decoded.username }, (err, user) => {
          if (err) {
            return res.json({
              success: false,
              code: 400,
              status: "Bad request",
              title: "If you keep getting this error please contact us.",
            });
          }

          if (!user) {
            return res.json({
              success: false,
              code: 400,
              status: "Bad request",
              title: "User doesn't exist.",
            });
          }

          const accessToken = jwt.sign(
            { username: user.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "10m" }
          );

          return res.json({ success: true, token: accessToken });
        });
      }
    );
  } else {
    res.json({
      success: false,
      code: 406,
      status: "Unauthorized",
    });
  }
};

exports.getUserDetails = (req, res, next) => {
  console.log(req.get("Authorization"));

  user.findOne({ _id: req.user._id }, "username", (err, user) => {
    if (err) {
      return res.json({
        success: false,
        code: 400,
        status: "Bad request",
        title: "If you keep getting this error please contact us.",
      });
    }

    return res.json({ success: true, user: user.username });
  });
};

exports.checkIfLogged = (req, res, next) => {
  const token = req.get("Authorization").split(" ");

  console.log(token);

  jwt.verify(token[1], process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.json({
        success: false,
        code: 406,
        status: "Unauthorized",
      });
    }

    user.findOne({ username: decoded.username }, (err, user) => {
      if (err) {
        return res.json({
          success: false,
          code: 400,
          status: "Bad request",
          title: "If you keep getting this error please contact us.",
        });
      }

      if (!user) {
        return res.json({
          success: false,
          code: 400,
          status: "Bad request",
          title: "User doesn't exist.",
        });
      }

      if (user.isAuthor == true) {
        req.user = user;
      }

      next();
    });
  });
};

exports.checkIfAuthor = (req, res, next) => {
  if (req.user.isAuthor == true) {
    next();
  } else {
    res.json({
      success: false,
      code: 406,
      status: "Unauthorized",
    });
  }
};
