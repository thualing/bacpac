/* Note:
Don't use strict mode; there are possible browser compatilibity issues
*/
	// "use strict"

/* Init */
	// Initial Greeting
	console.log("Welcome To The BacPac Login Page!");

	// Google Firebase Initial Setup
	var firebaseConfig = {
		apiKey: "AIzaSyD98_8qlaeufS_1nwJ3Dv8auLi93AjhW5A",
		authDomain: "banpac-4d0af.firebaseapp.com",
		databaseURL: "https://banpac-4d0af.firebaseio.com",
		storageBucket: "banpac-4d0af.appspot.com",
		messagingSenderId: "1079004100386"
	};
	var app = firebase.initializeApp(firebaseConfig);	// Default App (REQUIRED)
	console.log('App: ' + app.name);

	// Google Firebase Service Setup
	var auth = firebase.auth();

	// Login Listener
	/* Listens for login state changes, and updates information as necessary */
	auth.onAuthStateChanged(function(user){
		if (user) {		// ...if a user is currently signed in
			console.log("User: " + user.displayName);
		} else {		// ...if a user is signed out
			console.log("You are signed out. Please sign in using your account email and password, or create a new account");
		}
	});

/* Action: "Create Account Button" Click */
	$('#createAccount').on("click", function(){
		console.log("Creating a new account...");
		$('#errorMessage').html("");
	});

/* Action: "Sign-Up Modal Sign Up Button" Click */
	$('#signUpBtn').on("click", function(){
		console.log("Submitting new account info...");

		// Grab user info from input elements
		var uname = $('#createUsername').val();
		var pass = $('#createPassword').val();

		// Send to Firebase
		auth.createUserWithEmailAndPassword(uname, pass).catch(function(err){
			var errCode = err.code;
			var errMsg = err.message;

			// Log Error
			console.log("[ERR]" + errCode + ": " + errMsg);
			$('#errorMessage').html(errMsg);
		});
	});

/* Action: "Sign-Up Modal Cancel Button" Click */
	$('#cancelSignUpBtn').on("click", function(){
		console.log("Cancelling creating a new account");
	});

/* Action: "Submission Button" Click */
	$('#loginBtn').on("click", function(){
		console.log("Submitting login info...");

		// Grab user info from input elements
		var uname = $('#username').val();
		var pass = $('#password').val();

		// Send to Firebase
		auth.signInWithEmailAndPassword(uname, pass).catch(function(err){
			var errCode = err.code;
			var errMsg = err.message;

			// Log Error
			console.log("[ERR]" + errCode + ": " + errMsg);
			$('#loginErrorMessage').html(errMsg);
		});
	});