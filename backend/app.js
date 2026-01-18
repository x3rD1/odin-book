require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
});

const express = require("express");
const passport = require("passport");
const { session } = require("passport");
const app = express();
const pgSession = require("connect-pg-simple")(session);

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
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.session());

app.listen(3000, (error) => {
  if (error) throw error;
  console.log("App is listening to port 3000");
});
