exports.getBuyHistory = function(pool) {
	return function(req, res) {
		var obj = JSON.stringify(req.session.merchant);
		var obj1 = JSON.parse(obj);

		pool.connect(function(err, client, done)
		{
			if(err){
				return console.error('Lỗi hệ thống. Vui lòng trở lại sau vài phút',err);
			}
			client.query('select cash_collection.*,customers.phone_number, coupon_purchases.cash_value as total, payment_actions.name from cash_collection inner join payment_actions on payment_actions."Id" = cash_collection.payment_action_id inner join coupon_purchases on cash_collection.coupon_purchase_id = coupon_purchases."Id" inner join customers on coupon_purchases.customer_id = customers."Id"  where cash_collection.merchant_id = ' + JSON.stringify(obj1.Id) +' order by cash_collection.created_at DESC', function(err, result){
				done();

				if(err){
					res.end();
					return console.error('Vui lòng trở lại sau vài phút',err);
				}
				else{
					if(result[0] == undefined){
					res.render("buycashhistory", {data:result,id:JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection)}); 
					}
					else 
					{
						return console.error('Không có dữ liệu',err);
					}
				}
				
				
			});
		});
	};
};

exports.postBuyHistory = function(pool) {
	return function (req, res) {
		var obj = JSON.stringify(req.session.merchant);
		var obj1 = JSON.parse(obj);

		if (req.body.datestart == " " && req.body.dateend == " ")
		{
			pool.connect(function(err, client, done)
				{
				if(err){
					return console.error('Lỗi hệ thống. Vui lòng trở lại sau vài phút',err);
				}
				client.query('select cash_collection.*,customers.phone_number, coupon_purchases.cash_value as total, payment_actions.name from cash_collection inner join payment_actions on payment_actions."Id" = cash_collection.payment_action_id inner join coupon_purchases on cash_collection.coupon_purchase_id = coupon_purchases."Id" inner join customers on coupon_purchases.customer_id = customers."Id"  where cash_collection.merchant_id = ' + JSON.stringify(obj1.Id)+' order by cash_collection.created_at DESC', function(err, result){
					done();

					if(err){
						res.end();
						return console.error('Vui lòng trở lại sau vài phút',err);
					}
					else{
						if(result[0] == undefined){
						res.render("buycashhistory", {data:result, id:JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection)}); 
						}
						else 
						{
							return console.error('Không có dữ liệu',err);
						}
					}
					
					
				});
			});

		}

		else {
				pool.connect(function(err, client, done)
				{
				if(err){
					return console.error('Lỗi hệ thống. Vui lòng trở lại sau vài phút',err);
				}
				client.query("select cash_collection.*,customers.phone_number, coupon_purchases.cash_value as total, payment_actions.name from cash_collection inner join payment_actions on "+'payment_actions."Id"'+" = cash_collection.payment_action_id inner join coupon_purchases on cash_collection.coupon_purchase_id= " +'coupon_purchases."Id"'+ " inner join customers on coupon_purchases.customer_id = "+'customers."Id"'+ " where cash_collection.merchant_id = " + JSON.stringify(obj1.Id)+" and cash_collection.created_at between '"+ req.body.datestart + "' and '"+ req.body.dateend +"' order by cash_collection.created_at DESC", function(err, result){
					done();

					if(err){
						res.end();
						return console.error('Vui lòng trở lại sau vài phút',err);
					}
					else{
						if(result[0] == undefined){
						res.render("buycashhistory", {data:result, id:JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection)}); 
						}
						else 
						{
							return console.error('Không có dữ liệu',err);
						}
					}
					
					
				});
			});
		}
	};
};