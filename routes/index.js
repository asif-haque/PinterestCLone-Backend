var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const passport = require("passport");
const upload = require("./multer");

// username => req.session.passport.user

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

let currentUser = null;
router.use(async (req, res, next) => {
  if (req.session.passport) {
    currentUser = await userModel.findOne({
      username: req.session.passport.user,
    });
  }
  next();
});

/* GET home page. */
router.get("/", function (req, res, next) {
  // isLoggedIn ? res.redirect("/feed") :
  res.render("login", { nav: false, user: currentUser });
});

router.get("/register-page", function (req, res, next) {
  res.render("register", { nav: false, user: currentUser });
});

router.get("/feed", isLoggedIn, async (req, res) => {
  const posts = await postModel.find();
  res.render("feed", { posts: posts, nav: true, user: currentUser });
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const username = req.session.passport.user;
  const user = await userModel
    .findOne({ username: username })
    .populate("posts")
    .populate("bookmarks");
  res.render("profile", { user: user, nav: true, self: true });
});

router.get("/delete-dp", isLoggedIn, async function (req, res, next) {
  const username = req.session.passport.user;
  const user = await userModel.findOne({ username: username });
  user.dp = null;
  await user.save();
  res.redirect("/profile");
});

router.get("/profile/:userId", isLoggedIn, async function (req, res, next) {
  const userId = req.params.userId;
  const searchedUser = await userModel
    .findOne({ _id: userId })
    .populate("posts");

  const username = req.session.passport.user;
  const user = await userModel
    .findOne({ username: username })
    .populate("posts");
  if (userId === user._id.toString()) {
    res.redirect("/profile");
  } else {
    res.render("profile", { user: searchedUser, nav: true, self: false });
  }
});

router.get("/pins/:userId", isLoggedIn, async (req, res) => {
  const userId = req.params.userId;
  const user = await userModel
    .findOne({
      _id: userId,
    })
    .populate("posts");
  res.render("pins", { nav: true, user: user });
});

router.get("/bookmarks", isLoggedIn, async (req, res) => {
  const user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("bookmarks");
  res.render("bookmarks", { nav: true, user: user });
});

router.get("/pin/:postId", isLoggedIn, async (req, res) => {
  const postId = req.params.postId;
  const post = await postModel
    .findOne({
      _id: postId,
    })
    .populate("user");
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });

  res.render("pin", { nav: true, post: post, user: user });
});

router.get("/delete/:postId", async (req, res) => {
  const postId = req.params.postId;
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const post = await postModel.findOne({
    _id: postId,
  });
  if (user._id.equals(post.user)) {
    // delete from post model
    const deleted = await postModel.deleteOne({
      _id: postId,
    });
    if (deleted) {
      // delete it from user document
      const index = user.posts.indexOf(postId);
      index !== -1 && user.posts.splice(index, 1);
      await user.save();
      res.redirect(`/pins/${user._id}`);
    }
  } else {
    res.render("delete", { nav: true, user: currentUser });
  }
});

router.get("/unliked/:postId", isLoggedIn, async (req, res) => {
  const postId = req.params.postId;
  const post = await postModel.findOne({
    _id: postId,
  });
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const index = post.likes.findIndex((userId) => userId.equals(user._id));
  index !== -1 && post.likes.splice(index, 1);
  await post.save();
  res.redirect(`/pin/${postId}`);
});

router.get("/liked/:postId", isLoggedIn, async (req, res) => {
  const postId = req.params.postId;
  const post = await postModel.findOne({
    _id: postId,
  });
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  post.likes.push(user._id);
  await post.save();
  res.redirect(`/pin/${postId}`);
});

router.get("/bookmarked/:postId", isLoggedIn, async (req, res) => {
  const postId = req.params.postId;
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  user.bookmarks.push(postId);
  await user.save();
  res.redirect(`/pin/${postId}`);
});

router.get("/unbookmarked/:postId", isLoggedIn, async (req, res) => {
  const postId = req.params.postId;
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const index = user.bookmarks.findIndex((id) => id === postId);
  user.bookmarks.splice(index, 1);
  await user.save();
  res.redirect(`/pin/${postId}`);
});

router.post(
  "/fileupload",
  isLoggedIn,
  upload.single("dp"),
  async function (req, res, next) {
    // find the user and change the dp of the user in the database and save
    const username = req.session.passport.user;
    const user = await userModel.findOne({ username: username });

    user.dp = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

router.get("/edit-info", isLoggedIn, async function (req, res, next) {
  // find the user and render the previous data
  const username = req.session.passport.user;
  const user = await userModel.findOne({ username: username });

  res.render("editInfo", { user: user, nav: true });
});

router.post("/edit-info-submit", isLoggedIn, async function (req, res, next) {
  // find the user and render the previous data
  const oldusername = req.session.passport.user;
  const user = await userModel.findOne({ username: oldusername });
  const { fullname, email, username } = req.body;
  console.log(":: ", fullname);
  try {
    await userModel.updateOne(
      { username: oldusername },
      {
        $set: { fullname: fullname, email: email, username: username },
      }
    );
    res.redirect("/profile");
  } catch (error) {
    console.error("Error updating user information:", error);
    res.status(500).render("error", {
      error: error,
      message: "Error updating user information",
      nav: true,
      user: currentUser,
    });
  }
});

router.get("/add", isLoggedIn, (req, res) => {
  res.render("add", { nav: true, user: currentUser });
});

router.post(
  "/createpost",
  isLoggedIn,
  upload.single("uploadedFile"),
  async (req, res) => {
    try {
      const user = await userModel.findOne({
        username: req.session.passport.user,
      });

      const post = await postModel.create({
        user: user._id,
        title: req.body.title,
        description: req.body.description,
        image: req.file.filename,
      });
      user.posts.push(post._id);
      await user.save();
      res.redirect("/profile");
    } catch (error) {
      res.render("error", {
        error: error,
        message: "",
        nav: true,
        user: currentUser,
      });
    }
  }
);

router.post("/register", function (req, res, next) {
  const { username, email, fullname, password } = req.body;
  const userData = new userModel({ username, email, fullname });

  userModel.register(userData, password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

module.exports = router;
