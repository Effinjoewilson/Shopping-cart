var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
const userHelper = require('../helpers/user-helpers')

/* GET home page. */
router.get('/', function(req, res, next) {

  productHelpers.getAllProducts().then((products)=>{
    //console.log(products)
    res.render('user/view-products',{admin:false,products}); 
  })

});

router.get('/login', function(req,res){
  res.render('user/login')
})

router.get('/signup', (req,res)=>{
  res.render('user/signup')
})

router.post('/signup', (req,res)=>{
  //console.log(req.body)
  userHelper.doSignup(req.body).then((response)=>{
    console.log(response)
  })
})

module.exports = router;
