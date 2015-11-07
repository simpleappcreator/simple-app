'use strict';

// Defaults
var bc = locals.bc = {
    'ngTemplateMultipleFull': null,
    'ngTemplateMultipleForm': null,
    'ngTemplateSingleFull': null,
    'ngTemplateSingleForm': null,
};

class BasicCrud {
    constructor(args, args2, args3) {
        var bc = this;
        _.merge(bc, locals.bc);
        if (typeof args == 'string') args = {
            name: args,
        };
        for (let key in args)
            bc[key] = args[key];
        if (typeof args2 == 'object')
            for (let key in args2)
                bc[key] = args2[key];
        if (typeof args2 == 'string')
            args2.split(',').forEach(function(arg) {
                if (arg == 'a') bc.admin = true;
                if (arg == 'mU') bc.manualUpdate = true;
                if (arg == 'mR') bc.manualRoutes = true;
            });
        if (typeof args3 == 'object')
            for (let key in args3)
                bc[key] = args3[key];

        var name = args.name;
        var singular = bc.singular = pluralize.singular(name);
        var plural = bc.plural = pluralize(name);
        name = singular;
        bc.camelCase = _.camelCase(name);
        bc.name = bc.camelCase;
        bc.collectionName = bc.camelCase.toLowerCase();
        bc.startCase = _.startCase(name);
        bc.name = name.toLowerCase();
        bc.names = plural.toLowerCase();
        bc.Name = _.capitalize(_.camelCase(name));
        bc.Names = _.capitalize(_.camelCase(plural));
        bc.kebabCase = _.kebabCase(name);
        bc.slug = bc.kebabCase;
        bc.slugs = _.kebabCase(plural);
        bc.snakeCase = _.camelCase(name);
        // console.debug(bc.slug);

        bc.addDatabase();

        if (!bc.manualRoutes)
            bc.addRoutes_Full();

        return bc;
    }
}

BasicCrud.prototype.getName = function(doc, key) {
    var bc = this;
    // doc = doc || bc.data;
    // key = key || Object.keys(doc)[0];
    // return doc.name || doc.title || doc[bc.name] || doc[key] || '';
    doc = doc || data;
    key = key || Object.keys(doc)[0];
    if (key == '_id' && Object.keys(doc)[1])
        key = Object.keys(doc)[1];
    // console.debug('doc:', doc);
    return (doc.name || doc.username || doc.title ||
        doc[bc.name] || doc[bc.slug] ||
        doc[bc.collectionName] ||
        doc[key] ||
        doc[Object.keys(doc)[1]] ||
        doc._id);
};


BasicCrud.prototype.addDatabase = function() {
    var bc = this;
    if (!bc.schema) bc.schema = {
        [bc.camelCase]: 'String',
    };
    // console.debug(bc.collectionName);
    bc.db = (bc.mongoose || mongoose).model(bc.collectionName, bc.schema);
    bc.db.bc = bc;
    globalize(bc.Name, bc.db);
    globalize(bc.Names, bc.db);
    if (typeof db != 'undefined') db[bc.Name] = db[bc.Names] = bc.db;
    return bc;
};

BasicCrud.prototype.createDummyContent = function() {
    var bc = this;
    bc.db.find({}).execAsync().then(function(docs) {
        if (docs.length) return;
        console.verbose('[%s] Creating dummy content', bc.Name);
        for (var i = 1; i <= 3; i++)(function(i) {
            new bc.db({
                name: 'Test ' + bc.Name + ' ' + i,
            }).save();
        })(i);
    });
    return bc;
};


