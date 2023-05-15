var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
const verifyLogin=(req,res,next)=>{
  //console.log("Login verified")
  if(req.session.admin){
    next()
  }else{
    res.redirect('/admin/login')
  }
}

/* GET users listing. */
router.get('/', verifyLogin,function(req, res, next) {

  productHelpers.getAllProducts().then((products)=>{
    //console.log(products)
    res.render('admin/view-products',{admin:true,products}); 
  })

});

router.get('/add-product',verifyLogin, function(req,res){
  res.render('admin/add-product',{admin:true})
})

router.post('/add-product', verifyLogin,(req,res)=>{                                       //connecting
       // console.log(req.body)
      //  console.log(req.files.Image)
  productHelpers.addProduct(req.body,(id)=>{
    //console.log(id)
    let image=req.files.Image                                                   // add-product form with
    image.mv('./public/product-images/'+id+'.jpg', (err)=>{          
      if(!err){
        res.render('admin/add-product',{admin:true})
      }else{
        console.log(err)                                                           //Mongodb
      }
    })

    
  })
})

router.get('/delete-product/:id',verifyLogin,(req,res)=>{
  let proId=req.params.id     //like req.body in post method
  //console.log(proId)

  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })
})

router.get('/edit-product/:id',async(req,res)=>{
  //let proId=req.params.id  (id is passed by req.params.idname)
   let product= await productHelpers.getProductDetails(req.params.id)
  // console.log(product)
  res.render('admin/edit-product',{product,admin:true})
})

router.post('/edit-product/:id',verifyLogin,(req,res)=>{
 // console.log(req.params.id)
 let id=req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.Image){
      let image=req.files.Image                                                  
    image.mv('./public/product-images/'+id+'.jpg')
    }
  })
})

router.get('/login', function(req,res){
  if(req.session.admin){
    res.redirect('/admin/')
  }else
  res.render('admin/login',{"loginErr":req.session.adminloginErr})
  req.session.adminloginErr=false
})

router.post('/login', (req,res)=>{
  productHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      //console.log(response)
      req.session.admin=response.admin
      req.session.admin.loggedIn=true
      res.redirect('/admin/')
    }else{
      req.session.adminloginErr='Invalid username or password'
      res.redirect('/admin/login')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.admin=null
  res.redirect('/')
})

/*router.get('/signup', (req,res)=>{
  res.render('admin/signup')
})

router.post('/signup', (req,res)=>{
  //console.log(req.body)
  productHelpers.doSignup(req.body).then((adminData)=>{
    //console.log(adminData)
    
    req.session.admin=adminData
    req.session.admin.loggedIn=true
    res.redirect('/admin')
  })
})*/

router.get('/all-users',verifyLogin, async(req,res)=>{
  let users=await productHelpers.getAllUsers()
  //console.log(users)
  res.render('admin/all-users',{users,admin:true})
})

module.exports = router;
