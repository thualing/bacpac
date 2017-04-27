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
		console.log("Running Main Routine...");
		// /* "p" Key Default Action Override */
		// $(document).on("keydown", function(event){
		// 	if(event.which === 112){
		// 		console.log("p was pressed");
		// 		/* Initialize fileManagerFoldersPane with root directory folders */
		// 		updateFolderPane();
		// 	}
		// });

		/* Init the user's front end file manager */
		listDirectoryContent(user.data.uid, "/", database, updateFolderPane);

		/* Apply proper logout protocol to the logout button */
		setupLogoutProtocol("logoutBtn", database, auth);
	}






/* File Manager Utility: updateFolderPane
		Description:
			Updates the folder navigation tree with a directory's folders passed in through data.
			Takes the form of a callback to run after the first call to listDirectoryContent()
		Expects:
			N/A
		Parameters:
			Object data - the current user's directory's hierarchy data
		Returns:
			false - if error
			true - if successful read of session data
*/
	function updateFolderPane(data) {
		if (!data) {
			console.log("Error:updateFolderPane: invalid data");
			return false;
		}
		console.log("Updating navigation tree: " + JSON.stringify(data));
		return true;
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
		Description:
			Gathers a list of the speficied path's folders and files (ONLY those in that directory, i.e. no children's children).
			This list of files is passed to a callback, which should be used to acquire the list of files to display on UI
		Expects:
			N/A
		Parameters:
			string uid - the user's uid
			string fullPath - the requested path (within the user's root directory) to view
			Object dbRef - a reference to firebase.database()
			Function callback - the callback to run after querying database; it is passed a JSON object of requested path contents
		Returns:
			true - if successful call
			false - if invalid parameters
*/
	function listDirectoryContent(uid, fullPath, dbRef, callback) {
		if (!uid || !fullPath || !dbRef || !callback) {
			console.log("Error:listDirectoryContent: invalid parameter(s)");
			return false;
		} else if (typeof uid !== "string" || typeof fullPath !== "string") {
			console.log("Error:listDirectoryContent: type error(s)");
			return false;
		} else if (typeof callback !== "function") {
			console.log("Error:listDirectoryContent: callback is not a function!");
			return false;
		}
		dbRef.ref("/folder/" + uid + fullPath).once("value").then(function(snapshot){
			callback(snapshot.val());
		}).catch(function(error){
			console.log(error);
		});

		return true;
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