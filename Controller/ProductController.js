const express= require('express');
const router= express.Router();

router.get('/Hello',(requset, response)=>{
	response.send({msg:'Welcome REST API'});
});
const mongoose=require('mongoose');
const url="mongodb://localhost:27017/empdb";
mongoose.connect(url);

const Login = require('../Models/LoginModel');
const FoodProduct= require('../Models/ProductModel');
const CustomerSignup= require('../Models/CustomerModel');
const FoodCart=require('../Models/FoodCartModel');
const CustomerOrder= require('../Models/OrderTableModel');


const jwt= require('jsonwebtoken');

router.post('/loginCheck',(request,response)=>{
	var loginid= request.body.loginid;
	var pass= request.body.password;
	var user={
  			uid:loginid,
  			pass:pass
			}

	Login.find({userid:loginid, password: pass},(err, result)=>{
		if(err)
			response.send({'err': err})
		else if(result.length!=0){
			jwt.sign({user:user},'secretkey',{expiresIn:'100s'},(err,token)=>{
            if(err) throw err
            else
			response.send({msg: 'Login Success', token:token})
		})
		}else
			response.send({msg: 'Login Fail, Try Again..'})
	})
})


router.get('/viewProducts', verifyToken, (request, response)=>{
	jwt.verify(request.token, 'secretkey', (err, authData)=>{
		if(err)
			response.send({'err': err})
		else{
		FoodProduct.find({}, (err,result)=>{
		if(err) throw err
		else
			console.log(result);
		    result['user']=authData;
			response.send(result);
			})
	}
	})
})

 router.post('/addProduct', verifyToken, (request, response)=>{
	
	jwt.verify(request.token, 'secretkey', (err, authData)=>{
		if(err)
			response.send({'err': err})
		else{
	var pname= request.body.pname;
	var category= request.body.category;
	var price= request.body.price;
	var description= request.body.desc;

	const newfoodProduct= FoodProduct({
	Pname: pname,
	Category: category,
	Price: price,
	Description: description,	
			})
  newfoodProduct.save((err, result)=>{
  	if(err)
  		response.json({'err': err});
  	else
  		response.json({msg:'Product Added Successfully..'})
  })
}
})
})

router.delete('/deleteProduct',verifyToken,(request, response)=>{
	jwt.verify(request.token, 'secretkey', (err, authData)=>{
		if(err)
			response.json({'err': err})
		else{
	var id= request.query.id;
	FoodProduct.deleteOne({_id:id},(err)=>{
		if(err) throw err
			else
				response.json({'msg': 'Product Deleted...'})
	})
}
})
})

router.put('/updateProduct', verifyToken,(request, response)=>{
	jwt.verify(request.token, 'secretkey', (err, authData)=>{
		if(err)
			response.send({'err': err})
		else{
	var id= request.body.id;
	var Proname= request.body.pname;
	var category= request.body.category;
	var ProdPrice= request.body.price;
	var desc= request.body.description;
	FoodProduct.findByIdAndUpdate({_id:id},{Pname:Proname, Category:category, Price:ProdPrice, Description: desc},(err)=>{
	
		if(err)
			response.json({'err':err})
			else
				response.json({'msg': 'Product Updated...'})
	})
}
})
})

router.get('/viewPendingOrders',verifyToken,(request,response)=>{
	jwt.verify(request.token, 'secretkey', (err, authData)=>{
		if(err)
			response.json({'err': err})
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

	if(err)
		response.json({'err': err})
	else
	//console.log(result)
    response.json(result);
})
}	
})
})
// 	var 
// })




// FORMAT OF TOKEN
// Authorization: Bearer <access_token>
// Verify Token
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if(typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.json({msg:'Please provide valid token'});
  }
}

//=============================Customer Controller===================================================================================================//

router.post('/customerlogin',(request,response)=>{
	var loginid=request.body.loginid;
	var pass= request.body.password;
	var user={
  			uid:loginid,
  			pass:pass
			}

	CustomerSignup.find({userid:loginid, password: pass},(err, result)=>{
		if(err)
			response.json({'err': err})
		else if(result.length!=0){
			jwt.sign({user:user},'secretkey',{expiresIn:'100s'},(err,token)=>{
            if(err) throw err
            else
			response.send({msg: 'Login Success', token:token})
		})
		}else
			response.send({msg: 'Login Fail, Try Again..'});
})
})

router.post('/signupCustomer',verifyToken,(request, response)=>{
	jwt.verify(request.token, 'secretkey', (err, authData)=>{
		if(err)
			response.json({'err': err})
		else{
var userid= request.body.cid;
var username= request.body.Cname;
var pass = request.body.password;
var contact=request.body.contactno;
var address=request.body.address;
const newCustomerSignup= CustomerSignup({
	userid: userid,
	username: username,
	password: pass,
	contactno:contact,
	address:address
})
newCustomerSignup.save((err,result)=>{
	if(err) 
		response.json({'err': err})
	else
		response.json(result, {'msg':'Customer SIgnedUp Successfully'})
})
}
})
})

router.post('/addToCart',verifyToken,(request, response)=>{
	jwt.verify(request.token, 'secretkey', (err, authData)=>{
		if(err)
			response.json({'err': err})
		else{
	var id= request.body.PID;
	var Proname= request.body.Pname;
	var ProdPrice= request.body.price;
	var Quantity= request.body.quantity;
	var cid= request.body.cid;

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

newFoodCart.save((err,result)=>{
	if (err)
		response.json({'err':err});
	else response.json({'msg':'Product '+Proname+' Added to the Cart'});
})
}
})
}
})
})

router.get('/viewCart', verifyToken,(request,response)=>{
	jwt.verify(request.token, 'secretkey', (err, authData)=>{
		if(err)
			response.json({'err': err})
		else{
	var cid=request.query.cid;
FoodCart.find({CID:cid},(err,result)=>{
	if(err) response.json({'err': err});
	else
		response.json(result);
})
}
})
})


router.delete('/removecartproduct',verifyToken,(request, response)=>{
	jwt.verify(request.token, 'secretkey', (err, authData)=>{
		if(err)
			response.json({'err': err})
		else{
	var cid=request.query.cid;
	var Pname=request.query.Pname;
	FoodCart.deleteOne({CID:cid, Pname:Pname},(err,result)=>{
	if(err) response.json({'err': err});
	else
		response.json({'msg':'Product removed from Cart'});
})
}
})
})

router.get('/vieworderStatus',verifyToken,(request,response)=>{
	jwt.verify(request.token, 'secretkey',(err,authData)=>{
		if(err) response.json({'err': err});
		else{
			var cid=request.query.cid;
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
			if(err) response.json({'err': err});
			else
		response.json(result);
		
	})
	}
	})
})
module.exports=router;