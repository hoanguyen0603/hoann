exports.getPayment = function(pool) {
	return function (req, res) {
					req.session.ss = "null";
					req.session.desc = "null";
					var obj = JSON.stringify(req.session.merchant);
					var obj1 = JSON.parse(obj);
					res.render("payment", {id:JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc});
	};
};
	

exports.postPayment = function(app) {
	return function (req, res) {
					var obj = JSON.stringify(req.session.merchant);
					var obj1 = JSON.parse(obj);
					var obj_cus = JSON.stringify(req.session.customer);
					var obj_cus1 = JSON.parse(obj_cus);
					if(req.body.ma_otp == req.body.otp){
						//res.end(JSON.stringify(obj1.Id) +" "+ JSON.stringify(obj_cus1.Id)+" "+req.body.gtdh);
						app.DB
						.table("coupon_redeem")
						.insert({merchant_id: JSON.stringify(obj1.Id), 
								customer_id: JSON.stringify(obj_cus1.Id),
								goods_value: req.body.gtdh, 
								created_at: new Date(),
								updated_at: null}) 
						.then(function(result1) {
							//Nếu thêm mới tài khoản thành công thì thêm giao dịch
							if (result1[0] == undefined){
								app.DB
								.select("*")
								.from("coupon_redeem")
								.where("merchant_id", JSON.stringify(obj1.Id))
								.where("customer_id", JSON.stringify(obj_cus1.Id))
								.limit(1)
								.orderBy("Id", "desc")
								.then(function(result0) {
													
								if (result0[0] == undefined){
									req.session.ss = "Thất bại";
									req.session.desc = "Lỗi hệ thống";
									res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),gtdh: req.body.gtdh, otp: req.body.otp,ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
									}
								else {
									app.DB
									.select("*")
									.from("merchant_discounts")
									.where("merchant_id", JSON.stringify(obj1.Id))
									.then(function(result2) {
										if (result2[0] == undefined){
											req.session.ss = "Thất bại";
											req.session.desc = "Đại lý chưa cài đặt phí giao dịch. Vui lòng liên hệ công ty để được cài đặt";
											res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),gtdh: req.body.gtdh, otp: req.body.otp,ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
										}
										else {

											if(result2[0].discount >= 0)
											{
												var acc_fl = 1;
												var tt = parseInt(req.body.gtdh) * result2[0].discount;
											}
											else{
												var acc_fl = 0;
												var tt = - parseInt(req.body.gtdh) * result2[0].discount;
											}
												app.DB
												.table("merchant_balances")
												.insert({merchant_id: JSON.stringify(obj1.Id),
														goods_value : req.body.gtdh * result2[0].discount /100,
														account_flow: acc_fl,
														payment_action_id: 6,
														coupon_purchase_id: null,
														coupon_redeem_id: result0[0].Id,
														created_at: new Date(),
														updated_at: null})
												.then(function(result3) {
													if (result3[0] == undefined){
														
														app.DB
														.select("*")
														.from("merchants")
														.where("Id", JSON.stringify(obj1.Id))
														.then(function(result3000) {
															if (result3000[0] == undefined){
																req.session.ss = "Thất bại";
																req.session.desc = "Lôi hệ thống";
																res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),gtdh: req.body.gtdh, otp: req.body.otp,ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
															}
															else {
																var mer_bal = parseInt(result3000[0].outs_balance) + tt;
														app.DB
														.table("merchants")
														.where("Id", JSON.stringify(obj1.Id))
														.update("outs_balance", mer_bal)
														.then(function(result4) {
															if (result4[0] == undefined){
																	app.DB
																	.table("customer_balances")
																	.insert({customer_id: JSON.stringify(obj_cus1.Id),
																			payment_action_id: 10,
																			goods_value : req.body.gtdh,
																			account_flow: 0,
																			coupon_purchase_id: null,
																			coupon_redeem_id: result0[0].Id,
																			created_at: new Date(),
																			updated_at: null})
																	.then(function(result5) {
																		if (result5[0] == undefined){
																					app.DB
																			.select("*")
																			.from("customers")
																			.where("Id", JSON.stringify(obj_cus1.Id))
																			.then(function(result4000) {
																				if (result4000[0] == undefined){
																					req.session.ss = "Thất bại";
																					req.session.desc = "Lôi hệ thống";
																					res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),gtdh: req.body.gtdh, otp: req.body.otp,ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																				}
																				else {
																					var cus = parseInt(result4000[0].outs_balance) - parseInt(req.body.gtdh);
																					app.DB
																					.table("customers")
																					.where("Id", JSON.stringify(obj_cus1.Id))
																					.update("outs_balance", cus)
																					.then(function(result7) {
																					if (result7[0] == undefined)
																					{
																						app.DB
																						.table("merchant_balances")
																						.insert({merchant_id: JSON.stringify(obj1.Id),
																								goods_value : req.body.gtdh,
																								account_flow: 1,
																								payment_action_id: 5,
																								coupon_purchase_id: null,
																								coupon_redeem_id: result0[0].Id,
																								created_at: new Date(),
																								updated_at: null})
																						.then(function(result3333) {
																							if (result3333[0] == undefined){
																								
																								app.DB
																								.select("*")
																								.from("merchants")
																								.where("Id", JSON.stringify(obj1.Id))
																								.then(function(result30001) {
																									if (result30001[0] == undefined){
																										req.session.ss = "Thất bại";
																										req.session.desc = "Lôi hệ thống";
																										res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),gtdh: req.body.gtdh, otp: req.body.otp,ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																									}
																									else {
																										var mer = parseInt(result3000[0].outs_balance) + parseInt(req.body.gtdh);
																										app.DB
																										.table("merchants")
																										.where("Id", JSON.stringify(obj1.Id))
																										.update("outs_balance", mer)
																										.then(function(result4000) {
																										if (result4000[0] == undefined){

																										app.DB
																					.table("customer_balances")
																					.insert({customer_id: JSON.stringify(obj_cus1.Id),
																							payment_action_id: 11,
																							goods_value : req.body.gtdh * 0.01,
																							account_flow: 1,
																							coupon_purchase_id: null,
																							coupon_redeem_id: result0[0].Id,
																							created_at: new Date(),
																							updated_at: null})
																					.then(function(result8) {
																						if (result8[0] == undefined){
																								app.DB
																							.select("*")
																							.from("customers")
																							.where("Id", JSON.stringify(obj_cus1.Id))
																							.then(function(result6000) {
																								if (result6000[0] == undefined){
																									req.session.ss = "Thất bại";
																									req.session.desc = "Lôi hệ thống";
																									res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),gtdh: req.body.gtdh, otp: req.body.otp,ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																								}
																								else {
																								var toto = parseInt(result6000[0].outs_balance) + parseInt(req.body.gtdh * 0.01);
												 												app.DB
												 												.table("customers")
												 												.where("Id", JSON.stringify(obj_cus1.Id))
																								.update("outs_balance", toto)
																								.then(function(result9) {
												 													if (result9[0] == undefined){
											 																			app.DB
																														.select("*")
																														.from("customer_balances")
																														.where("customer_id", JSON.stringify(obj_cus1.Id))
																														.limit(1)
																														.orderBy("Id", "desc")
																														.then(function(result13) {
																														if (result13[0] == undefined){
											 																				req.session.ss = "Thất bại";
											 																				req.session.desc = "Mua hàng thất bại";
																															res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																														}
											 																			else {
																													    app.DB
											 																				.table("promo_used")
											 																				.insert({promotion_id: 6,
											 																						promotion_value: req.body.gtdh * 0.01,
											 																						customer_id: JSON.stringify(obj_cus1.Id),
											 																						merchant_id: JSON.stringify(obj1.Id),
																																	coupon_purchase_id: null,
																																	coupon_redeem_id: result0[0].Id,
																																	customer_balance_id: result13[0].Id,
																																	merchant_balance_id:null,
																																	created_at: new Date(),
																																	updated_at: null})
																															.then(function(result14) {
																																if (result14[0] == undefined){
																																app.DB
																																.select("*")
																																.from("promotions")
																																.where("Id", 6)
																																.then(function(result90) {
																																if (result90[0] == undefined){
													 																				req.session.ss = "Thất bại";
													 																				req.session.desc = "Mua hàng thất bại";
																																	res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																}
													 																			else {
													 																			var pro_quan = parseInt(result90[0].quantity_used) + 1;
											 																						app.DB
											 																						.table("promotions")
											 																						.where("Id", 6)
											 																						.update("quantity_used", pro_quan)
											 																						.then(function(result15) {
																																		if (result15[0] == undefined){
											 																								if(req.body.makm == "null"){

											 																																app.DB

											 																																.select("*")
																																											.from("customers")
																																											.where("Id", JSON.stringify(obj_cus1.Id))
																																											.then(function(result10000){
																																											if (result10000[0] == undefined){
																																												req.session.ss = "Thất bại";
																																												req.session.desc = "Lỗi hệ thống";
																																												res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
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
																																											  text: 'Cảm ơn bạn đã sử dụng dịch vụ nạp tiền vào ví tại ' + JSON.stringify(obj1.full_name) + '. Giá trị đơn hàng: '+ req.body.gtdh +'. Số dư tài khoản của bạn là: ' + result10000[0].outs_balance.toString() +'. Mọi chi tiết liên hệ: 01636439935'
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
																																												coupon_purchase_id: null,
																																												coupon_redeem_id: result0[0].Id,
																																												email_type_id: 3,
																																												email_content: JSON.stringify(email1.text),
																																												otp_request_id: null,
																																												created_at: new Date(),
																																												updated_at: null
																																											})
																																											.then(function(result1000) {
																																											if (result1000[0] == undefined){	
																																												req.session.ss = "Thành công";
																																												req.session.desc = "Mua hàng thành công";
																			 																									res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																																											}
																																											else{
																																													req.session.ss = "Thất bại";
																																													req.session.desc = "Lỗi hệ thống";
																																													res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																											}

																																											})
																																												.catch(function(err1000){
																																												req.session.ss = "Thất bại";
																																												req.session.desc = "Lỗi hệ thống";
																																												res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																											
																																											});
																																										}

																																										})
																																										.catch(function(err10000){
																																											req.session.ss = "Thất bại";
																																											req.session.desc = "Lỗi hệ thống";
																																											res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																										
																																										});



											 																									
											 																								}
																																			else{

																																			app.DB
																																			.select("*")
																																			.from("promotion_details")
																																			.where("code", req.body.makm)
																																			.where("rule2bemet", JSON.stringify(obj_cus1.Id))
																																			.then(function(result20){
																																			if (result20[0] == undefined){
																																				req.session.ss = "Thất bại";
																																				req.session.desc = "Mã khuyến mại không tồn tại. Vui lòng kiểm tra lại";
																																				res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																			}
																																			else{

																																				app.DB
																																				.select("*")
																																				.from("promotions")
																																				.where("Id", result20[0].promotion_id)
																																				.where("status", 1)
																																				.where("promo_user", 1)
																																				.where("promo_transaction", 1)
																																				.then(function(result19){
																																				if (result19[0] == undefined){
																																					req.session.ss = "Thất bại";
																																					req.session.desc = "Mã khuyến mại không hợp lệ. Vui lòng kiểm tra lại";
																																					res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																				}
																																				else{
																																					var km = 0;
																																					if(result19[0].value_type == 1){
																																						km = result19[0].value;
																																					}
																																					else if(result19[0].value_type == 2){
																																						km = req.body.gtdh * result19[0].value / 100;
																																					}
																																					app.DB
																																					.table("customer_balances")
																																					.insert({customer_id: JSON.stringify(obj_cus1.Id),
																																							payment_action_id: 11,
																																							goods_value : km,
																																							account_flow: 1,
																																							coupon_purchase_id: null,
																																							coupon_redeem_id: result0[0].Id,
																																							created_at: new Date(),
																																							updated_at: null})
																																					.then(function(result21){
																																						if (result21[0] == undefined){
																																						app.DB
																																						.select("*")
																																						.from("customers")
																																						.where("Id", JSON.stringify(obj_cus1.Id))
																																						.then(function(result100){
																																						if (result100[0] == undefined){
																																							req.session.ss = "Thất bại";
																																							req.session.desc = "Lỗi hệ thống";
																																							res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																						}
																																						else{
																																							var cus_bal = parseInt(result100[0].outs_balance) + parseInt(km);
																																							app.DB
																																							.table("customers")
																																							.where("Id", JSON.stringify(obj_cus1.Id))
																																							.update("outs_balance", cus_bal)
																																							.then(function(result22) {
																																								if (result22[0] == undefined){
																																								app.DB
																																								.select("*")
																																								.from("customer_balances")
																																								.where("customer_id", JSON.stringify(obj_cus1.Id))
																																								.limit(1)
																																								.orderBy("Id", "desc")
																																								.then(function(result23) {
																																								if (result23[0] == undefined){
																																									req.session.ss = "Thất bại";
																																									req.session.desc = "Lỗi hệ thống";
																																									res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																								}
																																								else{
																																									
																																									app.DB
																																									.table("promo_used")
																																									.insert({promotion_id: result19[0].Id,
																																											promotion_value: km,
																																											customer_id: JSON.stringify(obj_cus1.Id),
																																											merchant_id: JSON.stringify(obj1.Id),
																																											coupon_redeem_id: result0[0].Id,
																																											coupon_purchase_id: null,
																																											customer_balance_id: result23[0].Id,
																																											merchant_balance_id: null,
																																											created_at: new Date(),
																																											updated_at: null})
																																									.then(function(result24) {
																																										if (result24[0] == undefined){
																																										app.DB
																																										.select("*")
																																										.from("promotions")
																																										.where("Id", result19[0].Id)
																																										.then(function(result103) {
																																										if (result103[0] == undefined){
																																											req.session.ss = "Thất bại";
																																											req.session.desc = "Lỗi hệ thống";
																																											res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																										}
																																										else{
																																										var new_quan = parseInt(result103[0].quantity_used) + 1;

																																										app.DB						
																																										.table("promotions")
																																										.where("Id", result19[0].Id)
																																										.update("quantity_used", new_quan)
																																										.then(function(result25) {
																																											if (result25[0] == undefined){


												 																																app.DB
												 																																.select("*")
																																												.from("customers")
																																												.where("Id", JSON.stringify(obj_cus1.Id))
																																												.then(function(result10000){
																																												if (result10000[0] == undefined){
																																													req.session.ss = "Thất bại";
																																													req.session.desc = "Lỗi hệ thống";
																																													res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																												}
																																												else{
																																												app.DB
																																										.select("*")
																																										.from("promotions")
																																										.where("Id", result19[0].Id)
																																										.then(function(result103) {
																																										if (result103[0] == undefined){
																																											req.session.ss = "Thất bại";
																																											req.session.desc = "Lỗi hệ thống";
																																											res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																										}
																																										else{
																																										var new_quan = parseInt(result103[0].quantity_used) + 1;

																																										app.DB						
																																										.table("promotions")
																																										.where("Id", result19[0].Id)
																																										.update("quantity_used", new_quan)
																																										.then(function(result25) {
																																											if (result25[0] == undefined){


												 																																app.DB
												 																																.select("*")
																																												.from("customers")
																																												.where("Id", JSON.stringify(obj_cus1.Id))
																																												.then(function(result10000){
																																												if (result10000[0] == undefined){
																																													req.session.ss = "Thất bại";
																																													req.session.desc = "Lỗi hệ thống";
																																													res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
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
																																													  text: 'Cảm ơn bạn đã sử dụng dịch vụ nạp tiền vào ví tại ' + JSON.stringify(obj1.full_name) + '. Giá trị đơn hàng: '+ req.body.gtdh +'. Số dư tài khoản của bạn là: ' + result10000[0].outs_balance.toString() +'. Mọi chi tiết liên hệ: 01636439935'
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
																																													var elail = JSON.stringify(mailOptions);
																																													var elail1 = JSON.parse(elail);
																																													app.DB
																																													.table("otc_emails")
																																													.insert({
																																														customer_id: result10000[0].Id,
																																														email: result10000[0].email,
																																														coupon_purchase_id: null,
																																														coupon_redeem_id: result0[0].Id,
																																														email_type_id: 3,
																																														email_content: JSON.stringify(elail1.text),
																																														otp_request_id: null,
																																														created_at: new Date(),
																																														updated_at: null
																																													})
																																													.then(function(result1000) {
																																													if (result1000[0] == undefined){	
																																														req.session.ss = "Thành công";
																																														req.session.desc = "Mua hàng thành công";
																					 																									res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																																													}
																																													else{
																																															req.session.ss = "Thất bại";
																																															req.session.desc = "Lỗi hệ thống";
																																															res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																													}

																																													})
																																														.catch(function(err1000){
																																														req.session.ss = "Thất bại";
																																														req.session.desc = "Lỗi hệ thống";
																																														res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																													
																																													});
																																												}

																																												})
																																												.catch(function(err10000){
																																													req.session.ss = "Thất bại";
																																													req.session.desc = "Lỗi hệ thống";
																																													res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																												
																																												});
																																												}
																																												else {
																																													req.session.ss = "Thất bại";
																																													req.session.desc = "Lỗi hệ thống";
																																													res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																													}
																																												})
																																												.catch(function(err25){
																																													req.session.ss = "Thất bại";
																																													req.session.desc = "Lỗi hệ thống";
																																													res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																												});
																																												}
																																												})
																																												.catch(function(err103){
																																												req.session.ss = "Thất bại";
																																												req.session.desc = "Lỗi hệ thống";
																																												res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																												});
																																											}

																																											})
																																											.catch(function(err10000){
																																												req.session.ss = "Thất bại";
																																												req.session.desc = "Lỗi hệ thống";
																																												res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																											
																																											});
																																											}
																																											else {
																																												req.session.ss = "Thất bại";
																																												req.session.desc = "Lỗi hệ thống";
																																												res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																												}
																																											})
																																											.catch(function(err25){
																																												req.session.ss = "Thất bại";
																																												req.session.desc = "Lỗi hệ thống";
																																												res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																											});
																																											}
																																											})
																																											.catch(function(err103){
																																											req.session.ss = "Thất bại";
																																											req.session.desc = "Lỗi hệ thống";
																																											res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																											});
																																											}

																																										else{
																																											req.session.ss = "Thất bại";
																																											req.session.desc = "Lỗi hệ thống";
																																											res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																										}
																																										})
																																										.catch(function(err24){
																																										req.session.ss = "Thất bại";
																																										req.session.desc = "Lỗi hệ thống";
																																										res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																										});
																																								}
																																								})
																																								.catch(function(err23){
																																									req.session.ss = "Thất bại";
																																									req.session.desc = "Lỗi hệ thống";
																																									res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																								});



																																								}
																																								else {
																																								req.session.ss = "Thất bại";
																																								req.session.desc = "Lỗi hệ thống";
																																								res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																								}
																																							})
																																							.catch(function(err22){
																																							req.session.ss = "Thất bại";
																																							req.session.desc = "Lỗi hệ thống";
																																							res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																							
																																							});
																																						}
																																						})
																																						.catch(function(err100){
																																						req.session.ss = "Thất bại";
																																						req.session.desc = "Lỗi hệ thống";
																																						res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																						});


																																						}
																																						else {
																																							req.session.ss = "Thất bại";
																																							req.session.desc = "Lỗi hệ thống";
																																							res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																							
																																					}
																																					})
																																					.catch(function(err21){
																																					req.session.ss = "Thất bại";
																																					req.session.desc = "Lỗi hệ thống";
																																					res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																					});




																																				}
																																				})
																																				.catch(function(result19){
																																				req.session.ss = "Thất bại";
																																				req.session.desc = "Lỗi hệ thống";
																																				res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																		
																																				});
																																			}
																																			})
																																			.catch(function(err20){
																																			req.session.ss = "Thất bại";
																																			req.session.desc = "Lỗi hệ thống";
																																			res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																	
																																			});





											 																							//req.session.ss = "Thành công";
																																		//	req.session.desc = "Mua hàng có km thành công";
											 																							//res.render("buyproduct", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection), ss:req.session.ss, desc:req.session.desc}); 
																																			}
																																		}
																																		else {
											 																								req.session.ss = "Thất bại";
											 																								req.session.desc = "Lỗi hệ thống";
																																			res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																			}
																																		})
																																		.catch(function(err15){
																																			req.session.ss = "Thất bại";
																																		req.session.desc = "Lỗi hệ thống";
																																		res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																																		
																																	});
																																	}
																																
											 																					})
											 																					.catch(function(err90){
											 																					req.session.ss = "Thất bại";
											 																					req.session.desc = "Lỗi hệ thống";
											 																					res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
										 																					});
											 																					}
											 																					else{
																																	req.session.ss = "Thất bại";
																																	req.session.desc = "Lỗi hệ thống";
																																	res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																															}
											 																					})
											 																					.catch(function(err14){
											 																					req.session.ss = "Thất bại";
											 																					req.session.desc = "Lỗi hệ thống";
											 																					res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
										 																					});
																													}
																													})
																													.catch(function(err13){
																													req.session.ss = "Thất bại";
											 																		req.session.desc = "Lỗi hệ thống";
											 																		res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
											 																		});
																									
											 													}
											 													else {
											 														req.session.ss = "Thất bại";
																									req.session.desc = "Mua hàng thất bại";
											 														res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc}); 
																									}
											 													})
											 													.catch(function(err9){
											 													req.session.ss = "Thất bại";
											 													req.session.desc = "Lỗi hệ thống";
																								res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc}); 
																								
																								});
																								}
																						})
																						.catch(function(err6000){
																						req.session.ss = "Thất bại";
																						req.session.desc = "Lỗi hệ thống";
																						res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																						});
																					}
																						else {
																								req.session.ss = "Thất bại";
																								req.session.desc = "Lỗi hệ thống";
																								res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																								
																						}
																					})
																					.catch(function(err8){
																					req.session.ss = "Thất bại";
																					req.session.desc = "Lỗi hệ thống";
																					res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																					});


																									}
																									else {
																											req.session.ss = "Thất bại";
																											req.session.desc = "Lỗi hệ thống";
																											res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																									}
																								})
																								.catch(function(err4000){
																													req.session.ss = "Thất bại";
																													req.session.desc = "Lỗi hệ thống";
																													res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																													

																								});
																							}
																						})
																						.catch(function(err30001){
																						req.session.ss = "Thất bại";
																						req.session.desc = "Lỗi hệ thống";
																						res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 						
																						});
																				 			}
																						else 
																						{
																									req.session.ss = "Thất bại";
																									req.session.desc = "Lỗi hệ thống";
																									res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																													

																						}
																						})
																						.catch(function(err3333){
																						req.session.ss = "Thất bại";
																						req.session.desc = "Lỗi hệ thống";
																						res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 						
																						});
																					
																					}
																				else {
																					req.session.ss = "Thất bại";
																					req.session.desc = "Mua hàng thất bại";
																					res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																					}
																				})
																				.catch(function(err7){
																				req.session.ss = "Thất bại";
																				req.session.desc = "Lỗi hệ thống";
																				res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																				
																				});
																			}
																		})
																		.catch(function(err4000){
																		req.session.ss = "Thất bại";
																		req.session.desc = "Lỗi hệ thống";
																		res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																		});
																			}
																		else {
																				req.session.ss = "Thất bại";
																				req.session.desc = "Lỗi hệ thống";
																				res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																				
																		}
																	})
																	.catch(function(err5){
																	req.session.ss = "Thất bại";
																	req.session.desc = "Lỗi hệ thống";
																	res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 	
																	});
																}
																else {
																		req.session.ss = "Thất bại";
																		req.session.desc = "Lỗi hệ thống";
																		res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																}
															})
															.catch(function(err4){
																				req.session.ss = "Thất bại";
																				req.session.desc = "Lỗi hệ thống";
																				res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																				

															});
														}
													})
													.catch(function(err3000){
													req.session.ss = "Thất bại";
													req.session.desc = "Lỗi hệ thống";
													res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 						
													});
											 			}
													else 
													{
																req.session.ss = "Thất bại";
																req.session.desc = "Lỗi hệ thống";
																res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																				

													}
													})
													.catch(function(err3){
													req.session.ss = "Thất bại";
													req.session.desc = "Lỗi hệ thống";
													res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 						
													});
										}

										})
										.catch(function(err2){
												req.session.ss = "Thất bại";
												req.session.desc = "Lỗi hệ thống";
												res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp, gtdh: req.body.gtdh,ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																				

										});
									}
							})
							.catch(function(err0){
										req.session.ss = "Thất bại";
										req.session.desc = "Lỗi hệ thống";
										res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
							});
							}
							else {
										req.session.ss = "Thất bại";
										req.session.desc = "Lỗi hệ thống";
										res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 										
							}
						})
						.catch(function(err1){
									req.session.ss = "Thất bại";
									req.session.desc = "Lỗi hệ thống";
									res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
						});
					}
					else{
								req.session.ss = "Thất bại";
								req.session.desc = "Nhập sai mã OTP";
								res.render("payment", {id: JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection),otp: req.body.otp,gtdh: req.body.gtdh, ss:req.session.ss, desc:req.session.desc, makm: req.body.makm}); 
																				

					}
					
	};
};