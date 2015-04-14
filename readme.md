#simple-app

A simple module to kick-start your Node.js app development.

    npm install simple-app

![screenshot][1]

It has all the Express, Mongoose, Socket.io, Jade, Passport, and all that stuff pre-configured for you.

It assists you without getting in your way, or your style of doing things.


##Routing

To configure routes, you can do

>     var app = require('simple-app');
    app.get('/', function(req, res, next){
        res.render('index')
    });

Which is actually exactly what it does by default, if you don't plan on overwriting that route yourself. It also has a default view `index` of its own which is what you see in screenshot above.

Since a module in Node.js is only loaded once, you can include it in any file and configure it there. For example a separate file for routes

>**index.js**

>     require('simple-app');
    require(./routes/main);

>**routes/main.js**

>     var app = require('simple-app');
    app.get('/myroute', function(req, res, next){
        res.render('myview')
    });

Note, it's important to *first* require it in your *main* `index.js` (or `server.js`, or `app.js`) because that's the path relative to which it looks for `views` and `public` folders etc.


## Client-side

It follows the widely accepted standard of having your views (Jade, HTML) in the `views` directory, and your images, CSS, client-javascripts in `public` or `client` directories.

Anything in your `public` or `client` directory is available as a static resource.

`public/vendor/some.css` => `GET /vendor/some.css`

`client/my.js` => `GET /my.js`


## Minification

It can minify your resources! If you set an environment variable or config variable `minify`, it'll process all the CSS (or Stylus styles) and JS files and create a `public.css.min` or `client.js.min` like files respectively for public/client directories and css/js type files.


## Configuration

You can configure the app, like its name, IP address, port, external domain name that it's hosted on (for generating Sitemap), and whether the app is in development mode or production mode.

There are two ways to configure these settings:

1. through environment variables.

        export app="AppName"
        export IP="127.0.0.1"
        export PORT=3000
        export NODE_ENV="development"
        export NODE_ENV="production"
        #default is development
        export hostname="www.myapp.com"

2. through a `config.js` file

        var config = module.exports;
        config.name = 'TestApp';
        config.port = 10000;

It tries to be foolproof by normalizing all setting names' cases to lowercase, and having several different aliases for same settings like app/appname/name/APP_NAME etc.

All these settings are available in `app.config`


## Submodules

#### Passport

Passport is available as `app.passport` and strategies as `app.passport.local/google/facebook`

There's a wrapper to serialize/deserialize

>     app.serializeUser(function(user, done) { done(null, user.id); });
    app.deserializeUser(User.findById);

which handles errors and logs messages automatically

>     Seriazed [user.user/name](54e8d8…cd1)
    DeSerializing (54e8d8…cd1)
    DeSerialized [user.user/name](54e8d8…cd1)

And since `serializeUser` is almost always exacly the same as above, it's already pre-configured like that, so you just have to `app.deserializeUser(User.findById)`.

Nevertheless you can still over-ride however you want. You can even over-ride using `app.passport.de/serializeUser`.


---

There's also some helper middlewares

`app.reqUser` which checks `if(req.user)` exists, otherwise redirects to `/login`

`app.reqAdmin` which checks `if(req.user.admin || req.user.group == 'admin')`, or throws 401 Unauthorized.

>     app.get('/secret', app.reqAdmin, function(req, res) {
        res.render('secret');
    });

#### Mongoose

#### Mongoose-connect

#### Stylus

#### Jade-static





## app.locals

res.locals


## Development/Production mode

compress
no minificationin devel



## Routes (revisited)

The routes should be configured with `app.<verb>`. This is actually a wrapper for the original `app.<verb>` which would've been available if you were to configure Express manually. It's still available in `app._<verb>`. But the wrapper serves an important function.

There are certain **default routes** and **middlewares**, like 404/500 error handler\*, and those should always be configured *after* ***your*** routes.

Every time you add a route, it removes those previously added "default" routes and adds them back ***after*** *your* routes.

\*The error handler serves the default view `error.jade` with the relevant error message.

There's also a default `/` route which serves the default `index` view as seen in the screenshot above. If you configure your own `/` route, it is made to *precede* this default view as described above, effectively disabling it.

Same could be done to disable the default error handlers if you wish to implement your own.

#### middlewarres

Last page
Sitemap generator
catch404s
    First, check if there's a viewfile that exists with the corresponding req.path

catchErrors
    failed-lookup


#### routes

All can be removed `app.removeDefaultMiddlewares()`


## Client-side (revisited)

It has a lot of commonly needed views, like header/footer, error page, login/logout/register pages etc.
And it also has a lot of commonly needed client-side CSS and javascripts libraries.

Here's what the default header-partial that's included looks like

>     <!DOCTYPE html><html ng-app="app" ng-controller="app">
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

Couple of things to note here.

Firstly, I know it's a bad practice to include all that in the `<head>`. What's to be noted here is that
the Jade file `views/partials/header.jade` that generated it is included by default, but you'll probably use your own version of a header etc anyways, so the layout itself is not as important.

What's more important is all those CSS and javascript libraries and other stuff is available on client-side without you having put anything in your app `public` or `client` folder. You can use them in your own layouts wherever you want.

Furthermore, if you look at the actual jade file, you'll see that it includes all those script *programatically*. So that you don't have to change the file anytime you include more client-side files, restarting the app will automatically make them available as certain variables which can be looped through. It tries to order them in a way to include jquery or angular before their plugins.

>     div Resources
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




[1]: http://i.imgur.com/ua90vzQ.png