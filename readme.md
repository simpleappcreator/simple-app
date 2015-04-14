#simple-app

A simple module to kick-start your Node.js app development.

    npm install simple-app

![screenshot](http://i.imgur.com/ua90vzQ.png)


It has all the Express, Mongoose, Socket.io, Jade, Passport, and all that stuff pre-configured for you.

It assists you without getting in your way, or your style of doing things.


##Routing

To configure routes, you can do

    var app = require('simple-app');
    app.get('/', function(req, res, next){
        res.render('index')
    });

Since a module in Node.js is only loaded once, you can include it in any file and configure it there. For example a separate file for routes

**index.js**

    require('simple-app');
    require(./routes/main);

**routes/main.js**

    var app = require('simple-app');
    app.get('/myroute', function(req, res, next){
        res.render('myview')
    });

Note, it's important to *first* require it in your *main* `index.js` (or `server.js`, or `app.js`) because that's the path relative to which it looks for `views` and `public` folders etc.


## Client-side

It follows the widely accepted standard of having your views (Jade, HTML) in the `views` directory, and your images, CSS, client-javascripts in `public` and `client` directories.

Anything in your `public` or `client` directory is available as a static resource.

`public/vendor/some.css` `=>` `GET /vendor/some.css`

`client/app.js` `=>` `GET /app.js`


## Minification

Minify your resources! If you set an environment variable or config variable `minify`, it'll minify all the CSS and JS files when the app starts up.
For Stylus styles, it'll also convert and minify it as CSS.

It'll include jQuery, Angular, Bootstrap *before* any other files.

For all CSS and JS files in `public` it'll create `public.css.min` and `public.js.min`

For all CSS/Stylus and JS files in `client` it'll create `client.css.min` and `client.js.min`

## Configuration

You can configure the app, like its name, IP address, port, external domain name that it's hosted on (for generating Sitemap), and whether the app is in development mode or production mode.

There are two ways to configure these settings:

1. through environment variables.

        # defaults
        export app="SimpleApp"
        export IP="0.0.0.0"
        export PORT=80
        export NODE_ENV="production"
        export NODE_ENV="development"
        # default is development

2. through a `config.js` file

        var config = module.exports;
        config.name = 'TestApp';
        config.ip = "127.0.0.1"
        config.port = 10000;
        config.hostname="www.myapp.com"

It tries to normalize all setting names to lowercase, and having several different aliases for same settings names like app/appname/name/APP_NAME etc.
[More info in the source](https://github.com/simpleappcreator/simple-app/blob/master/lib/config.js)

All these settings are in `app.config`


## Submodules

It uses and makes available frequently used modules that you might need in your app.

#### [Passport](https://github.com/jaredhanson/passport)

Passport is available as `app.passport` and strategies as `app.passport.local/google/facebook`

There's a wrapper to serialize/deserialize

    app.serializeUser(function(user, done) { done(null, user.id) });
    app.deserializeUser(User.findById);

which handles errors and logs messages automatically

    Seriazed [user.user/name](54e8d8…cd1)
    DeSerializing (54e8d8…cd1)
    DeSerialized [user.user/name](54e8d8…cd1)

And since `serializeUser` is almost always exactly the same as above, it's already pre-configured like that, so you just have to `app.deserializeUser(User.findById)`

Nevertheless you can still over-ride however you want, using either the wrappers or directly using `app.passport.de/serializeUser`

---

There are also some helper middlewares

`app.reqUser` which checks `if(req.user)` otherwise redirects to `/login`

`app.reqAdmin` which checks `if(req.user.admin || req.user.group == 'admin')` or throws 401

    app.get('/secret', app.reqAdmin, function(req, res) {
        res.render('secret');
    });

#### [Mongoose](https://github.com/Automattic/mongoose)

Mongoose is available as `app.mongoose` which tries to connect to `mongodb://locahost/appname` by default, or if you configure a setting `mongodburl`

It also tries to *guess* the URL if app is hosted on openshift or MONGOLAB etc.

When defining databases in your app you should use

    var app = require('simple-app');
    var mongoose = app.mongoose;
    var User = mongoose.Schema({
        ...

#### Mongo Session Store

[Sessions](https://github.com/expressjs/session)
are stored in the mongo database using
[connect-mongo](https://github.com/kcbanner/connect-mongo).


#### [Jade](https://github.com/jadejs/jade)

Default view engine is set to Jade.

As usual you can change to whatever `app.set('view engine', 'hbs')`

#### [Jade-static](https://github.com/shovon/jade-static)

Serves Jade files in `client` (or `public`) directory as HTMLs

`/client/components/header-nav/header-nav.jade` `=>` `GET /components/header-nav/header-nav.html`

Found it extremely useful in creating
[AngularJS](http://angularjs.org/)
[directive components](http://google.com/search?q=angular+directive+components)
using [`templateUrl`](https://docs.angularjs.org/guide/directive#template-expanding-directive).


#### [Stylus](https://github.com/learnboost/stylus)

All `.styl` files (in `client`/`public`) are injected with [nib](https://github.com/tj/nib)
and served as `.css` files.


## app.locals #todo

res.locals #todo


## Development/Production mode #todo

compress #todo

no minificationin devel #todo



## Routes (revisited)

The routes should be configured with `app.<verb>`. This is actually a wrapper for the original `app.<verb>` which would've been available if you were to configure Express manually. It's still available in `app._<verb>`. But the wrapper serves an important function.

There are certain **default routes** and **middlewares**, like 404/500 error handler\*, and those should always be configured *after* ***your*** routes.

Every time you add a route, it removes those previously added "default" routes and adds them back ***after*** *your* routes.

\*The error handler serves the default view `error.jade` with the relevant error message.

There's also a default `/` route which serves the default `index` view as seen in the screenshot above. If you configure your own `/` route, it is made to *precede* this default view as described above, effectively disabling it.

Same could be done to disable the default error handlers if you wish to implement your own.

#### middlewarres #todo

Last page #todo

Sitemap generator #todo

catch404s #todo

>First, check if there's a viewfile that exists with the corresponding req.path #todo

catchErrors #todo

>failed-lookup #todo


#### routes #todo

All can be removed `app.removeDefaultMiddlewares()` #todo

#### views #todo

Lot of commonly used views, like header/footer, error page, login/logout/register pages etc are included.




## Resources listing

For convenience of including all the resources *programatically*, all the resources are enlisted in `app.config.resources`

    public: {
        js: ['jquery.js', 'angular.js', 'angular-animate.js', 'bootstrap.js', 'moment.js', ...
          fullpaths: ['C:\\TestApp\\node_modules\\simple-app\\lib\\public\\jquery.js', ... ]],
          min: 'public.min.js'
        css: ['bootstrap-theme.css', 'bootstrap.css' ...
          fullpaths: ['C:\\TestApp\\node_modules\\simple-app\\lib\\public\\bootstrap-theme.css', ...]],
          min: 'public.min.css'
    },
    client: {
        css: ['components/data/data.css',  'app.css' ...
          fullpaths: ['C:\\TestApp\\client\\components\\data\\data.css', ...]],
          min: 'client.min.css'
        js: ['components/data/data.js', 'app.js' ...
          fullpaths: ['C:\\TestApp\\client\\components\\data\\data.js' ...]]
          min: 'client.min.js'
    },
    angularApp: ['data', 'alertErr']

`app.config.resources.public.js` would contain an array of *names* of all the JS files in `public` dir.
`app.config.resources.public.js.fullpaths` would contain an array *full paths* of the same.
`app.config.resources.public.js.min` would only be present if minification was done, and would contain just the string "public.min.css"

Same everything goes for `app.config.resources.client`

Note that `app.config.resources.public.js` is an Array and `app.config.resources.public.js.min` is a ***property*** which won't be enumerated when the array would be looped with `forEach`

`app.config.resources.angularApp` contains the names of all the folders in the `client/components` dir that have a JS file.

Useful for creating Angular directive components.

    client/components/header-nav
        header-nav.js
        header-nav.jade

An Angular directive `header-nav` is available by default.
This is what creates the top bar in the default view.
You just include the tagname `header-nav` in your HTML and Angular injects this directive.


## Client-side (revisited)

Lot of commonly needed client-side CSS and javascripts libraries are included.
And this is where the resources listed in `app.config.resources` come in handy!

Here's what the default (partial) header view that's included looks like:

    <!DOCTYPE html><html ng-app="app" ng-controller="app">
    <head>
      <div>Resources<div>public<div>CSS
        <link rel="stylesheet" href="/bootstrap-theme.css">
        <link rel="stylesheet" href="/bootstrap.css">
      </div><div>JS
        <script src="/jquery.js"></script>
        <script src="/angular.js"></script>
      </div></div><div>client<div>CSS
        <link rel="stylesheet" href="/misc.css">
        <link rel="stylesheet" href="/title.css">
      </div><div>JS
        <script src="/components/header-nav/header-nav.js"></script>
        <script src="/app.js"></script>
    </head><body>
    <header-nav></header-nav><main>

Ignoring the bad practice of including all that in the `<head>`, what's to be noted here is that
the Jade file `views/partials/header.jade` that generated it is included by default, but you'll probably use your own version of a header etc anyways, so the layout itself is not as important.

What's more important is all those CSS and javascript libraries and other stuff is available on client-side without you having put anything in your app `public` or `client` folder. You can use them in your own layouts wherever you want.

Furthermore, if you look at the actual jade file, you'll see that it includes all those script *programatically*.
So that you don't have to change the file anytime you include more client-side files,
restarting the app will automatically make them available as certain variables which can be looped through.

    div Resources
      each topdir in ['public', 'client']
        div= topdir
          div CSS
            if(dev && resources[topdir].css)
              each css in resources[topdir].css
                link(rel="stylesheet", href="/#{css}")
            else if(!dev && resources[topdir].css.min)
              link(rel="stylesheet", href="/#{resources[topdir].css.min}")
          div JS
            if(dev && resources[topdir].js)
              each js in resources[topdir].js
                script(src="/#{js}")
            else if(!dev && resources[topdir].js.min)
              script(src="/#{resources[topdir].js.min}")

If this cup of tea tastes bad, you don't have to drink it. :) It's just an option.



