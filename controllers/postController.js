const post = require("../models/post");
const { body, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");

exports.getAll = (req, res, next) => {
  post.find({}, (err, posts) => {
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
};

exports.get = (req, res, next) => {
  post.findOne({ url: req.params.postUrl }, (err, post) => {
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

    return res.json({ success: true, post });
  });
};

exports.post = [
  body("title").isLength({ min: 1 }).trim().escape(),
  body("content").isLength({ min: 1 }),

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
    const regexPattern = /[^A-Za-z0-9]/g;

    const postObj = {
      title: req.body.title,
      content: cleanCode,
      author: req.user._id,
      url: req.body.title
        .toLowerCase()
        .replace(regexPattern, " ")
        .split(" ")
        .join("_"),
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
