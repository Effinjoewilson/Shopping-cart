var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/',async function(req, res, next) {

  let user=req.session.user
  //console.log(user)
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  

  productHelpers.getAllProducts().then((products)=>{
    //console.log(products)
    res.render('user/view-products',{admin:false,products,user,cartCount}); 
  })

});

router.get('/login', function(req,res){
  if(req.session.loggedIn){
    res.redirect('/')
  }else
  res.render('user/login',{"loginErr":req.session.loginErr})
  req.session.loginErr=false
})

router.post('/login', (req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.loginErr='Invalid username or password'
      res.redirect('/login')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.get('/signup', (req,res)=>{
  res.render('user/signup')
})

router.post('/signup', (req,res)=>{
  //console.log(req.body)
  userHelpers.doSignup(req.body).then((userData)=>{
    //console.log(userData)
    req.session.loggedIn=true
    req.session.user=userData
    res.redirect('/')
  })
})

router.get('/cart',verifyLogin, async(req,res)=>{

  let user=req.session.user
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let totalValue=await userHelpers.getTotalAmount(req.session.user._id)  //to display total value in cart page
  //console.log(products) //<=
  res.render('user/cart',{user,products,totalValue})                             //let user=req.session.user
  /*                                                                      //if(req.session.loggedIn){
     using middleware instead of checking                                        //res.render('user/cart',{user})
     session at each time                                                // }else
  */                                                                             // res.redirect('/login')
  
})

router.get('/add-to-cart/:id', (req,res)=>{                                  //verifyLogin is removed. Ajax blocks it
  //console.log("This is Effin")                                            //it should be added in a different manner
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })
})

router.post('/change-product-quantity', (req,res,next)=>{
  //console.log("This is Effin") 
  userHelpers.changeProductQuantity(req.body).then((response)=>{  //in req.body= 4 data that is passed from cart.hbs
    res.json(response)
  })
})

router.post('/remove-product', (req,res)=>{
  //console.log(req.body)
  userHelpers.removeProductFromCart(req.body).then((response)=>{
    res.json(response)
  })
})

router.get('/place-order', verifyLogin, async(req,res)=>{
  let user=req.session.user
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{admin:false,user,total})
})

router.post('/place-order', async(req,res)=>{
  //console.log(req.body)
  let products=await userHelpers.getCartProductList(req.body.userId)  //it takes the product list in the cart not entire product
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)   //that means in cart it includes quantity
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    //console.log("OrderId : "+orderId)
    if(req.body['payment_method']=='cash'){
       res.json({cash:true})
    }else{
      //console.log("This is Effin")
       userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)
       })
    }
    
  })
})

router.get('/cash-on-delivery', verifyLogin, async(req,res)=>{
  let user=req.session.user
  //console.log(user)
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let details=await userHelpers.getUserOrderDetails(user._id)
  let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  //console.log(details)
  res.render('user/cash-on-delivery',{admin:false,user,details,products,totalValue})
})

router.post('/delete-Cart-Order-collections-add-toHistory', async(req,res)=>{
  //console.log(req.body)
  userId=req.body.userId
  orderId=req.body.orderId
  let products=await userHelpers.getCartProducts(userId)
  let details=await userHelpers.getUserOrderDetails(userId)
  let totalValue=await userHelpers.getTotalAmount(userId)
  userHelpers.insertToOrderHistory(userId,orderId,products,details,totalValue).then((response)=>{
    //console.log("Hai this is effin")
    res.json({status:true})
  })
})

router.get('/order-history', verifyLogin,async(req,res)=>{
  let user=req.session.user
  let orderHistory=await userHelpers.getUserOrderHistoryDetails(user._id)
  //console.log(orderHistory)
  let products=await userHelpers.getCartProductsFromHistory(user._id)
  //console.log(products)
  res.render('user/order-history',{admin:false,user,orderHistory,products})
})

router.post('/verify-payment', (req,res)=>{
  console.log(req.body)
})

module.exports = router; 
