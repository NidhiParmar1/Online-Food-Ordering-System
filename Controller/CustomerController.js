const express= require('express');
const router= express.Router();

router.get('/Hello1',(requset, response)=>{
	response.send({msg:'Welcome Hello1 REST API'});
});