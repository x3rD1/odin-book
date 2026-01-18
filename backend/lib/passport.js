const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const prisma = require("./prisma");
const bcrypt = require("bcryptjs");

passport.use(
  new LocalStrategy(async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });

      // Check if user does not exist
      if (!user) {
        return done(null, false, { message: "Invalid email or password" });
      }

      const match = await bcrypt.compare(password, user.password);
      // Check if entered password is incorrect
      if (!match) {
        return done(null, false, { message: "Invalid email or password" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });

    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
