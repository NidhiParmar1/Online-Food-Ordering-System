const mongoose= require('mongoose');
var schema= mongoose.Schema;
const CartSchema= schema({
	PID: Object,
	Pname: String,
	Price: Number,
	Quantity: Number,
	CID: String
	
})

module.exports= mongoose.model('FoodCart', CartSchema);