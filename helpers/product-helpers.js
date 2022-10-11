
var db = require('../config/connection')
var collection= require('../config/collections')

module.exports={

    addProduct:(producted,callback) =>{                                       // using call back 
        //console.log(product);   

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
    }                                      //value will be in then
}