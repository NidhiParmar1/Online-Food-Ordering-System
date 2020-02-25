const express= require('express');
const app= express();
app.listen(8000, ()=>
	{ 
		console.log("Server started at Port No.8000");
})

const bodyparser= require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
  extended:true }));

const path=require('path');
app.set('views', path.join( __dirname, 'views'));
app.set('view engine', 'hbs');

const session=require('express-session');
app.use(session({secret:"adffssfd"}));

app.use(function(request, response, next){
	response.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0');
	next();
})

const upload = require('express-fileupload')
app.use(upload());

///======================Add Common Nav-Bar+=====================================================
const hbs =require('express-handlebars');
app.engine('hbs', hbs({
	extname: 'hbs',
	defaultLayout: 'mainLayout',
	layoutsDir:__dirname+'/views/layouts/'}));
//========================NodeMailer===================================================
const nodemailer=require('nodemailer');
const transporter= nodemailer.createTransport({
	service: 'gmail',
	auth:    {
	user: 'harshie.hr.111@gmail.com',
	pass:  'harshiehr'
	}
})
///========================================================================================================================//
//=======================================Admin Model==============================================================//
app.get('/adminlogin',(request, response)=>{
	response.render('Login',{'user': request.session.user})
})

/*app.get('/',(request, response)=>{
var uslogin= 'Admin';
var uspass= 'admin123';
const newLogin= Login({
	userid:  uslogin,
	password: uspass
})
newLogin.save().then (data=> console.log("Data Inserted Successfully"))
//response.render('index', {'msg': 'Data Inserted'})
//response.render('Login');	
})*/

const mongoose=require('mongoose');
const Login = require('./Models/LoginModel');
const FoodProduct= require('./Models/ProductModel');
const CustomerSignup= require('./Models/CustomerModel');
const FoodCart=require('./Models/FoodCartModel');
const url= "mongodb://localhost:27017/empdb";
//const url="mongodb+srv://Nidhi:nidhi123@mongodb-kiutd.mongodb.net/test?retryWrites=true&w=majority";
//const url="mongodb+srv://Nidhi:nidhip123@cluster0-ucqag.mongodb.net/test?retryWrites=true&w=majority"
mongoose.connect(url);

app.post('/loginCheck',(request, response)=>{
var loginid= request.body.login;
var passwod= request.body.password;

Login.findOne({userid:loginid, password: passwod},(err, result)=>{
	if(err) throw err
	else if(result!=null){
		request.session.user= loginid;
	    response.render('Home', {user: request.session.user});}
	else
		response.render('Login', {'msg': 'Login Fail, try Again'})
})
})

app.get('/forgotPassword',(request, response)=>{
	response.render('ForgotPassword',{user: request.session.user})
})

app.post('/sendPassword',(request, response)=>{
	var Userid=request.body.uid;
	var LoginId=request.body.login;
	Login.findOne({userid:Userid},(err, result)=>{
		if(err) throw err
		else{
		var mailOptions={
		from: 'harshie.hr.111@gmail.com',
		to:   LoginId,
		subject: 'Password Details',
		text:   'Hello '+Userid+ ', Your password is: ' +result.password
	}

	transporter.sendMail(mailOptions, (err, result)=>{
	if(err) throw err
		else{
			response.render('ForgotPassword',{msg: 'Password sent to your registered emailid'});
		}
		})
		}
})
})

app.get('/backHome',(request, response)=>{
	if(request.session.user===undefined)
		response.redirect('/');
	else
	response.render('Home',{user: request.session.user});
})

app.get('/addProduct',(request, response)=>{
	if(request.session.user===undefined)
		response.redirect('/');
	response.render('AddProducts',{user: request.session.user})
})
 
