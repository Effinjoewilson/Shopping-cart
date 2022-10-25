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