//-- Begin Traditional Login and Signup --//

function returnToIndex() {
	window.location.href = "pages/index";
}

function loginWithAjax() {

	document.getElementById("buttonLoginFromSignup").disabled = true;

	var email = document.getElementById('user_email_l').value;
	var password = document.getElementById('user_password_l').value;

	$.ajax({
		url : "/users/login/",
		type : "POST",
		cache : false,
		data : {
			"email" : email,
			"password" : password
		},
		complete : function(result) {
			//console.log(result.responseText);
			location.reload();
		}
	});
}

function logout() {
	$.ajax({
		url : "/users/logout/",
		type : "POST",
		cache : false,
		complete : function(result) {
			location.reload();
		}
	});
}

function login(login_submit_clicked) {

	if (login_submit_clicked == true) {
		document.getElementById("login_button").disabled = true;
	}

	var email = document.getElementById('user_email_l').value;
	var password = document.getElementById('user_password_l').value;

	if (email == "" || password == "") {
		alert("No puede haber campos vacíos");
		document.getElementById("login_button").disabled = false;
		return;
	}

	$('#log_in_user').submit();

	return;
}

function validate_signup_user(signup_submit_clicked) {

	if (signup_submit_clicked == true) {
		document.getElementById("signup_button").disabled = true;
	}

	var email = document.getElementById('user_email_s').value;
	var name = document.getElementById('user_name_s').value;
	var password = document.getElementById('user_password_s').value;
	var password_conf = document.getElementById('user_password_confirmation_s').value;

	if (email == "" || name == "" || password == "" || password_conf == "") {
		alert("No puede haber campos vacíos");
		document.getElementById("signup_button").disabled = false;
		return;
	}

	var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	if (!regex.test(email)) {
		alert("E-mail no válido");
		document.getElementById("signup_button").disabled = false;
		return;
	}

	if (password != password_conf) {
		alert("Las contraseñas no coinciden");
		document.getElementById("signup_button").disabled = false;
		return;
	}

	$.ajax({
		url : "/users/signup/",
		type : "POST",
		cache : false,
		data : {
			"email" : email,
			"name" : name,
			"password" : password
		},
		complete : function(result) {

			var response = result.responseText.replace(/\s/g, '');

			if (response == "Succesful") {

				$('#sign_up_message').html("Su registro ha sido exitoso");
			} else if (response == "ExistentUserbutnotsignedupbefore") {

				$('#sign_up_message').html("Su correo ha sido registrado anteriormente (realizó una compra o se registró al pre-lanzamiento). La información registrada se relacionará con su nombre y contraseña que acaba de ingresar.");
			} else if (response == "Useralreadysignedup") {

				$('#sign_up_message').html("Su cuenta ha sido registrada anteriormente. Al presionar el botón 'Continuar' intentaremos iniciar sesión con la contraseña ingresada. En caso de que no recuerde su contraseña, por favor envíe un correo al administrador.");
			}

			$("#sign_up").modal("hide");
			$("#sign_up_success").modal("show");

			document.getElementById('user_email_l').value = email;
			document.getElementById('user_password_l').value = password;
		}
	});
	return;
}

function loginFromSignup(login_submit_clicked) {

	if (login_submit_clicked == true) {
		document.getElementById("buttonLoginFromSignup").disabled = true;
	}

	$('#log_in_user').submit();
	return;
}

//-- End Traditional Login and Signup --//

//-- Begin Login With Facebook --//

function statusChangeCallback(response) {
	//console.log(response);
	if (isLogged != "")
		return;

	if (response.status === 'connected') {
		// Logged into your app and Facebook.
		loadingSession();
	} else if (response.status === 'not_authorized') {
		// The person is logged into Facebook, but not your app.
		console.log('Please log into this app.');
	} else {
		// The person is not logged into Facebook, so we're not sure if
		// they are logged into this app or not.
		console.log('Please log into Facebook.');
	}
}

function loginFB() {
	console.log("loginFB");
	FB.login(function(response) {
		console.log(response);
		statusChangeCallback(response);
	}, {
		scope : 'public_profile,email'
	});
}

function checkLoginState() {

	FB.getLoginStatus(function(response) {
		statusChangeCallback(response);
	});
}

function loadingSession() {

	console.log("loadingSession");

	FB.api('/me', function(response) {

		//console.log(JSON.stringify(response));
		console.log("fbApi");

		$.ajax({
			url : "/users/signup/",
			type : "POST",
			cache : false,
			data : {
				"email" : response.email,
				"name" : response.name,
				"password" : response.id,
				"id_facebook" : response.id
			},
			complete : function(result) {

				console.log(result.responseText)
				console.log(response.email);

				$("#log_in").modal("hide");
				$("#sign_up").modal("hide");

				$('#sign_up_message').html("<p align='center'>Iniciando sesión con Facebook</p>");
				$("#sign_up_success").modal("show");

				document.getElementById('user_email_l').value = response.email;
				document.getElementById('user_password_l').value = response.id;
			}
		});

	});
}

window.fbAsyncInit = function() {
	FB.init({
		appId : '621421591269758',
		status : true,
		cookie : true,
		xfbml : true,
		version : 'v2.0'
	});

	/*
	 FB.getLoginStatus(function(response) {
	 statusChangeCallback(response);
	 });
	 */

}; ( function(d) {
		var js, id = 'facebook-jssdk';
		if (d.getElementById(id)) {
			return;
		}
		js = d.createElement('script');
		js.id = id;
		js.async = true;
		js.src = "http://connect.facebook.net/es_LA/all.js";
		d.getElementsByTagName('head')[0].appendChild(js);
	}(document)); 
	
//-- End Login With Facebook --