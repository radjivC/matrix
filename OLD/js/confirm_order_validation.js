
document.getElementById("twitter").onblur = function() {
    var twitterAccount = $('#twitter').val();
    if (twitterAccount.charAt(0) !== '@')
        twitterAccount = "@" + twitterAccount;
    console.log(twitterAccount);
};

var valid_promo_code = false
var has_free_deliveries = false
var socialPromoCodeFromUserLogged = "";

has_free_deliveries = false;
var cardId = "newCard";

function formKeypress() {
      $('#review_error').html("")
}

function nameKeypress() {
      $('#name_error').html("")
}

function emailKeypress() {
      $('#email_error').html("")
}

function phoneKeypress() {
      $('#phone_error').html("")
}

function promoKeypress() {
      $('#promo_error').html("")
}

function enable_link(link_id) {
  $(link_id).removeClass('disabled');   
  $(link_id).addClass('pointer');
  $(link_id).children('a').unbind('click');
}

function disable_link(link_id) {
    $(link_id).removeClass('pointer');
  $(link_id).children('a').bind('click', function(e){
      e.preventDefault();
  })
}


var selected_delivery_window = ""
function select_delivery_window(available_queue_id){
    $('#'+selected_delivery_window).removeClass("delivery-window-active");
    selected_delivery_window = available_queue_id;
    $('#selected_queue_id').val(available_queue_id);
    $('#'+selected_delivery_window).addClass("delivery-window-active");
}

function clickBackStep(step) {
    //window.location = '/orders/new?step=' + step + '&order_conf=8A1D5ED7'
    console.log("step back");
}

function updateCheckOutDisplay(){
    if(has_free_deliveries || valid_promo_code){
        $('#checkout_display').hide()
        $('#cash_div').hide()
        
    }else{
        $('#checkout_display').show()
        $('#cash_div').show()
    }
}

function promocodeKeypress(){
    var promoCode = document.getElementById('promo_code').value;
    var email = document.getElementById('email').value;
    if(email == "")
        return;
    
    if(socialPromoCodeFromUserLogged == "")
        return;
        
    if(socialPromoCodeFromUserLogged == promoCode){
        $('#promo_code_error').html("Lo sentimos, pero no puedes ingresar tu propio código de promoción, mejor compartelo con un amigo :)");
    }else{
        $('#promo_code_error').html("");
    }
    
    /*
    $.ajax({
        url: "/orders/checkPromoCode/" + promoCode + "/" + email,
        type: "POST",
        cache: false,
        complete: function(result) {
            var promoCodeFromDB = result.responseText;
            valid_promo_code = promoCode.replace(/\s/g, '') == promoCodeFromDB.replace(/\s/g, '');
            
            if(valid_promo_code)
                $('#mount').html("Tu envío será <b>GRATIS</b> gracias a tu código ingresado.")
            else
                $('#mount').html("Se realizará un cargo de <strong>$50.00 MXN</strong>")
                
            updateCheckOutDisplay();
        }
    });
    */
}

function selectingCard(){
    var myselect = document.getElementById("cardSelect");
    if (!myselect)
        return;
    
    cardId = myselect.options[myselect.selectedIndex].value;
    if (cardId == "newCard"){
        $( "#cardForm" ).show( "blind", {}, 500 );
    }else{
        $( "#cardForm" ).hide( "blind", {}, 500 );
    }

    //alert();
}

