var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');

/* GET users listing. */
router.get('/', function(req, res, next) {

  productHelpers.getAllProducts().then((products)=>{
    //console.log(products)
    res.render('admin/view-products',{admin:true,products}); 
  })

});

router.get('/add-product', function(req,res){
  res.render('admin/add-product',{admin:true})
})

router.post('/add-product', (req,res)=>{                                       //connecting
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

router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id     //like req.body in post method
  //console.log(proId)

  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })
})

router.get('/edit-product/:id',async(req,res)=>{
  //let proId=req.params.id
   let product= await productHelpers.getProductDetails(req.params.id)
  // console.log(product)
  res.render('admin/edit-product',{product,admin:true})
})

module.exports = router;
