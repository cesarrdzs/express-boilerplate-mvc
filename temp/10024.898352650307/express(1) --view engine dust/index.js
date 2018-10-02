let express = require('express'),
app = express(),
path = require('path'),
favicon = require('serve-favicon'),
logger = require('morgan'),
cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'),
flash = require('connect-flash'),
session = require('express-session'),
KnexStore = require('knex-pg-store'),
exphbs = require('express-handlebars');
let adaro = require('adaro');

require('dotenv').config();

const hbs = exphbs({
		extname : '.hbs',
		layoutsDir : 'app/views/layouts/',
		defaultLayout : 'layout',
		helpers : require('handlebars-helpers')()
});

// view engine setup
app.engine('dust', adaro.dust());
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'dust');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
		secret: process.env.SECRETSESS,
		resave: true,
		saveUninitialized: true
}));

app.use(flash()); // use connect-flash for flash messages stored in session
require('./common/routes.js')(app); // load our routes and pass in our app

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
