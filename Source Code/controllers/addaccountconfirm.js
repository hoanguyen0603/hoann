exports.getSignUp = function(pool) {
	return function (req, res) {
					req.session.ss = "null";
					req.session.desc = "null";
					var obj = JSON.stringify(req.session.merchant);
					var obj1 = JSON.parse(obj);
					res.render("addaccountconfirm", {id:JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),ss:req.session.ss, desc:req.session.desc});
	};
};
	

exports.postSignUp = function(app) {
	return function (req, res) {
					var obj = JSON.stringify(req.session.merchant);
					var obj1 = JSON.parse(obj);

					if(req.body.ma_otp == req.body.otp){
						app.DB
						.table("customers")
						.where("Id", req.body.makh)
						.update("status_id", 1)
						.then(function(result4){
						if (result4[0] == undefined)
						{
							app.DB
							.select("*")
							.from("customers")
							.where("Id", req.body.makh)
							.then(function(result4) {
							if (result4[0] == undefined){
								req.session.ss = "Thất bại";
								req.session.desc = "Lỗi hệ thống";
								res.render("addaccountconfirm", {id:JSON.stringify(obj1.full_name), otp: req.body.otp, goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),ss:req.session.ss, desc:req.session.desc, otp: req.body.otp, cus: req.body.makh});												
							}
							else{
								var d = new Date(); 
								d.setDate(d.getDate() + 1);

																						app.DB
																						.table("promotion_details")
																						.insert({
																							promotion_id: 7,
																							rule2bemet: result4[0].Id,
																							rule_type: 1,
																							description: null,
																							balance_description: null,
																							code: 'WELCOME',
																							code_noti: 1,
																							code_noti_content: null,
																							date_start: new Date(),
																							date_end: d,
																							created_at: new Date(),
																							updated_at: null
																						})
																						.then(function(result9) {
																						if (result9[0] == undefined){	
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
																			  to: result4[0].email,
																			  subject: 'Dịch vụ thanh toán bằng ví điện tử',
																			  text: 'Cảm ơn bạn đã đăng ký sử dụng dịch vụ nạp tiền vào ví tại ' + JSON.stringify(obj1.full_name) + '. Với mỗi giao dịch mua hàng bạn sẽ nhận được chiết khẩu mặc định từ công ti. Sử dụng mã khuyến mại "WELCOME" để nhận khuyến mại 2% trong ngày thanh toán đầu tiên. Mọi chi tiết liên hệ: 01636439935'
																			};

																			transporter.sendMail(mailOptions, function(error, info){
																			  if (error) {
																			    console.log(error);
																			  } else {
																			    console.log('Email sent: ' + info.response);
																			  }
																			});
																			req.session.ss = "null";
																			req.session.desc = "null";
																			var email = JSON.stringify(mailOptions);
																			var email1 = JSON.parse(email);
																			app.DB
																			.table("otc_emails")
																			.insert({
																				customer_id: result4[0].Id,
																				email: result4[0].email,
																				coupon_purchase_id: null,
																				coupon_redeem_id: null,
																				email_type_id: 5,
																				email_content: JSON.stringify(email1.text),
																				otp_request_id: null,
																				created_at: new Date(),
																				updated_at: null
																			})
																			.then(function(result8) {
																			if (result8[0] == undefined){	
																				req.session.ss = "Thành công";
																				req.session.desc = "Đăng ký tài khoản thành công";
																				res.render("addaccount", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																			}
																			else{
																					req.session.ss = "Thất bại";
																					req.session.desc = "Lỗi hệ thống";
																					res.render("addaccountconfirm", {id:JSON.stringify(obj1.full_name), otp: req.body.otp, goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),ss:req.session.ss, desc:req.session.desc, otp: req.body.otp, cus: req.body.makh});												
																			}

																			})
																				.catch(function(err8){
																				req.session.ss = "Thất bại";
																				req.session.desc = "Lỗi hệ thống";
																				res.render("addaccountconfirm", {id:JSON.stringify(obj1.full_name), otp: req.body.otp, goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),ss:req.session.ss, desc:req.session.desc, otp: req.body.otp, cus: req.body.makh});												
																			
																			});
																						}
																						else{
																								req.session.ss = "Thất bại";
																								req.session.desc = "Lỗi hệ thống";
																								res.render("addaccountconfirm", {id:JSON.stringify(obj1.full_name), otp: req.body.otp, goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),ss:req.session.ss, desc:req.session.desc, otp: req.body.otp, cus: req.body.makh});												
																						}

																						})
																							.catch(function(err9){
																							req.session.ss = "Thất bại";
																							req.session.desc = "Lỗi hệ thống";
																							res.render("addaccountconfirm", {id:JSON.stringify(obj1.full_name), otp: req.body.otp, goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),ss:req.session.ss, desc:req.session.desc, otp: req.body.otp, cus: req.body.makh});												
																						
																						});
																			
								}
							})
								.catch(function(err4){
								req.session.ss = "Thất bại";
								req.session.desc = "Lỗi hệ thống";
								res.render("addaccountconfirm", {id:JSON.stringify(obj1.full_name), otp: req.body.otp, goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),ss:req.session.ss, desc:req.session.desc, otp: req.body.otp, cus: req.body.makh});												
																			
							});
							
						}
						
						else 
						{
							req.session.ss = "Thất bại";
							req.session.desc = "Lỗi hệ thống2";
							res.render("addaccountconfirm", {id:JSON.stringify(obj1.full_name), otp: req.body.otp, goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),ss:req.session.ss, desc:req.session.desc, otp: req.body.otp, cus: req.body.makh});												
						}
						})
						.catch(function(err4){
							req.session.ss = "Thất bại";
							req.session.desc = "Lỗi hệ thống1";
							res.render("addaccountconfirm", {id:JSON.stringify(obj1.full_name), otp: req.body.otp, goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),ss:req.session.ss, desc:req.session.desc, otp: req.body.otp, cus: req.body.makh});						
						});
																						
					}
					else
					{
						req.session.ss = "Thất bại";
						req.session.desc = "Nhập sai mã xác nhận. Vui lòng kiểm tra lại";
						res.render("addaccountconfirm", {id:JSON.stringify(obj1.full_name), otp: req.body.otp, goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc, cus: req.body.makh});	
					}
					
	};
};