const express= require('express');
var app= express();

const port= process.env.PORT ||8000;
 app.listen(port, ()=>{
 	console.log("Server Started on Port:"+port);
 })
const bodyparser= require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
	extended: true
}));

const productcontroller= require('./Controller/ProductController');
app.use('/api', productcontroller);

 // const customercontroller= require('./Controller/CustomerController');
 // app.use('/api', customercontroller);