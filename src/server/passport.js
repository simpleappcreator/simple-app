function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {var callNext = step.bind(null, "next");var callThrow = step.bind(null, "throw");function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {Promise.resolve(value).then(callNext, callThrow);}}callNext();});};}global.passport = require('passport');
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
        fn(user, function (err, id) {
            if (err) console.error('Couldn\'t Serialize', tostr(user), err);else 
            if (config.verbose_all || config.verbose_passport) console.verbose('Serialized', tostr(user));
            try {
                done(err, id);} 
            catch (err) {
                console.error(err);}});});};




passport.deserializeUser = function deserializeUser_unshiftPatch(findById, req, done) {
    if (typeof findById != 'function' && !findById.findById) return passport._deserializeUser.apply(this, arguments);
    if (findById.findById) findById = findById.findById.bind(findById);
    return this._deserializers.unshift(function deserializeUserWrapper(id, done) {
        if (config.verbose_all || config.verbose_passport) console.verbose('DeSerializing (%s)', tostr(id));
        findById(id, function (err, user) {
            if (user) {
                if (config.verbose_all || config.verbose_passport) console.verbose('DeSerialized', tostr(user));
                return done(null, user);}

            AnonUser.findById(id, (function () {var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(er_, anonuser) {return regeneratorRuntime.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:if (!
                                    anonuser) {_context.next = 2;break;}return _context.abrupt('return', done(null, anonuser));case 2:_context.next = 4;return (
                                        new AnonUser().saveAsync());case 4:anonuser = _context.sent;return _context.abrupt('return', 
                                    done(null, anonuser));case 6:case 'end':return _context.stop();}}}, _callee, this);}));return function (_x, _x2) {return ref.apply(this, arguments);};})());});});};





// Default de/serializers
passport.serializeUser(function defaultPassportSerialize(user, done) {
    done(null, user.id || user._id);});

passport.deserializeUser(AnonUser);

passport.useStrategies = function usePassportAllStrategies(User) {
    if (!User || !User.findOrCreate) return console.error('User[.findOrCreate] required');
    passport.useProviderStrategy('google', User);
    passport.useProviderStrategy('facebook', User);
    passport.useProviderStrategy('twitter', User);};


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
        realm: app.hostname }, 

    function (accessToken, refreshToken, profile, done) {
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;
        delete profile._json;
        delete profile._raw;
        var query = {};
        query.provider = {};
        query.provider[provider] = profile;
        User.findOrCreate(query, function (err, user) {
            if (!user) done(err || new Error('Could not find or create User[' + provider.id + ']'));else 
            done(null, user);});}));};





app.setUser = function AppSetUser(User) {
    // console.debug('Setting User', User);
    if (!User) User = AnonUser;
    if (!User.findOrCreate) return console.error('User.findOrCreate method needed');
    app.User = User;
    passport.deserializeUser(User);
    passport.useStrategies(User);};

app.setUser(AnonUser); // default
//# sourceMappingURL=passport.js.map
