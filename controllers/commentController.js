const comment = require("../models/comment");
const post = require("../models/post");
const { body, validationResult } = require("express-validator");

exports.getAll = (req, res, next) => {
  comment.findOne({ post: req.params.postUrl }, (err, comment) => {
    if (err) {
      return res.json({
        succesS: false,
        code: 400,
        status: "Bad request",
        title: "If you keep getting this error please contact us.",
      });
    }

    if (comment.length == 0) {
      return res.json({
        success: false,
        code: 400,
        status: "Bad request",
        title: "There are no comments.",
      });
    }

    return res.json({ success: true, code: 200, result: posts });
  });
};

exports.add = [
  body("username").trim().escape(),
  body("comment").trim().escape(),

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

    post.findById({ _id: req.params.postUrl }, (err, post) => {
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
          code: 400,
          status: "Bad request",
          title: "Post doesn't exist.",
        });
      }

      const postObject = {
        user: req.body.username,
        post: post._id,
        comment: req.body.comment,
        date: new Date(),
      };

      comment.create(postObject, (err, post) => {
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
    });
  },
];