app.post('/saveProduct',(request, response)=>{
if(request.files){	
var prodName= request.body.pname;
var category= request.body.option;
var price= request.body.price;
var description= request.body.text;
var file= request.files.file;
var imgname= file.name;
file.mv('./Uploads/'+imgname, (err)=>{
    	if(err) throw err
    		else{
    			
const newfoodProduct= FoodProduct({
	Pname: prodName,
	Category: category,
	Price: price,
	Description: description,
	ImgAddress: imgname		
			})
  newfoodProduct.save().then (data=> console.log("Data Inserted Successfully"))
  response.render('AddProducts', {'msg': 'Product Added','user': request.session.user})
}
}) 
}
})

app.use(express.static(path.join(__dirname,'Uploads')))

app.get('/viewProducts', (request, response)=>{
	if(request.session.user===undefined)
		response.redirect('/');
	else{
		FoodProduct.find({}, (err,result)=>{
		if(err) throw err
		else
			//console.log(result);
			response.render('ProductDetails', {'prodetail': result, user: request.session.user})
	})
	}
})

app.get('/deleteproduct',(request, response)=>{
	if(request.session.user===undefined)
		response.redirect('/');
	else{
	var id= request.query.id;
	//console.log(id);
	FoodProduct.deleteOne({_id:id},(err)=>{
		if(err) throw err;
		else
		FoodProduct.find({},(err,result)=>{
		if(err) throw err;
		else
	    response.render('ProductDetails',{prodetail:result, msg: 'Data Deleted...',user: request.session.user})
		})
		
	})
}
})

app.get('/updateproduct',(request,response)=>{
	if(request.session.user===undefined)
		response.redirect('/');
	else{
		var id=request.query.id;
	FoodProduct.findOne({_id:id},(err, result)=>{
		if(err) throw err
		else
			//console.log(result)
		response.render('updateProduct', {'prod': result})
	})
}
})

app.post('/updateAction',(request, response)=>{
if(request.files){	
var id= request.body.id;
var Proname= request.body.pname;
var category= request.body.option;
var ProdPrice= request.body.price;
var desc= request.body.text;
var file= request.files.file;
var imgname= file.name;
file.mv('./Uploads/'+imgname, (err)=>{
    	if(err) throw err
    		else{
    FoodProduct.findByIdAndUpdate(id,{Pname:Proname, Category:category, Price:ProdPrice, Description: desc, ImgAddress:imgname},(err)=>{
	if(err) throw err;
	else{
	FoodProduct.find({},(err, result)=>{
		if(err) throw err
	else
	response.render('ProductDetails',{'prodetail': result, 'msg':'Data Updated with img..','user': request.session.user})
	})
	}
	})
	}
    })
    }
	else{
	var id= request.body.id;
	var Proname= request.body.pname;
	var category=request.body.option;
	var ProdPrice= request.body.price;
	var desc= request.body.text;
	
FoodProduct.findByIdAndUpdate(id,{Pname:Proname, Category:category, Price:ProdPrice, Description: desc},(err)=>{
	if(err) throw err;
	else{
	FoodProduct.find({},(err, result)=>{
		if(err) throw err
	else
	response.render('ProductDetails',{'prodetail': result, 'msg': 'Data Updated..','user': request.session.user})
})
}
})
}
})
//===============================Serch By Catagory==================================================================
app.post('/serchOrders', (request, response)=>{
	var catg= request.body.search;
FoodProduct.find({Category:catg},(err,result)=>{
	if(err) throw err
		else
			//console.log(result);
			response.render('Index', {'prodetail': result, customer:request.session.login})

})	
})
//======================================================================================================================
app.get('/CheckPname', (request, response)=>{

	var prodname= request.query.pname;
	//console.log(prodname)
	FoodProduct.findOne({Pname: prodname},(err,result)=>{
		if(err) throw err
			else if(result!=null)
				response.send({'msg':'Already Exist'});
			else
				response.send({'msg':'Available'});
	})
})

