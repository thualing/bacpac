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
		// console.log("Updating navigation tree: " + JSON.stringify(data));	// debug

		// Create the html templates needed to represent files/folders.
		var counter = 0;
		var fileElements = "";
		var folderElements = "";
		var currentDirectoryLedger = Object.keys(data);	// a string array of the files/folders in the current directory
		// console.log("obj: " + currentDirectoryLedger[1]);	// debug

		for(var i = 0; i < currentDirectoryLedger.length; i++) {
			switch(currentDirectoryLedger[i]) {
				case "0": {		// ignore this directory identifier; it was used as an initializer and is irrelevant
					break;
				}
				default: {		// otherwise... process the files...
					// console.log("A: " + currentDirectoryLedger[i] + " B:" + database + " C: " + uid);	// debug
					distinguishEntity(currentDirectoryLedger[i], database, uid, function (result, key) {
						switch (result) {
							case "file": {
								// console.log(result + " " + key);	// debug
								// inserts elements into the UI that are identifiable via unique ids (i.e. "file1, file2,..., fileN") and class "fileElement"
								// these elements, when clicked, will call the function specified by the "onclick" attrubute

								// Button
								/*
								fileElements += "<div class='dropdown'><button id='file" + i + "' type='button' class='fileElement btn btn-info btn-block dropdown-toggle' data-toggle='dropdown'>" + decodeURIComponent(key) + "</button><ul id='folder" + i + "dropdown' class='dropdown-menu'><li><a href='#'>HI</a></li></ul></div>";
								*/
								var elementID = "file" + counter;
								var elementDropdownID = "folder" + counter + "dropdown";
								var fileName = decodeURIComponent(key);

								// Dropdown Option Menu
								
/*								fileElements += "<div class='dropdown col-xs-6 col-md-3' style='text-align: left'>    <div id='" + elementID + "' class='fileElement dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>    <a href='#' class='thumbnail row'>    <span class='glyphicon glyphicon-file' style='font-size: xx-large'></span>" + fileName + "</a>    </div>    <ul id='" + elementDropdownID + "' class='dropdown-menu' style='position: static'>    <li class='dropdown-header'>Options</li>    <li>    <a href='#'>Download</a>    </li>    <li>    <a href='#'>Properties</a>    </li>    <li>    <a href='#' style='color:red'>Delete</a>    </li>    </ul>    </div>";*/

								// Custom 1
								fileElements += "<div class='col-xs-6 col-md-3' style=''>\
									<div id='" + elementID + "' class='fileElement'>\
										<a href='#' role='button' class='thumbnail'>\
											<div>\
												<span class='glyphicon glyphicon-file' style='font-size: large;display: block; word-wrap: break-word; width: inherit'></span>\
												<span style='display: block; word-wrap: break-word; width: inherit'>" + fileName + "</span>\
											</div>\
										</a>\
									</div>\
								</div>";
								

								// Collapsible Option Menu
								/*fileElements += "<div class='col-md-12' style='text-align: left'>    <div id='" + elementID + "' class='fileElement' style='text-align: inherit'>    <a href='#" + elementDropdownID + "' role='button' class='thumbnail btn btn-info row' data-toggle='collapse' aria-expanded='false' aria-controls='" + elementDropdownID + "'>    <span class='glyphicon glyphicon-file' style='font-size: xx-large'></span>" + fileName + "</a>    <div class='collapse' id='" + elementDropdownID + "'>    <ul class='well'>    <li><button href='#'>Download</button></li>    <li><button href='#'>Properties</button></li>    <li><button>Delete</button></li>    </ul>    </div>    </div>    </div>";*/
								counter++;
								break;
							}
							case "folder": {
								folderElements += "<div class='list-group btn-group'><button id='folder" + i + "' type='button' class='folderElement list-group-item btn btn-primary dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>" + decodeURIComponent(key) + "</button><ul id='folder" + i + "dropdown' class='dropdown-menu'><li><a href='#'>Hello</a></li></ul></div>";
								break;
							}
							default: {
								console.log("Error:updateFolderPane: entity error occurred");
								break;
							}
						}
						insertElement("fileManagerFoldersPane", folderElements);	// populate folder navigation tree
						insertElement("fileManagerContent", fileElements);		// populate file area
					});
					break;
				}
			}
		}
		return true;
	}

/* File Manager Utility: distinguishEntity
		Description:
			Determines if the specified entity is a file or folder according to the user's databases
		Expects:
			?
		Parameters:
			string key - the key name of a fileName/folderName (a key provided by the database)
			FirebaseObject dbRef - a reference to the firebase.database() object
			string uid - the current user's uid
			Function callback - a callback to run after execution; it is passed the entity type 
				(i.e. "file" for a file, "folder" for a folder, "error" if the query encountered an error,
				or "unknown" if otherwise), and the originally specified key
		Returns:
			false - if unsuccessful, or if an error occurred
			true - if call was successfully processed
*/
	function distinguishEntity(key, dbRef, uid, callback) {
		if (!key || !dbRef || !uid || !callback) {
			console.log("Error:distinguishEntity: invalid parameter(s)");
			return false;
		} else if(typeof key !== "string" || typeof uid !== "string") {
			console.log("Error:distinguishEntity: Type Error!");
			return false;
		} else if (key === "") {
			console.log("Error:distinguishEntity: empty key");
			return false;
		} else if (uid === "") {
			console.log("Error:distinguishEntity: empty uid");
			return false;
		}

		// Cross-reference the key with fileName db
		dbRef.ref('/fileName/' + uid + "/" + key).once("value").then(function(snapshot) {
			var entity = snapshot.val();
			// console.log("Entity = " + JSON.stringify(entity));	// debug
			if (entity === null) {	// is a folder, i.e. the entity is not in the fileName registry
				callback("folder", key);
			} else if ((Object.keys(entity)).indexOf("path") !== -1) {		// is a file, i.e. entity was an object containing the "path" key
				callback("file", key);
			} else {
				callback("unknown", key);
			}
		}).catch(function(error){
			console.log("Error:distinguishEntity: Internal Error Occurred! [" + error + "]");
			callback("error", key);
		});
		return true;
	}

/* File Manager Utility: insertElement
		Description:
			Inserts a html element into the specified UI area as a child element
		Expects:
			The element id specified must exist within the page, otherwise an error will be thrown
			Note: Beware of inserting multiple htmlObj with the same ID; IDs are REQUIRED to be UNIQUE
		Parameters:
			string elemID - the ID of the element to insert the object into
			string htmlObj - the html object to insert into the specified element
		Returns:
			false - if error
			true - if successful insertion
*/
	function insertElement(elemID, htmlObj) {


		// Check if element exists
		switch($("#" + elemID).length) {
			case 1: {
				$("#" + elemID).html(htmlObj);
				return true;
				break;
			}
			case 0: {
				console.log("Error:insertElement: element '" + elemID + "' not found");
				return false;
				break;
			}
			default: {
				console.log("Error:insertElement: multiple instances of element '" + elemID + "'");
				return false;
				break;
			}
		}
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