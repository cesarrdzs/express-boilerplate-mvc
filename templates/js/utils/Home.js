const User = require('../models/User');

module.exports = class DefaultController {
	constructor(){}

	async index(){
		this.render({
			title: 'Express Boilerplate Default',
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