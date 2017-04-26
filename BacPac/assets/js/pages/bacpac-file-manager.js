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
	var user = {data:""};
	var uid = getParameterByName("uid");
	readSessionData(user, getParameterByName("uid"), database, rsdCallback);
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
			// all clear; login is valid
			break;
		}
	}





/* MAIN - main function to run the page */
	function main() {
		/* Initialize fileManagerFoldersPane with root directory folders */
		initFolderPane();

		/* Apply proper logout protocol to the logout button */
		setupLogoutProtocol("logoutBtn", database, auth);
	}





/* File Manager Utility: initFolderPane
		Description:
			initializes the folder tree with the root directory folders.
		Expects:
			N/A
		Parameters:
			?
		Returns:
			?
*/
	function initFolderPane() {

	}

/* File Manager Utility: applyProfileData
		Description:
			Applies a user's profile data onto the relevant web page elements
		Expects:
			N/A
		Parameters:
			string elemID - the ID of the target element to apply profile data to
			string data - the data to apply to the targeted element
		Returns:
			true - 
*/
	function applyProfileData(elemID, data) {
		if (!elemID || !data) {
			console.log("Error:applyProfileData: invalid parameter(s)");
			return false;
		} else if (elemID === '') {
			console.log("Error:applyProfileData: invalid element ID");
			return false;
		}
		$("#" + elemID).html(data);
		return true;
	}

/* File Manager Utility: listDirectoryContent 
		returns a list of the speficied path's folders and files (ONLY those in that directory, i.e. no children's children).
*/
	function listDirectoryContent(uid, fullPath) {
		if (!uid) return false;
		database.ref("/folder/" + uid + fullPath).once("value").then(function(snapshot){
			return shapshot.val();
		}).catch(function(error){
			console.log(error);
		});
	}

/* File Manager Utility: rsdCallback
		Description:
			The callback to run after reading Session Data
		Expects:
			N/A
		Parameters:
			Object data - the current user data 
		Returns:
			false - if error
			true - if successful read of session data

*/
	function rsdCallback(data){
		if (!data) {
			console.log("Error:rsdCallback: invalid session");
			window.location = "bacpac-login.html";
			return false;
		};
		switch(data.uid) {
			case null: {
				// not found
				console.log("Error: User ID not found");
				window.location = "bacpac-login.html";
				return false;
				break;
			}
			case '': {
				// invalid found
				console.log("Error: User ID not found");
				window.location = "bacpac-login.html";
				return false;
				break;
			}
			default: {
				// all clear; login is valid
				applyProfileData("profileUsername", data.email);
				main();		// run page
				return true;
				break;
			}
		}
	}