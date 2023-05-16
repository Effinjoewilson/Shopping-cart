function addToCart(proId){
    $.ajax({                                                //seperate script should be added for ajax
      url:'/add-to-cart/'+proId,                           //in layout.hbs
      method:'get',
      success:(response)=>{
        if(response.status){
            let count=$('#cart-count').html()              //id='cart-count' is given for cart to get the number of
            count=parseInt(count)+1                       //items added to the cart as badge in user-header.
            $('#cart-count').html(count)                 //count is taken in a string format to convert it into
        }                                               //a integer parseInt() is used
          
      }
    })
  }


  function changeQuantity(cartId,proId,count){
    let quantity=parseInt(document.getElementById(proId).innerHTML)// this takes the current quantity 
    //console.log(cartId)
    count=parseInt(count)

    $.ajax({
        url:'/change-product-quantity',
        data:{
            cart:cartId,
            product:proId,
            count:count,
            quantity:quantity
        },
        method:'post',
        success:(response)=>{
            if(response.removeProduct){
                alert("Product removed from the cart")
                //console.log("PRODUCT DELETED")
                location.reload()
            }else{
                //console.log("PRPDUCT INCREMENT OR DECREMENTED")
                document.getElementById(proId).innerHTML=quantity+count
                location.reload()
            }
        }
    })
}

function removeProduct(cartId,proId){

    $.ajax({
        url:'/remove-product',
        data:{
            cart:cartId,
            product:proId
        },
        method:'post',
        success:(response)=>{
            if(response.removeProduct){
                //console.log("PRODUCT DELETED")
                alert("Product removed from the cart")
                location.reload()
            }else{
                console.log("ERROR OCCURED")
            }
        }
    })
}