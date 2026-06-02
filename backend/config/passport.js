const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: (process.env.BASE_URL || 'http://localhost:5000') + '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      if (!profile.emails || !profile.emails.length) {
        return done(new Error('No email found in your Google profile'), null);
      }
      const email = profile.emails[0].value;

      // College domain restriction check
      if (!email.endsWith('@vitapstudent.ac.in') && !email.endsWith('@vitap.ac.in')) {
        return done(null, false, { message: 'Only VIT-AP college emails are allowed' });
      }

      let user = await User.findOne({ email });
      if (!user) {
        // Create new user (automatically verified via OAuth)
        user = await User.create({
          email: email,
          isVerified: true,
          role: 'user'
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
