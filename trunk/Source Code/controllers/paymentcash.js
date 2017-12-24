exports.getPaymentCash = function(pool) {
	return function (req, res) {
					req.session.ss = "null";
					req.session.desc = "null";
					var obj = JSON.stringify(req.session.merchant);
					var obj1 = JSON.parse(obj);
					res.render("paymentcash", {id:JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc});
	};
};
	

exports.postPaymentCash = function(app, pool) {
	return function (req, res) {
		var obj = JSON.stringify(req.session.merchant);
		var obj1 = JSON.parse(obj);
		req.session.ss = "null";
		req.session.desc = "null";		
		pool.connect(function(err, client, done)
		{
			if(err){
				return console.error('Lỗi hệ thống. Vui lòng trở lại sau vài phút',err);
			}
			client.query('select * from coupons order by value ASC', function(err, result){
				done();

				if(err){
					res.end();
					req.session.ss = "Thất bại";
					req.session.desc = "Lỗi hệ thống";
					res.render("buycash", {data:result, data:result, id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
				}
				else
				{
					if(req.body.ma_otp == req.body.otp){
							app.DB
							.table("coupon_purchases")
							.insert({merchant_id: JSON.stringify(obj1.Id),
									customer_id : req.body.makh,
									payment_method: 1,
									created_at: new Date(),
									updated_at: null,
									cash_value: req.body.gtphieu})
							.then(function(result3) {
								if (result3[0] == undefined){
									//res.end("Tạo giao dịch thành công");
												app.DB
												.select("*")
												.from("coupon_purchases")
												//.max("Id")
												.where("merchant_id", JSON.stringify(obj1.Id))
												.where("customer_id", req.body.makh)
												.limit(1)
												.orderBy("Id", "desc")
												.then(function(result2) {
													//Nếu chưa có thì tạo mới rồi tạo giao dịch
													if (result2[0] == undefined){
														req.session.ss = "Thất bại";
														req.session.desc = "Lỗi hệ thống";
														res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
													}
													else {
															app.DB
															.table("cash_collection")
															.insert({merchant_id: JSON.stringify(obj1.Id),
																	cash_value : req.body.gtphieu,
																	collect_flow: 1,
																	payment_action_id: 12,
																	coupon_purchase_id: result2[0].Id,
																	created_at: new Date(),
																	updated_at: null})
															.then(function(result4) {
																if (result4[0] == undefined){
																	
																	app.DB
																	.select("*")
																	.from("merchants")
																	//.max("Id")
																	.where("Id", JSON.stringify(obj1.Id))
																	.then(function(result20) {
																		//Nếu chưa có thì tạo mới rồi tạo giao dịch
																		if (result20[0] == undefined){
																			req.session.ss = "Thất bại";
																			req.session.desc = "Lỗi hệ thống";
																			res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																		}
																		else {
																			var new_outs_balance = parseInt(req.body.gtphieu) + parseInt(result20[0].outs_balance);
																			app.DB
																			.table("merchants")
																			.where("Id", JSON.stringify(obj1.Id))
																			.update("outs_cash_collection", new_outs_balance)
																			.then(function(result6) {
																				if (result6[0] == undefined){
																					app.DB
																					.table("customer_balances")
																					.insert({customer_id: req.body.makh,
																							payment_action_id: 9,
																							goods_value : req.body.gtphieu,
																							account_flow: 1,
																							coupon_purchase_id: result2[0].Id,
																							coupon_redeem_id: null,
																							created_at: new Date(),
																							updated_at: null})
																					.then(function(result5) {
																						if (result5[0] == undefined){
																							//res.end("Tạo giao dịch customer_balances thành công");
																							app.DB
																							.select("*")
																							.from("customers")
																							//.max("Id")
																							.where("Id", req.body.makh)
																							.then(function(result21){
																								//Nếu chưa có thì tạo mới rồi tạo giao dịch
																								if (result21[0] == undefined){
																									req.session.ss = "Thất bại";
																									req.session.desc = "Lỗi hệ thống";
																									res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																								}
																								else {
																									var new_cus_outs_balance = parseInt(req.body.gtphieu) + parseInt(result21[0].outs_balance);

																									app.DB
																									.table("customers")
																									.where("Id", req.body.makh)
																									.update("outs_balance", new_cus_outs_balance)
																									.then(function(result7){
																										if (result7[0] == undefined){
																											if(req.body.makm == "null"){
																																											app.DB
																																											.select("*")
																																											.from("customers")
																																											.where("Id", req.body.makh)
																																											.then(function(result10000){
																																											if (result10000[0] == undefined){
																																												req.session.ss = "Thất bại";
																																												req.session.desc = "Lỗi hệ thống";
																																												res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
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
																																											  to: result10000[0].email,
																																											  subject: 'Dịch vụ thanh toán bằng ví điện tử',
																																											  text: 'Cảm ơn bạn đã sử dụng dịch vụ nạp tiền vào ví tại ' + JSON.stringify(obj1.full_name) + '. Giá trị phiếu: '+ req.body.gtphieu +'. Số dư tài khoản của bạn là: ' + result10000[0].outs_balance.toString() +'. Mọi chi tiết liên hệ: 01636439935'
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
																																												customer_id: result10000[0].Id,
																																												email: result10000[0].email,
																																												coupon_purchase_id: result2[0].Id,
																																												coupon_redeem_id: null,
																																												email_type_id: 3,
																																												email_content: JSON.stringify(email1.text),
																																												otp_request_id: null,
																																												created_at: new Date(),
																																												updated_at: null
																																											})
																																											.then(function(result1000) {
																																											if (result1000[0] == undefined){	
																																												req.session.ss = "Thành công";
																																												req.session.desc = "Nạp tiền vào ví thành công";
																																												res.render("buycash", {data:result, id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																																											}
																																											else{
																																													req.session.ss = "Thất bại";
																																													req.session.desc = "Lỗi hệ thống";
																																													res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																											}

																																											})
																																												.catch(function(err1000){
																																												req.session.ss = "Thất bại";
																																												req.session.desc = "Lỗi hệ thống";
																																												res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																											
																																											});
																																										}

																																										})
																																										.catch(function(err10000){
																																											req.session.ss = "Thất bại";
																																											req.session.desc = "Lỗi hệ thống";
																																											res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																										
																																										});
																											}
																											else{
																												app.DB
																												.select("*")
																												.from("promotion_details")
																												.where("code", req.body.makm)
																												.where("rule2bemet", req.body.makh)
																												.then(function(result10){
																												if (result10[0] == undefined){
																													req.session.ss = "Thất bại";
																													req.session.desc = "Mã khuyến mại không tồn tại. Vui lòng kiểm tra lại";
																													res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																												}
																												else{
																													app.DB
																													.select("*")
																													.from("promotions")
																													.where("Id", result10[0].promotion_id)
																													.where("status", 1)
																													.where("promo_user", 1)
																													.where("promo_transaction", 2)
																													.then(function(result9){
																													if (result9[0] == undefined){
																														req.session.ss = "Thất bại";
																														req.session.desc = "Mã khuyến mại không hợp lệ. Vui lòng kiểm tra lại";
																														res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																													}
																													else{
																														var km = 0;
																														if(result9[0].value_type == 1){
																															km = result9[0].value;
																														}
																														else if(result9[0].value_type == 2){
																															km = req.body.gtphieu * result9[0].value / 100;
																														}

																														app.DB
																														.table("customer_balances")
																														.insert({customer_id: req.body.makh,
																																payment_action_id: 11,
																																goods_value : km,
																																account_flow: 1,
																																coupon_purchase_id: result2[0].Id,
																																coupon_redeem_id: null,
																																created_at: new Date(),
																																updated_at: null})
																														.then(function(result11){
																															if (result11[0] == undefined){
																																	app.DB
																																	.select("*")
																																	.from("customers")
																																	.where("Id", req.body.makh)
																																	.then(function(result100){
																																	if (result100[0] == undefined){
																																		req.session.ss = "Thất bại";
																																		req.session.desc = "Lỗi hệ thống";
																																		res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																	}
																																	else{
																																		var cus_bal = parseInt(result100[0].outs_balance) + parseInt(km);
																																		app.DB
																																		.table("customers")
																																		.where("Id", req.body.makh)
																																		.update("outs_balance", cus_bal)
																																		.then(function(result12) {
																																			if (result12[0] == undefined){
																																				app.DB
																																				.select("*")
																																				.from("customer_balances")
																																				.where("customer_id", req.body.makh)
																																				.limit(1)
																																				.orderBy("Id", "desc")
																																				.then(function(result13) {
																																				if (result13[0] == undefined){
																																					req.session.ss = "Thất bại";
																																					req.session.desc = "Mua phiếu thất bại";
																																					res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																				}
																																				else{
																																					app.DB
																																					.table("promo_used")
																																					.insert({promotion_id: result9[0].Id,
																																							promotion_value: km,
																																							customer_id: req.body.makh,
																																							merchant_id: JSON.stringify(obj1.Id),
																																							coupon_redeem_id: null,
																																							coupon_purchase_id: result2[0].Id,
																																							customer_balance_id: result13[0].Id,
																																							merchant_balance_id: null,
																																							created_at: new Date(),
																																							updated_at: null})
																																					.then(function(result14) {
																																						if (result14[0] == undefined){
																																							app.DB
																																							.select("*")
																																							.from("promotions")
																																							.where("Id", result9[0].Id)
																																							.then(function(result103) {
																																							if (result103[0] == undefined){
																																								req.session.ss = "Thất bại";
																																								req.session.desc = "Mua phiếu thất bại";
																																								res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																							}
																																							else{
																																									var new_quan = parseInt(result103[0].quantity_used) + 1;

																																									app.DB						
																																									.table("promotions")
																																									.where("Id", result9[0].Id)
																																									.update("quantity_used", new_quan)
																																									.then(function(result15) {
																																										if (result15[0] == undefined){
																																											app.DB
																																											.select("*")
																																											.from("customers")
																																											.where("Id", req.body.makh)
																																											.then(function(result10000){
																																											if (result10000[0] == undefined){
																																												req.session.ss = "Thất bại";
																																												req.session.desc = "Lỗi hệ thống";
																																												res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
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
																																											  to: result10000[0].email,
																																											  subject: 'Dịch vụ thanh toán bằng ví điện tử',
																																											  text: 'Cảm ơn bạn đã sử dụng dịch vụ nạp tiền vào ví tại ' + JSON.stringify(obj1.full_name) + '. Giá trị phiếu: '+ req.body.gtphieu +'. Số dư tài khoản của bạn là: ' + result10000[0].outs_balance.toString() +'. Mọi chi tiết liên hệ: 01636439935'
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
																																												customer_id: result10000[0].Id,
																																												email: result10000[0].email,
																																												coupon_purchase_id: result2[0].Id,
																																												coupon_redeem_id: null,
																																												email_type_id: 3,
																																												email_content: JSON.stringify(email1.text),
																																												otp_request_id: null,
																																												created_at: new Date(),
																																												updated_at: null
																																											})
																																											.then(function(result1000) {
																																											if (result1000[0] == undefined){	
																																												req.session.ss = "Thành công";
																																												req.session.desc = "Nạp tiền vào ví thành công";
																																												res.render("buycash", {data:result, id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																																											}
																																											else{
																																													req.session.ss = "Thất bại";
																																													req.session.desc = "Lỗi hệ thống";
																																													res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																											}

																																											})
																																												.catch(function(err1000){
																																												req.session.ss = "Thất bại";
																																												req.session.desc = "Lỗi hệ thống";
																																												res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																											
																																											});
																																										}

																																										})
																																										.catch(function(err10000){
																																											req.session.ss = "Thất bại";
																																											req.session.desc = "Lỗi hệ thống";
																																											res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																										
																																										});
																																									
																																										
																																									}
																																									else {
																																										req.session.ss = "Thất bại";
																																										req.session.desc = "Lỗi hệ thống";
																																										res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																										}
																																									})
																																									.catch(function(err15){
																																										req.session.ss = "Thất bại";
																																										req.session.desc = "Lỗi hệ thống";
																																										res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																									
																																									});
																																							}
																																							})
																																							.catch(function(err103){
																																							req.session.ss = "Thất bại";
																																							req.session.desc = "Lỗi hệ thống";
																																							res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																							});
																																						}

																																						else{
																																							req.session.ss = "Thất bại";
																																							req.session.desc = "Lỗi hệ thống";
																																							res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																						}
																																						})
																																						.catch(function(err14){
																																						req.session.ss = "Thất bại";
																																						req.session.desc = "Lỗi hệ thống";
																																						res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																						});
																														
																														

																																				}
																																				})
																																				.catch(function(err13){
																																				req.session.ss = "Thất bại";
																																				req.session.desc = "Lỗi hệ thống";
																																				res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																				});

																																			}
																																			else {
																																				req.session.ss = "Thất bại";
																																				req.session.desc = "Nạp tiền vào ví thất bại";
																																				res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																				}
																																			})
																																			.catch(function(err12){
																																			req.session.ss = "Thất bại";
																																			req.session.desc = "Lỗi hệ thống";
																																			res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																			
																																			});
																													
																																	}
																																	})
																																	.catch(function(err100){
																																	req.session.ss = "Thất bại";
																																	req.session.desc = "Lỗi hệ thống";
																																	res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																	});


																					
																															}
																															else {
																																	req.session.ss = "Thất bại";
																																	req.session.desc = "Lỗi hệ thống";
																																	res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																																	
																															}
																															})
																															.catch(function(err11){
																															req.session.ss = "Thất bại";
																															req.session.desc = "Lỗi hệ thống";
																															res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																															});
																											

																														}
																													})
																													.catch(function(err9){
																													req.session.ss = "Thất bại";
																													req.session.desc = "Lỗi hệ thống";
																													res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																												
																													});
																												}
																												})
																												.catch(function(err10){
																												req.session.ss = "Thất bại";
																												req.session.desc = "Lỗi hệ thống";
																												res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																										
																												});
																											}
																										}
																										else
																										{
																											req.session.ss = "Thất bại";
																											req.session.desc = "Lỗi hệ thống";
																											res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																										}
																										})
																										.catch(function(err7){
																											req.session.ss = "Thất bại";
																											req.session.desc = "Lỗi hệ thống";
																											res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																										});
																								}

																								})
																								.catch(function(err21){
																									req.session.ss = "Thất bại";
																									req.session.desc = "Lỗi hệ thống";
																									res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																								});

																						}
																						else {
																							req.session.ss = "Thất bại";
																							req.session.desc = "Lỗi hệ thống";
																							res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																						}
																					})
																					.catch(function(err5){
																						req.session.ss = "Thất bại";
																						req.session.desc = "Lỗi hệ thống";
																						res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																					});
																				}
																				else {
																					req.session.ss = "Thất bại";
																					req.session.desc = "Lỗi hệ thống";
																					res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																				}
																			})
																			.catch(function(err6){
																				req.session.ss = "Thất bại";
																				req.session.desc = "Lỗi hệ thống";
																				res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																			});
																		}
																		})
																			.catch(function(err20){
																			req.session.ss = "Thất bại";
																			req.session.desc = "Lỗi hệ thống";
																			res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),  otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu,ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																		});	
																}
																else {
																	req.session.ss = "Thất bại";
																	req.session.desc = "Lỗi hệ thống";
																	res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),  otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu,ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																}
															})
															.catch(function(err4){
																req.session.ss = "Thất bại";
																req.session.desc = "Lỗi hệ thống";
																res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),  otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu,ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
															});	
														}
													})
													.catch(function(err2){
														req.session.ss = "Thất bại";
														req.session.desc = "Lỗi hệ thống";
														res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
													});
								}
								else {
									req.session.ss = "Thất bại";
									req.session.desc = "Lỗi hệ thống";
									res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
								}
							})
							.catch(function(err3){
								req.session.ss = "Thất bại";
								req.session.desc = "Lỗi hệ thống";
								res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),  otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu,ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
							});
					}
					else
					{
						req.session.ss = "Thất bại";
						req.session.desc = "Nhập sai mã xác nhận. Vui lòng kiểm tra lại";
						res.render("paymentcash", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), otp: req.body.otp, cus: req.body.makh, cash_value: req.body.gtphieu, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
					}
			}
			});
		});
		
	};
};