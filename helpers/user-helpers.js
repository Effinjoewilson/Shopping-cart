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
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})//in the 
            if(userCart){                                                      //cart_collcetion checking if the user is 
                db.get().collection(collection.CART_COLLECTION)               //alredy added a item to cart, by checking userId.  
                .updateOne({user:objectId(userId)},{                         //if already added push new items to it.
                                                                            // else new user is created to a cart_collection and
                        $push:{products:objectId(proId)}                   //products are passed as an array.
                    
                }).then((response)=>{
                    resolve()
                })
            }else{
                let cartObj={
                    user:objectId(userId),
                    products:[objectId(proId)]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    }
}