function _typeof(obj) {return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;}var bcrypt = require('bcrypt');

module.exports = MongooseUserUtilsPlugin;

function MongooseUserUtilsPlugin(User, options) {
    User.methods.savePassword = savePassword;
    User.methods.verifyPassword = verifyPassword;
    User.statics.findUser = findUser;
    User.statics.findOrCreate = findOrCreate;

    User.set('toJSON', { 
        transform: function transform(doc, ret, options) {
            delete ret.__v;
            delete ret.hash;
            delete ret.password;
            return ret;} });}


;

var strictfalse = { 
    strict: false };


function savePassword(password) {
    this.set('hash', bcrypt.hashSync(password || bcrypt.genSaltSync(), 10), strictfalse);}
;

function verifyPassword(password) {
    return bcrypt.compareSync(password, this.get('hash') || '');}
;

var fields = ['user', 'email', 'username', 'provider'];

function findUser(query, done_, backdoor) {
    var User = this;
    done_ = done_ || nooperr;

    return new Promise(function (resolve, reject) {
        if (query.user) {
            if (query.user.match(/^.+\@.+\..+$/)) 
            query.email = query.user;else 

            query.username = query.user;
            delete query.user;}


        var provider = query.provider;

        var password = query.password;
        delete query.password;

        if (!password && !provider) return done(new Error('Need a Password'));

        if (!Object.keys(query).length && !provider) return done(new Error('Need an Email or Username'));

        var $orquery = { 
            $or: [] };


        if (provider) 
        for (var name in provider) {
            for (var key in provider[name]) {
                if (key == 'id') (function (key, value) {
                    var provider = {};
                    provider[key] = value;
                    $orquery.$or.push(provider);})(
                'provider.' + name + '.' + key, provider[name][key]);}}

        for (var key in query) {
            if (! ~matchIndexOf(fields, key)) continue;
            if (!query[key] || !query[key].length && _typeof(query[key]) == 'object' && !Object.keys(query[key]).length) continue;
            var field = {};
            field[key] = query[key];
            $orquery.$or.push(field);}
        ;

        // console.debug('$orquery:', $orquery);
        User.findOne($orquery, function (err, user) {
            if (err) return done(err);
            if (!user) return done(new Error('User doesn\'t exist'), false, query, password);
            if (!provider && !user.verifyPassword(password) && !backdoor) 
            return done(new Error('Wrong password'));
            return done(backdoor && new Error('User accessed via backdoor') || null, user, query, password);});


        function done(err, user) {
            done_.apply(null, arguments);
            if (user) resolve(user);else 
            reject(err);}});}




;

function findOrCreate(query, done_, backdoor) {
    var User = this;
    done_ = done_ || nooperr;
    return new Promise(function (resolve, reject) {
        User.findUser(query, function (err, user, query, password) {
            // if (user) done(err || new Error('User already exists'), user, query, password);
            if (user) done(null, user, query, password);else 
            if (user !== false || !query || !query.provider && !password) 
            done(err || new Error('An error occurred while creating user'), user, query, password);
            // else done(null, new User(query), query, password);
            // else done(new Error('New User created'), new User(query), query, password);
            else new User(query).save(function (err, user) {
                    if (err) err.message = 'Couldn\'t create user. ' + err.message;
                    done(err, user, query, password);});}, 

        backdoor).catch(nooperr);

        function done(err_, user, query, password) {
            if (user) {
                if (password) user.savePassword(password);
                if (query) 
                for (var key in query) {
                    if (~fields.indexOf(key)) 
                    user.set(key, query[key], strictfalse);}

                if (user.get('provider')) 
                for (var provider in user.get('provider')) {
                    if (!user.get('email') && user.get('provider')[provider].emails && user.get('provider')[provider].emails[0] && user.get('provider')[provider].emails[0].value) 
                    user.set('email', user.get('provider')[provider].emails[0].value);}

                user.save(function (err, user) {
                    done_(err || err_, user);
                    if (user) resolve(user);else 
                    reject(err || err_);});} else 

            {
                done_(err_);
                reject(err_);}}});}





;


/*
    Possible* Securiy Flaw
    User can register via email/pass
    User can register via google auth (separately)
    Can one user access the other somehow?
*/
//# sourceMappingURL=userutils.js.map
