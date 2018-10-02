const Home = require('../app/controllers/Home');
//you can include all your controllers

module.exports = function (app) {

		app.get('/', (req, res) => { Home.index(req, res) } );

}
