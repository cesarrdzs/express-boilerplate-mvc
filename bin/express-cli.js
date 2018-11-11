#!/usr/bin/env node

var ejs = require('ejs')
var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var program = require('commander')
var readline = require('readline')
var sortedObject = require('sorted-object')
var util = require('util')

var MODE_0666 = parseInt('0666', 8)
var MODE_0755 = parseInt('0755', 8)

var _exit = process.exit
var pkg = require('../package.json')

var version = pkg.version

// Re-assign process.exit because of commander
// TODO: Switch to a different command framework
process.exit = exit

// CLI

around(program, 'optionMissingArgument', function (fn, args) {
	program.outputHelp()
	fn.apply(this, args)
	return { args: [], unknown: [] }
})

before(program, 'outputHelp', function () {
	// track if help was shown for unknown option
	this._helpShown = true
})

before(program, 'unknownOption', function () {
	// allow unknown options if help was shown, to prevent trailing error
	this._allowUnknownOption = this._helpShown

	// show help if not yet shown
	if (!this._helpShown) {
		program.outputHelp()
	}
})

program
	.name('expressbo')
	.version(version, '    --version')
	.usage('[options] [dir]')
	.option('-e, --ejs', 'add ejs engine support', renamedOption('--ejs', '--view=ejs'))
	.option('    --pug', 'add pug engine support', renamedOption('--pug', '--view=pug'))
	.option('    --hbs', 'add handlebars engine support', renamedOption('--hbs', '--view=hbs'))
	.option('-H, --hogan', 'add hogan.js engine support', renamedOption('--hogan', '--view=hogan'))
	.option('-v, --view <engine>', 'add view <engine> support (dust|ejs|hbs|hjs|jade|pug|twig|vash) (defaults to jade)')
	.option('-c, --css <engine>', 'add stylesheet <engine> support (less|stylus|compass|sass) (defaults to plain css)')
	.option('    --git', 'add .gitignore')
	.option('-f, --force', 'force on non-empty directory')
	.parse(process.argv)

if (!exit.exited) {
	main()
}

/**
 * Install an around function; AOP.
 */

function around (obj, method, fn) {
	var old = obj[method]

	obj[method] = function () {
		var args = new Array(arguments.length)
		for (var i = 0; i < args.length; i++) args[i] = arguments[i]
		return fn.call(this, old, args)
	}
}

/**
 * Install a before function; AOP.
 */

function before (obj, method, fn) {
	var old = obj[method]

	obj[method] = function () {
		fn.call(this)
		old.apply(this, arguments)
	}
}

/**
 * Prompt for confirmation on STDOUT/STDIN
 */

function confirm (msg, callback) {
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	})

	rl.question(msg, function (input) {
		rl.close()
		callback(/^y|yes|ok|true$/i.test(input))
	})
}

/**
 * Copy file from template directory.
 */

function copyTemplate (from, to) {
	from = path.join(__dirname, '..', 'templates', from)
	write(to, fs.readFileSync(from, 'utf-8'))
}

/**
 * Create application at the given directory `path`.
 *
 * @param {String} path
 */

