const User = require('../models/User');

class Home {
	constructor(){}

	async index(req, res){
		let user = new User();

		let allUsers = await user.findAll();

		res.render('home/index', {
			title: 'Express Boilerplate Home',
			error: req.flash("error"),
			success: req.flash("success"),
			session: req.session,
			allUsers: allUsers
		});

	}

}


module.exports = new Home();
