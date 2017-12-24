exports.getCheckSettle = function(pool) {
	return function(req, res) {
		var obj = JSON.stringify(req.session.merchant);
		var obj1 = JSON.parse(obj);

		pool.connect(function(err, client, done)
		{
			if(err){
				return console.error('Lỗi hệ thống. Vui lòng trở lại sau vài phút',err);
			}
			client.query('select * from merchant_settleds where merchant_id = ' + JSON.stringify(obj1.Id) + ' and settled_date = current_date - 1', function(err, result){
				done();

				if(err){
					res.end();
					return console.error('Vui lòng trở lại sau vài phút',err);
				}
				else{
					if(result[0] == undefined){
					res.render("checksettle", {data:result, id:JSON.stringify(obj1.full_name),goods:JSON.stringify(obj1.outs_balance),cash:JSON.stringify(obj1.outs_cash_collection)}); 
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