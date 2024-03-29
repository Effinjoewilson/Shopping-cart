var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
const verifyLogin=(req,res,next)=>{
  if(req.session.userLoggedIn){
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
  if(req.session.user){
    res.redirect('/')
  }else
  res.render('user/login',{"loginErr":req.session.userloginErr})
  req.session.userloginErr=false
})

router.post('/login', (req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      
      req.session.user=response.user   // user detsils is used in various place using req.session.user
      req.session.userLoggedIn=true   //if user is logged in or if there is session is ditermined by req.session.userLoggedIn
      res.redirect('/')
    }else{
      req.session.userloginErr='Invalid username or password'
      res.redirect('/login')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/')
})

router.get('/signup', (req,res)=>{
  res.render('user/signup')
})

router.post('/signup', (req,res)=>{
  //console.log(req.body)
  userHelpers.doSignup(req.body).then((userData)=>{
    //console.log(userData)
    
    req.session.user=userData
    req.session.userLoggedIn=true
    res.redirect('/')
  })
})

router.get('/cart',verifyLogin, async(req,res)=>{

  let user=req.session.user
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let totalValue=0;
  if(products.length>0){
    totalValue=await userHelpers.getTotalAmount(req.session.user._id)  //to display total value in cart page
  }
  
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
    res.json(orderId)
    //console.log("OrderId : "+orderId) 
  })
})

router.get('/confirm-order/:id', verifyLogin, async(req,res)=>{
  //console.log("Order id : "+req.params.id)
  var orderId=req.params.id
  let user=req.session.user
  //console.log(user)
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let details=await userHelpers.getUserOrderDetails(orderId)
  let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  //console.log("hai"+details._id)
  res.render('user/confirm-order',{admin:false,user,details,products,totalValue})
})

router.post('/delete-Cart-Order-collections-add-toHistory', async(req,res)=>{
  //console.log(req.body)
  userId=req.body.userId
  orderId=req.body.orderId
  let products=await userHelpers.getCartProducts(userId)
  let details=await userHelpers.getUserOrderDetails(orderId)
  let totalValue=await userHelpers.getTotalAmount(userId)

  if(details.paymentMethod=='cash'){
    userHelpers.insertToOrderHistory(userId,orderId,products,details,totalValue)
    res.json({cash:true})
 }else{
   //console.log("This is Effin")
    userHelpers.generateRazorpay(orderId,totalValue).then((response)=>{
     res.json(response)
    })
 }
})

router.get('/order-history', verifyLogin,async(req,res)=>{
  let user=req.session.user
  let orderHistory=await userHelpers.getUserOrderHistoryDetails(user._id)
  //console.log(orderHistory)
  let products=await userHelpers.getCartProductsFromHistory(user._id)
  //console.log(products)
  res.render('user/order-history',{admin:false,user,orderHistory,products})
})

router.post('/verify-payment', async(req,res)=>{
  let userId=req.session.user._id
  let orderId=req.body['order[receipt]']
  
  //console.log(req.body)
  userHelpers.verifyPayment(req.body).then(()=>{
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
        //console.log("Payment Successfull");

        res.json({status:true})
      })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:''})
  })
})

router.get('/insert-to-order-history/:id', async(req,res)=>{
  let userId=req.session.user._id
  var orderId=req.params.id
  let products=await userHelpers.getCartProducts(userId)
  let details=await userHelpers.getUserOrderDetails(orderId)
  let totalValue=await userHelpers.getTotalAmount(userId)

  userHelpers.insertToOrderHistory(userId,orderId,products,details,totalValue)
  res.redirect('/order-history')
})

module.exports = router; 
