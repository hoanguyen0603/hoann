
//khởi tạo module express
var express = require("express"); 
//khởi tạo biến áp để khởi tạo thư viện express
var app = express(); 
//thư viện các hàm toán học
var math = require('mathjs');
//khởi tạo thư viện body-parser
var bodyParser = require('body-parser')
//truy cập thuộc tính use để truy cập thư mục mặc định = public chứa hình ảnh, css, html, jqurery
app.use(express.static("public")); 
 // truy cập thư viện view mặc định là ejs
app.set("view engine", "ejs");
// tạo thư mục chứa views
app.set("views", "./views");
//Khởi tạo biến phân trang

// Khởi tạo biến database connection
app.DB = require('./config/db');
app.locals.moment=require("moment");
//khởi tạo thư viện session
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

app.use(session({
    store: new RedisStore({host:'localhost'}),
    secret: 'keyboard cat'
}));
//sử dụng thư viện pg để kết nối cơ sở dữ liệu
var pg = require("pg");

// cài đặt kết nối cơ sở dữ liệu
var config = {
	user: 'postgres',
	database: 'flash',
	password: '123',
	host: 'localhost',
	port: 5432,
	max: 10,
	idleTimeoutMillis: 30000,
};

//cài đặt nhận dữ liệu từ POST
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//tạo biến lưu cấu hình
var pool = new pg.Pool(config); 

//khai báo sử dụng controllers
var AuthController = require('./controllers/auth');
var HomeController = require('./controllers/home');
var HeaderController = require('./controllers/header');
var BuyCashController = require('./controllers/buycash');
var BuyProductController = require('./controllers/buyproduct');
var BuyCashHistoryController = require('./controllers/buycashhistory');
var SaleHistoryController = require('./controllers/salehistory');
var SettleHistoryController = require('./controllers/settlehistory');
var CheckSettleController = require('./controllers/checksettle');
var PaymentController = require('./controllers/payment');
var PaymentCashController = require('./controllers/paymentcash');
var AddAccountController = require('./controllers/addaccount');
var ChangePassController = require('./controllers/changepass');
var SignUpController = require('./controllers/addaccountconfirm');

// //mở đường dẫn, truyền tham số request và response
app.get("/", AuthController.getLogin(pool));	
app.post("/", urlencodedParser, AuthController.postLogin(app));
app.get("/flash/home", HomeController.getHome(app));
app.get("/flash/header", HeaderController.getHeader(pool));
app.get("/flash/buycash", BuyCashController.getBuyCash(pool));	
app.get("/flash/buyproduct", BuyProductController.getBuyProduct(pool));	
app.post("/flash/buyproduct", urlencodedParser, BuyProductController.postBuyProduct(app));
app.get("/flash/payment", PaymentController.getPayment(pool));	
app.post("/flash/payment", urlencodedParser, PaymentController.postPayment(app));
app.get("/flash/paymentcash", PaymentCashController.getPaymentCash(pool));	
app.post("/flash/paymentcash", urlencodedParser, PaymentCashController.postPaymentCash(app, pool));
app.post("/flash/buycash", urlencodedParser, BuyCashController.postBuyCash(app, pool));
app.get("/flash/buycashhistory", BuyCashHistoryController.getBuyHistory(pool));	
app.get("/flash/salehistory", SaleHistoryController.getSaleHistory(pool));	
app.post("/flash/salehistory",urlencodedParser, SaleHistoryController.postSaleHistory(pool));	
app.post("/flash/settlehistory",urlencodedParser, SettleHistoryController.postSettleHistory(pool));	
app.post("/flash/buycashhistory",urlencodedParser, BuyCashHistoryController.postBuyHistory(pool));
app.get("/flash/settlehistory", SettleHistoryController.getSettleHistory(pool, app));	
app.get("/flash/checksettle", CheckSettleController.getCheckSettle(pool));	
app.get("/flash/addaccount", AddAccountController.getAddAccount(pool));	
app.post("/flash/addaccount", urlencodedParser, AddAccountController.postAddAccount(app));
app.get("/flash/changepass", ChangePassController.getChangePass(pool));	
app.post("/flash/changepass", urlencodedParser, ChangePassController.postChangePass(app));
app.get("/flash/addaccountconfirm", SignUpController.getSignUp(pool));	
app.post("/flash/addaccountconfirm", urlencodedParser, SignUpController.postSignUp(app));


//cài đặt cron-job
// var CronJob = require('node-cron');
// // //00 05 00 * * 1,3,5
// var t = CronJob.schedule('* * * * * *', function() {
// 		app.DB
// 		.select("*")
// 		.from("merchants")
// 		.where("status_id", 1)
// 		.where("account_type_id", 0)
// 		.then(function(result) {
// 			if (result[0] == undefined){
// 				console.log("không có đại lý");
// 			}
// 			else{
// 				console.log(Object.keys(result[0]).count);
// 			}
// 		})
// 		.catch(function(err){
// 			console.log(err);
// 		});

// }, null, true, 'Asia/Bangkok');

//t.stop();
// mở cổng port 3000
app.listen(3000); 