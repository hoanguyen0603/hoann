var knex = require('knex');
var db = knex({
	client: 'pg',
	connection: {
		user: 'postgres',
		database: 'flash',
		password: '123',
		host: 'localhost',
	}
})

module.exports = db;