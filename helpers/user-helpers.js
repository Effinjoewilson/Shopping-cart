var db = require('../config/connection')
var collection= require('../config/collections')
const bcrypt = require('bcrypt')
var objectId=require('mongodb').ObjectId

module.exports={
    doSignup:(userData)=>{
        //console.log(userData)
        return new Promise(async(resolve,reject)=>{
            userData.password =await bcrypt.hash(userData.password,10)                               //since it is a single threaded 
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{      //function, if await is not given
                //console.log(data)                                                                //null will be there in db
                resolve(userData)
            })
        })
        
    },

    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{       //bcrypt.compare is to check if the current
                    if(status){                                                 //password is same to encrypted password in database
                        console.log("Login success")
                        response.user=user
                        response.status=true
                        resolve(response)
                    }else{
                        console.log("Login failed")
                        resolve({status:false})
                    }
                })
            }else{
                console.log("Login failed")
                resolve({status:false})
            }
        })
    },

    addToCart:(proId,userId)=>{
       // console.log(proId+" Chris")
       // console.log(userId+" Effin")
       let proObj={
        item:objectId(proId),
        quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})//in the cart_collcetion
            if(userCart){                                                               // checking if the user is alredy added
                let proExist=userCart.products.findIndex(product=> product.item==proId)// a item to cart, by checking userId.
                console.log(proExist)                                                 //if already added push new items to it.
                if(proExist!=-1){                                                    // else new user is created to a cart_collection 
                    db.get().collection(collection.CART_COLLECTION)                 //and products are passed as an array.
                    .updateOne({'products.item':objectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}                       //If already user is present, while pushing new product
                    }                                                       //to the cart, checking if the product is alredy present
                    ).then(()=>{                                           //in the cart. if it is alredy present add quantity
                        resolve()                                         //to the product by incrementing the quantity by 1.
                    })                                                   //else new product is pushed to the cart.
                }else{                                                       
                db.get().collection(collection.CART_COLLECTION)                 
                .updateOne({user:objectId(userId)},{                         
                                                                            
                        $push:{products:proObj}                   
                    
                }).then((response)=>{
                    resolve()
                })
                }
            }else{
                let cartObj={
                    user:objectId(userId),
                    products:[proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },

    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems= await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}            //aggregate method is used in this case to check the userId
                },                                           //and display the products which is added to cart
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                }
            ]).toArray()
            //console.log(cartItems)   //<=
            //console.log(cartItems[0].products)
            resolve(cartItems)
            
        })
    },

    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count=cart.products.length
            }
            resolve(count)
        })
    }
}