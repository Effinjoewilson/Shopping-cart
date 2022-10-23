
var db = require('../config/connection')
var collection= require('../config/collections')
var objectId=require('mongodb').ObjectId

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
    }
}