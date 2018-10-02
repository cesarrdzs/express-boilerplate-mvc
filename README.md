[![Express Logo](https://i.cloudup.com/zfY6lL7eFa-3000x3000.png)](http://expressjs.com/)

[Express](http://expressjs.com/) application generator.

- [Node.js](https://nodejs.org/en/)
- [Expressjs](https://www.npmjs.com/package/express)
- [Knex](https://knexjs.org/)

## Installation

```sh
$ npm install -g express-boilerplate-mvc
```

## Quick Start

The quickest way to get started with express is to utilize the executable `express(1)` to generate an application as shown below:

Create the app:

```bash
$ express-boilerplate --view=hbs /tmp/myapp && cd /tmp/myapp
```

Install dependencies:

```bash
$ npm install
```

Start your Express.js app at `http://localhost:3000/`:

```bash
$ npm start
```

## Command Line Options

This generator can also be further configured with the following command line flags.

				--version        output the version number
		-e, --ejs            add ejs engine support
				--pug            add pug engine support
				--hbs            add handlebars engine support
		-H, --hogan          add hogan.js engine support
		-v, --view <engine>  add view <engine> support (dust|ejs|hbs|hjs|jade|pug|twig|vash) (defaults to jade)
		-c, --css <engine>   add stylesheet <engine> support (less|stylus|compass|sass) (defaults to plain css)
				--git            add .gitignore
		-f, --force          force on non-empty directory
		-h, --help           output usage information

## License

[MIT](LICENSE)

Inspired/forked on [express-generator](https://npmjs.org/package/express-generator)
