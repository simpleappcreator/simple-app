global.passport = require('passport');
passport.LocalStrategy = require('passport-local').Strategy;
passport.GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.FacebookStrategy = require('passport-facebook').Strategy;
passport.TwitterStrategy = require('passport-twitter').Strategy;


// Passport de/serialise patch to *unshift* functions, so that user get placed before defaults
passport._serializeUser = passport.serializeUser;
passport._deserializeUser = passport.deserializeUser;

passport.serializeUser = function serializeUser_unshiftPatch(fn) {
    if (typeof fn !== 'function') return passport._serializeUser.apply(this, arguments);
    return this._serializers.unshift(function serializeUserWrapper(user, done) {
        if (config.verbose_all || config.verbose_passport) console.verbose('Serializing', tostr(user));
        fn(user, function(err, id) {
            if (err) console.error('Couldn\'t Serialize', tostr(user), err);
            else if (config.verbose_all || config.verbose_passport) console.verbose('Serialized', tostr(user));
            try {
                done(err, id);
            } catch (err) {
                console.error(err);
            }
        });
    });
};
passport.deserializeUser = function deserializeUser_unshiftPatch(findById, req, done) {
    if (typeof findById != 'function' && !findById.findById) return passport._deserializeUser.apply(this, arguments);
    if (findById.findById) findById = findById.findById.bind(findById);
    return this._deserializers.unshift(function deserializeUserWrapper(id, done) {
        if (config.verbose_all || config.verbose_passport) console.verbose('DeSerializing (%s)', tostr(id));
        findById(id, function(err, user) {
            if (user) {
                if (config.verbose_all || config.verbose_passport) console.verbose('DeSerialized', tostr(user));
                return done(null, user);
            }
            AnonUser.findById(id, async function(er_, anonuser) {
                if (anonuser) return done(null, anonuser);
                anonuser = await new AnonUser().saveAsync();
                return done(null, anonuser);
            });
        });
    });
};

// Default de/serializers
passport.serializeUser(function defaultPassportSerialize(user, done) {
    done(null, user.id || user._id);
});
passport.deserializeUser(AnonUser);

passport.useStrategies = function usePassportAllStrategies(User) {
    if (!User || !User.findOrCreate) return console.error('User[.findOrCreate] required');
    passport.useProviderStrategy('google', User);
    passport.useProviderStrategy('facebook', User);
    passport.useProviderStrategy('twitter', User);
}

passport.useProviderStrategy = function usePassportProviderStrategy(provider, User) {
    if (!provider || !provider.length) return console.error('Invalid provider');
    if (!User || !User.findOrCreate) return console.error('User[.findOrCreate] required');
    var clientID = config[provider + '_clientid'] || '1';
    var clientSecret = config[provider + '_clientsecret'] || '1';
    passport.use(new passport[toTitleCase(provider) + 'Strategy']({
            clientID: clientID,
            consumerID: clientID,
            consumerKey: clientID,
            clientSecret: clientSecret,
            consumerSecret: clientSecret,
            callbackURL: app.hostname + '/login/' + provider + '/return',
            returnURL: app.hostname + '/login/' + provider + '/return',
            realm: app.hostname,
        },
        function(accessToken, refreshToken, profile, done) {
            profile.accessToken = accessToken;
            profile.refreshToken = refreshToken;
            delete profile._json;
            delete profile._raw;
            var query = {};
            query.provider = {};
            query.provider[provider] = profile;
            User.findOrCreate(query, function(err, user) {
                if (!user) done(err || new Error('Could not find or create User[' + provider.id + ']'));
                else done(null, user);
            });
        }
    ));
}

app.setUser = function AppSetUser(User) {
    // console.debug('Setting User', User);
    if (!User) User = AnonUser;
    if (!User.findOrCreate) return console.error('User.findOrCreate method needed');
    app.User = User;
    passport.deserializeUser(User);
    passport.useStrategies(User);
}
app.setUser(AnonUser); // default
