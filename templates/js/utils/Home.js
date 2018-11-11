const User = require('../models/User');

module.exports = class HomeController {
	constructor(){}

	async index(){
		this.res.render('home/index', {
			title: 'Express Boilerplate Home',
			error: req.flash("error"),
			success: req.flash("success"),
			session: req.session,
			allUsers: allUsers
		});
	}

	async getUsers(){
		try {
			let user = new User();
			let allUsers = await user.findAll();
			this.res.json(allUsers);
		}catch(error){
			this.res.json({
				message: error.message
			})
		}
	}


}