function setPriceFromDistance(){

    var pickup_address = "Anáhuac, Miguel Hidalgo, 11320 Ciudad de México, D.F., México";
    var dropff_address = "test ";
      
    var lat = "";
    var lng = "";
     
    var destination = new google.maps.LatLng(lat, lng);
    /* Converting text address to location object in order to know if it belongs to delivery area. */
    var geocoder = new google.maps.Geocoder();
    var directionsService = new google.maps.DirectionsService();
   
    var request = {
        origin: pickup_address,
        destination: destination,
        avoidHighways: true,
        avoidTolls: true,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
                                
    directionsService.route(request, function(response, status) {
        var distance = response.routes[0].legs[0].distance;
        var price = "Contactar Admin.";
        
        if(distance.value <=  7000)
            price = "$50.00 MXN";
        else 
        if(distance.value <= 10000)
            price = "$80.00 MXN";
        else 
        if(distance.value <= 15000)
            price = "$120.00 MXN";
        else 
        if(distance.value <= 20000)
            price = "$170.00 MXN";
        else 
        if(distance.value <= 25000)
            price = "$230.00 MXN";

        $('#price_a').html("El cargo se realizará hasta que tu Kangou entregue las cosas: <b>"+price+"</b> del envío más la compra con un cargo del <b>5%</b>");
        $('#distance').html("Distancia Total: <b>"+distance.text+"</b>");
        $('#price_b').html("Precio: <b>"+price+"</b>");
        
        var $form = $('#checkout_form_id'); 
        $form.append($('<input type="hidden" name="data[Order][distance]" />').val(distance.text));
        $form.append($('<input type="hidden" name="data[Order][price]" />').val(price));
    });

}


// Conekta Public Key
//Conekta.setPublishableKey('key_K6UmMsZKzrrPaa4N'); //Llave modo sandbox
Conekta.setPublishableKey('key_eL9oHoCTCvHoBWtb'); //Llave modo producción
  
var conektaSuccessResponseHandler = function(response) {
    var $form = $('#checkout_form_id');

    var token_id = response.id;
    //console.log("Success Response:" +token_id);
    // Inserta el token_id dentro del formulario para que sea enviado al servidor
    $form.append($('<input type="hidden" name="conektaTokenId" />').val(token_id));
    // y manda el formulario a tu servidor
    $form.get(0).submit();
};

var conektaErrorResponseHandler = function(response) {
    var $form = $('#checkout_form_id');
    
    // Show the errors on the form
    //console.log("Error Response: "+response.message);
    alert(response.message);
    
    document.getElementById("newCardButton").disabled=false;
    document.getElementById("payCashButton").disabled=false; 
};

$(document).ready(function() {

    updateCheckOutDisplay();
    selectingCard();
    setPriceFromDistance();
    
    $('#'+selected_delivery_window).addClass("delivery-window-active")

    /*
    $('#payCashButton').click(function(){
        var email=document.getElementById('email').value;
        var name=document.getElementById('name').value;
        var phone=document.getElementById('phone').value;
        var promoCode = document.getElementById('promo_code').value;
        
        if(socialPromoCodeFromUserLogged == promoCode)
            promoCode = "";

        var atpos=email.indexOf("@");
        var dotpos=email.lastIndexOf(".");

        if (3>name.length) {
          $('#name_error').html("el nombre es muy corto (mínimo se requieren 3 letras)")
          $('#name').focus();
          return false;
        } else if (atpos<1 || dotpos<atpos+2 || dotpos+1>=email.length) {
          $('#email_error').html("e-mail es invalido");
          $('#email').focus();
          return false;
        } else if (10>phone.length) {
          $('#phone_error').html("número de teléfono muy corto (mínimo se requieren 10 dígitos)")
          $('#phone').focus();
          return false;
        }
        
        var isOk = confirm("¿Desea confirmar su envío con Pago en Efectivo?");
        if(!isOk)
            return false;
        
        document.getElementById("newCardButton").disabled=true;
        document.getElementById("payCashButton").disabled=true;
        
        var $form = $('#checkout_form_id');
        $form.append($('<input type="hidden" name="data[Order][promo_code]" />').val(promoCode));
        $form.append($('<input type="hidden" name="data[Order][user_email]" />').val(email));
           */
        //var newUrl = 'orders/addTest/1027/807/735';
        /*document.getElementById('checkout_form_id').action = newUrl;
        document.getElementById('checkout_form_id').submit();
        return false;
    });

    */

    $('#newCardButton').click(function(){
        var email=document.getElementById('email').value;
        var name=document.getElementById('name').value;
        var phone=document.getElementById('phone').value;
        var promoCode = document.getElementById('promo_code').value;
        
        if(socialPromoCodeFromUserLogged == promoCode)
            promoCode = "";

        var atpos=email.indexOf("@");
        var dotpos=email.lastIndexOf(".");

        if (3>name.length) {
          $('#name_error').html("el nombre es muy corto (mínimo se requieren 3 letras)")
          $('#name').focus();
          return false;
        } else if (atpos<1 || dotpos<atpos+2 || dotpos+1>=email.length) {
          $('#email_error').html("e-mail es invalido");
          $('#email').focus();
          return false;
        } else if (10>phone.length) {
          $('#phone_error').html("número celular no válido")
          $('#phone').focus();
          return false;
        }

        var isOk = confirm("¿Desea confirmar su envío con Pago con Tarjeta?");
        if(!isOk)
            return false;
        
        var $form = $('#checkout_form_id'); 
        document.getElementById("newCardButton").disabled=true;
        //document.getElementById("payCashButton").disabled=true;
        
        console.log("cardId: " + cardId);
        
        $form.append($('<input type="hidden" name="data[Order][promo_code]" />').val(promoCode));
        $form.append($('<input type="hidden" name="data[Order][cardToChekOut]" />').val(cardId));
        $form.append($('<input type="hidden" name="data[Order][user_email]" />').val(email));

        var isNewCard = cardId == "newCard";
        
        if(valid_promo_code || has_free_deliveries || !isNewCard)
            $('#checkout_form_id').submit();
        else
            Conekta.token.create($form, conektaSuccessResponseHandler, conektaErrorResponseHandler);
        return false;
    });

    var cHeight = $(window).height() * 0.5 - 50
    var cWidth = $(window).width() * 0.5 - 50
    $('#loadingIcon').css({'top': cHeight, 'left': cWidth});

  $("#progress_step4").addClass("active");
  enable_link('#progress_step1')
  enable_link('#progress_step2')
  enable_link('#progress_step3')
  enable_link('#progress_step4')
  
    // update_delivery_time(1)
    // $(".delivery_time .btn").click(function() {
    //  update_delivery_time($(this).val())
    // }); 

});
