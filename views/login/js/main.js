let eyeicon1 = document.getElementById("eyeicon1");
let password = document.getElementById("password");
let eyeicon2 = document.getElementById("eyeicon2");


eyeicon1.addEventListener("click", () => {
	if (password.type == "password") {
		password.type = "text";
		eyeicon1.src = "/login/images/eyeOpen.png";
	} else {
		password.type = "password";
		eyeicon1.src = "/login/images/eyeClose.png";

	}
})
eyeicon2.addEventListener("click", () => {
	if (password.type == "password") {
		password.type = "text";
		eyeicon2.src = "/login/images/eyeOpen.png";
	} else {
		password.type = "password";
		eyeicon2.src = "/login/images/eyeClose.png";

	}
})
function toggleForm() {
	var loginForm = document.getElementById('login-form');
	var signupForm = document.getElementById('signup-form');
	var formTitle = document.getElementById('form-title');

	if (loginForm.style.display === 'none') {
		loginForm.style.display = 'block';
		signupForm.style.display = 'none';
		formTitle.innerText = 'Sign In';
	} else {
		loginForm.style.display = 'none';
		signupForm.style.display = 'block';
		formTitle.innerText = 'Sign Up';
	}
}
	

$(function() {
	'use strict';
	
  $('.form-control').on('input', function() {
	  var $field = $(this).closest('.form-group');
	  if (this.value) {
	    $field.addClass('field--not-empty');
	  } else {
	    $field.removeClass('field--not-empty');
	  }
	});

});