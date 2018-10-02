const DB = require('../common/database');

class Utils {
	constructor() {}

	loggedIn(req, res, next) {
		if (req.session.isLogged) {
			if (req.session.schema != req.subdomains[0]) {
				req.session.destroy();
				res.redirect('/login');
			}
			next();
		} else {
			res.redirect('/login');
		}
	}

	moneyCommas(ammount) {
		return (parseFloat(ammount).toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}


}

module.exports = new Utils();
