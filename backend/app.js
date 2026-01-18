require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
});

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const pgSession = require("connect-pg-simple")(session);

require("./lib/passport");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.set("trust proxy", 1);
app.use(
  session({
    store: new pgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: true,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      secure: process.env.NODE_ENV === "production" ? "true" : "false",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.listen(3000, (error) => {
  if (error) throw error;
  console.log("App is listening to port 3000");
});
