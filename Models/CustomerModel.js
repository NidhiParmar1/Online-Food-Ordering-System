const mongoose= require('mongoose');
var schema= mongoose.Schema;
const SignupSchema= schema({
	userid: String,
	username: String,
	password: String,
	contactno:Number,
	address:String,
})

module.exports= mongoose.model('CustomerSignup', SignupSchema);