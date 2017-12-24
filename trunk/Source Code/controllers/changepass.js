exports.getChangePass = function(pool) {
	return function (req, res) {
					req.session.ss = "null";
					req.session.desc = "null";
					var obj = JSON.stringify(req.session.merchant);
					var obj1 = JSON.parse(obj);
					res.render("changepass", {id:JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc});
	};
};
	

exports.postChangePass = function(app) {
	return function (req, res) {
		var passwordHash = require('password-hash');
		var API = require('phone-number-validation');
		var api = new API({
			access_key: '7a36028f4329ab7d'
		});
		var obj = JSON.stringify(req.session.merchant);
					var obj1 = JSON.parse(obj);
					app.DB
					.select("*")
					.from("merchants")
					.where("Id", JSON.stringify(obj1.Id))
					.where("password", req.body.curpass)
					.then(function(result1) {
						//Nếu chưa có thì tạo mới rồi tạo giao dịch
						if (result1[0] == undefined){
							req.session.ss = "Thất bại";
							req.session.desc = "Mật khẩu hiện tại không đúng. Vui lòng nhập lại";
							res.render("changepass", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
						}
						else {
								if(req.body.conpass == req.body.reconpass){
									app.DB
													.table("merchants")
													.where("Id", JSON.stringify(obj1.Id))
													.update("password", passwordHash.generate(req.body.conpass))
													.then(function(result2) {
														if (result2[0] == undefined){
															req.session.ss = "Thành công";
															req.session.desc = "Đổi mật khẩu thành công";
															res.render("changepass", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
														}
															else{
																req.session.ss = "Thất bại";
																req.session.desc = "Lỗi hệ thống";
																res.render("changepass", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
														}
												})
												.catch(function(err2){
														req.session.ss = "Thất bại";
														req.session.desc = "Lỗi hệ thống";
														res.render("changepass", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
												});
								}
								else{
									req.session.ss = "Thất bại";
									req.session.desc = "Mật khẩu xác nhận không đúng. Vui lòng nhập lại";
									res.render("changepass", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
								}
							 }
						})
						.catch(function(err1){
								req.session.ss = "Thất bại";
								req.session.desc = "Lỗi hệ thống";
								res.render("changepass", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
						});
	};
};