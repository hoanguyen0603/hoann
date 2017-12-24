
exports.postSettleHistory = function(pool) {
	return function (req, res) {
		var obj = JSON.stringify(req.session.merchant);
		var obj1 = JSON.parse(obj);

		if (req.body.datestart == "" && req.body.dateend == "")
		{
			if(req.body.slt_trangthai != ""){

				pool.connect(function(err, client, done)
					{
					if(err){
						return console.error('Lỗi hệ thống. Vui lòng trở lại sau vài phút',err);
					}
					client.query('select merchant_settlement.*,merchant_settlement_status.description from merchant_settlement inner join merchant_settlement_status on merchant_settlement.status_id = merchant_settlement_status."Id" where merchant_settlement.merchant_id = ' + JSON.stringify(obj1.Id)+' and merchant_settlement.status_id =' + req.body.slt_trangthai +' order by merchant_settlement.created_at DESC', function(err, result){
						done();

						if(err){
							res.end();
							return console.error('Vui lòng trở lại sau vài phút',err);
						}
						else{
							if(result[0] == undefined){
							res.render("settlehistory", {data:result, id:JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection)}); 
							}
							else 
							{
								return console.error('Không có dữ liệu',err);
							}
						}
						
						
					});
				});
			}
			else
			{
				pool.connect(function(err, client, done)
					{
					if(err){
						return console.error('Lỗi hệ thống. Vui lòng trở lại sau vài phút',err);
					}
					client.query('select merchant_settlement.*,merchant_settlement_status.description from merchant_settlement inner join merchant_settlement_status on merchant_settlement.status_id = merchant_settlement_status."Id" where merchant_settlement.merchant_id = ' + JSON.stringify(obj1.Id)+' order by merchant_settlement.created_at DESC', function(err, result){
						done();

						if(err){
							res.end();
							return console.error('Vui lòng trở lại sau vài phút',err);
						}
						else{
							if(result[0] == undefined){
							res.render("settlehistory", {data:result, id:JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection)}); 
							}
							else 
							{
								return console.error('Không có dữ liệu',err);
							}
						}
						
						
					});
				});
			}

		}

		else {
			if(req.body.slt_trangthai != ""){

				pool.connect(function(err, client, done)
					{
					if(err){
						return console.error('Lỗi hệ thống. Vui lòng trở lại sau vài phút',err);
					}
					client.query("select merchant_settlement.*,merchant_settlement_status.description from merchant_settlement inner join merchant_settlement_status on merchant_settlement.status_id = "+'merchant_settlement_status."Id"'+" where merchant_settlement.merchant_id = " + JSON.stringify(obj1.Id)+" and merchant_settlement.created_at between '"+ req.body.datestart + "' and '"+ req.body.dateend +"' and merchant_settlement.status_id= " + req.body.slt_trangthai + " order by merchant_settlement.created_at DESC", function(err, result){
					
						done();

						if(err){
							res.end();
							return console.error('Vui lòng trở lại sau vài phút',err);
						}
						else{
							if(result[0] == undefined){
							res.render("settlehistory", {data:result, id:JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection)}); 
							}
							else 
							{
								return console.error('Không có dữ liệu',err);
							}
						}
						
						
					});
				});
			}
			else
			{
				pool.connect(function(err, client, done)
				{
				if(err){
					return console.error('Lỗi hệ thống. Vui lòng trở lại sau vài phút',err);
				}
				client.query("select merchant_settlement.*,merchant_settlement_status.description from merchant_settlement inner join merchant_settlement_status on merchant_settlement.status_id = "+'merchant_settlement_status."Id"'+" where merchant_settlement.merchant_id = " + JSON.stringify(obj1.Id)+" and merchant_settlement.created_at between '"+ req.body.datestart + "' and '"+ req.body.dateend +"' order by merchant_settlement.created_at DESC", function(err, result){
					done();

					if(err){
						res.end();
						return console.error('Vui lòng trở lại sau vài phút',err);
					}
					else{
						if(result[0] == undefined){
						res.render("settlehistory", {data:result, id:JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection)}); 
						}
						else 
						{
							return console.error('Không có dữ liệu',err);
						}
					}
					
					
				});
			});
			}
		}
	};
};


exports.getSettleHistory = function(pool,app) {
	return function(req, res) {
		var obj = JSON.stringify(req.session.merchant);
		var obj1 = JSON.parse(obj);
			pool.connect(function(err, client, done)
				{
				if(err){
					return console.error('Lỗi hệ thống. Vui lòng trở lại sau vài phút',err);
				}
				client.query('select merchant_settlement.*,merchant_settlement_status.description from merchant_settlement inner join merchant_settlement_status on merchant_settlement.status_id = merchant_settlement_status."Id" where merchant_settlement.merchant_id = ' + JSON.stringify(obj1.Id)+' order by merchant_settlement.created_at DESC', function(err, result){
					done();

					if(err){
						res.end();
						return console.error('Vui lòng trở lại sau vài phút',err);
					}
					else{
						if(result[0] == undefined){
								res.render("settlehistory", {data:result, id:JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection)}); 
						
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