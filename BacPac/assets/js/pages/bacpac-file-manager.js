/* ---------- File Manager ---------- */
// var elf = $('.file-manager').elfinder({
// 	url : 'assets/misc/elfinder-connector/connector.php'  // connector URL (REQUIRED)
// }).elfinder('instance');

$(document).ready(function () {
	console.log("File Manager initialized...");
});

/* Init */
	// Google Firebase Initial Setup
	var firebaseConfig = {
		apiKey: "AIzaSyD98_8qlaeufS_1nwJ3Dv8auLi93AjhW5A",
		authDomain: "banpac-4d0af.firebaseapp.com",
		databaseURL: "https://banpac-4d0af.firebaseio.com",
		storageBucket: "banpac-4d0af.appspot.com",
	};
	var app = firebase.initializeApp(firebaseConfig);	// Default App (REQUIRED)
	console.log('App: ' + app.name);

	// Google Firebase Service Setup
	var auth = firebase.auth();
	var database = firebase.database(app);
	var storage = firebase.storage();

	// Firebase Authentication Safeguard
	var user = null;
	var uid = getParameterByName("uid");
	switch(uid) {
		case null: {
			// not found
			console.log("Error: User ID not found");
			window.location = "bacpac-login.html";
			break;
		}
		case '': {
			// invalid found
			console.log("Error: User ID not found");
			window.location = "bacpac-login.html";
			break;
		}
		default: {
			// set user to the currentUser data
			readSessionData(uid);
			break;
		}
	}







/* Action: Logout Button click */
	$("#logoutBtn").on("click", function(){
	    database.ref("/sessions/" + user.uid).remove().then(function(){
	        console.log("Session Ended...");
	        auth.signOut().then(function(){
	            console.log("Signing Out");
	            window.location = ("bacpac-login.html");
	        }).catch(function(error){
	            console.log(error);
	        });
	    }).catch(function(error){
	        console.log("Internal Error Occurred! [" + error + "]");
	    });
	});

/* Utility: Query String Parameter Retriever */
	function getParameterByName(name, url) {
	    if (!url) {
	     url = window.location.href;
	    }
	    name = name.replace(/[\[\]]/g, "\\$&");
	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	        results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

/* Utility: readSessionData */
	function readSessionData(userId) {
		database.ref("/sessions/" + userId).once("value").then( function(snapshot){
		    user = snapshot.val();
		    console.log("Current User: " + JSON.stringify(user));
		});
	}