BasicCrud.prototype.addRoutes_CRUD = function() {
    var bc = this;
    bc.addRoute_POSTupdate();
    bc.addRoute_POSTremove();
    bc.addRoute_POSTadd();
    return bc;
};
BasicCrud.prototype.addRoutes_Views = function() {
    var bc = this;
    bc.addRoute_PRElocals();
    // bc.addRoute_PRErefs();
    bc.addRoute_GETmultiple();
    bc.addRoute_GETsingle();
    bc.addRoute_GETadd();
    return bc;
};
BasicCrud.prototype.addRoutes_Bare = function() {
    var bc = this;
    bc.addRoutes_CRUD();
    bc.addRoute_PRElocals();
    // bc.addRoute_PRErefs();
    // bc.addRoutes_Views();
    return bc;
};
BasicCrud.prototype.addRoutes_Basic = function() {
    var bc = this;
    bc.addRoutes_CRUD();
    // bc.addRoute_PRErefs();
    bc.addRoutes_Views();
    return bc;
};
BasicCrud.prototype.addRoutes_Full = function() {
    var bc = this;
    bc.addRoutes_CRUD();
    bc.addRoute_PRElocals();
    bc.addRoute_PRErefs();
    bc.addRoute_GETmultiple();
    bc.addRoute_GETsingle();
    bc.addRoute_GETadd();
    return bc;
};



