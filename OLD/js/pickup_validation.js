var map;
var deliveryArea;
var directionsDisplay;
var directionsService;
var geocoder;
var marker;
var mexico_location = new google.maps.LatLng(19.41, -99.16);
var mexico_zoom = 12;

var pickup_address_valid = false;
var pickup_address_error;
var valid_pickup_address;
var valid_pickup_address_title;
var valid_pickup_address_street_address;
var valid_pickup_address_city;
var valid_pickup_address_province;
var valid_pickup_address_country;
var valid_pickup_address_postal_code;
var valid_pickup_address_components;
var valid_pickup_geometry;
var valid_pickup_geometry_lat;
var valid_pickup_geometry_lng;
var valid_pickup_zone;
var pickup_submit_clicked = false;
var enterKeyPressed = false;

var order_item_list_error

var valid_delivery_charge = false;
var delivery_charge

var completed_steps = 0;

function removeCustomLegend() {
	map.controls[google.maps.ControlPosition.TOP_CENTER].clear();
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

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var newGeolocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
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

function addCustomLegend() {
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

	map.controls[google.maps.ControlPosition.TOP_CENTER].push(customLegend);
}

function initialize() {

	/*
	var isWrongLogin = ;
	console.log(isWrongLogin);

	if(isWrongLogin)
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
		zoom : mexico_zoom,
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		center : mexico_location,
		streetViewControl : false,
		disableDefaultUI : false,
		disableDoubleClickZoom : true,
		draggable : true,
		scrollwheel : true,
	}

	map = new google.maps.Map(map_canvas, mapOptions);
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
	var deliveryAreaCoords = [sw_boundary, se_boundary, ne_boundary, nw_boundary];

	// Construct the polygon
	/*
	 deliveryArea = new google.maps.Polygon({
	 paths: deliveryAreaCoords,
	 strokeColor: '#FFFFFF',
	 strokeOpacity: 0.0,
	 strokeWeight: 0,
	 fillColor: '#FFFFFF',
	 fillOpacity: 0.0
	 });
	 */
	deliveryArea = new google.maps.Polygon({
		paths : deliveryAreaCoords,
		strokeColor : '#FF0000',
		strokeOpacity : 0.5,
		strokeWeight : 3,
		fillColor : '#FF0000',
		fillOpacity : 0.01
	});

	deliveryArea.setMap(map);

	google.maps.event.addListener(deliveryArea, 'click', function(event) {
		removeCustomLegend();
		clickToPutMarker(event);
	});

	// Create a renderer for directions and bind it to the map.
	var rendererOptions = {
		map : map
	}
	directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

	//Adding autocomplete
	var southWest = new google.maps.LatLng(19.266668, -99.291719);
	var northEast = new google.maps.LatLng(19.553239, -99.018090);
	var defaultBounds = new google.maps.LatLngBounds(southWest, northEast);

	var input = document.getElementById('pickup_address_line_one');
	var options = {
		bounds : defaultBounds,
		componentRestrictions : {
			country : 'mx'
		}
	};
	autocomplete = new google.maps.places.Autocomplete(input, options);

	google.maps.event.addListener(autocomplete, 'place_changed', function() {
		//removeCustomLegend();
		setAddressFromAutoComplete();
	});
	document.getElementById("pickup_gmaps_address").value = "";
}

function setAddressFromAutoComplete() {

	document.getElementById('pickup_address_line_two').value = "";
	document.getElementById('pickup_company_name').value = "";

	var place = autocomplete.getPlace();
	try {
		var location = place.geometry.location;

		if (google.maps.geometry.poly.containsLocation(location, deliveryArea)) {
			placeMarker(location);
			$('#pickup_address_error').html(null);
		} else {
			if (marker)
				marker.setMap(null);

			map.setCenter(mexico_location);
			map.setZoom(mexico_zoom);

			$('#pickup_address_error').html("Fuera del área de envío");
		}

		pickup_address_valid = true;

		$('#pickup_gmaps_address').val(place.formatted_address);
		document.getElementById('pickup_address_line_one').value = place.formatted_address;

		$('#pickup_gmaps_geometry_lat').val(location.lat());
		$('#pickup_gmaps_geometry_lng').val(location.lng());

		pickup_address_error = "";

		if ( typeof place.formatted_address !== "undefined" && (place.types[0] != null || place.types[0] != ""))
			document.getElementById('pickup_company_name').value = place.name;

	} catch(e) {
		console.log("Error: " + e);
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

function validate_pickup_address(pickup_submit_clicked) {

	valid_pickup_geometry = null;
	valid_pickup_geometry_lat = null;
	valid_pickup_geometry_lng = null;
	// document.getElementById('pickup_company_name').value = "";

	$('#pickup_address_error').html(null);

	if (pickup_submit_clicked == true)
		document.getElementById("pickup_address_next_button").disabled = true;

	var pickup_address;
	var pickup_address_one = document.getElementById('pickup_address_line_one').value;
	var pickup_address_two = document.getElementById('pickup_address_line_two').value;

	pickup_address = pickup_address_one + " " + pickup_address_two;
	if (pickup_address.indexOf("Ciudad de M") < 0)
		pickup_address += ", Ciudad de México, México";

	if (pickup_address_one == "") {
		pickup_address_valid = false;
		pickup_address_error = "No puede estar en blanco"
		$('#pickup_address_error').html(pickup_address_error);
		animateMap();
		getDeliveryCharge();
		if (pickup_submit_clicked == true) {
			document.getElementById("pickup_address_next_button").disabled = false;
			$('#pickup_address_line_one').focus();
		}
	} else {

		geocoder.geocode({
			'address' : pickup_address
		}, function(results, status) {
			//console.log(pickup_address);
			enterKeyPressed = false;
			if (status == google.maps.GeocoderStatus.OK) {

				if (google.maps.geometry.poly.containsLocation(results[0].geometry.location, deliveryArea) == false) {

					/* Invalid Address */
					valid_pickup_address = document.getElementById("pickup_address_line_one").value;
					valid_pickup_address += " " + document.getElementById("pickup_address_line_two").value;
					$('#pickup_gmaps_address').val(valid_pickup_address);
					if (marker)
						marker.setMap(null);

					/*
					 if (pickup_submit_clicked) {
					 $('#new_pickup_address').submit();
					 }*/

					pickup_address_valid = false;
					pickup_address_error = "Ingresa una direcci&oacute;n v&aacute;lida"
					$('#pickup_address_error').html(pickup_address_error);
					animateMap();
					if (pickup_submit_clicked == true) {
						document.getElementById("pickup_address_next_button").disabled = false;
						$('#pickup_address_line_one').focus();
					}

				} else {

					/* Valid Address */

					if (!pickup_submit_clicked) {

						pickup_address_valid = true;
						$('#pickup_address_line_one').blur();
						valid_pickup_address = results[0].formatted_address;
						valid_pickup_geometry = results[0].geometry.location;
						valid_pickup_geometry_lat = valid_pickup_geometry.lat()
						valid_pickup_geometry_lng = valid_pickup_geometry.lng()
						$('#pickup_address_error').html(null);
						$('#pickup_gmaps_address').val(valid_pickup_address);
						$('#pickup_gmaps_geometry_lat').val(valid_pickup_geometry_lat);
						$('#pickup_gmaps_geometry_lng').val(valid_pickup_geometry_lng);

						//console.log(valid_pickup_address);

						var data = results[1];
						if ( typeof data === 'undefined')
							data = results[0];

						var pickupAddressOne = "";
						var pickupAddressTwo = "";
						for (var i = 0; i < data.address_components.length; i++) {

							if (i < 2) {

								var shorName = data.address_components[i].short_name;

								if (isNaN(shorName))
									pickupAddressOne = shorName + " " + pickupAddressOne;
								else
									pickupAddressOne = pickupAddressOne + " " + shorName;

							} else
								pickupAddressTwo += data.address_components[i].short_name + ", ";

						}
						document.getElementById("pickup_address_line_one").value = pickupAddressOne;
						document.getElementById("pickup_address_line_two").value = pickupAddressTwo;
					}
					//console.log("pickup_gmaps_address:"+document.getElementById("pickup_gmaps_address").value);
					if (document.getElementById("pickup_gmaps_address").value == "") {
						pickup_address_valid = false;
						pickup_address_error = "Ingresa una direcci&oacute;n v&aacute;lida"
						$('#pickup_address_error').html(pickup_address_error);
						animateMap();
						if (pickup_submit_clicked == true) {
							document.getElementById("pickup_address_next_button").disabled = false;
							$('#pickup_address_line_one').focus();
						}
					} else {
						if (pickup_submit_clicked) {
							$('#new_pickup_address').submit();
						} else {
							animateMap();
						}
					}

				}
			} else {

				/* Invalid Address */
				valid_pickup_address = document.getElementById("pickup_address_line_one").value;
				valid_pickup_address += " " + document.getElementById("pickup_address_line_two").value;
				$('#pickup_gmaps_address').val(valid_pickup_address);
				if (marker)
					marker.setMap(null);
				map.setCenter(mexico_location);
				map.setZoom(12);

				if (pickup_submit_clicked) {
					$('#new_pickup_address').submit();
				}

			}
		});
	}
}

function gpsToPutMarkerAndAddress(position) {
	var event = {
		latLng : position
	};
	placeMarker(position);
	dropMarker(event);
}

function clickToPutMarker(event) {
	var position = event.latLng;
	placeMarker(position);
	setPositionToAddressForm(event);
}

function setPositionToAddressForm(position) {

	var latLng = position.latLng
	geocoder.geocode({
		'latLng' : latLng
	}, function(data, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			pickup_address_valid = true;

			var pickupAddressOne = "";
			var pickupAddressTwo = "";
			for (var i = 0; i < data[0].address_components.length; i++) {
				if (i < 2) {
					var shorName = data[0].address_components[i].short_name;
					console.log(isNaN(shorName));

					if (isNaN(shorName))
						pickupAddressOne = shorName + " " + pickupAddressOne;
					else
						pickupAddressOne = pickupAddressOne + " " + shorName;

				} else
					pickupAddressTwo += data[0].address_components[i].short_name + ", ";
			}
			document.getElementById("pickup_address_line_one").value = pickupAddressOne;
			document.getElementById("pickup_address_line_two").value = pickupAddressTwo;
			document.getElementById('pickup_company_name').value = "";
			$('#pickup_address_error').html(null);

			console.log(data[0].formatted_address);

			$('#pickup_gmaps_address').val(data[0].formatted_address);
			$('#pickup_gmaps_geometry_lat').val(data[0].geometry.location.lat());
			$('#pickup_gmaps_geometry_lng').val(data[0].geometry.location.lng());
		}
	});
}

function dropMarker(position) {

	if (google.maps.geometry.poly.containsLocation(position.latLng, deliveryArea)) {
		setPositionToAddressForm(position);
		$('#pickup_address_error').html(null);
	} else {
		pickup_address_error = "Fuera de la zona de env&iacute;o"
		$('#pickup_address_error').html(pickup_address_error);
		document.getElementById("pickup_address_line_one").value = "";
		document.getElementById("pickup_address_line_two").value = "";
		$('#pickup_address_line_one').focus();
		pickup_address_valid = false;
		marker.setMap(null);
		directionsDisplay.setMap(null);
		map.setCenter(mexico_location);
		map.setZoom(mexico_zoom);
	}
}

function placeMarker(location) {

	pickup_address_error = "";
	$('#pickup_address_error').html(null);

	if (marker)
		marker.setMap(null);

	map.setCenter(location);
	map.setZoom(16);
	marker = new google.maps.Marker({
		map : map,
		draggable : true,
		animation : google.maps.Animation.DROP,
		position : location
	});
	google.maps.event.addListener(marker, 'dragend', dropMarker);
}

function selectFirstAddressAutocomplete() {
	var firstResult = $(".pac-container .pac-item:first ").text();

	pickup_address_valid = true;
	pickup_address_error = "";
	$('#pickup_address_error').html(null);

	document.getElementById('pickup_address_line_one').value = firstResult;

	geocoder.geocode({
		"address" : firstResult
	}, function(results, status) {

		if (status == google.maps.GeocoderStatus.OK) {

			//$(".pac-container .pac-item:first").addClass("pac-selected");
			//$(".pac-container").css("display","none");
			//$(".pac-container").css("visibility","hidden");
			pickup_address_valid = true;
			$('#pickup_gmaps_address').val(results[0].formatted_address);
			console.log("locationC");
			console.log(results[0].geometry.location);

			$('#pickup_gmaps_geometry_lat').val(results[0].geometry.location.lat());
			$('#pickup_gmaps_geometry_lng').val(results[0].geometry.location.lng());
			document.getElementById('pickup_address_line_one').value = results[0].formatted_address;
			document.getElementById("pickup_address_line_two").value = results[0].formatted_address;

			var location = results[0].geometry.location;
			if (google.maps.geometry.poly.containsLocation(location, deliveryArea)) {
				placeMarker(location);
			} else {
				if (marker)
					marker.setMap(null);

				map.setCenter(mexico_location);
				map.setZoom(12);
			}

		}
	});
}

/*
 $("#pickup_address_line_one").focusin(function () {
 $(document).keypress(function (e) {
 //console.log("Pressing key");
 if (e.which == 13 && !enterKeyPressed) {
 enterKeyPressed = true;
 document.getElementById('pickup_address_line_one').value = document.getElementById('pickup_gmaps_address').value;
 //selectFirstAddressAutocomplete();
 } else {
 $(".pac-container").css("visibility","visible");
 }

 });
 });
 */

function getDeliveryCharge() {
}

function animateMap() {
	directionsDisplay.setMap(null);
	if (pickup_address_valid) {
		placeMarker(valid_pickup_geometry);
	} else {
		map.setCenter(mexico_location);
		map.setZoom(mexico_zoom);
	}
}

function validateAddresses() {

	if (document.getElementById('pickup_address_error').value == null && document.getElementById('pickup_gmaps_address').value != "" && document.getElementById('pickup_gmaps_geometry_lat').value != "" && document.getElementById('pickup_gmaps_geometry_lng').value != "") {
		valid_pickup_address = document.getElementById('pickup_gmaps_address').value
		valid_pickup_geometry = new google.maps.LatLng(document.getElementById('pickup_gmaps_geometry_lat').value, document.getElementById('pickup_gmaps_geometry_lng').value);
		pickup_address_valid = true;
	} else {
		pickup_address_valid = false
	}
}

function setStep(step, redraw) {
	if (step == "2") {
		$('#map_canvas').hide();
	} else {
		$('#map_canvas').show();
		if (redraw) {
			validateAddresses();
			initialize();
			animateMap();
			getDeliveryCharge();
		}
	}
	updateCompletedSteps(step - 1)
	if (step == "1") {
		$('#step_1').show();
		$('#step_2').hide();
		$('#step_3').hide();
		$('#featured_shops_option').show();
		$("#progress_step1").addClass("active");
		$("#progress_step2").removeClass("active");
		$("#progress_step3").removeClass("active");
		$("#progress_step4").removeClass("active");
		enable_link('#progress_step1')
		$('#pickup_address_line_one').focus();
		return true;
	} else if (step == "2") {
		$('#step_1').hide();
		$('#step_2').show();
		$('#step_3').hide();
		$('#featured_shops_option').hide();
		$("#progress_step1").removeClass("active");
		$("#progress_step2").addClass("active");
		$("#progress_step3").removeClass("active");
		$("#progress_step4").removeClass("active");
		enable_link('#progress_step2')
		$("#order_item_list").focus();
		return true;
	} else if (step == "3") {
		$('#step_1').hide();
		$('#step_2').hide();
		$('#step_3').show();
		$('#featured_shops_option').hide();
		$("#progress_step1").removeClass("active");
		$("#progress_step2").removeClass("active");
		$("#progress_step3").addClass("active");
		$("#progress_step4").removeClass("active");
		enable_link('#progress_step3')
		//$('#dropoff_address_line_one').focus();
		return true;
	} else {
		//      alert("Page Error")
	}
	return false;
}

function changeStep(step, redraw) {
	if (setStep(step, redraw)) {
		window.history.pushState(step, "title", "/orders/new?step=" + step);
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
	$(link_id).children('a').bind('click', function(e) {
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
	//window.location = '/orders/new?step=' + step + '&order_conf=9714F309'
}

function updateCompletedSteps(step) {
	if (step > completed_steps) {
		completed_steps = step
	}
}


$(window).resize(function() {
	var map_container_width = $("#map_container").css('width');
	$("#map_canvas").css('width', parseInt(map_container_width) - 359 + 'px');

});

$(document).ready(function() {

	var map_container_width = $("#map_container").css('width');

	$("#map_canvas").css('width', parseInt(map_container_width) - 359 + 'px');

	//chrome runs this on page load
	window.addEventListener("popstate", function(e) {
		setStep(getQueryVariable("step"), true);
	});

	updateCompletedSteps(0)

	if (completed_steps == "0") {
		enable_link('#progress_step1')
		disable_link('#progress_step2')
		disable_link('#progress_step3')
		disable_link('#progress_step4')
	} else if (completed_steps == "1") {
		enable_link('#progress_step1')
		enable_link('#progress_step2')
		disable_link('#progress_step3')
		disable_link('#progress_step4')
	} else if (completed_steps == "2") {
		enable_link('#progress_step1')
		enable_link('#progress_step2')
		enable_link('#progress_step3')
		disable_link('#progress_step4')
	} else if (completed_steps == "3") {
		enable_link('#progress_step1')
		enable_link('#progress_step2')
		enable_link('#progress_step3')
		enable_link('#progress_step4')
	} else {
		alert("Error")
	}
	setStep(1, true);
});