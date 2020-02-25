const mongoose= require('mongoose');
var schema= mongoose.Schema;
const LoginSchema= schema({
	userid: String,
	password: String
})

module.exports= mongoose.model('Login', LoginSchema);