const KnexDB = require('../../common/KnexDB');

class User {

	constructor(schema){
		this.schema = schema;
		this.knex = KnexDB.getConnection();
	}

	findAll() {
		return this.knex.withSchema(this.schema)
		.select('*')
		.from('users');
	}

	findById(userId){
		return this.knex.withSchema(this.schema)
		.select('*')
		.from('users')
		.where('user_id', userId);
	}
};

module.exports = User;
