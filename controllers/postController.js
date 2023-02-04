const post = require("../models/post");
const { body, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");
const { checkIfAuthor, checkIfLoggedAndAuthor } = require("./userController");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const async = require("async");
const comment = require("../models/comment");
require("dotenv").config();

function createUrl(url) {
  const regexPattern = /[^A-Za-z0-9]/g;

  let newUrlArray = url.toLowerCase().replace(regexPattern, " ").split(" ");
  let array = [];

  for (let i = 0; newUrlArray.length > i; i++) {
    if (newUrlArray[i] == "") {
      continue;
    }

    array.push(newUrlArray[i]);
  }

  return array.join("_");
}

exports.getAll = (req, res, next) => {
  let token;

  if (req.get("Authorization") !== undefined) {
    token = req.get("Authorization").split(" ")[1];
  }

  console.log(token, process.env.ACCESS_TOKEN_SECRET);

  const result = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        console.log(err);
        return false;
      }

      return decoded;
    }
  );

  console.log(result);

  async.series(
    {
      result: function (cb) {
        user.findOne({ username: result.username }, (err, user) => {
          if (err) {
            return cb(err);
          }

          if (!user) {
            return cb(null, false);
          }

          if (user.isAuthor == true) {
            return cb(null, true);
          }
        });
      },
    },
    function (err, results) {
      if (err) {
        return res.json({
          success: false,
          code: 400,
          status: "Bad request",
          title: "If you keep getting this error please contact us.",
        });
      }

      const object = {
        query: results.result === true ? {} : { posted: true },
      };

      post
        .find(object.query)
        .populate("author", "_id username")
        .exec((err, posts) => {
          if (err) {
            return res.json({
              success: false,
              code: 400,
              status: "Bad request",
              title: "If you keep getting this error please contact us.",
            });
          }

          return res.json({ success: true, posts });
        });
    }
  );
};

exports.get = (req, res, next) => {
  const token = req.get("Authorization").split(" ");
  const result = jwt.verify(
    token[1],
    process.env.ACCESS_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        return false;
      }

      return decoded;
    }
  );

  async.series(
    {
      result: function (cb) {
        user.findOne({ username: result.username }, (err, user) => {
          if (err) {
            return cb(err);
          }

          if (!user) {
            return cb(null, false);
          }

          if (user.isAuthor == true) {
            return cb(null, true);
          }
        });
      },
    },
    function (err, results) {
      if (err) {
        return res.json({
          success: false,
          code: 400,
          status: "Bad request",
          title: "If you keep getting this error please contact us.",
        });
      }

      post
        .findOne({ [req.query.option]: req.params.para })
        .populate("author", "_id username")
        .exec((err, post) => {
          if (err) {
            console.log(err);
            return res.json({
              success: false,
              code: 400,
              status: "Bad request",
              title: "If you keep getting this error please contact us.",
            });
          }

          if (!post) {
            return res.json({
              success: false,
              code: 404,
              status: "Post not found.",
            });
          }

          if (post.posted === false && results.false) {
            return res.json(
              res.json({
                success: false,
                code: 406,
                status: "Unauthorized",
              })
            );
          }

          comment.find({ post: post._id }, (err, comments) => {
            if (err) {
              console.log(err);
              return res.json({
                success: false,
                code: 400,
                status: "Bad request",
                title: "If you keep getting this error please contact us.",
              });
            }

            return res.json({ success: true, post, comments });
          });
        });
    }
  );
};

exports.post = [
  body("title").isLength({ min: 1 }).trim().escape(),
  body("content").isLength({ min: 1 }),
  body("posted").isBoolean(),
  body("edited").isBoolean(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        code: 400,
        title: "Bad request",
        status: "Check errors",
        errors: errors.array(),
      });
    }

    const cleanCode = sanitizeHtml(req.body.content);

    const postObj = {
      title: req.body.title,
      content: cleanCode,
      author: req.user._id,
      url: createUrl(req.body.title),
      date: new Date(),
      dateEdited: req.body.dateEdited != undefined ? new Date() : undefined,
      edited: req.body.edited == false ? false : true,
      posted: req.body.posted == true ? true : false,
    };

    post.create(postObj, (err, post) => {
      if (err) {
        return res.json({
          success: false,
          code: 400,
          status: "Bad request",
          title: "If you keep getting this error please contact us.",
        });
      }

      return res.json({ success: true, result: post });
    });
  },
];

exports.edit = [
  body("title").isLength({ min: 1 }).trim().escape(),
  body("content").isLength({ min: 1 }),
  body("url").escape(),
  body("posted").isBoolean(),
  body("edited").isBoolean(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        code: 400,
        title: "Bad request",
        status: "Check errors",
        errors: errors.array(),
      });
    }

    post.findOne({ _id: req.params.postId }, "author", (err, resultPost) => {
      if (err) {
        return res.json({
          success: false,
          code: 400,
          status: "Bad request",
          title: "If you keep getting this error please contact us.",
        });
      }

      if (!resultPost) {
        return res.json({
          success: false,
          code: 404,
          status: "Post not found.",
        });
      }

      console.log(resultPost);

      if (resultPost.author.toString() == req.user._id) {
        const cleanCode = sanitizeHtml(req.body.content);

        const postObj = {
          title: req.body.title,
          content: cleanCode,
          url: req.body.url.length == 0 ? resultPost.url : req.body.url,
          edited: req.body.edited,
          posted: req.body.posted,
        };

        post.updateOne({ _id: req.params.postId }, postObj, (err, post) => {
          if (err) {
            return res.json({
              success: false,
              code: 400,
              status: "Bad request",
              title: "If you keep getting this error please contact us.",
            });
          }

          return res.json({ success: true, post });
        });
      } else {
        return res.json({
          success: false,
          code: 406,
          status: "Unauthorized",
        });
      }
    });
  },
];

exports.delete = (req, res, next) => {
  post.findOne({ _id: req.params.postId }, "author", (err, post) => {
    if (err) {
      return res.json({
        success: false,
        code: 400,
        status: "Bad request",
        title: "If you keep getting this error please contact us.",
      });
    }

    if (post.author.toString() == req.user._id) {
      post.delete({ _id: req.params.postId }, (err, post) => {
        if (err) {
          return res.json({
            success: false,
            code: 400,
            status: "Bad request",
            title: "If you keep getting this error please contact us.",
          });
        }

        return res.json({ success: true, post });
      });
    } else {
      return res.json({
        success: false,
        code: 406,
        status: "Unauthorized",
      });
    }
  });
};
