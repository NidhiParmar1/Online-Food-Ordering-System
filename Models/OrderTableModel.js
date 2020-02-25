const mongoose= require('mongoose');
var schema= mongoose.Schema;
const OrderTableSchema= schema({
	Pname: String,
	Price: Number,
	Quantity: Number,
	Total: Number,
	Address:String,
	CID: String,
	Status: String,
	Payment: String,
	datetime:{type: Date, 'default': Date.now, index: true}
})

module.exports= mongoose.model('CustomerOrder', OrderTableSchema);
