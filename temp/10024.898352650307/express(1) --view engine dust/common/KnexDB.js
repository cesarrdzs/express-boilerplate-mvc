const knex = require('knex');

class KnexDB {

	constructor() {
		this.db = knex({
			client: 'pg',
			connection: {
				host: process.env.DB_HOST,
				port: process.env.DB_PORT,
				database: process.env.DB_NAME,
				user: process.env.DB_USER,
				password: process.env.DB_PASS
			}
		});
	}

	getConnection() {
		return this.db;
	}

}

module.exports = new KnexDB();
