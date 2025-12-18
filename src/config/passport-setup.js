import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// 1. Serialize User (What to save in the session)
passport.serializeUser((user, done) => {
    // In a real app, you would save the user ID from your database here.
    done(null, user.id);
});

// 2. Deserialize User (What to retrieve from the session)
passport.deserializeUser((id, done) => {
    // In a real app, you would fetch the user from your database using the ID.
    // For this example, we just pass the ID back
    done(null, { id: id, displayName: 'Test User' });
});

// 3. Configure Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        // The verify callback function
        (accessToken, refreshToken, profile, done) => {
            // This function runs after the user successfully logs in with Google.

            // In a real application, you would:
            // 1. Check if a user with `profile.id` exists in your database.
            // 2. If yes, call done(null, existingUser).
            // 3. If no, create a new user record with `profile` data, and call done(null, newUser).

            console.log('User Profile:', profile.displayName, profile.emails[0].value);

            // For a basic setup, we'll just pass the profile ID to the serialize function
            done(null, profile);
        }
    )
);

export default passport;