function createApplication (name, path) {
	var wait = 8

	console.log()
	function complete () {
		if (--wait) return
		var prompt = launchedFromCmd() ? '>' : '$'

		console.log()
		console.log('   install dependencies:')
		console.log('     %s cd %s && npm install', prompt, path)
		console.log()
		console.log('   run the app:')

		if (launchedFromCmd()) {
			console.log('     %s SET DEBUG=%s:* & npm start', prompt, name)
		} else {
			console.log('     %s DEBUG=%s:* npm start', prompt, name)
		}

		console.log()
	}

	// JavaScript
	var app = loadTemplate('js/index.js')
	var www = loadTemplate('js/www')

	// App name
	www.locals.name = name

	// App modules
	app.locals.modules = Object.create(null)
	app.locals.uses = []

	mkdir(path, function () {
		mkdir(path + '/public', function () {
			mkdir(path + '/public/js')
			mkdir(path + '/public/img')
			mkdir(path + '/public/files')
			mkdir(path + '/public/css', function () {
				switch (program.css) {
					case 'less':
						copyTemplate('css/style.less', path + '/public/css/style.less')
						break
					case 'stylus':
						copyTemplate('css/style.styl', path + '/public/css/style.styl')
						break
					case 'compass':
						copyTemplate('css/style.scss', path + '/public/css/style.scss')
						break
					case 'sass':
						copyTemplate('css/style.sass', path + '/public/css/style.sass')
						break
					default:
						copyTemplate('css/style.css', path + '/public/css/style.css')
						break
				}
				complete()
			})
		})

		mkdir(path + '/common', function () {
			copyTemplate('js/utils/KnexDB.js', path + '/common/KnexDB.js')
			copyTemplate('js/utils/Utils.js', path + '/common/Utils.js')
			copyTemplate('js/utils/environment', path + '/.env')
			complete()
		})

		mkdir(path + '/app', function(){
			mkdir(path + '/app/controllers', function(){
				copyTemplate('js/utils/Home.js', path + '/app/controllers/HomeController.js')
				complete()
			})

			mkdir(path + '/app/models', function(){
				copyTemplate('js/utils/User.js', path + '/app/models/User.js')
				complete()
			})

			mkdir(path + '/app/views', function () {
				mkdir(path + '/app/views/home', function(){
					switch (program.view) {
						case 'dust':
							copyTemplate('dust/index.dust', path + '/app/views/home/index.dust')
							break
						case 'ejs':
							copyTemplate('ejs/index.ejs', path + '/app/views/home/index.ejs')
							break
						case 'jade':
							copyTemplate('jade/index.jade', path + '/app/views/home/index.jade')
							break
						case 'hjs':
							copyTemplate('hogan/index.hjs', path + '/app/views/home/index.hjs')
							break
						case 'hbs':
							copyTemplate('hbs/index.hbs', path + '/app/views/home/index.hbs')
							break
						case 'pug':
							copyTemplate('pug/index.pug', path + '/app/views/home/index.pug')
							break
						case 'twig':
							copyTemplate('twig/index.twig', path + '/app/views/home/index.twig')
							break
						case 'vash':
							copyTemplate('vash/index.vash', path + '/app/views/home/index.vash')
							break
					}
					complete()
				});

				mkdir(path + '/app/views/layouts', function() {
					switch (program.view) {
						case 'dust':
							copyTemplate('dust/error.dust', path + '/app/views/error.dust')
							break
						case 'ejs':
							copyTemplate('ejs/error.ejs', path + '/app/views/error.ejs')
							break
						case 'jade':
							copyTemplate('jade/layout.jade', path + '/app/views/layouts/layout.jade')
							copyTemplate('jade/error.jade', path + '/app/views/error.jade')
							break
						case 'hjs':
							copyTemplate('hogan/error.hjs', path + '/app/views/error.hjs')
							break
						case 'hbs':
							copyTemplate('hbs/layout.hbs', path + '/app/views/layouts/layout.hbs')
							copyTemplate('hbs/error.hbs', path + '/app/views/error.hbs')
							break
						case 'pug':
							copyTemplate('pug/layout.pug', path + '/app/views/layouts/layout.pug')
							copyTemplate('pug/error.pug', path + '/app/views/error.pug')
							break
						case 'twig':
							copyTemplate('twig/layout.twig', path + '/app/views/layouts/layout.twig')
							copyTemplate('twig/error.twig', path + '/app/views/error.twig')
							break
						case 'vash':
							copyTemplate('vash/layout.vash', path + '/app/views/layouts/layout.vash')
							copyTemplate('vash/error.vash', path + '/app/views/error.vash')
							break
					}
					complete()
				});
			})

		})

		// CSS Engine support
		switch (program.css) {
			case 'less':
				app.locals.modules.lessMiddleware = 'less-middleware'
				app.locals.uses.push("lessMiddleware(path.join(__dirname, 'public'))")
				break
			case 'stylus':
				app.locals.modules.stylus = 'stylus'
				app.locals.uses.push("stylus.middleware(path.join(__dirname, 'public'))")
				break
			case 'compass':
				app.locals.modules.compass = 'node-compass'
				app.locals.uses.push("compass({ mode: 'expanded' })")
				break
			case 'sass':
				app.locals.modules.sassMiddleware = 'node-sass-middleware'
				app.locals.uses.push("sassMiddleware({\n  src: path.join(__dirname, 'public'),\n  dest: path.join(__dirname, 'public'),\n  indentedSyntax: true, // true = .sass and false = .scss\n  sourceMap: true\n})")
				break
		}

		// Template support
		switch (program.view) {
			case 'dust':
				app.locals.modules.adaro = 'adaro'
				app.locals.view = {
					engine: 'dust',
					render: 'adaro.dust()'
				}
				break
			default:
				app.locals.view = {
					engine: program.view
				}
				break
		}

		// package.json
		var pkg = {
			name: name,
			version: '1.0.0',
			private: true,
			scripts: {
				start: 'nodemon ./bin/www'
			},
			dependencies: {
				'body-parser': '~1.18.2',
				'cookie-parser': '~1.4.3',
				'debug': '~2.6.9',
				"dotenv": "^6.0.0",
				'express': '~4.16.3',
				"express-handlebars": "^3.0.0",
				"express-session": "^1.15.6",
				"handlebars-helpers": "^0.10.0",
				"knex": "0.15.2",
				"knex-pg-store": "^1.1.1",
				'morgan': '~1.9.0',
				"nodemailer": "^4.6.7",
				"nodemailer-express-handlebars": "^3.0.0",
				"nodemon": "^1.14.12",
				'serve-favicon': '~2.4.5',
				"nodemon": "^1.14.12",
				"pg": "^7.4.3",
				"express-mvc-router": "^1.0.0",
				"connect-flash": "^0.1.1",
			}
		}

		switch (program.view) {
			case 'dust':
				pkg.dependencies.adaro = '~1.0.4'
				break
			case 'jade':
				pkg.dependencies['jade'] = '~1.11.0'
				break
			case 'ejs':
				pkg.dependencies['ejs'] = '~2.5.7'
				break
			case 'hjs':
				pkg.dependencies['hjs'] = '~0.0.6'
				break
			case 'hbs':
				pkg.dependencies['hbs'] = '~4.0.1'
				break
			case 'pug':
				pkg.dependencies['pug'] = '2.0.0-beta11'
				break
			case 'twig':
				pkg.dependencies['twig'] = '~0.10.3'
				break
			case 'vash':
				pkg.dependencies['vash'] = '~0.12.2'
				break
		}

		// CSS Engine support
		switch (program.css) {
			case 'less':
				pkg.dependencies['less-middleware'] = '~2.2.1'
				break
			case 'compass':
				pkg.dependencies['node-compass'] = '0.2.3'
				break
			case 'stylus':
				pkg.dependencies['stylus'] = '0.54.5'
				break
			case 'sass':
				pkg.dependencies['node-sass-middleware'] = '0.9.8'
				break
		}

		// sort dependencies like npm(1)
		pkg.dependencies = sortedObject(pkg.dependencies)

		// write files
		write(path + '/package.json', JSON.stringify(pkg, null, 2) + '\n')
		write(path + '/index.js', app.render())
		mkdir(path + '/bin', function () {
			write(path + '/bin/www', www.render(), MODE_0755)
			complete()
		})

		if (program.git) {
			copyTemplate('js/gitignore', path + '/.gitignore')
		}

		complete()
	})
}

