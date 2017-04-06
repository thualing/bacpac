/* Note:
Don't use strict mode; there are possible browser compatilibity issues
*/
	// "use strict"

/* Init */
	// Initial Greeting
	console.log("Welcome To The BacPac Login Page!");
	var createAccountModalShown = false;

	// Enter Key Default Action Override
	$(document).on("keydown", function(event){
		if(event.which === 13){
			switch(createAccountModalShown){
				case false: {
					// SignIn: force enter key to invoke existing account credentials submission
					$("#loginBtn").click();
					break;
				}
				case true: {
					// SignUp: force enter key to invoke new account credentials submission
					$("#signUpBtn").click();
					break;
				}
				default: break;
			}
		}
	});

	// Setup the Sign Up Modal
	$('#signUpModal').on('shown.bs.modal', function (e){
		createAccountModalShown = true;
		// console.log("Modal shown");

		// Clear Sign In contents
		$('#username').val("");
		$('#password').val("");
		$('#loginErrorMessage').html("");
	}).on('hidden.bs.modal', function(e){
		createAccountModalShown = false;
		// console.log("Modal hidden");

		// Clear Sign Up Modal Contents
		$('#signupErrorMessage').html("");
		$('#createUsername').val("");
		$('#createPassword').val("");
	});

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

	// Initial Page Setup
	/* Logs the previous user out, just in case they have not done so themselves */
	auth.signOut().then(function(){
		console.log("Sign Out Successful!");
	}).catch(function(error){
		console.log("An error has occurred...");
	});

	// Login Listener
	/* Listens for login state changes, and updates information as necessary */
	auth.onAuthStateChanged(function(user) {
		if (user) {		// ...if a user is currently signed in
			console.log("Logged in as User: " + user.displayName);
			console.log("Email: " + user.email);
			console.log("Verification: " + user.emailVerified);
			console.log("photoURL: " + user.photoURL);
			console.log("Anonymity: " + user.isAnonymous);
			console.log("ID: " + user.uid);
			console.log("Provider: " + user.providerData);
			if (!user.emailVerified && createAccountModalShown) {
				user.sendEmailVerification().then(function () {
					// If email sent...
					console.log("Verification Email sent successfully!");
					$('#emailVerificationModalBody').html("<h5>Verification sent to " + user.email + "</h5> <p>Please <strong>verify</strong> your email by checking out the Verification Email we sent you!</p>");
					$('#emailVerificationModal').modal('show');
					$('#signUpModal').modal('hide');
				}, function (err) {
					// If err...
					console.log("Verification error: " + err);
					$('#emailVerificationModalBody').html("Sorry, we messed up somewhere! Please check back later.");
					$('#emailVerificationModal').modal('show');
					$('#signUpModal').modal('hide');
				});
			} else if (!user.emailVerified) {

			} else if (user.uid) {
				window.location = ('bacpac-upload.html?uid=' + user.uid);
				// console.log("USERID is Active");
			}
		} else {		// ...if a user is signed out
			console.log("You are signed out. Please sign in using your account email and password, or create a new account");
		}
	});

/* Action: "Create Account Button" Click */
	$('#createAccount').on("click", function(){
		console.log("Creating a new account...");
	});

/* Action: "Sign-Up Modal Sign Up Button" Click */
	$('#signUpBtn').on("click", function(){
		console.log("Submitting new account info...");

		// Show status
		$('#signupErrorMessage').html("Submitting...");

		// Grab user info from input elements
		var uname = $('#createUsername').val();
		var pass = $('#createPassword').val();

		// Send to Firebase
		auth.createUserWithEmailAndPassword(uname, pass).catch(function(err){
			var errCode = err.code;
			var errMsg = err.message;

			// Log Error
			console.log("[ERR]" + errCode + ": " + errMsg);
			$('#signupErrorMessage').html(errMsg);
		});
	});

/* Action: "Sign-Up Modal Cancel Button" Click */
	$('#cancelSignUpBtn').on("click", function(){
		console.log("Cancelling creating a new account");
	});

/* Action: "Submission Button" Click */
	$('#loginBtn').on("click", function(){
		console.log("Submitting login info...");

		// Show status
		$('#loginErrorMessage').html("Submitting...");

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