app.get('/viewPendingOrders',(request,response)=>{
	if(request.session.user===undefined)
		response.redirect('/');
	else{
		status='Pending';
	CustomerOrder.aggregate([

	{ 
 		$match: {Status:status}
 				},
	{ $lookup:
	{
		from:"foodproducts",
		localField: "Pname",
		foreignField: "Pname",
		as: "data"
	}
}],(err,result)=>{

	if(err) throw err
	else
	//console.log(result)
    response.render('CustomerOrderDetail',{'prodetail': result, user: request.session.user})
})	
}	
})

app.get('/viewOrderHistory', (request,response)=>{
	if(request.session.user===undefined)
		response.redirect('/');
	else{
	var id=request.query.id;
 	var status='Dispatched';
 	CustomerOrder.findByIdAndUpdate(id,{Status:status},(err)=>{
 		if(err) throw err;
 		else{
 			CustomerOrder.aggregate([
 				{ 
 					$match: {Status:status}
 				},
		{
			$lookup:
			{
				from:"foodproducts",
				localField: "Pname",
				foreignField: "Pname",
				as: "data"
			}
		}],(err,result)=>{

			if(err) throw err
			else
				//console.log(result)
   		 response.render('OrderHistory',{'prodetail': result, user: request.session.user})
		})	

 		}
})
 }
 })

app.get('/dispatchproduct', (request,response)=>{
	if(request.session.user===undefined)
		response.redirect('/');
	else{
 	var id=request.query.id;
 	var status='Dispatched';
 	CustomerOrder.findByIdAndUpdate(id,{Status:status},(err)=>{
 		if(err) throw err;
 		else{
 			CustomerOrder.aggregate([
 		{ $match:{Status: 'Pending'}},
 				
		{
			$lookup:
			{
				from:"foodproducts",
				localField: "Pname",
				foreignField: "Pname",
				as: "data"
			}
		}],(err,result)=>{

			if(err) throw err
			else
				//console.log(result)
   		 response.render('CustomerOrderDetail',{'prodetail': result, user: request.session.user, msg:'Order Dispatched'})
		})	

 		}
 	})
}
 })

app.get('/viewCustomer',(request, response)=>{
	if(request.session.user===undefined)
		response.redirect('/');
	else{
CustomerSignup.find({}, (err,result)=>{
	console.log(result);
	response.render('CustomerDetails',{'prodetail': result, user: request.session.user})
})
}	
})
 		

app.get('/logout',(request,response)=>{
	request.session.destroy();
	FoodProduct.find({}, (err,result)=>{
		if(err) throw err
		else
			//console.log(result);
		    response.render('Index', {'prodetail': result, 'msg':'You are Logged Out'})
	})	
})
//=================================Customer Model==================================================//
app.get('/customerSign',(request, response)=>{
	response.render('CustomerSignup')
})

app.get('/',(request, response)=>{
	FoodProduct.find({}, (err,result)=>{
		if(err) throw err
		else
			//console.log(result);
		    response.render('Index', {'prodetail': result, customer:request.session.login})
	})
})

app.post('/insertCustomer',(request, response)=>{
var userid= request.body.login;
var username= request.body.Cname;
var pass = request.body.password;
var contact=request.body.number;
var address=request.body.address;
const newCustomerSignup= CustomerSignup({
	userid: userid,
	username: username,
	password: pass,
	contactno:contact,
	address:address
})
newCustomerSignup.save().then (data=> console.log("Data Inserted Successfully"))
response.render('CustomerLogin', {'msg': 'Welcome, you are Successfully registered'})
//response.render('Login');	

})
app.get('/customerLogin',(request, response)=>{
	response.render('CustomerLogin')
})

