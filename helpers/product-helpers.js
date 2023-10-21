
var db = require('../config/connection')
var collection= require('../config/collections')
var objectId=require('mongodb').ObjectId
const bcrypt = require('bcrypt')

module.exports={

    addProduct:(producted,callback) =>{                                       // using call back 
        //console.log(producted);   

        db.get().collection('product').insertOne(producted).then((data)=>{
           // console.log(data);
            callback(data.insertedId)
        })
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
          try {
            const products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
          } catch (error) {
            console.error('Error fetching products:', error);
            reject(error); // Reject the promise in case of an error
          }
        });
      },

    deleteProduct:(proId) =>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
                //console.log(response)
                resolve(response)
            })
        })
    },

    getProductDetails:(proId) =>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },

    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},{
                $set:{
                    name:proDetails.name,
                    category:proDetails.category,
                    price:proDetails.price,
                    description:proDetails.description

                }
            }).then((response)=>{
                resolve()
            })
        })
    },

    /*doSignup:(adminData)=>{
        //console.log(adminData)
        return new Promise(async(resolve,reject)=>{
            adminData.password =await bcrypt.hash(adminData.password,10)                               //since it is a single threaded 
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data)=>{      //function, if await is not given
                //console.log(data)                                                                //null will be there in db
                resolve(adminData)
            })
        })
        
    },*/

    doLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let admin= await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.email})
            if(admin){
                bcrypt.compare(adminData.password,admin.password).then((status)=>{       //bcrypt.compare is to check if the current
                    if(status){                                                 //password is same to encrypted password in database
                        console.log("Login success")
                        response.admin=admin
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

    getAllUsers:()=>{

        return new Promise(async(resolve,reject)=>{

            let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()
            //console.log(users)
            resolve(users)
        })
    },

    getAllOrders:()=>{

        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collection.ORDER_HISTORY_COLLECTION).find().toArray()

            resolve(orders)
        })
    },

    getCartProductsFromHistory:()=>{
        return new Promise(async(resolve,reject)=>{
            let product= await db.get().collection(collection.ORDER_HISTORY_COLLECTION).aggregate([
                /*{
                    $match:{userId:objectId(userId)}            //aggregate method is used in this case to check the userId
                },*/                                           //and display the products which is added to cart
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
            resolve(product)
            
        })
    },

    changeStatus:(status,orderId)=>{
        return new Promise((resolve,reject)=>{

            db.get().collection(collection.ORDER_HISTORY_COLLECTION)
            .updateOne({_id:objectId(orderId)},{
                $set:{
                    status:status,
                }
            }).then((response)=>{
                resolve(status)
            })
        })
    }
}