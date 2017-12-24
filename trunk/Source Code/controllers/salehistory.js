
exports.getSaleHistory = function(pool) {
	return function(req, res) {
		var obj = JSON.stringify(req.session.merchant);
		var obj1 = JSON.parse(obj);

		pool.connect(function(err, client, done)
		{
			if(err){
				return console.error('Lỗi hệ thống. Vui lòng trở lại sau vài phút',err);
			}
			client.query('select merchant_balances.*,customers.phone_number, coupon_redeem.goods_value as total, payment_actions.name from merchant_balances inner join payment_actions on payment_actions."Id" = merchant_balances.payment_action_id inner join coupon_redeem on merchant_balances.coupon_redeem_id = coupon_redeem."Id" inner join customers on coupon_redeem.customer_id = customers."Id" where merchant_balances.merchant_id = ' + JSON.stringify(obj1.Id)+' order by merchant_balances.created_at DESC', function(err, result){
				done();

				if(err){
					res.end();
					return console.error('Vui lòng trở lại sau vài phút',err);
				}
				else{
					if(result[0] == undefined){
					res.render("salehistory", {
						data:result,
						id:JSON.stringify(obj1.full_name),
						goods:JSON.stringify(obj1.outs_balance),
						cash:JSON.stringify(obj1.outs_cash_collection)
					}); 
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

exports.postSaleHistory = function(pool) {
	return function (req, res) {
		var obj = JSON.stringify(req.session.merchant);
		var obj1 = JSON.parse(obj);

		if (req.body.datestart == "" && req.body.dateend == "")
		{
			pool.connect(function(err, client, done)
				{
				if(err){
					return console.error('Lỗi hệ thống. Vui lòng trở lại sau vài phút',err);
				}
				client.query('select merchant_balances.*,customers.phone_number, coupon_redeem.goods_value as total, payment_actions.name from merchant_balances inner join payment_actions on payment_actions."Id" = merchant_balances.payment_action_id inner join coupon_redeem on merchant_balances.coupon_redeem_id = coupon_redeem."Id" inner join customers on coupon_redeem.customer_id = customers."Id"  where merchant_balances.merchant_id = ' + JSON.stringify(obj1.Id)+' order by merchant_balances.created_at DESC', function(err, result){
					done();

					if(err){
						res.end();
						return console.error('Vui lòng trở lại sau vài phút',err);
					}
					else{
						if(result[0] == undefined){

							res.render("salehistory", {
								data:result,
								id:JSON.stringify(obj1.full_name),
								goods:JSON.stringify(obj1.outs_balance),
								cash:JSON.stringify(obj1.outs_cash_collection)
							}); 
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
				client.query("select merchant_balances.*,customers.phone_number, coupon_redeem.goods_value as total, payment_actions.name from merchant_balances inner join payment_actions on "+'payment_actions."Id"'+" = merchant_balances.payment_action_id inner join coupon_redeem on merchant_balances.coupon_redeem_id = "+ 'coupon_redeem."Id"' + " inner join customers on coupon_redeem.customer_id = "+ 'customers."Id"' + " where merchant_balances.merchant_id = " + JSON.stringify(obj1.Id)+" and merchant_balances.created_at between '"+ req.body.datestart + "' and '"+ req.body.dateend +"' order by merchant_balances.created_at DESC", function(err, result){
					done();

					if(err){
						res.end();
						return console.error('Vui lòng trở lại sau vài phút',err);
					}
					else{
						if(result[0] == undefined){
						res.render("salehistory", {data:result, id:JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection)}); 
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