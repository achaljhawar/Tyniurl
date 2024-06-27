const passport = require('passport')
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
require('dotenv').config()
const GOOGLE_CLIENT_ID = process.env.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.CLIENT_SECRET;
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "https://tyniurl.onrender.com/login/google/callback",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));
passport.serializeUser(function(user, done){
    done(null, user);
})
passport.deserializeUser(function(user, done){
    done(null, user);
})