app.post('/loginCustomer',(request, response)=>{	
var userid= request.body.login;
var password= request.body.password;

CustomerSignup.findOne({userid:userid, password: password},(err, result)=>{
	if(err) throw err
	else if(result!=null){
	request.session.login= userid;
	var ipAddress = request.header('x-forwarded-for') || request.connection.remoteAddress;
FoodCart.update({CID:ipAddress},{CID:userid},(err,result)=>{
		if(err) throw err;
		else console.log('view cart');
	})
	FoodProduct.find({}, (err,result)=>{
		if(err) throw err
		else
			//console.log(result);
		    response.render('Index', {'prodetail': result, customer:'Welcome '+ request.session.login})
	})
	}else response.render('CustomerLogin',{'msg':'Login Fail'})  
})
})

app.get('/CheckloginId',(request, response)=>{
	
var loginID= request.query.login;
//console.log(loginID)
	CustomerSignup.findOne({userid: loginID},(err,result)=>{
		if(err) throw err
			else if(result!=null)
				response.send({'msg':'Already Exist'});
			else
				response.send({'msg':'Available'});
	})	
})



app.post('/addToCart',(request, response)=>{
	if(request.session.login===undefined){
    var ipAddress = request.header('x-forwarded-for') || request.connection.remoteAddress;
	cid=ipAddress;
    }else {
    	cid= request.session.login;
    }
	// 	FoodProduct.find({}, (err,result)=>{
	// 	if(err) throw err
	// 	else
	// 		//console.log(result);
	// 	    response.render('Index', {'prodetail': result, msg:"First Login and then add Product to the Cart"})
	// })}else{
	console.log(ipAddress);
	console.log(request.session.login);
	var id= request.body.PID;
	var Proname= request.body.Pname;
	var ProdPrice= request.body.price;
	var Quantity= request.body.quantity;
	var cid= cid;
	FoodCart.findOne({CID:cid,Pname:Proname}, (err,result)=>{
		///console.log(result);
	if(result!=null){
		var quant= parseInt(result.Quantity)+parseInt(Quantity);
		result.Quantity=quant;
		result.save();
	}		
	else{
	const newFoodCart=FoodCart({
	PID: id,
	Pname: Proname,
	Price: ProdPrice,
	Quantity: Quantity,
	CID:cid
	})

newFoodCart.save().then (data=> console.log("Data Inserted Successfully"));
}
})

FoodProduct.find({}, (err,result)=>{
		if(err) throw err
		else
			//console.log(result);
		    response.render('Index', {'prodetail': result, customer: request.session.login,'msg': 'Product Added to the Cart..'})
		})

});
	

app.get('/viewCart',(request,response)=>{
	if(request.session.login===undefined){
	var ipAddress = request.header('x-forwarded-for') || request.connection.remoteAddress;
	cid=ipAddress;
    }else {
    	cid= request.session.login;
    }
FoodCart.aggregate([
{
	$match: {CID:cid}
},
{
	$lookup:
	{
		from:"foodproducts",
		localField: "Pname",
		foreignField: "Pname",
		as: "data"
	}

}],(err,result)=>{
	
	if(err) throw err
	else if(result.length>0){
//console.log(result.length)
var cartData=result;
var fprice=result.map((rec)=>{
var total=(rec.Price*rec.Quantity);
	return total;
})
//console.log(fprice);
var finalResult=cartData.map((rec,index)=>{
	var pair={fprice:fprice[index]}
	obj={...rec,...pair};
	return obj;
})
var Gtotal=fprice.reduce((price,num)=>{return price+num})
//console.log(Gtotal);
response.render('CustomerCart',{'prodetail': finalResult, 'gtotal': Gtotal, customer: request.session.login})
}else
response.render('CustomerCart',{ 'prodetail': result,customer: request.session.login})
})

})

app.get('/removecartproduct',(request, response)=>{
if(request.session.login===undefined){
    var ipAddress = request.header('x-forwarded-for') || request.connection.remoteAddress;
	var cid=ipAddress;
    }else {
    var	cid= request.session.login;
    }
	var id= request.query.id;
	//console.log(id);
	FoodCart.deleteOne({CID:cid, Pname:id},(err)=>{
		if(err) throw err;
		else{
			response.redirect('/viewCart')
}		
})
})

