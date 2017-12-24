exports.getBuyProduct = function(pool) {
	return function (req, res) {
					req.session.ss = "null";
					req.session.desc = "null";
					var obj = JSON.stringify(req.session.merchant);
					var obj1 = JSON.parse(obj);
					res.render("buyproduct", {id:JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc});
	};
};
	

exports.postBuyProduct = function(app) {
	return function (req, res) {
		var obj = JSON.stringify(req.session.merchant);
		var obj1 = JSON.parse(obj);

					app.DB
					.select("*")
					.from("customers")
					.where("phone_number", req.body.sdt)
					.then(function(result1) {
						if (result1[0] == undefined){
							req.session.ss = "Thất bại";
							req.session.desc = "Số điện thoại không thuộc tài khoản nào. Vui lòng đăng ký để thanh toán";
							res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
						}
						else {
							// app.DB
							// 	.select("*")
							// 	.from("merchants")
							// 	.where("phone_number", req.body.sdt)
							// 	.then(function(result1000000){
							// 	if (result1000000[0] == undefined)
							// 	{	
									// if(parseInt(result1[0].outs_balance) < parseInt(req.body.gtdh))
								// {
								// 	req.session.ss = "Thất bại";
								// 	req.session.desc = "Giá trị đơn hàng vượt quá số dư hiện tại. Vui lòng kiểm tra lại"
								// 	res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc});
								// }
								// else{

									req.session.customer = result1[0];
									var obj = JSON.stringify(req.session.merchant);
									var obj1 = JSON.parse(obj);
									var test = 0;
									test = Math.floor(1000 + (10000 - 1000) * Math.random());
									var otp = test;
											app.DB
											.table("otp_requests")
											.insert({
												otp_code: otp,
												merchant_id: JSON.stringify(obj1.Id),
												customer_id: result1[0].Id,
												created_at: new Date()
											})
											.then(function(result2) {
											if (result2[0] == undefined){
													app.DB
													.select("*")
													.from("otp_requests")
													.where("merchant_id", JSON.stringify(obj1.Id))
													.where("customer_id", result1[0].Id)
													.limit(1)
													.orderBy("Id", "desc")
													.then(function(result3) {
														if (result3[0] == undefined){
															req.session.ss = "Thất bại";
															req.session.desc = "Lỗi hệ thống";
															res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc});
														}
														else {
															if(req.body.makm == ""){
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
																  to: result1[0].email,
																  subject: 'Dịch vụ thanh toán bằng ví điện tử',
																  text: 'Cảm ơn bạn đã sử dụng dịch vụ thanh toán tại' + JSON.stringify(obj1.full_name) + '. Giá trị đơn hàng: '+ req.body.gtdh +'. Mã OTP của bạn là: ' + result3[0].otp_code.toString() +'. Sử dụng mã để hoàn tất thanh toán. Mọi chi tiết liên hệ: 01636439935'
																};

																transporter.sendMail(mailOptions, function(error, info){
																  if (error) {
																    console.log(error);
																  } else {
																    console.log('Email sent: ' + info.response);
																  }
																});
																console.log(result3[0].otp_code.toString());
																req.session.ss = "null";
																req.session.desc = "null";
																//req.session.makm = "null";

																			var email = JSON.stringify(mailOptions);
																			var email1 = JSON.parse(email);
																			app.DB
																			.table("otc_emails")
																			.insert({
																				customer_id: result1[0].Id,
																				email: result1[0].email,
																				coupon_purchase_id: null,
																				coupon_redeem_id: null,
																				email_type_id: 1,
																				email_content: JSON.stringify(email1.text),
																				otp_request_id: result3[0].Id,
																				created_at: new Date(),
																				updated_at: null
																			})
																			.then(function(result8) {
																			if (result8[0] == undefined){	
																				res.render("payment", {id:JSON.stringify(obj1.full_name), otp: result3[0].otp_code.toString(),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: "null"});	
																			}
																			else{
																					req.session.ss = "Thất bại";
																					req.session.desc = "Lỗi hệ thống";
																					res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																			}

																			})
																				.catch(function(err8){
																				req.session.ss = "Thất bại";
																				req.session.desc = "Lỗi hệ thống";
																				res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																			
																			});




																
															}
															else{
																app.DB
																.select("*")
																.from("promotion_details")
																.where("code", req.body.makm)
																.then(function(result4) {
																if (result4[0] == undefined){
																	req.session.ss = "Thất bại";
																	req.session.desc = "Không tồn tại mã khuyến mại hợp lệ. Vui lòng kiểm tra lại";
																	res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																}
																else{

																	app.DB
																	.select("*")
																	.from("promotions")
																	.where("Id", result4[0].promotion_id)
																	.where("status", 1)
																	//.whereRaw("quantity > ?", ["quantity.used"])
																	.where("promo_user", 1)
																	.where("promo_transaction", 1)
																	.then(function(result5) {
																	if (result5[0] == undefined){
																		req.session.ss = "Thất bại";
																		req.session.desc = "Mã khuyến mại không hợp lệ. Vui lòng kiểm tra lại";
																		res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
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
																			  to: result1[0].email,
																			  subject: 'Dịch vụ thanh toán bằng phiếu ví điện tử',
																			  text: 'Cảm ơn bạn đã sử dụng dịch vụ thanh toán tại' + JSON.stringify(obj1.full_name) + '. Giá trị đơn hàng: '+ req.body.gtdh +'. Giao dịch được nhận khuyến mại từ chương trình "'+ result5[0].name +'". Mã OTP của bạn là: ' + result3[0].otp_code.toString() +'. Sử dụng mã để hoàn tất thanh toán. Mọi chi tiết liên hệ: 01636439935'
																			};

																			transporter.sendMail(mailOptions, function(error, info){
																			  if (error) {
																			    console.log(error);
																			  } else {
																			    console.log('Email sent: ' + info.response);
																			  }
																			});
																			console.log(result3[0].otp_code.toString());
																			req.session.ss = "null";
																			req.session.desc = "null";
																			//req.session.makm = "null";


																			var email1 = JSON.stringify(mailOptions);
																						var email2 = JSON.parse(email1);
																						app.DB
																						.table("otc_emails")
																						.insert({
																							customer_id: result1[0].Id,
																							email: result1[0].email,
																							coupon_purchase_id: null,
																							coupon_redeem_id: null,
																							email_type_id: 2,
																							email_content: JSON.stringify(email2.text),
																							otp_request_id: result3[0].Id,
																							created_at: new Date(),
																							updated_at: null
																						})
																						.then(function(result9) {
																						if (result9[0] == undefined){	
																							res.render("payment", {id:JSON.stringify(obj1.full_name), otp: result3[0].otp_code.toString(),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm});	
																						}
																						else{
																								req.session.ss = "Thất bại";
																								req.session.desc = "Lỗi hệ thống";
																								res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																						}

																						})
																							.catch(function(err9){
																							req.session.ss = "Thất bại";
																							req.session.desc = "Lỗi hệ thống";
																							res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																						
																						});


																			
																	}

																	})
																	.catch(function(err5){
																	req.session.ss = "Thất bại";
																	req.session.desc = "Lỗi hệ thống";
																	res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																					
																	});				
																	}
																	})
																	.catch(function(err4){
																	req.session.ss = "Thất bại";
																	req.session.desc = "Lỗi hệ thống";
																	res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																					
																	});
															}
														}
													})
													.catch(function(err3){
															req.session.ss = "Thất bại";
															req.session.desc = "Lỗi hệ thống";
															res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc});
													});
											}
											else {
												req.session.ss = "Thất bại";
												req.session.desc = "Lỗi hệ thống";
												res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc});
											}
										})
										.catch(function(err2){
												req.session.ss = "Thất bại";
												req.session.desc = "Lỗi hệ thống";
												res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc});
										});
								 
								// }
						// 		}
						// 			else{
						// 				req.session.ss = "Thất bại";
						// 				req.session.desc = "Số điện thoại thuộc tài khoản cửa hàng. Vui lòng đăng ký tài khoản để nạp tiền"
						// 				res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc});
						// 			}
						// 			})
						// 			.catch(function(err1000000){
						// 				req.session.ss = "Thất bại";
						// 				req.session.desc = "Lỗi hệ thống";
						// 				res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc});
						// 			});
						}
						
						})
						.catch(function(err1){
								req.session.ss = "Thất bại";
								req.session.desc = "Lỗi hệ thống";
								res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc});
						});
		
	};
};