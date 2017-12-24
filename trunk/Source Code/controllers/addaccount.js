exports.getAddAccount = function(pool) {
	return function (req, res) {
					req.session.ss = "null";
					req.session.desc = "null";
					var obj = JSON.stringify(req.session.merchant);
					var obj1 = JSON.parse(obj);
					res.render("addaccount", {id:JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc});
	};
};
	

exports.postAddAccount = function(app) {
	return function (req, res) {
		var obj = JSON.stringify(req.session.merchant);
		var obj1 = JSON.parse(obj);
					app.DB
					.select("*")
					.from("customers")
					.where("phone_number", req.body.sdtkh)
					.where("status_id", 1)
					.then(function(result1) {
						if (result1[0] == undefined){
							app.DB
							.select("*")
							.from("merchants")
							.where("phone_number", req.body.sdtkh)
							.then(function(result2) {
								if (result2[0] == undefined){
									app.DB
									.table("customers")
									.insert({merchant_id: JSON.stringify(obj1.Id), 
											full_name: req.body.tenkh.toString(), 
											phone_number: req.body.sdtkh, 
											email: req.body.emailkh, 
											status_id: 2, 
											outs_balance: '0', 
											attemps: '0', 
											created_at: new Date(),
											updated_at: null}) 
									.then(function(result3) {
										//Nếu thêm mới tài khoản thành công thì thêm giao dịch
										if (result3[0] == undefined){

												app.DB
												.select("*")
												.from("customers")
												.where("phone_number", req.body.sdtkh)
												.then(function(result200) {
													//Nếu chưa có thì tạo mới rồi tạo giao dịch
													if (result200[0] == undefined){
														req.session.ss = "Thất bại";
														req.session.desc = "Lỗi hệ thống"
														res.render("addaccount", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
													}
													else {

														var test = 0;
														test = Math.floor(1000 + (10000 - 1000) * Math.random());
														var otp = test;
															app.DB
															.table("otp_requests")
															.insert({
																otp_code: otp,
																merchant_id: JSON.stringify(obj1.Id),
																customer_id: result200[0].Id,
																created_at: new Date()
															})
															.then(function(result29) {
															if (result29[0] == undefined){	
																app.DB
																.select("*")
																.from("otp_requests")
																.where("merchant_id", JSON.stringify(obj1.Id))
																.where("customer_id", result200[0].Id)
																.limit(1)
																.orderBy("Id", "desc")
																.then(function(result39) {
																if (result39[0] == undefined){
																		req.session.ss = "Thất bại";
																		req.session.desc = "Lỗi hệ thống";
																		res.render("addaccount", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																	}
																	else{
																							var nodemailer = require('nodemailer');
																							var transporter = nodemailer.createTransport({
																							service: 'gmail',
																							  auth: {
																							    user: 'ngochoannh95@gmail.com',
																							    pass: 'hoann0603'
																							  }
																							});
																							var mailOptions = {
																							  from: 'ngochoannh95@gmail.com',
																							  to: result200[0].email,
																							  subject: 'Dịch vụ thanh toán bằng ví điện tử',
																							  text: 'Cảm ơn bạn đã đăng ký sử dụng dịch vụ thanh toán tại' + JSON.stringify(obj1.full_name) + '. Mã OTP của bạn là: ' + result39[0].otp_code.toString() +'. Sử dụng mã để hoàn tất đăng ký. Mọi chi tiết liên hệ: 01636439935'
																							};

																							transporter.sendMail(mailOptions, function(error, info){
																							  if (error) {
																							    console.log(error);
																							  } else {
																							    console.log('Email sent: ' + info.response);
																							  }
																							});
																							console.log(result39[0].otp_code.toString());
																							
																							var email = JSON.stringify(mailOptions);
																										var email1 = JSON.parse(email);
																										app.DB
																										.table("otc_emails")
																										.insert({
																											customer_id: result200[0].Id,
																											email: result200[0].email,
																											coupon_purchase_id: null,
																											coupon_redeem_id: null,
																											email_type_id: 4,
																											email_content: JSON.stringify(email1.text),
																											otp_request_id: result39[0].Id,
																											created_at: new Date(),
																											updated_at: null
																										})
																										.then(function(result8) {
																										if (result8[0] == undefined){	
																											req.session.ss = "null";
																											req.session.desc = "null";
																											res.render("addaccountconfirm", {id:JSON.stringify(obj1.full_name), otp: result39[0].otp_code.toString(),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc, cus: result200[0].Id});	
																										}
																										else{
																												req.session.ss = "Thất bại";
																												req.session.desc = "Lỗi hệ thống";
																												res.render("addaccount", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																										}

																										})
																											.catch(function(err8){
																											req.session.ss = "Thất bại";
																											req.session.desc = "Lỗi hệ thống";
																											res.render("addaccount", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																										
																										});
												
																		
																	}
																	})
																	.catch(function(err39){
																		req.session.ss = "Thất bại";
																		req.session.desc = "Lỗi hệ thống";
																		res.render("addaccount", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																			
																	});
																}
															else
															{
																req.session.ss = "Thất bại";
																req.session.desc = "Lỗi hệ thống";
																res.render("addaccount", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																						
															}
															})
															.catch(function(err29){
																req.session.ss = "Thất bại";
																req.session.desc = "Lỗi hệ thống";
																res.render("addaccount", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
															});
												
													}
													})
													.catch(function(err200){
															req.session.ss = "Thất bại";
															req.session.desc = "Lỗi hệ thống"
															res.render("addaccount", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
													});
												
										}
										else {
												req.session.ss = "Thất bại";
												req.session.desc = "Đăng ký thất bại"
												res.render("addaccount", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
										
											 }
										})
										.catch(function(err3){
												req.session.ss = "Thất bại";
												req.session.desc = "Lỗi hệ thống"
												res.render("addaccount", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
										});
								}
								else {
												req.session.ss = "Thất bại";
												req.session.desc = "Số điện thoại thuộc tài khoản đại lý. Vui lòng sử dụng số điện thoại khác để đăng ký"
												res.render("addaccount", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
									 }
								})
								.catch(function(err2){
										req.session.ss = "Thất bại";
										req.session.desc = "Lỗi hệ thống"
										res.render("addaccount", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
								});
						}
						else {
								req.session.ss = "Thất bại";
								req.session.desc = "Số điện thoại đã là số điện thoại khách hàng của hệ thống. Vui lòng sử dụng số điện thoại khác để đăng ký"
								res.render("addaccount", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
							 }
						})
						.catch(function(err1){
								req.session.ss = "Thất bại";
								req.session.desc = "Lỗi hệ thống"
								res.render("addaccount", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
						});
	};
};