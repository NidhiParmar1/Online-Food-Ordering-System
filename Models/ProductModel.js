const mongoose= require('mongoose');
var schema= mongoose.Schema;
const ProductSchema= schema({
	Pname: String,
	Category: String,
	Price: Number,
	Description: String,
	ImgAddress: String
})

module.exports= mongoose.model('FoodProduct', ProductSchema);