exports.postLogin = function(app) {
	return function (req, res) {
	var passwordHash = require('password-hash');
	var API = require('phone-number-validation');
	var api = new API({
		access_key: '7a36028f4329ab7d'
	});

	// api.validate(req.body.id, function (err, result) {
	// if (err) {
 //    	return console.log('Validate Callback (Error): ' + JSON.stringify(err));
	// }
	// else{
	// 	console.log('Validate Callback (Success): ' + JSON.stringify(result));
	// }
    
	// });


		app.DB
		.select("*")
		.from("merchants")
		.where("phone_number", req.body.id)
		.where("status_id", 1)
		//.where("password", req.body.pass)
		.then(function(result) {
			if (result[0] == undefined){
				req.session.ss = "Thất bại";
				req.session.desc = "Số điện thoại không đúng. Vui lòng nhập lại"
				res.render("login",{ss:req.session.ss, desc:req.session.desc}); 
			}
			else {

				if(passwordHash.verify(req.body.pass, result[0].password) == true){
					req.session.merchant = result[0];
					res.redirect("./flash/home");
				}
				else{
					req.session.ss = "Thất bại";
					req.session.desc = "Mật khẩu không đúng. Vui lòng nhập lại"
					res.render("login",{ss:req.session.ss, desc:req.session.desc}); 
				}
				
			}
		})
		.catch(function(err){
			console.log(err);
				req.session.ss = "Thất bại";
				req.session.desc = "Lỗi hệ thống"
				res.render("login",{ss:req.session.ss, desc:req.session.desc}); 
		});
	
	};
};

exports.getLogin = function(app) {
	return function (req, res) {
		req.session.ss = "null";
		req.session.desc = "null";
		res.render("login",{ss:req.session.ss, desc:req.session.desc}); 
	};
};