app.post('/placeOrder',(request, response)=>{
if(request.session.login===undefined){
	response.redirect('/customerLogin');
}else{
	var address=request.body.text;
	var amount=request.body.amount;
	response.render('Payment',{customer: request.session.login, addr:address, amount:amount})
}
})
//===================================AddressAJAX=========================================
app.get('/checkAddress',(request, response)=>{
	if(request.session.login===undefined)
		response.redirect('/');
else{
	var userid=request.session.login;
	CustomerSignup.findOne({userid:userid},(err,result)=>{
		if(err) throw err;
		else 
		 var data=result.address;
			response.send({'msg':data})
	})
}
})

//====================Payment Method================================================================
const stripe=require('stripe')('sk_test_mNmjvufwrIycCWnRZcq9jZtl00LeKmsqHu')

app.post('/pay',(request,response)=>{
var token=request.body.stripeToken;
var chargeamt=request.body.amount;
var address=request.body.address;
var charge=stripe.charges.create({
amount:chargeamt,
currency:"inr",
source:token
},(err,result)=>{
if(err){
        console.log("Card Decliend");
    }else
//console.log('Payment Successfully');
var mailOptions={
		from: 'harshie.hr.111@gmail.com',
		to:   'Nparmar91@gmail.com',
		subject: 'Payment Status',
		text:   'Hello Customer, Your payment of inr' +chargeamt+' is successful.'
	}

	transporter.sendMail(mailOptions, (err, result)=>{
	if(err) throw err
		else{
			console.log('Payment Successful..');
		}
		})
//console.log(address);
response.redirect('/checkOut?addr='+address &'payment=Paid')
});
});

//========================================================================================================
const CustomerOrder=require('./Models/OrderTableModel')
app.get('/checkOut',(request,response)=>{
	if(request.session.login===undefined)
		response.redirect('/');
else{
var cid=request.session.login;
 
FoodCart.aggregate([
{
	$match: {CID:cid}
},
{
	$lookup:
	{
		from:"foodproducts",
		localField: "Pname",
		foreignField: "Pname",
		as: "data"
	}

}],(err,result)=>{
	//console.log(result);
 var cartData=result.map((d)=>{
  	var Proname=d.Pname;
  	var Price=d.Price;
  	var Quantity=d.Quantity;
  	var addr= request.query.addr;
  	var CID=cid;
  	var total= (d.Price*d.Quantity);
  	var status= 'Pending';
  	var Payment=request.query.payment;
  	console.log(Payment);
const newCustomerOrder=CustomerOrder({
	
	Pname: Proname,
	Price: Price,
	Quantity: Quantity,
	Address:addr,
	CID:cid,
	Total:total,
	Status:status,
	Payment: Payment
	})
newCustomerOrder.save().then (data=> console.log("Data Inserted Successfully"));
  })
 FoodCart.remove({CID:cid},(err)=>{
 	if(err) throw err
 		else
 			//console.log("Data Deleted")
 		response.render('CustomerCart',{customer: request.session.login, ordermsg:'Payment done and Order Placed Successfully..'})
 })
})
}
})

app.get('/orderStatus',(request,response)=>{
	if(request.session.login===undefined)
		response.redirect('/');
else{
	var cid=request.session.login;
CustomerOrder.aggregate([
{
	$match: {CID:cid}
},
{
	$lookup:
	{
		from:"foodproducts",
		localField: "Pname",
		foreignField: "Pname",
		as: "data"
	}

}],(err,result)=>{

	//console.log(result)
response.render('CustomerOrderStatus',{ prodetail: result, customer: request.session.login})
})
}
})

	
//==============================================================================================================================================================
//================404 Page Not found=================================================//
app.use(function(request, response){
	response.status(404);
	response.render('404', {title: '404: Requested Page Not Found'})
})		