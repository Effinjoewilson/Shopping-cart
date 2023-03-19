var db = require('../config/connection')
var collection= require('../config/collections')
const bcrypt = require('bcrypt')
const { response } = require('express')
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
                    .updateOne({user:objectId(userId),'products.item':objectId(proId)},
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
                        as:'product'                 //console this at check, there will be _id,item,quantity,and products 
                    }                               //as an array. for this we only need things that are projecting below 
                },                                 //The product can be seen as a array. converting the zeroth element of the 
                {                                 // array as an object. So while passing to cart dont want to take inside array
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
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
    },

    changeProductQuantity:(details)=>{
        //console.log(details)
        details.count=parseInt(details.count)
        details.quantity=parseInt(details.quantity)

        return new Promise((resolve,reject)=>{

            if(details.quantity==1 && details.count==-1){

                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart)},
                {
                    $pull:{products:{item:objectId(details.product)}}    //The pull method removes an item if the  
                }                                                       // item quantity become zero
                ).then((response)=>{
                    resolve({removeProduct:true})
                })

            }else{

                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart), 'products.item':objectId(details.product)},
                {
                    $inc:{'products.$.quantity':details.count}
                }
                ).then((response)=>{
                    resolve(true)
                })
            }
        })
    },

    removeProductFromCart:(details)=>{

        return new Promise((resolve,reject)=>{

            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:objectId(details.cart)},
            {
                $pull:{products:{item:objectId(details.product)}}    //The pull method removes the  
            }                                                       // entire product from cart
            ).then((response)=>{
                resolve({removeProduct:true})
            })
        })
    },

    getTotalAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let total= await db.get().collection(collection.CART_COLLECTION).aggregate([
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
                },                                  
                {                                 
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },{
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity',{$convert:{input:'$product.price',to:'int'}}]}}
                    }             //first quantity*price then takes the sum of all then it is placed in total
                }


            ]).toArray()
            //console.log(total[0].total); it give total amount
            resolve(total[0].total)
            
        })
    },

    placeOrder:(order,products,total)=>{
        return new Promise((resolve,reject)=>{
            //console.log(order,products,total)
            let status=order.payment_method==='cash'?'placed':'pending'  //like if else
            let orderObj={
                deliveryDetails:{
                    mobile:order.phonenumber,
                    address:order.address,
                    pincode:order.pincode
                },
                userId:objectId(order.userId),
                paymentMethod:order.payment_method,
                products:products,
                totalAmount:total,
                status:status,
                date:new Date()
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
                resolve()
            })
        })
    },

    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{

            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            resolve(cart.products)
        })
    },

    getUserOrderDetails:(userId)=>{  // MINE
        return new Promise(async(resolve,reject)=>{
            
            let orderDetails=await db.get().collection(collection.ORDER_COLLECTION).findOne({userId:objectId(userId)})
            resolve(orderDetails)
        })
    }
}