var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const expressSession = require("express-session");
const passport = require("passport");
const env = require("dotenv");
env.config();

const MongoStore = require("connect-mongo");

var indexRouter = require("./routes/index");
const staticRouter = require("./routes/staticRoute");
var usersRouter = require("./routes/users");
const { error } = require("console");
const connectMongoDb = require("./connection");
const UserModel = require("./models/users");

var app = express();
connectMongoDb();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Allowing the session
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: "abcde",
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 7 * 24 * 60 * 60, // Session TTL (optional)
    }),
  })
);

// Auth
app.use(passport.initialize());
app.use(passport.session()); // Creates session
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routing
app.use("/", indexRouter);
// app.use("/", staticRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error", { error: err, nav: false, message: "" });
});

module.exports = app;
