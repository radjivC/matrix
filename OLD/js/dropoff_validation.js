 var map;
  var deliveryArea;  
  var directionsDisplay;
  var directionsService;
  var geocoder;
  var marker;
  var markerArray = [];
  var mexico_location = new google.maps.LatLng(19.41, -99.16);
  var mexico_zoom = 12;

  var dropoff_address_valid = false;
  var dropoff_address_error;
  var valid_dropoff_address;
  var valid_dropoff_address_title;
  var valid_dropoff_address_street_address;
  var valid_dropoff_address_city;
  var valid_dropoff_address_province;
  var valid_dropoff_address_country;
  var valid_dropoff_address_postal_code;
  var valid_dropoff_address_components;
  var valid_dropoff_geometry;
  var valid_dropoff_geometry_lat;
  var valid_dropoff_geometry_lng;
  var valid_dropoff_zone;  
  var dropoff_submit_clicked = false;
  var enterKeyPressed = false;

  var order_item_list_error

  var valid_delivery_charge = false;
  var delivery_charge

  var completed_steps = 0;

  function removeCustomLegend(){
    map.controls[google.maps.ControlPosition.TOP_CENTER ].clear();
  }

  function addGPScontrol(controlDiv, map) {

      // Set CSS styles for the DIV containing the control
      // Setting padding to 5 px will offset the control
      // from the edge of the map
      controlDiv.style.padding = '5px';
    
      // Set CSS for the control border
      var controlUI = document.createElement('div');
      controlUI.style.backgroundColor = 'white';
      controlUI.style.borderStyle = 'solid';
      controlUI.style.borderWidth = '2px';
      controlUI.style.cursor = 'pointer';
      controlUI.style.textAlign = 'center';
      controlUI.title = 'Clic para posicionar el mapa en mi ubicaci&oacute;n';
      controlDiv.appendChild(controlUI);
    
      // Set CSS for the control interior
      var controlText = document.createElement('div');
      controlText.style.fontFamily = 'Arial,sans-serif';
      controlText.style.fontSize = '12px';
      controlText.style.paddingLeft = '4px';
      controlText.style.paddingRight = '4px';
      controlText.innerHTML = '<b>Mi Localizaci&oacute;n</b>';
      controlUI.appendChild(controlText);
    
      // Setup the click event listeners: simply set the map to its location
      google.maps.event.addDomListener(controlUI, 'click', function() {
        
          removeCustomLegend();
        
          if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
              var newGeolocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
              gpsToPutMarkerAndAddress(newGeolocation);
            }, function() {
                map.setCenter(mexico_location);
                map.setZoom(mexico_zoom);
            });
          } else {
              map.setCenter(mexico_location);
              map.setZoom(mexico_zoom);
          }
      });
    
  }

  function addCustomLegend(){
      var customLegend = document.createElement('div');
      customLegend.style.padding = '5px';
    
      // Set CSS for the control border
      var controlUI = document.createElement('div');
      controlUI.style.backgroundColor = 'white';
      controlUI.style.cursor = 'pointer';
      controlUI.style.textAlign = 'center';
      customLegend.appendChild(controlUI);
    
      // Set CSS for the control interior
      var controlText = document.createElement('div');
      controlText.style.fontFamily = 'Arial,sans-serif';
      controlText.style.fontSize = '14px';
      controlText.style.paddingLeft = '4px';
      controlText.style.paddingRight = '4px';
      controlText.innerHTML = '<p align="center"><b>Puedes hacer clic en la zona roja del mapa<br/> para obtener la direcci&oacute;n.</b></p>';
      controlUI.appendChild(controlText);
      
      map.controls[google.maps.ControlPosition.TOP_CENTER ].push(customLegend);
  }

  function initialize() {
  
    document.getElementById('dropoff_address_line_two').value = "";
    document.getElementById('estimated_price').value = "";
    document.getElementById('distance').value = "";
  
    /*
    var isWrongLogin = ;
    console.log(isWrongLogin);
    
    if(isWroknsLogin)
        $("#sign_up_success").modal("show");
    */
        
    // use new maps!
    google.maps.visualRefresh = true;

    // Instantiate a directions service.
    directionsService = new google.maps.DirectionsService();
    geocoder = new google.maps.Geocoder();

    // Create a map, center it on Mexico, disable features
    var map_canvas = document.getElementById('map_canvas');

    //find a way to turn scroll off for iphone/ipad
    var mapOptions = {
      zoom: mexico_zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: mexico_location,
      streetViewControl: false,
      disableDefaultUI: false,
      disableDoubleClickZoom: true,
      draggable: true,
      scrollwheel: true,
    }

    map = new google.maps.Map(map_canvas,mapOptions);
    var gpsControlDiv = document.createElement('div');
    var gpControl = new addGPScontrol(gpsControlDiv, map);

    gpsControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(gpsControlDiv);
    //addCustomLegend();

    // denote delivery area
    var sw_boundary = new google.maps.LatLng(19.528002, -99.285882);
    var se_boundary = new google.maps.LatLng(19.553239, -99.018090);
    var ne_boundary = new google.maps.LatLng(19.301990, -98.978952);
    var nw_boundary = new google.maps.LatLng(19.266668, -99.291719);
    var deliveryAreaCoords = [
      sw_boundary,
      se_boundary,
      ne_boundary,
      nw_boundary
    ];

    // Construct the polygon
    /*
    deliveryArea = new google.maps.Polygon({
      paths: deliveryAreaCoords,
      strokeColor: '#FFFFFF',
      strokeOpacity: 0.0,
      strokeWeight: 0,
      fillColor: '#FFFFFF',
      fillOpacity: 0.0
    });*/
    deliveryArea = new google.maps.Polygon({
      paths: deliveryAreaCoords,
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeWeight: 3,
      fillColor: '#FF0000',
      fillOpacity: 0.01
    }); 
    
    deliveryArea.setMap(map);
    
    google.maps.event.addListener(deliveryArea, 'click', function(event) {
        removeCustomLegend();
        clickToPutMarker(event);
    });

    // Create a renderer for directions and bind it to the map.
    var rendererOptions = {
      map: map
    }
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    
    //Adding autocomplete
    var southWest = new google.maps.LatLng(19.266668, -99.291719);
    var northEast = new google.maps.LatLng(19.553239, -99.018090);
    var defaultBounds = new google.maps.LatLngBounds( southWest, northEast);
    
    var input = document.getElementById('dropoff_address_line_one');
    var options = {
      bounds: defaultBounds,
      componentRestrictions: {country: 'mx'}
    };
    autocomplete = new google.maps.places.Autocomplete(input, options);

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        //removeCustomLegend();
        setAddressFromAutoComplete();
    });
    document.getElementById("dropoff_gmaps_address").value = "";
  }
  
  function setAddressFromAutoComplete(){
    
    document.getElementById('dropoff_address_line_two').value = "";
    document.getElementById('dropoff_company_name').value = "";
    
    var place = autocomplete.getPlace();
    
    try{
        var location = place.geometry.location;
        
        if (google.maps.geometry.poly.containsLocation(location, deliveryArea)) {
            placeMarker(location);
        }else{
            if(marker)
                marker.setMap(null);
        
            map.setCenter(mexico_location);
            map.setZoom(12);
        }
        
        dropoff_address_valid = true;
        $('#dropoff_gmaps_address').val(place.formatted_address);
         document.getElementById('dropoff_address_line_one').value = place.formatted_address;
        
        $('#dropoff_gmaps_geometry_lat').val(location.lat());
        $('#dropoff_gmaps_geometry_lng').val(location.lng());
        
        dropoff_address_error = "";
        $('#dropoff_address_error').html(null);
        
        if(typeof place.formatted_address !== "undefined" && (place.types[0] != null || place.types[0] != ""))
            document.getElementById('dropoff_company_name').value = place.name;        
        
    }catch(e){
        console.log("Error: "+e);
        //selectFirstAddressAutocomplete();
    }
  }
  

  function getQueryVariable(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split('=');
          if (decodeURIComponent(pair[0]) == variable) {
              return decodeURIComponent(pair[1]);
          }
      }
  }
  
  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function validate_dropoff_address(dropoff_submit_clicked) {
    
    valid_dropoff_geometry = null;
    valid_dropoff_geometry_lat = null;
    valid_dropoff_geometry_lng = null;
    
    if (dropoff_submit_clicked == true) 
      document.getElementById("dropoff_address_next_button").disabled=true;
    
    var dropoff_address;
    var dropoff_address_one = document.getElementById('dropoff_address_line_one').value;
    var dropoff_address_two = document.getElementById('dropoff_address_line_two').value;
    
    dropoff_address = dropoff_address_one + " " + dropoff_address_two;
    if(dropoff_address.indexOf("Ciudad de M") < 0)
        dropoff_address += ", Ciudad de México, México";
    
    if (dropoff_address_one == "") {
      dropoff_address_valid = false;
      dropoff_address_error = "No puede estar en blanco";
      $('#dropoff_address_error').html(dropoff_address_error);
      animateMap(); 
      if (dropoff_submit_clicked) {
        document.getElementById("dropoff_address_next_button").disabled=false;
        $('#dropoff_address_line_one').focus();
      }
    } else {
        
      $('#dropoff_gmaps_address').val(dropoff_address);
      geocoder.geocode( {'address': dropoff_address}, function(results, status) {
       
        enterKeyPressed = false;
        if (status == google.maps.GeocoderStatus.OK) {
    
          if (google.maps.geometry.poly.containsLocation(results[0].geometry.location, deliveryArea) == false) {
            
            /* Invalid address for delivery area */
            
            valid_dropoff_address = document.getElementById("dropoff_address_line_one").value;
            valid_dropoff_address += " " + document.getElementById("dropoff_address_line_two").value;
            $('#dropoff_gmaps_address').val(valid_dropoff_address);
            if(marker)
                marker.setMap(null);
            map.setCenter(mexico_location);
            map.setZoom(12);
            
            /*
            if (dropoff_submit_clicked) {
                $('#new_dropoff_address').submit();
            }
            */
            dropoff_address_valid = false;
            dropoff_address_error = "Ingresa una direcci&oacute;n v&aacute;lida"
            $('#dropoff_address_error').html(dropoff_address_error);
            animateMap(); 
            if (dropoff_submit_clicked == true) {
                document.getElementById("dropoff_address_next_button").disabled=false;
                $('#dropoff_address_line_one').focus();
            } 
            
          } else {

            /* Valid Address */
            if(!dropoff_submit_clicked){
                
                dropoff_address_valid = true;
                $('#dropoff_address_line_one').blur();
                valid_dropoff_address = results[0].formatted_address;            
                valid_dropoff_geometry = results[0].geometry.location;
                valid_dropoff_geometry_lat = valid_dropoff_geometry.lat()
                valid_dropoff_geometry_lng = valid_dropoff_geometry.lng()
                $('#dropoff_address_error').html(null);
                $('#dropoff_gmaps_address').val(valid_dropoff_address);
                $('#dropoff_gmaps_geometry_lat').val(valid_dropoff_geometry_lat);
                $('#dropoff_gmaps_geometry_lng').val(valid_dropoff_geometry_lng);
                
                var data = results[1];
                if(typeof data === 'undefined')
                    data = results[0];
                
                var dropoffAddressOne = "";
                var dropoffAddressTwo = "";
                for(var i=0; i<data.address_components.length; i++){
                    
                    if(i < 2){
                        
                        var shorName = data.address_components[i].short_name;
                            
                        if(isNaN(shorName))
                            dropoffAddressOne  = shorName + " " + dropoffAddressOne;
                        else
                            dropoffAddressOne  = dropoffAddressOne + " " + shorName;
                            
                    }else
                        dropoffAddressTwo += data.address_components[i].short_name + ", ";
           
                }
                document.getElementById("dropoff_address_line_one").value = dropoffAddressOne;
                document.getElementById("dropoff_address_line_two").value = dropoffAddressTwo;
            }
            
            if(document.getElementById("dropoff_gmaps_address").value == ""){
                dropoff_address_valid = false;
                dropoff_address_error = "Ingresa una direcci&oacute;n v&aacute;lida"
                $('#dropoff_address_error').html(dropoff_address_error);
                animateMap(); 
                if (dropoff_submit_clicked == true) {
                    document.getElementById("dropoff_address_next_button").disabled=false;
                    $('#dropoff_address_line_one').focus();
                }
            }else{
                if (dropoff_submit_clicked) {
                    $('#new_dropoff_address').submit();
                }else{
                    animateMap();
                }
            }

            
            
          }
        } else {
            
            /* Invalid address for delivery area */
            valid_dropoff_address = document.getElementById("dropoff_address_line_one").value;
            valid_dropoff_address += " " + document.getElementById("dropoff_address_line_two").value;
            $('#dropoff_gmaps_address').val(valid_dropoff_address);
            if(marker)
                marker.setMap(null);
            map.setCenter(mexico_location);
            map.setZoom(12);
          
            /*
            if (dropoff_submit_clicked) {
                $('#new_dropoff_address').submit();
            }
            */
        }
        });
    }
  }

  function gpsToPutMarkerAndAddress(position){
    var event = {
        latLng:position
    };
    placeMarker(position);
    dropMarker(event);
  }
  
  function clickToPutMarker(event){
    var position = event.latLng;
    placeMarker(position);
    setPositionToAddressForm(event);
  }
  
  function setPositionToAddressForm(position){
    
    var latLng = position.latLng
    geocoder.geocode({'latLng':latLng},function(data,status){
        if(status == google.maps.GeocoderStatus.OK){
            dropoff_address_valid = true;
            
            //document.getElementById("dropoff_address_line_one").value = data[0].formatted_address;
            
            var dropoffAddressOne = "";
            var dropoffAddressTwo = "";
            for(var i=0; i<data[0].address_components.length; i++){
                if(i < 2)
                    dropoffAddressOne  = data[0].address_components[i].short_name + ", " + dropoffAddressOne;
                else
                    dropoffAddressTwo += data[0].address_components[i].short_name + ", ";
            }
            document.getElementById("dropoff_address_line_one").value = dropoffAddressOne;
            document.getElementById("dropoff_address_line_two").value = dropoffAddressTwo;
            document.getElementById('dropoff_company_name').value = "";
            $('#dropoff_address_error').html(null);
            
            $('#dropoff_gmaps_address').val(data[0].formatted_address);
            $('#dropoff_gmaps_geometry_lat').val(data[0].geometry.location.lat());
            $('#dropoff_gmaps_geometry_lng').val(data[0].geometry.location.lng());
        }
    });
  }
  
  function dropMarker(position){

    if (google.maps.geometry.poly.containsLocation(position.latLng, deliveryArea)) {
       setPositionToAddressForm(position);
       setRouteFromPickUp(position.latLng);
       $('#dropoff_address_error').html(null);
    }else{
        dropoff_address_error = "Fuera de la zona de env&iacute;o"
        $('#dropoff_address_error').html(dropoff_address_error);
        document.getElementById("dropoff_address_line_one").value = "";
        document.getElementById("dropoff_address_line_two").value = "";
        $('#dropoff_address_line_one').focus();
        dropoff_address_valid = false;
        marker.setMap(null);
        directionsDisplay.setMap(null);
        map.setCenter(mexico_location);
        map.setZoom(mexico_zoom);
    }
  }
  
  function setRouteFromPickUp(location){
      
      try {
        if (!google.maps.geometry.poly.containsLocation(location, deliveryArea)) 
            return;
      } catch(err) {
            return;
      }
      
      var valid_pickup_address = "Ramón Fabié 48, Vista Alegre, Cuauhtémoc, 06860 Ciudad de México, D.F., México";
      
      /* Converting text address to location object in order to know if it belongs to delivery area. */
      geocoder.geocode({"address":valid_pickup_address }, function(results, status) {
        
        if (status == google.maps.GeocoderStatus.OK) {
            if (google.maps.geometry.poly.containsLocation(results[0].geometry.location, deliveryArea)){
                
                var request = {
                    origin: valid_pickup_address,
                    destination: location,
                    avoidHighways: true,
                    avoidTolls: true,
                    travelMode: google.maps.DirectionsTravelMode.DRIVING
                };
                
                directionsService.route(request, function(response, status) {
                    
                    var distance = response.routes[0].legs[0].distance;
   
                    var price = "Contactar Admin.";
                    if(distance.value <=  7000)
                        price = "50 pesos";
                    else 
                    if(distance.value <= 10000)
                        price = "80 pesos";
                    else 
                    if(distance.value <= 15000)
                        price = "120 pesos";
                    else 
                    if(distance.value <= 20000)
                        price = "170 pesos";
                    else 
                    if(distance.value <= 25000)
                        price = "230 pesos";
                        
                    document.getElementById('distance').value = distance.text;
                    document.getElementById('estimated_price').value = price;
                    
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setMap(map);
                        directionsDisplay.setOptions( { suppressMarkers: true } );
                        directionsDisplay.setDirections(response);
                    }
                });
            }
        }
      });
      
      
      
  }

  function placeMarker(location) {
     
     dropoff_address_error = "";
     $('#dropoff_address_error').html(null);
     
     if(marker)
        marker.setMap(null);
    
      map.setCenter(location);
      map.setZoom(16);
      marker = new google.maps.Marker({
        map: map,
        draggable:true,
        animation: google.maps.Animation.DROP,
        position: location
      });
      google.maps.event.addListener(marker, 'dragend', dropMarker);
      
      setRouteFromPickUp(location);
  }
  
  function selectFirstAddressAutocomplete(){
    var firstResult = $(".pac-container .pac-item:first ").text();
        
    dropoff_address_valid = true;
    dropoff_address_error = "";
    $('#dropoff_address_error').html(null);
    
    document.getElementById('dropoff_address_line_one').value = firstResult;
    
    
    geocoder.geocode({"address":firstResult }, function(results, status) {
        
        if (status == google.maps.GeocoderStatus.OK) {
            
            //$(".pac-container .pac-item:first").addClass("pac-selected");
            //$(".pac-container").css("display","none");
            //$(".pac-container").css("visibility","hidden");
            
            $('#dropoff_gmaps_address').val(results[0].formatted_address);
            $('#dropoff_gmaps_geometry_lat').val(results[0].geometry.location.lat());
            $('#dropoff_gmaps_geometry_lng').val(results[0].geometry.location.lng());
            document.getElementById('dropoff_address_line_one').value = results[0].formatted_address;
            document.getElementById("dropoff_address_line_two").value = results[0].formatted_address;
            
            var location = results[0].geometry.location;
            if (google.maps.geometry.poly.containsLocation(location, deliveryArea)) {
                placeMarker(location);
            }else{
                if(marker)
                    marker.setMap(null);
            
                map.setCenter(mexico_location);
                map.setZoom(12);
            }
        
        }
    });
  }

  /*
  $("#dropoff_address_line_one").focusin(function () {
    $(document).keypress(function (e) {
        if (e.which == 13 && !enterKeyPressed) {
            enterKeyPressed = true;
            selectFirstAddressAutocomplete();
        } else {
            $(".pac-container").css("visibility","visible");
        }
        
    });
  });
  */

  function getDeliveryCharge() {}

  function animateMap() {
    directionsDisplay.setMap(null);
    if (dropoff_address_valid) {
      placeMarker(valid_dropoff_geometry)
    } else {
      map.setCenter(mexico_location);
      map.setZoom(mexico_zoom);
    }
    /*
    // First, remove any existing markers from the map.
    for (var i = 0; i < markerArray.length; i++) {
      markerArray[i].setMap(null);
    }
    // Now, clear the array itself.
    markerArray = [];
    directionsDisplay.setMap(null)

    if (dropoff_address_valid == true) {
      var valid_dropoff_address = "Ramón Fabié 48, Vista Alegre, Cuauhtémoc, 06860 Ciudad de México, D.F., México";
      var request = {
        origin: valid_dropoff_address,
        destination: valid_dropoff_address,
        travelMode: google.maps.DirectionsTravelMode.WALKING
      };
      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setMap(map);
          directionsDisplay.setDirections(response);
          updateDisplay();
        } else {
          // alert("Google Maps Connection Error")
        }
      });   
        
      updateDisplay();

    } else {
      map.setCenter(mexico_location);
      map.setZoom(mexico_zoom);
      directionsDisplay.setMap(null);
      updateDisplay();

    }
    */
  }

  function validateAddresses() {

    if (document.getElementById('dropoff_address_error').value == null &&
        document.getElementById('dropoff_gmaps_address').value != "" &&
        document.getElementById('dropoff_gmaps_geometry_lat').value != "" &&
        document.getElementById('dropoff_gmaps_geometry_lng').value != "") {
      valid_dropoff_address = document.getElementById('dropoff_gmaps_address').value
      valid_dropoff_geometry = new google.maps.LatLng(
        document.getElementById('dropoff_gmaps_geometry_lat').value,
        document.getElementById('dropoff_gmaps_geometry_lng').value);
      dropoff_address_valid = true;
    } else {
      dropoff_address_valid = false
    }
  }

  function setStep(step, redraw){
    if (step=="2") {
      $('#map_canvas').hide();
    }
    else {
      $('#map_canvas').show();
      if (redraw) {
        validateAddresses();
        initialize();
        animateMap();
        getDeliveryCharge();       
      }   
    }
    updateCompletedSteps(step-1)

      $('#step_1').hide();
      $('#step_2').hide();
      $('#step_3').show();
      $('#featured_shops_option').hide();   
      $("#progress_step1").removeClass("active");   
      $("#progress_step2").removeClass("active"); 
      $("#progress_step3").addClass("active");   
      $("#progress_step4").removeClass("active");  
      enable_link('#progress_step3')
      $('#dropoff_address_line_one').focus();
      return true;
  }

  function changeStep(step, redraw) {
      if (setStep(step, redraw)) {
        window.history.pushState(step, "title", "/orders/new?step="+step);      
      }
  }

  function orderItemListKeyPressed() {
    $('#order_item_list_error').html(null);
  }

  function enable_link(link_id) {
    $(link_id).removeClass('disabled');
    $(link_id).addClass('pointer');
    $(link_id).children('a').unbind('click');
  }

  function disable_link(link_id) {
    $(link_id).children('a').bind('click', function(e){
    $(link_id).removeClass('pointer');
      return false;
    })
  }

  function clickChangeStep(step) {
    if (step <= (completed_steps + 1)) {
      if (step == "2") {
        clickBackStep(step);
        // changeStep(step,false)
      } else {
        clickBackStep(step);
        // changeStep(step, true)
      }
    }
  }
  
  function clickBackStep(step) {
    console.log("changed to step: "+step);
    //window.location = '/orders/new?step=' + step + '&order_conf=9714F309'
  }

  function updateCompletedSteps(step) {
    if (step > completed_steps) {
      completed_steps = step
    }
  }

  $(window).resize(function() {
    var map_container_width=$("#map_container").css('width');
    $("#map_canvas").css('width', parseInt(map_container_width)-359 + 'px');

  });

  $(document).ready(function() {

    var map_container_width=$("#map_container").css('width');

    $("#map_canvas").css('width', parseInt(map_container_width)-359 + 'px');

    $("#new_dropoff_address").bind("ajax:success", function(e, data, status, xhr) {
      if (data.success) {
        window.location = "../error.html"
      } else {
//        alert("Server Connection Error 2")
      }
//      document.getElementById("dropoff_address_next_button").disabled=false;
    });

    //chrome runs this on page load
    window.addEventListener("popstate", function(e) {
      setStep(getQueryVariable("step"), true);
    });

    updateCompletedSteps(2)

      enable_link('#progress_step1')
      enable_link('#progress_step2')
      enable_link('#progress_step3')
      enable_link('#progress_step4')

    setStep(3, true);
  });
