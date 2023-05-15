
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

    getAllProducts:() =>{                                                      // using promise
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)                //resolve is for success 
        })                                  //when it is returned its
    },                                      //value will be in then

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
    }
}