/**
 * Create an app name from a directory path, fitting npm naming requirements.
 *
 * @param {String} pathName
 */

function createAppName (pathName) {
	return path.basename(pathName)
		.replace(/[^A-Za-z0-9.()!~*'-]+/g, '-')
		.replace(/^[-_.]+|-+$/g, '')
		.toLowerCase()
}

/**
 * Check if the given directory `path` is empty.
 *
 * @param {String} path
 * @param {Function} fn
 */

function emptyDirectory (path, fn) {
	fs.readdir(path, function (err, files) {
		if (err && err.code !== 'ENOENT') throw err
		fn(!files || !files.length)
	})
}

/**
 * Graceful exit for async STDIO
 */

function exit (code) {
	// flush output for Node.js Windows pipe bug
	// https://github.com/joyent/node/issues/6247 is just one bug example
	// https://github.com/visionmedia/mocha/issues/333 has a good discussion
	function done () {
		if (!(draining--)) _exit(code)
	}

	var draining = 0
	var streams = [process.stdout, process.stderr]

	exit.exited = true

	streams.forEach(function (stream) {
		// submit empty write request and wait for completion
		draining += 1
		stream.write('', done)
	})

	done()
}

/**
 * Determine if launched from cmd.exe
 */

function launchedFromCmd () {
	return process.platform === 'win32' &&
		process.env._ === undefined
}

/**
 * Load template file.
 */

function loadTemplate (name) {
	var contents = fs.readFileSync(path.join(__dirname, '..', 'templates', (name + '.ejs')), 'utf-8')
	var locals = Object.create(null)

	function render () {
		return ejs.render(contents, locals)
	}

	return {
		locals: locals,
		render: render
	}
}

/**
 * Main program.
 */

function main () {
	// Path
	var destinationPath = program.args.shift() || '.'

	// App name
	var appName = createAppName(path.resolve(destinationPath)) || 'hello-world'

	// View engine
	if (program.view === undefined) {
		if (program.ejs) program.view = 'ejs'
		if (program.hbs) program.view = 'hbs'
		if (program.hogan) program.view = 'hjs'
		if (program.pug) program.view = 'pug'
	}

	// Default view engine
	if (program.view === undefined) {
	//	warning('the default view engine will not be handlebars in future releases\n' +
	//		"use `--view=hbs' or `--help' for additional options")
		program.view = 'hbs'
	}

	// Generate application
	emptyDirectory(destinationPath, function (empty) {
		if (empty || program.force) {
			createApplication(appName, destinationPath)
		} else {
			confirm('destination is not empty, continue? [y/N] ', function (ok) {
				if (ok) {
					process.stdin.destroy()
					createApplication(appName, destinationPath)
				} else {
					console.error('aborting')
					exit(1)
				}
			})
		}
	})
}

/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */

function mkdir (path, fn) {
	mkdirp(path, MODE_0755, function (err) {
		if (err) throw err
		console.log('   \x1b[36mcreate\x1b[0m : ' + path)
		fn && fn()
	})
}

/**
 * Generate a callback function for commander to warn about renamed option.
 *
 * @param {String} originalName
 * @param {String} newName
 */

function renamedOption (originalName, newName) {
	return function (val) {
		warning(util.format("option `%s' has been renamed to `%s'", originalName, newName))
		return val
	}
}

/**
 * Display a warning similar to how errors are displayed by commander.
 *
 * @param {String} message
 */

function warning (message) {
	console.error()
	message.split('\n').forEach(function (line) {
		console.error('  warning: %s', line)
	})
	console.error()
}

/**
 * echo str > path.
 *
 * @param {String} path
 * @param {String} str
 */

function write (path, str, mode) {
	fs.writeFileSync(path, str, { mode: mode || MODE_0666 })
	console.log('   \x1b[36mcreate\x1b[0m : ' + path)
}
