var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')

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

router.post('/login', (req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      res.redirect('/')
    }else{
      res.redirect('/login')
    }
  })
})

router.get('/signup', (req,res)=>{
  res.render('user/signup')
})

router.post('/signup', (req,res)=>{
  //console.log(req.body)
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response)
  })
})

module.exports = router;
