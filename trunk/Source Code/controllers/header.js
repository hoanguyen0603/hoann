exports.getHeader = function(pool) {
	return function(req, res) {
		var obj = JSON.stringify(req.session.merchant);
		var obj1 = JSON.parse(obj);

		pool.connect(function(err, client, done)
		{
			if(err){
				return console.error('Lỗi hệ thống. Vui lòng trở lại sau vài phút',err);
			}
			client.query('select * from merchants where Id = ' + JSON.stringify(obj1.Id), function(err, result){
				done();

				if(err){
					res.end();
					return console.error('Vui lòng trở lại sau vài phút',err);
				}
				else{
					if(result[0] != undefined){
						console.log(result);
					res.render("home", {data:result}); 
					}
					else 
					{
						console.error('Không có dữ liệu',err);
					}
				}
				
				
			});
		});
	};
};