BasicCrud.prototype.addRoute_PRElocals = function(path) {
    var bc = this;
    // console.debug(options);
    if (path) app.get(path, route);
    else app.get('/' + (bc.admin ? 'admin/' : '') + bc.slug + '*', route);
    return bc;

    function route(req, res, next) {
        var locals = res.locals;
        locals.bc = bc;
        // locals.bc = _.merge({}, bc);
        locals.schema = bc.schema;
        next();
    }
};
BasicCrud.prototype.addRoute_PRErefs = function(path) {
    var bc = this;
    if (path) app.get(path, route);
    else app.get('/' + (bc.admin ? 'admin/' : '') + bc.slug + '*', route);
    return bc;

    function route(req, res, next) {
        var locals = res.locals;
        locals.refs = {};
        var limit = Infinity;
        Promise.all(Object.keys(bc.schema).reduce((refs, key) => {
            // Collect unique refs
            if (!bc.schema[key]) return refs;
            var ref = bc.schema[key].ref;
            if (!ref || ~refs.indexOf(ref)) return refs;
            return refs.concat([ref]);
        }, []).map(ref => {
            // populate each unique ref:
            console.log(bc.slug, ref);
            var Model = (req.mongoose || mongoose).model(ref);
            return Model.find({}).lean().limit(limit).execAsync()
                .then(mongoose.desensitize)
                .then(mongoose.objectify)
                .then(docs => locals.refs[ref] = docs)
                .catch(console.err)
        })).then(d => next()).catch(next);
    }
};
BasicCrud.prototype.addRoute_GETmultiple = function(path) {
    var bc = this;
    if (path) app.get(path, route);
    else app.get('/' + (bc.admin ? 'admin/' : '') + bc.slugs, route);
    return bc;

    function route(req, res, next) {
        var locals = res.locals;
        var Model = req.mongoose && req.mongoose.model(bc.collectionName) || bc.db
        Model.find({}).lean().limit(bc.limit || Infinity).sort(bc.sortOrder || '').execAsync().then(mongoose.desensitize).then(function(docs) {
            locals.title = bc.Names + ' | ' + config.Name;
            locals.data = locals[bc.names] = docs;
            if (req.json) res.json(locals.data);
            else res.render(bc.viewMultiple || 'basic-crud/multiple');
        }).catch(next);
    }
};
BasicCrud.prototype.addRoute_GETsingle = function(path) {
    var bc = this;
    if (path) app.get(path, route);
    else app.get('/' + (bc.admin ? 'admin/' : '') + bc.slug + '/:title/:id', route);
    return bc;

    function route(req, res, next) {
        var locals = res.locals;
        (req.mongoose && req.mongoose.model(bc.collectionName) || bc.db)
        .findByIdAsync(req.params.id).then(function(doc) {
            if (!doc) throw new Error('Doesn\'t exist');
            locals.data = doc;
            locals.title = bc.Name + ': ' + getDocName(doc) + ' | ' + config.Name;
            if (req.json || req.url.match(/json$/)) res.json(doc);
            else res.render(bc.viewSingle || 'basic-crud/single');
        }).catch(function(err) {
            err.message = 'Not found. ' + err.message;
            err.status = 404;
            next(err);
        });
    }
};
BasicCrud.prototype.addRoute_GETadd = function(path) {
    var bc = this;
    if (path) app.get(path, route);
    else app.get('/' + (bc.admin ? 'admin/' : '') + bc.slug + '/add', route);
    return bc;

    function route(req, res, next) {
        var locals = res.locals;
        locals.data = req.query;
        locals.title = 'Add ' + _.startCase(bc.Name) + ' | ' + config.Name;
        res.render('basic-crud/single');
    }
};
BasicCrud.prototype.addRoute_POSTupdate = function(path) {
    var bc = this;
    if (path) app.get(path, route);
    else app.post('/' + (bc.admin ? 'admin/' : '') + bc.slug + '/update', route);
    return bc;

    function route(req, res, next) {
        var data = req.body;
        console.verbose('%s Update request received:\n', bc.Name, data);
        var id = data.id || data._id;
        if (data.password)
            var password = data.password
        delete data.id;
        delete data._id;
        delete data.__v;
        delete data.password;
        delete data.hash;
        var Model = req.mongoose && req.mongoose.model(bc.collectionName) || bc.db;
        Model.findByIdAndUpdate(id, data).execAsync().then(function(doc) {
            if (password && password.length && doc.savePassword) {
                doc.savePassword(password);
                return doc.saveAsync();
            } else return doc;
        }).then(function(doc) {
            console.verbose('%s Update request fulfilled\n', bc.Name, doc);
            if (req.json) res.json(doc);
            else res.redirect('/' + (bc.admin ? 'admin/' : '') + bc.slug + '/' + getDocSlug(doc) + '/' + doc.id);
        }).catch(function(err) {
            err.message = bc.Name + ' Update request failed. ' + err.message;
            next(err);
        });
    }
};
BasicCrud.prototype.addRoute_POSTremove = function(path) {
    var bc = this;
    if (path) app.get(path, route);
    else app.post('/' + (bc.admin ? 'admin/' : '') + bc.slug + '/remove', route);
    return bc;

    function route(req, res, next) {
        var data = req.body;
        var id = data.id || data._id;
        console.verbose('%s Remove request received:\n', bc.Name, data);
        var Model = req.mongoose && req.mongoose.model(bc.collectionName) || bc.db;
        Model.findById(id).removeAsync().then(function() {
            console.verbose('%s Remove request fulfilled\n', bc.Name);
            if (req.json) res.json('removed');
            else res.redirect('/' + (bc.admin ? 'admin/' : '') + bc.slugs);
        }).catch(function(err) {
            err.message = bc.Name + ' Remove request failed. ' + err.message;
            next(err);
        });
    }
};
BasicCrud.prototype.addRoute_POSTadd = function(path) {
    var bc = this;
    if (path) app.get(path, route);
    else app.post('/' + (bc.admin ? 'admin/' : '') + bc.slug + '/add', route);
    return bc;

    function route(req, res, next) {
        var data = req.body;
        console.verbose('%s Add request received:\n', bc.Name, data);
        var Model = req.mongoose && req.mongoose.model(bc.collectionName) || bc.db;
        new Model(data).saveAsync().spread(function(doc) {
            console.verbose('%s Add request fulfilled\n', bc.Name, doc);
            if (req.json) res.json(doc);
            else res.redirect('/' + (bc.admin ? 'admin/' : '') + bc.slug + '/' + getDocSlug(doc) + '/' + doc.id);
        }).catch(function(err) {
            err.message = bc.Name + ' Add request failed. ' + err.message;
            next(err);
        });
    }
};



function getDocName(doc) {
    return doc.name || doc.title;
}

function getDocSlug(doc) {
    return slug(tostr(getDocName(doc), 30)).toLowerCase()
}

module.exports = BasicCrud;
