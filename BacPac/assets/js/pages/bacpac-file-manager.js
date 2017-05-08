/* ---------- File Manager ---------- */
// var elf = $('.file-manager').elfinder({
// 	url : 'assets/misc/elfinder-connector/connector.php'  // connector URL (REQUIRED)
// }).elfinder('instance');

$(document).ready(function () {
	console.log("File Manager initialized...");
	$("#optionsButton").click(function (event) {
			event.preventDefault();
		if ($("#fileOptionsMenu").hasClass("hidden")) {
			$("#fileOptionsMenu").removeClass("hidden");
		}
		else {
			$("#fileOptionsMenu").addClass("hidden");
		}
	});
});

$(document).on("keydown", function(event){
	if(event.which === 13) {	// if the enter key was pressed
		// Do nothing
	}
})

/* Init */
	// Google Firebase Initial Setup
	var firebaseConfig = {
		apiKey: "AIzaSyD98_8qlaeufS_1nwJ3Dv8auLi93AjhW5A",
		authDomain: "banpac-4d0af.firebaseapp.com",
		projectId: "banpac-4d0af",
		databaseURL: "https://banpac-4d0af.firebaseio.com",
		storageBucket: "banpac-4d0af.appspot.com",
		messagingSenderId: "1079004100386"
	};
	var app = firebase.initializeApp(firebaseConfig);	// Default App (REQUIRED)
	console.log('App: ' + app.name);

	// Google Firebase Service Setup
	var auth = firebase.auth();
	var database = firebase.database(app);
	var storage = firebase.storage();

	// Firebase Authentication Safeguard
	var user = {data:""};
	var currentDirectory = "";
	var uid = getParameterByName("uid");
	readSessionData(user, getParameterByName("uid"), database, rsdCallback);
	switch(uid) {
		case null: {
			// not found
			console.log("Error: User ID not found");
			window.location = "index.html";
			break;
		}
		case '': {
			// invalid found
			console.log("Error: User ID not found");
			window.location = "index.html";
			break;
		}
		default: {
			// all clear; login is valid
			break;
		}
	}

	// Sharing Status Variables
	var sharingList = {};
	var blackList = {};
	var sharingHistory = {};
	var fileToShare = "";



/* MAIN - main function to run the page */
	function main() {
		console.log("Running Main Routine...");
		console.log("Initializing auth: " + JSON.stringify(auth.currentUser));

		// Re-authenticate user
		auth.currentUser.reload();

		// /* "p" Key Default Action Override */
		// $(document).on("keydown", function(event){
		// 	if(event.which === 112){
		// 		console.log("p was pressed");
		// 		/* Initialize fileManagerFoldersPane with root directory folders */
		// 		updateFolderPane();
		// 	}
		// });

		/* Setup Initial stage of the path Tracker */
		$("#homedestination").on("click", function() {
			listDirectoryContent(user.data.uid, "/", database, updateFolderPane);	// when "Home" is clicked, the user is taken to the home directory
		});

		/* Init the user's front end file manager */
		listDirectoryContent(user.data.uid, "/", database, updateFolderPane);

		/* Init the listenere for the user's share files display */
		listFilesSharedWithMe(user.data.uid, "sharedFileContent", database);

		/* Apply proper logout protocol to the logout button */
		setupLogoutProtocol("logoutBtn", database, auth);

		/* setup the Add Folder stuff */
		setupAddFolderButton();

	}






/* File Manager Utility: updateFolderPane
		Description:
			Updates the folder navigation tree with a directory's folders passed in through data.
			Takes the form of a callback to run after the first call to listDirectoryContent()
		Expects:
			The uid variable (string of the current user's uid) MUST exist
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

		// Update the folder/file content pane
		for(var i = 0; i < currentDirectoryLedger.length; i++) {
			// console.log("length: " + currentDirectoryLedger.length);	// debug
			switch(currentDirectoryLedger[i]) {
				case "0": {		// unless this is the only thing in the dir (i.e. dir is empty), ignore this directory identifier; it was used as an initializer and is irrelevant
					if (currentDirectoryLedger.length <= 1) {	// if the dir is empty...
						console.log("Directory is empty!");
						var emptyDirSign = "<h1 style='text-align: center'>This directory is empty!</h1>";
						insertIntoElement("fileManagerContent", emptyDirSign);		// populate folder content box
					}
					break;
				}
				default: {		// otherwise... process the files...
					// console.log("A: " + currentDirectoryLedger[i] + " B:" + database + " C: " + uid);	// debug
					distinguishEntity(currentDirectoryLedger[i], database, uid, function (result, key) {
						switch (result) {
							case "file": {
								// console.log(result + " " + key);	// debug
								var elementID = "file" + counter;
								var elementDropdownID = "folder" + counter + "dropdown";
								var fileName = decodeURIComponent(key);

								// Custom 1
								fileElements += "<div class='col-xs-6 col-md-3' style='padding-top: 10px'>\
									<div id='" + elementID + "' class='fileElement' title='Click For File Options'>\
										<div role='button' class='thumbnail'>\
											<div onclick='optionMenu(" + '"' + elementID + '"' + ")'>\
												<span class='glyphicon glyphicon-file' style='font-size: large;display: block; word-wrap: break-word; width: inherit'></span>\
												<span id='" + elementID + "filename' style='display: block; word-wrap: break-word; width: inherit; font-size: medium'>" + fileName + "</span>\
												<div id='" + elementID + "OptionMenu' class='fileOptionMenu container-fluid hidden'>\
													<div class='row'>\
														<button class='fileOptionMenuBtn btn btn-block btn-primary' onclick='promptDownloadFromElement(" + '"' + elementID + '",' + '"' + uid + '"' + ")'><span class='fa fa-arrow-circle-down'></span>Open/Download</button>\
														<button class='fileOptionMenuBtn btn btn-block btn-info' onclick='promptShareFromElement(" + '"' + elementID + '",' + '"' + uid + '"' + ")'><span class='fa fa-share-square-o'></span>Sharing</button>\
														<button class='fileOptionMenuBtn btn btn-block btn-default' onclick='promptPropertiesFromElement(" + '"' + elementID + '",' + '"' + uid + '"' + ")'><span class='fa fa-info'></span>Properties</button>\
														<button class='fileOptionMenuBtn btn btn-block btn-warning' onclick='promptMoveFromElement(" + '"' + elementID + '",' + '"' + uid + '"' + ")'><span class='fa fa-level-up'></span>Move</button>\
														<button class='fileOptionMenuBtn btn btn-block btn-danger' onclick='promptDeleteFromElement(" + '"' + elementID + '",' + '"' + uid + '"' + ")'><span class='fa fa-times-circle'></span>Delete</button>\
													</div>\
												</div>\
											</div>\
										</div>\
									</div>\
								</div>";

								counter++;
								break;
							}
							case "folder": {
								var elementID = "folder" + counter;
								var folderName = bacpacDecode(key);
								var destination = currentDirectory + bacpacEncode(folderName) + "/";

								// console.log(result + " " + key);	// debug
								folderElements += "<div class='col-xs-6 col-md-3' style='padding-top: 10px'>\
									<div id='" + elementID + "' class='fileElement' title='Click For File Options'>\
										<div role='button' class='thumbnail'>\
											<div onclick='folderMenu(" + '"' + elementID + '"' + ")'>\
												<span class='glyphicon glyphicon-folder-open' style='font-size: large;display: block; word-wrap: break-word; width: inherit'></span>\
												<span id='" + elementID + "foldername' style='display: block; word-wrap: break-word; width: inherit; font-size: medium'>" + folderName + "</span>\
												<div id='" + elementID + "OptionMenu' class='fileOptionMenu container-fluid hidden'>\
													<div class='row'>\
														<button class='fileOptionMenuBtn btn btn-block btn-primary' onclick='downDirectory(" + '"' + elementID + '","' + destination + '"' + ")'>Open</button>\
														<button class='fileOptionMenuBtn btn btn-block btn-danger' onclick='promptDeleteFolder(" + '"' + elementID + '","' + uid +'"' + ")'>Delete</button>\
													</div>\
												</div>\
											</div>\
										</div>\
									</div>\
								</div>";
								counter++;
								break;
							}
							default: {
								console.log("Error:updateFolderPane: entity error occurred");
								break;
							}
						}

						// Only place elements on the UI when all files' html templates are configured (improves UI efficiency)
						if (counter === currentDirectoryLedger.length - 1) {
							// insertIntoElement("fileManagerFoldersPane", folderElements);	// populate folder navigation tree
							insertIntoElement("fileManagerContent", folderElements + fileElements);		// populate folder content box
						}
					});
					break;
				}
			}
		}
		return true;
	}

/* File Manager Utility: optionMenu
		Description:
			Launches the options menu for the file element specified by elemID
		Expects:
			?
		Parameters:
			string elemID - the id of the file element that was clicked
		Returns:
			N/A
*/
	function optionMenu(elemID) {
		// console.log("Hi, I'm " + elemID);	// debug

		switch($("#" + elemID + "OptionMenu").hasClass("hidden")) {
			case true: {	// if a file's option menu is closed
				$(".fileOptionMenu").addClass("hidden");	// close any other open file option menus before opening this one
				$(".folderOptionMenu").addClass("hidden");	// close any other open folder option menus before opening this one
				$("#" + elemID + "OptionMenu").removeClass("hidden");	// then open this one
				break;
			}
			default: {	// if it is already open
				$("#" + elemID + "OptionMenu").addClass("hidden");	// close this one
				break;
			}
		}
	}

/* File Manager Utility: folderMenu
		 Description:
		 	Launches the folder menu for the folder element specified by elemID
		 Expects:
		 	?
		 Parameters:
		 	string elemID - the id of the file element that was clicked
		 Returns:
		 	N/A
 */
	function folderMenu(elemID) {
		// console.log("Hi, I'm " + elemID);	// debug

		switch($("#" + elemID + "OptionMenu").hasClass("hidden")) {
			case true: {	// if a file's option menu is closed
				$(".folderOptionMenu").addClass("hidden");	// close any other open file option menus before opening this one
				$(".fileOptionMenu").addClass("hidden");	// close any other open file option menus before opening this one
				$("#" + elemID + "OptionMenu").removeClass("hidden");	// then open this one
				break;
			}
			default: {	// if it is already open
				$("#" + elemID + "OptionMenu").addClass("hidden");	// close this one
				break;
			}
		}
	}

/* File Manager Utility: promptDownloadFromElement
		Description:
			Prompts the download of the file represented by the specified element
			Applies content to a download modal and launches the modal.
		Expects:
			(Will turn into a parameter in future:) The function ASSUMES that the code has a firebase.storage() object named
			"storage"
		Parameters:
			string elemID - the id of the file element that was clicked
			string userID - the current user's uid
		Returns:
			N/A
*/
	function promptDownloadFromElement(elemID, userID) {
		var fileName = ($("#" + elemID + "filename").html()).replace(/&amp;/g, "&");	// get file name from the inner html of the clicked file element
		// console.log("Downloading " + fileName + " from " + elemID + " for user " + userID);	// debug

		var fileRef = storage.ref("files/" + userID + "/" + fileName);
		fileRef.getDownloadURL().then(function(url){
			// Launch a Download (and Preview?) Modal
			// console.log("Download: " + url);	// debug
			$("#downloadModalPreview").attr("src", url);				// place preview image in the preview iframe
			$("#downloadModalDownloadButton").attr("title", url);		// place the download url in the button's title field
			$("#downloadModal").modal("show");							// launch modal
			$("#downloadModalDownloadButton").off("click");				// remove previous click event listener from the download button (solves multiple tabs opening)
			$("#downloadModalDownloadButton").on("click", function () {	// place new click event listener to the download button for the currently previewed item
				console.log("Opening window for: " + url);	// debug
				window.open($("#downloadModalDownloadButton").attr("title"));
			});
		}).catch(function(error) {
			console.log("Error:promptDownloadFromElement: Internal Error Occurred! [" + error.code + " (" + error.message + ")" + "]");
		});
	}

/* File Manager Utility: promptShareFromElement
		Description:
			Prompts the sharing/unsharing of the file you own, represented by the specified element
			Applies content to the sharing modal and launches the modal
		Expects:
			(Will turn into a parameter in future:) The function ASSUMES that the code has a firebase.database() object named
			"database" in it.
			The object "sharingList" (case-sensitive) must be initialized as an empty object within this file in global scope (and above any calls to this function)
			The object "sharingHistory" (case-sensitive) must be initialized as an empty object within this file in global scope (and above any calls to this function)
			The variable "fileToShare" (case-sensitive) must be initialized as an empty string within this file in global scope (and above any calls to this function)
		Parameters:
			string elemID - the id of the file element that was clicked
			string userID - the current user's uid
		Returns:
			N/A
*/
	function promptShareFromElement(elemID, userID) {
		var fileName = ($("#" + elemID + "filename").html()).replace(/&amp;/g, "&");
		console.log("Sharing " + fileName + " from " + elemID + " for user " + userID);	// debug
		fileToShare = fileName;	// set the name of current file to be shared

		// Setup Current Sharing Info for the current file (i.e. if the file is currently shared with others, the UI needs to reflect that)
		database.ref("/shared/" + userID + "/withOtherUsers/" + encodeURIComponent(fileName).replace(/\./g, '%2E')).once("value").then(function(snapshot){
			var listOfShareUsers = snapshot.val();		// snapshot.val() returns the JSON object of key:value pairs consisting of "uid":"unencodedEmailOfUserWithThatUid"
			if (listOfShareUsers !== null) {	// if the selected file IS CURRENTLY shared with others
				var arrayOfUids = Object.keys(listOfShareUsers);	// pull the uids of users who can access this file; store them in an array of strings

				console.log("Alert:promptShareFromElement: The file " + fileToShare + " is already shared with others!");	// debug
				arrayOfUids.forEach(function(currentUid, currentIndex, returnedArray) {
					addUserToShare(elemID, userID, listOfShareUsers[currentUid], currentUid, true);	// populate the share queue with the emails/usernames of people who are already shared this file; also record history on who was previously shared this file (for use with removing sharing rights of others)
					console.log(" Previously shared with: " + JSON.stringify(sharingHistory));
				});
			} else {
				console.log("Alert:promptShareFromElement: The file " + fileToShare + " is not shared with anyone right now...");	// debug
			}
		});

		// Setup Sharing Modal Search Feature
		$("#sharingModalUserSearchBar").off("input");	// remove previous input event listener
		$("#sharingModalUserSearchBar").on("input", function(){	// add a listener that continuously searches the BacPac user base for the desired user
			var searchTerm = encodeURIComponent($("#sharingModalUserSearchBar").val()).replace(/\./g, '%2E').replace(/%40/g, '@');
			// console.log("Searching for " + searchTerm);	// debug
			if (searchTerm === "" || searchTerm === "0") {	// if search bar is empty, clear user display
				insertIntoElement("sharingModalUserDisplay", "<p style='color:white; font-style:oblique;'>No Users Found</p>");
				return;
			}

			// This requests a new ref each time input is updated; inefficient, but simple enough for now
			database.ref("/roster/").once("value").then(function(snapshot){
				// Acquire the user emails of all registered bacpac users in an array
				var usernames = Object.keys(snapshot.val());
				var resultHTML = "";
				var matchCount = 0;

				// Clear the sharing Modal Search Display
				var noUsersFound = "<p style='color:white; font-style:oblique;'>No Users Found</p>";
				insertIntoElement("sharingModalUserDisplay", noUsersFound);		// if no matches are found, this will be all that remains in the box

				// Sift through the usernames for partial/complete matches to searchTerm and place partial/complete matches into the user display
				usernames.forEach(function(uname, unameIndex, returnedArray){
					if(!uname.includes("@")){	// since roster now includes a list of uids:emails in conjunction with emails:uids, ignore the former, and count the latter
						// use the "@" to distinguish between email:uid pairs and uid:email pairs. If a uid:email pair is encountered, do nothing...
						console.log(uname + " is not an email!");
						return;
					}
					console.log(uname + " is an email!");

					if (uname.includes(searchTerm)) {	// if there's a match, place it in the UI in the following button template:
						matchCount++;

						if (!matchCount) insertIntoElement("sharingModalUserDisplay", "");

						resultHTML += "\
						<button class='btn btn-info' style='width:100%' onclick='addUserToShare(" + '"' + elemID + '",' + '"' + userID + '",' + '"' + decodeURIComponent(uname) + '",' + '"' + snapshot.val()[uname]["uid"] + '"' + ")'>\
							" + decodeURIComponent(uname) + "\
						</button>";
						insertIntoElement("sharingModalUserDisplay", resultHTML);
					}
				});
			});
		});
		$("#sharingModalConfirm").off("click");	// remove the click event of the Confirm button
		$("#sharingModalConfirm").on("click", function(){
			updateFileShareStatus(userID);
		});	// add a listener for a click to confirm sharing
		$("#sharingModalCancel").off("click");	// remove the click event of the Cancel button
		$("#sharingModalCancel").on("click", cancelShareFromElement);	// add a listener for a click to cancel sharing
		$("#sharingModal").modal("show");
	}

/* File Manager Utility: promptMoveFromElement
		Description:
			?
		Expects:
			(Will turn into a parameter in future:) The function ASSUMES that the code has a firebase.database() object named
			"database" in it, and a firebase.storage(object) named "storage".
		Parameters:
			string elemID - the ID of the element representing the file to move
			string userID - the current user's UID
		Returns:
			?
*/
	function promptMoveFromElement(elemID, userID) {
		var fileName = ($("#" + elemID + "filename").html()).replace(/&amp;/g, "&");
		console.log("Alert:promptMoveFromElement: Preparing to move " + fileName + " (owned by " + userID + ")");	// debug

		// Place filename onto the header
		$("#moveFileName").html(fileName);

		// Setup modal close action
		$("#moveFileModalCancel").off("click");
		$("#moveFileModalCancel").on("click", function () {
			$("#moveFileName").html("");	// clear header
			$("#moveFileWarning").html("");	// clear modal warning section
			$("#moveFileModal").modal("hide");	// hide modal
		});

		// Populate the file moving modal body with a fully interactable directory tree (listing only directories) to select from
		database.ref("/folder/" + userID + "/").once("value").then(function (snapshot) {	// acquire a snapshot of the user's entire directory tree
			// console.log(JSON.stringify(snapshot.val()));	// debug
			
			createDirectoryTreeFrom("", elemID, "moveFileDirectoryTree", "moveFilePathTracker", userID, database);	// create a dir. tree iface starting from the user's root directory
		}).catch(function (error) {
			console.log("Error:promptMoveFromElement: Internal Error Occurred! [" + error.code + " (" + error.message + ")]");
			return;
		});

		// Show the file moving modal
		$("#moveFileModal").modal("show");
	}

/* File Manager Utility: createDirectoryTreeFrom
		Description:
			Create's a directory tree (and breadcrumb stream) showing ONLY directories from the specified user's directory tree location
		Expects:
			If dbRef is not specified:
				(Will turn into a parameter in future:) The function ASSUMES that the code has a firebase.database() object named
				"database" in it
			The variable "currentDirectory" must exist and be initialized in the beginning of the code as an empty string.
			Whenever the "currentDirectory" variable is changed, certain conditions must be met:
				The first character MUST NOT be a "/" under ANY CIRCUMSTANCES.
				If the "currentDirectory" is NOT EMPTY after the change, the last character MUST be a "/".
				If the "currentDirectory" variable is changed to reflect the home directory, it must become an EMPTY STRING.
		Parameters:
			string location - the full path of the requested directory perspective within the current user's directory tree (IF NOT EMPTY, must have a "/" as a suffix, and not as a prefix!)
			string elemID - the id of the file element representing the file to be moved
			string treeID - the id of the html element to insert the directory tree interface into
			string trackID - the id of the html element to insert the breadcrumb path tracker interface into
			string userID - the current user's uid
			FirebaseObject dbRef - the firebase.database() object
*/
	function createDirectoryTreeFrom(location, elemID, treeID, trackID, userID, dbRef) {
		if (!userID || !treeID || !elemID || !trackID) {
			console.log("Error:createDirectoryTreeFrom: Invalid Parameter(s)!");
			console.log("userID: " + userID, " elemID: " + elemID + " treeID: " + treeID + " trackID: " + trackID);
			return;
		} else if (location[0] === "/") {
			console.log("Error:createDirectoryTreeFrom: Invalid location! (has forward slash prefix)");
			return;
		} else if ((location !== "") && (location[location.length - 1] !== "/")) {
			console.log("Error:createDirectoryTreeFrom: Invalid location! (missing forward slash suffix)");
			return;
		} else if (!dbRef) {
			if (!database) {
				console.log("Error:createDirectoryTreeFrom: Invalid firebase.database() reference!");
				return;
			} else {
				dbRef = database;
			}
		}
		var prevPath = currentDirectory;

		// console.log("Current Location: " + location);	// debug

		// populate the file
		dbRef.ref("/folder/" + userID + "/" + location).once("value").then(function (snapshot) {
			var directoryContents = snapshot.val();
			var directoryKeys = Object.keys(directoryContents);
			var folderElements = "";
			var locationArray = location.split("/");	// get an array showing the path taken via the location
			var breadcrumbPaths = "";
			var breadcrumbs = "<li><a id='dirTreeHome' href='#' onclick='createDirectoryTreeFrom(" + '"","' + elemID + '","' + treeID + '","' + trackID + '","' + userID + '"' + ")'>Home</a></li>";

			// console.log("directoryKeys: " + directoryKeys + " (" + directoryKeys.length + ")");	// debug

			// insert path history breadcrumbs into the directory history path tracker
			for (var k = 0; k < locationArray.length; k++) {
				if (k === locationArray.length - 1) {	// if this is the last element (i.e. a "" string from the ".split()"), we're done; place all UI breadcrumbs to the directory path tracker
					insertIntoElement("moveFilePathTracker", breadcrumbs);
				} else {
					// otherwise, continue compiling breadcrumb html
					breadcrumbPaths += locationArray[k] + "/";
					console.log("breadcrumbPaths: " + breadcrumbPaths);
					breadcrumbs += "\
					<li><a id='dirTreeHist" + k + "' href='#' onclick='createDirectoryTreeFrom(" + '"' + breadcrumbPaths + '","' + elemID + '","' + treeID + '","' + trackID + '","' + userID + '"' + ")'>\
						" + bacpacDecode(locationArray[k]) +"\
					</a></li>";
				}
			}

			// insert folder selection elements into the directory tree
			var emptyDirSign = "<h1 style='text-align: center;'>This directory is empty!</h1>";
			var noFoldersSign = "<h1 style='text-align: center;'>This directory has no folders!</h1>";
			for (var i = 0; i < directoryKeys.length; i++) {
				switch (directoryKeys[i]) {
					case "0": {
						if (directoryKeys.length <= 1) {	// if the dir is empty (i.e. only contains the {0:0} entry)
							console.log("Alert:createDirectoryTreeFrom: Directory is empty!");	// debug
							var addHereElement = "<button class='btn btn-primary fileMoveDst' onclick='moveFile(" + '"' + elemID + '","' + location + '","' + prevPath + '","' + userID + '"' + ")'><span class='glyphicon glyphicon-plus'></span>Move Here</button>";
							insertIntoElement(treeID, addHereElement + emptyDirSign);
						}
						break;
					}
					default: {
						// console.log("looping: " + directoryKeys[i]);	// debug
						distinguishEntity(directoryKeys[i], dbRef, userID, function (entityType, returnedkey) {
							switch (entityType) {
								case "folder": {
									var addHereElement = "<button class='btn btn-primary fileMoveDst' onclick='moveFile(" + '"' + elemID  +'","' + location + '","' + prevPath + '","' + userID + '"' + ")'><span class='glyphicon glyphicon-plus'></span>Move Here</button>";

									folderElements += "\
									<button id='dirTreeElem" + i + "' class='btn btn-default fileMoveDst' onclick='createDirectoryTreeFrom(" + '"' + location + returnedkey + "/" + '","' + elemID + '","' + treeID + '","' + trackID + '","' + userID + '"' + ")'><span class='glyphicon glyphicon-folder-open' style='padding-right:10px'></span>" + bacpacDecode(returnedkey) + "\
									</button>";

									console.log("Alert:createDirectoryTreeFrom: Inserting into directory tree...");
									insertIntoElement(treeID, addHereElement + folderElements);
									break;
								}
								default: {
									// console.log("Skipping entity '" + entityType + "'...");	// debug
									
									var addHereElement = "<button class='btn btn-primary fileMoveDst' onclick='moveFile(" + '"' + elemID  +'","' + location + '","' + prevPath + '","' + userID + '"' + ")'><span class='glyphicon glyphicon-plus'></span>Move Here</button>";

									// if this is the last element, and the folderElements view is still empty, this file probably isn't empty, but doesn't have any folders in it...
									if (folderElements.length === 0) {
										insertIntoElement(treeID, addHereElement + noFoldersSign);
									}
									break;
								}
							}
						});
					}
				}
			}
			// console.log(locationArray);	// debug
			// console.log(locationArray.length);	// debug
		});
	}

/* File Manager Utility: moveFile
		Description:
			Performs the necessary database queries to move to selected file to the relevant location in the file system
			Once finished, refreshes the directory content view
		Expects:
			(Will turn into a parameter in future:) The function ASSUMES that the code has a firebase.database() object named
			"database" in it
		Parameters:
			string elemID - the id of the file element representing the file to be moved
			string path - the desired full path within the user's directory tree to move the file (must NOT have a "/" prefix, but MUST have a "/" suffix)
			string oldPath - the previous full path within the user's directory tree to move the file (must NOT have a "/" prefix, but MUST have a "/" suffix)
			string userID - the current user's uid
		Returns:
			N/A
*/
	function moveFile(elemID, path, oldPath, userID){
		if (!userID || !elemID) {
			console.log("Error:createDirectoryTreeFrom: Invalid Parameter(s)!");
			console.log("userID: " + userID, " elemID: " + elemID + " treeID: " + treeID + " trackID: " + trackID);
			return;
		} else if (path[0] === "/" || oldPath[0] === "/") {
			console.log("Error:createDirectoryTreeFrom: Invalid path/oldPath! (has forward slash prefix)");
			return;
		} else if (((path !== "") && (path[path.length - 1] !== "/")) || ((oldPath !== "") && (oldPath[oldPath.length - 1] !== "/"))) {
			console.log("Error:createDirectoryTreeFrom: Invalid path/oldPath! (missing forward slash suffix)");
			return;
		} else {
			if (!database) {
				console.log("Error:createDirectoryTreeFrom: Invalid firebase.database() reference!");
				return;
			}
		}

		if (path === oldPath) {
			$("#moveFileWarning").html("<h3>Your file already exists here...</h3>");
			console.log("Error:createDirectoryTreeFrom: The source and destination paths are identical!");
			return;
		}

		var fileName = ($("#" + elemID + "filename").html()).replace(/&amp;/g, "&");
		console.log("Alert:moveFile: Moving user '" + userID + "'s file '" + fileName + "' to '" + path + "'");

		// First, acquire the previous data of the file in question
		database.ref("/folder/" + userID + "/" + oldPath + bacpacEncode(fileName)).once("value").then(function (snapshot) {
			var fileData = snapshot.val();

			// Compile updates, then update the file's path records in "/folder"
			var updates = {};
			updates["/folder/" + userID + "/" + path + bacpacEncode(fileName)] = fileData;	// copy the old data into the new location
			updates["/folder/" + userID + "/" + oldPath + bacpacEncode(fileName)] = null;	// erase the old data from the old location
			database.ref().update(updates).then(function () {
				console.log("Alert:moveFile: File was moved successfully!");

				// Clear and close file move modal
				$("#moveFileName").html("");	// clear header
				$("#moveFileWarning").html("");	// clear modal warning section
				$("#moveFileModal").modal("hide");	// hide modal

				// Refresh the user's directory view
				listDirectoryContent(userID, "/" + currentDirectory , database, updateFolderPane);
				return;
			}).catch(function (error) {
				console.log("Error:moveFile: Internal Error Occurred! [in updating records] [" + error.code + " (" + error.message + ")]");
				return;
			});
		}).catch(function (error) {
			console.log("Error:moveFile: Internal Error Occurred! [in getting previous records] [" + error.code + " (" + error.message + ")]");
		});
	}

/* File Manager Utility: cancelShareFromElement
		Description:
			Performs the necessary cleanup when cancelling the share function
		Expects:
			The object "sharingList" (case-sensitive) must be initialized as an empty object within this file in global scope (and above any calls to this function)
			The object "sharingHistory" (case-sensitive) must be initialized as an empty object within this file in global scope (and above any calls to this function)
			The object "blackList" (case-sensitive) must be initialized as an empty object within this file in global scope (and above any calls to this function)
			The variable "fileToShare" (case-sensitive) must be initialized as an empty string within this file in global scope (and above any calls to this function)
		Parameters:
			N/A
		Returns:
			?
*/
	function cancelShareFromElement() {
		console.log("Alert:cancelShareFromElement: Cancelling Sharing...");
		$("#sharingModalUserSearchBar").val("");	// clear the search bar text
		$("#sharingModalUserDisplay").html("<p style='color:white; font-style:oblique;'>No Users Found</p>");	// clear the display html
		$("#sharingModalShareList").html("");	// clear UI share list
		sharingList = {};	// clear share queue
		sharingHistory = {};	// clear record of who the file was prev. shared with
		blackList = {};	// clear blackList
		fileToShare = "";	// clear the name of the file to share
		console.log(sharingList);	// debug
	}

/* File Manager Utility: addUserToShare
		Description:
			Adds a user to a UI-implemented list of users to share a file with.
		Expects:
			(Will turn into a parameter in future:) The function ASSUMES that the code has a firebase.database() object named
			"database" in it.
			The userName parameter is a literal email, no the URIencoded version (i.e. not "someuser@gmail%2Ecom", but "someuser@gmail.com")
			The object "sharingList" (case-sensitive) must be initialized as an empty object within this file in global scope (and above any calls to this function)
			The object "sharingHistory" (case-sensitive) must be initialized as an empty object within this file in global scope (and above any calls to this function)
		Parameters:
			string elemID - the id of the file element that was clicked
			string userID - the current user's uid
			string userName - selected user's email/username
			string shareID - the uid of the user to share with
			(optional) bool shouldRecord - specifies if the shareHistory must also be updated to reflect the previous list of people who were shared the file in question
		Returns:
			N/A
*/
	function addUserToShare(elemID, userID, userName, shareID, shouldRecord) {
		console.log("E:" + elemID + " U:" + userID + " '" + userName + "'" +" S:" + shareID);	// debug

		// Make sure that the selected user is not already in the share queue
		if (typeof sharingList[shareID] !== "undefined"){
			console.log("Alert:addUserToShare: User '" + shareID + "' is already in queue!");
			return;
		}

		// Make sure that if they are in the blackList, they are removed from it (i.e. in case of a removal followed by an add to the share queue)
		if (blackList[shareID]) {
			delete blackList[shareID];
		}

		// If not, then add to the current running list of people to share to (instantiate a new javascript object member)
		sharingList[shareID] = userName;
		if (shouldRecord) sharingHistory = sharingList;	// this is for recording who to "unshare" from; enables us to share/unshare files using just THIS function (i.e. no need to separate it to a "share" function and "unshare" function)
		console.log(sharingList);	// debug

		// Add html elements
		var currentShareListHtml = $("#sharingModalShareList").html();	// get the current contents of the share queue
		var additionalUserElement = "<button id='share" + shareID + "'' class='btn btn-danger sharingModalUserQueueButton' onclick='removeUserFromShare(" + '"' + shareID + '"' + ")'>" + userName + "<span class='glyphicon glyphicon-remove'></span></button>";
		insertIntoElement("sharingModalShareList", currentShareListHtml + additionalUserElement);
	}

/* File Manager Utility: removeUserFromShare
		Description:
			Removes a user from the UI-implemented list of users to share with
		Expects:
			The object "sharingList" (case-sensitive) must be initialized as an empty object within this file in global scope (and above any calls to this function)
			The object "blackList" (case-sensitive) must be initialized as an empty object within this file in global scope (and above any calls to this function)
		Parameters:
			string shareID - the uid of the user to share with
		Returns:
			N/A
*/
	function removeUserFromShare(shareID) {
		console.log("Alert:removeUserFromShare: User '" + shareID + "' removed from queue!");	// debug

		$("#share" + shareID).remove();	// remove the element from the DOM
		blackList[shareID] = sharingList[shareID];	// add the removed user to the blackList (the queue for "unsharing")
		delete sharingList[shareID];	// remove that key:value pair from the sharingList
		console.log(sharingList);	// debug
	}

/* File Manager Utility: updateFileShareStatus
		Description:
			Invokes a sharing action
			Writes info to the database updating the sharing status of the selected file
			Note: This function overwrites the database's share status entry for this file; removing users from the queue will effectively be similar to directly unsharing a file with those users 
		Expects:
			(Will turn into a parameter in future:) The function ASSUMES that the code has a firebase.database() object named
			"database" in it, and a firebase.storage(object) named "storage".
			The variable "fileToShare" (case-sensitive) must be initialized as an empty string within this file in global scope (and above any calls to this function)
			The object "sharingList" (case-sensitive) must be initialized as an empty object within this file in global scope (and above any calls to this function)
			The object "sharingHistory" (case-sensitive) must be initialized as an empty object within this file in global scope (and above any calls to this function)
		Parameters:
			string userID - the current user's uid
		Returns:
			N/A
*/
	function updateFileShareStatus (userID) {
		// acquire temp copy of the blackList and fileToShare (in case the additive callback finishes first)
		var tempBl = blackList;
		var tempFTS = fileToShare;

		// acquire the uids of the users who are shared this file; store it in an array
		var arrayOfUids = Object.keys(sharingList);

		// // acquire the uids of the users previously shared this file; store it in an array
		// var arrayOfPrevUids = Object.keys(sharingHistory);

		// acquire the uids of the users who are now blacklisted (i.e. unshared)
		var arrayOfBlackListedUids = Object.keys(tempBl);

		console.log("Alert:updateFileShareStatus: Sharing '" + tempFTS + "' with " + JSON.stringify(sharingList) + "... \nUnsharing it with " + JSON.stringify(tempBl));	// debug

		// Add a record into the current user's withOtherUsers section to record that the current user's file has been shared with others
		database.ref("/shared/" + userID + "/withOtherUsers/" + fbdbEncode(tempFTS)).set(sharingList).then(function(){
			console.log("Alert:updateFileShareStatus: Your sharing records have been successfully updated!");	// debug

			// NEGATIVE: Remove records from the "unshared" users's fromOtherUsers sections to reflect that this file is no longer shared with them
			arrayOfBlackListedUids.forEach(function (currentBLUid, currentIndex, returnedArray) {
				database.ref("/shared/" + currentBLUid + "/fromOtherUsers/" + userID + "/" + fbdbEncode(tempFTS)).remove().then(function () {
					console.log("Alert:updateFileShareStatus: Unshared users updated!");
					$("#sharingModalCancel").click();	// close the Sharing Modal
					return;
				}).catch(function (error) {
					console.log("Error:updateFileShareStatus: Internal Error Occurred! [" + error.code + " (" + error.message + ")]");
					$("#sharingModalCancel").click();	// close the Sharing Modal
				});
			});

			// ADDITIVE: Add records into the shared users' fromOtherUsers sections to reflect that this file is shared with them
			arrayOfUids.forEach(function (currentUidOfOtherUser, currentIndex, returnedArray) {
				// For each user being shared this file, record that the current user is sharing it with them
				database.ref("/shared/" + currentUidOfOtherUser + "/fromOtherUsers/" + userID + "/" + fbdbEncode(tempFTS)).set(tempFTS).then(function () {
					console.log("Alert:updateFileShareStatus: File was successfully shared!");
					$("#sharingModalCancel").click();	// close the Sharing Modal
					return;
				}).catch(function (error) {
					console.log("Error:updateFileShareStatus: Internal Error Occurred! [" + error.code + " (" + error.message + ")]");
					$("#sharingModalCancel").click();	// close the Sharing Modal
				});
			});

			return;
		}).catch(function (error) {
			console.log("Error:updateFileShareStatus: Internal Error Occurred! [" + error.code + " (" + error.message + ")]");
			$("#sharingModalCancel").click();	// close the Sharing Modal
			return;
		});
	}

/* Utility: fbdbEncode
		Description:
			Encodes the given string so that it can be registered successfully as a key to the Google Firebase Realtime Database
			Currently encodes ".", in addition to characters encoded by encodeURIComponent
		Expects:
			N/A
		Parameters:
			string str - the string to encode
		Returns:
			string result - the encoded string
*/
	function fbdbEncode(str) {
		return encodeURIComponent(str).replace(/\./g, '%2E');
	}

/* File Manager Utility: promptPropertiesFromElement
		Description:
			Requests and displays additional information about the selected file
		Expects:
			(Will turn into a parameter in future:) The function ASSUMES that the code has a firebase.database() object named
			"database" in it, and a firebase.storage(object) named "storage".
		Parameters:
			string elemID - the id of the file element that was clicked
			string userID - the current user's uid
		Returns:
			N/A
*/
	function promptPropertiesFromElement(elemID, userID) {
		var fileName = ($("#" + elemID + "filename").html()).replace(/&amp;/g, "&");	// get file name from the inner html of the clicked file element

		var fileRef = storage.ref("files/" + userID + "/" + fileName);
		fileRef.getMetadata().then(function(metadata) {
			// console.log("Meta Data: " + JSON.stringify(metadata));	// debug
			$("#propertiesModalFileName").html("<strong>Name: </strong>" + metadata.name);
			$("#propertiesModalFileType").html("<strong>Element Type: </strong>" + metadata.type);
			$("#propertiesModalFileSize").html("<strong>Size: </strong>" + metadata.size + " bytes");
			$("#propertiesModalFileCreationDate").html("<strong>Created: </strong>" + metadata.timeCreated);
			$("#propertiesModalFileLastUpdate").html("<strong>Last Updated: </strong>" + metadata.updated);
			$("#propertiesModalFileContentType").html("<strong>Content Type: </strong>" + metadata.contentType);
			$("#propertiesModal").modal("show");
		}).catch(function(error) {
			console.log("Error:promptPropertiesFromElement: Internal Error Occurred! [" + error.code + " (" + error.message + ")]");
		});
	}

/* File Manager Utility: distinguishEntity
		Description:
			Determines if the specified entity is a file or folder according to the user's databases
		Expects:
			?
		Parameters:
			string key - the unecoded key name of a fileName/folderName (a key provided by the database)
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
			console.log("Error:distinguishEntity: Internal Error Occurred! [" + error.code + " (" + error.message + ")]");
			callback("error", key);
		});
		return true;
	}

/* File Manager Utility: appendIntoElement
		Description:
			Appends html content to the end of the content currently in the specified element
			A call to this function will PRESERVE any html within the specified element before appending
		Expects:
			?
		Parameters:
			string elemID - the id of the element to append into
			string htmlObj - the html object to append
		Returns:
			?
*/
	function appendIntoElement(elemID, htmlObj) {
		var oldHtml = $("#" + elemID).html();
		insertIntoElement(elemID, oldHtml + htmlObj);
	}

/* Utility: insertIntoElement
		Description:
			Inserts html into the specified element as a child element.
			A call to this function will OVERWRITE any html within the specified element; use with caution
		Expects:
			The element id specified must exist within the page, otherwise an error will be thrown
			Note: Beware of inserting multiple htmlObj with the same ID; IDs are REQUIRED to be UNIQUE
		Parameters:
			string elemID - the ID of the element to insert the object into
			string htmlObj - the string of the html element(s) to insert into the specified element
		Returns:
			false - if error
			true - if successful insertion
*/
	function insertIntoElement(elemID, htmlObj) {
		// Check if element exists
		switch($("#" + elemID).length) {
			case 1: {
				$("#" + elemID).html(htmlObj);
				return true;
				break;
			}
			case 0: {
				console.log("Error:insertIntoElement: element '" + elemID + "' not found");
				return false;
				break;
			}
			default: {
				console.log("Error:insertIntoElement: multiple instances of element '" + elemID + "'");
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
		console.log("currentDirectory = " + currentDirectory);
		dbRef.ref("/folder/" + uid + fullPath).once("value").then(function(snapshot){
			callback(snapshot.val());
		}).catch(function(error){
			console.log("Error:listDirectoryContent: Internal Error Occurred! [" + error.code + " (" + error.message + ")]");
		});

		return true;
	}

/* File Manager Utility: listFilesSharedWithMe
		Description:
			Lists all files shared to the user by others
		Expects:
			This function is exepected to be called ONLY once
		Parameters:
			string userID - the current user's uid
			string shareAreaID - the id of the element that will house all shared files
			FirebaseObject dbRef - the firebase.database() object
		Returns:
			?
*/
	function listFilesSharedWithMe(userID, shareAreaID, dbRef) {
		// Continuously listen to your database and acquire the full list of files that are shared with the current user at the given moment...
		dbRef.ref("/shared/" + userID + "/fromOtherUsers/").on("value", function (snapshot) {
			var counter = 0;
			var filesFromOthers = snapshot.val();
			var uidKeysArray = Object.keys(filesFromOthers);
			// console.log(JSON.stringify(snapshot.val()));	// debug

			if (uidKeysArray.length <= 1 && uidKeysArray["0"]) {
				console.log("Alert:listFilesSharedWithMe: No files were shared with you...");
				return;
			} else {
				// console.log(uidKeysArray);	// debug

				// Clear the "shared with me" folders area
				insertIntoElement(shareAreaID, "");

				// Add an element into the "shared with me" folders area
				uidKeysArray.forEach(function (currentKey, currentIndex, returnedArray) {
					switch(currentKey) {
						case "0": {
							console.log("Alert:listFilesSharedWithMe: Skipping the initializer entry...");
							break;
						}
						default: {
							// console.log("Files shared by: " + currentKey);	// debug
							var sharerUid = currentKey;
							var filesSharedFromOtherUser = filesFromOthers[currentKey];
							var keysOfFilesSharedFromOtherUser = Object.keys(filesSharedFromOtherUser);
							// console.log("Files shared by '" + currentKey + "': " + JSON.stringify(filesSharedFromOtherUser));	// debug

							// For each key, append a file element with download information and sharerUid information
							keysOfFilesSharedFromOtherUser.forEach(function (currentFileKey, currentFileKeyIndex, returnedFileKeyArray) {
								var fileName = bacpacDecode(currentFileKey);
								var elementID = "sharedFile" + counter;
								counter++;
								console.log("Alert:listFilesSharedWithMe: Appending file '" + fileName + "' shared by '" + sharerUid + "'");	// debug

								dbRef.ref("/roster/" + sharerUid).once("value").then(function (snapshot) {
									var sharerEmail = bacpacDecode(snapshot.val().email);

									var fileToAdd = "\
									<div class='col-xs-6 col-md-3' style='padding-top: 10px'>\
										<div id='" + elementID + "' class='fileElement' title='Click For File Options'>\
											<div role='button' class='thumbnail'>\
												<div onclick='optionMenu(" + '"' + elementID + '"' + ")'>\
													<div class='container-fluid'>\
														<div class='row'>\
															<span class='label label-info' style='float:right; display: block;'>" + sharerEmail + "</span>\
															<span class='glyphicon glyphicon-file' style='font-size: large;display: block; word-wrap: break-word; width: inherit'></span>\
														</div>\
													</div>\
													<span id='" + elementID + "filename' style='display: block; word-wrap: break-word; width: inherit; font-size: medium'>" + fileName + "</span>\
													<div id='" + elementID + "OptionMenu' class='fileOptionMenu container-fluid hidden'>\
														<div class='row'>\
															<button class='fileOptionMenuBtn btn btn-block btn-primary' onclick='promptDownloadFromElement(" + '"' + elementID + '",' + '"' + sharerUid + '"' + ")'><span class='fa fa-arrow-circle-down'></span>Open/Download</button>\
															<button class='fileOptionMenuBtn btn btn-block btn-default' onclick='promptPropertiesFromElement(" + '"' + elementID + '",' + '"' + sharerUid + '"' + ")'><span class='fa fa-info'></span>Properties</button>\
														</div>\
													</div>\
												</div>\
											</div>\
										</div>\
									</div>";
									appendIntoElement(shareAreaID, fileToAdd);
								}).catch(function (error) {
									console.log("Error:listFilesSharedWithMe: Internal Error Occurred! [" + error.code + " (" + error.message +")]");
									return;
								});
							});
							break;
						}
					}
				});
			}
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
			window.location = "index.html";
			return false;
		};
		switch(data.uid) {
			case null: {
				// not found
				console.log("Error: User ID not found");
				window.location = "index.html";
				return false;
				break;
			}
			case '': {
				// invalid found
				console.log("Error: User ID not found");
				window.location = "index.html";
				return false;
				break;
			}
			default: {
				// all clear; login is valid
				console.log("photoURL: " + data.photoURL);
				$("#profilePicture").attr("src", data.photoURL);
				applyProfileData("profileUsername", data.email);
				main();		// run page
				return true;
				break;
			}
		}
	}

/* File Manager Utility: setupAddFolderButton
		Description:
			tells the Add Folder button to launch Add Folder Modal
		Expects:
			N/A
		Parameters: DNE for now
		Returns:
			N/A
	 */
	function setupAddFolderButton() {
		// Setup add folder button action
		$("#addFolder").click(function (event) {
			$("#fileOptionsMenu").addClass("hidden");
			$("#addFolderModal").modal('show');
		});

		// Setup modal close button actions
		$("#makeFolderButtonClose").off("click");
		$("#makeFolderButtonClose").on("click", function () {
			$("#addFolderModalWarning").html("");	// clear the warning text
			$("#folderNameText").val("");	// clear the input field
			$("#addFolderModal").modal("hide");	// close the add Folder modal
		});

		// Setup make folder button actions
		$("#makeFolderButton").click(function (event) {
			console.log($("#folderNameText").val());
			var folderNameText = $("#folderNameText").val();	// grab text from the text box
			var encodedFolderNameText = bacpacEncode(folderNameText);

			if ((folderNameText.length === 1) && (folderNameText.search(/^[0-9]/) !== -1)) {	// if the first character in the folder name is a number, complain
				$("#addFolderModalWarning").html("Folder names cannot be a single numeric character!");
				console.log("Error:setupAddFolderButton: Invalid file Name (cannot start with a number)");
			} else {
				database.ref("folder/" + uid + "/" + currentDirectory).once("value").then(function (snapshot) {	// else, check to see if the folder already exists
					var directoryContents = snapshot.val();
					var nameOfStuff = Object.keys(directoryContents);	// acquire the list of files and folders within the directory

					// If the folder name is taken by any file or folder in the directory...
					if (nameOfStuff.includes(encodedFolderNameText)) {
						$("#addFolderModalWarning").html("This name is already taken!");
						console.log("Alert:setupAddFolderButton: Duplicate folder found! Consider a different name...");
					}

					// Else, add the folder
					else {
						console.log("Alert:setupAddFolderButton: Adding empty folder to the current directory: '/" + currentDirectory + "'");
						database.ref("folder/" + uid +"/" + currentDirectory + encodedFolderNameText).set({
							0 : 0
						}).then(function() {
							console.log("Alert:setupAddFolderButton: Successfully added empty folder!");
							console.log("Alert:setupAddFolderButton: Reloading Directory Display... ");

							// Reload the user's front end file manager
							listDirectoryContent(user.data.uid, "/" + currentDirectory , database, updateFolderPane);

							// Close the add Folder modal
							$("#makeFolderButtonClose").click();
						}).catch(function(error) {
							console.log("Error:setupAddFolderButton: Internal Error Occurred! [" + error.code + " (" + error.message + ")]");
						});
					}
				});
			}
		});
	}

/* File Manager Utility: promptDeleteFromElement
	Description:
		Launches a modal warning the user about permanent deletion of file content.
		If approved, permanently deletes the file from the Firebase Database records, removes it from storage, then reloads the user's directory view
	Expects:
		The element with id "elemID" must represent a file element in the UI (i.e. it must have the css class "fileElement")
		(Will turn into a parameter in future:) The function ASSUMES that the code has a firebase.database() object named
			"database" in it, and a firebase.storage(object) named "storage".
	Parameters:
		string elemID - the ID of the element representing the file to delete
		string userID - the current user's uid
	Returns:
		?
*/
	function promptDeleteFromElement(elemID, userID) {
		var fileName = ($("#" + elemID + "filename").html()).replace(/&amp;/g, "&");	// since the html encodes "&" with "&amp;", we must resolve this!
		console.log("Preparing to Delete file!");

		// Setup warning content
		$("#filenameToDelete").html("<h2>Are you sure you want to delete file '" + fileName + "'?</h2>\
			<h5 style='color:red;'>It will be permanently deleted from your BacPac...</h5>");
		$("#deleteModal").modal("show");

		// Setup confirm button action
		$("#deleteModalConfirm").off("click");
		$("#deleteModalConfirm").on("click", function () {
			// delete the file from the database
			deleteFile(fileName, userID, database, storage);

			// reload the directory view
			listDirectoryContent(userID, "/" + currentDirectory , database, updateFolderPane);

			// reset modal
			$("#filenameToDelete").html("");
			$("#deleteModal").modal("hide");
			$("#deleteModal").modal("hide");
		});

		// Setup additional cancel button actions
		$("#deleteModalCancel").off("click");
		$("#deleteModalCancel").on("click", function () {
			$("#filenameToDelete").html("");
			$("#deleteModal").modal("hide");
			console.log("Cancelling Deletion...");
		});
	}

/* File Manager Utility: deleteFile
		Description:
			Deletes the selected file from the database
		Expects:
			The variable "currentDirectory" must exist and be initialized in the beginning of the code as an empty string.
			Whenever the "currentDirectory" variable is changed, certain conditions must be met:
				The first character MUST NOT be a "/" under ANY CIRCUMSTANCES.
				If the "currentDirectory" is NOT EMPTY after the change, the last character MUST be a "/".
				If the "currentDirectory" variable is changed to reflect the home directory, it must become an EMPTY STRING.
		Parameters:
			string file - the unencoded name of the file to delete
			string userID - the current user's uid
			FirebaseObject dbRef - the firebase.database() object
			FirebaseObject stRef - the firebase.storage() object
		Returns:
			?
*/
	function deleteFile(file, userID, dbRef, stRef) {
		if (!file || !userID || !dbRef || !stRef) {
			console.log("Error:deleteFile: Invalid Parameter(s)");
			return;
		} else if (file === "") {
			console.log("Error:deleteFile: file not specified!");
			return;
		}
		var encodedFileName = bacpacEncode(file);
		console.log("Alert:deleteFile: Permanently deleting file '" + file + "' (" + encodedFileName + ") from BacPac servers...");

		// remove records of the file from the current user's (and shared users') database sections
		dbRef.ref("/folder/" + userID + "/" + currentDirectory + encodedFileName).remove().then(function(){	// delete from /folder
			console.log("Alert:deleteFile: Successfully deleted file's folder record...");
			dbRef.ref("/fileName/" + userID + "/" + encodedFileName).remove().then(function(){	// delete from /fileName
				console.log("Alert:deleteFile: Successfully deleted file's fileName record...");
				dbRef.ref("/fileAttribute/" + userID + "/" + encodedFileName).remove().then(function(){	// delete from /fileAttribute
					console.log("Alert:deleteFile: Successfully deleted file's fileAttribute record...");

					// Unshare the file from whoever it's shared with (since it's deleted)
					dbRef.ref("/shared/" + userID + "/withOtherUsers/" + encodedFileName).once("value").then(function(snapshot) {	// acquire full list of users who are shared the file
						var sharingList = snapshot.val();	// get the JSON of the entire sharing list for this file
						var arrayOfUids;

						// if the file was NOT shared with anyone (i.e. snapshot.val() === null), skip this part, since we won't need to delete from anybody's sharing list
						if (!sharingList) {
							console.log("Alert:deleteFile: Deleted file was not shared with anyone... ");
							return;
						} else {
							arrayOfUids = Object.keys(sharingList);	// get the keys

							// destroy the current user's sharing record; we won't need it in the db anymore, since we copied it to var sharingList above
							dbRef.ref("/shared/" + userID + "/withOtherUsers/" + encodedFileName).remove().then(function () {
								console.log("Alert:deleteFile: Successfully deleted file from your sharing records...");
							}).catch(function (error) {
								console.log("Error:deleteFile: Internal Error Occurred! [database remove(/withOtherUsers/encodedFileName)] [" + error.code + " (" + error.message + ")]");
							});

							// at the same time, for each user that this file is shared with, remove their shared entries
							arrayOfUids.forEach(function (currentUid, currentIndex, returnedArray) {
								dbRef.ref("/shared/" + currentUid + "/fromOtherUsers/" + userID + "/" + encodedFileName).remove().then(function() {	// remove the file from peoples' sharing record
									if (currentIndex === returnedArray.length - 1) {
										console.log("Alert:deleteFile: Successfully removed sharing history from other users' accounts...");
									}
								}).catch(function (error) {
									console.log("Error:deleteFile: Internal Error Occurred! [database remove(/fromOtherUsers/...)] [" + error.code + " (" + error.message + ")]");
								});
							});
							return;
						}
					}).catch(function (error) {
						console.log("Error:deleteFile: Internal Error Occurred! [database get(sharingList)] [" + error.code + " (" + error.message + ")]");
					});
				}).catch(function (error) {
					console.log("Error:deleteFile: Internal Error Occurred! [database->/fileAttribute] [" + error.code + " (" + error.message + ")]");
				});
			}).catch(function (error) {
				console.log("Error:deleteFile: Internal Error Occurred! [database->/fileName] [" + error.code + " (" + error.message + ")]");
			});
		}).catch(function (error) {
			console.log("Error:deleteFile: Internal Error Occurred! [database->/folder] [" + error.code + " (" + error.message + ")]");
		});

		// remove the file from storage
		stRef.ref("files/" + userID + "/" + file).delete().then(function() {
			console.log("Alert:deleteFile: Successfully removed file from your BacPac storage");
		}).catch(function (error) {
			console.log("Error:deleteFile: Internal Error Occurred! [storage] [" + error.code + " (" + error.message + ")]");
			return;
		});
	}

/* File Manager Utility: promptDeleteFolder
		Description:
			Immediately deletes a folder if it is empty, else asks the user to confirm via a modal if it is ok to delete sub folders
		Expects:
			The variable "currentDirectory" must exist and be initialized in the beginning of the code as an empty string.
			(Will turn into a parameter in future:) The function ASSUMES that the code has a firebase.database() object named
			"database" in it, and a firebase.storage(object) named "storage".
			Whenever the "currentDirectory" variable is changed, certain conditions must be met:
				The first character MUST NOT be a "/" under ANY CIRCUMSTANCES.
				If the "currentDirectory" is NOT EMPTY after the change, the last character MUST be a "/".
				If the "currentDirectory" variable is changed to reflect the home directory, it must become an EMPTY STRING.
		Parameters:
			string elemID - the id of the folder element
			string userID - the current user's uid
		Returns:
			N/A
*/
	function promptDeleteFolder(elemID, userID) {
		var folderName = ($("#" + elemID + "foldername").html()).replace(/&amp;/g, "&");	// allows folders to contain ampersands
		var encodedFolderName = bacpacEncode(folderName);
		console.log("currentDirectory: '" + currentDirectory + "'");	// debug
		console.log("Alert:promptDeleteFolder: Preparing to delete folder '" + folderName + "' (" + encodedFolderName + ")");	// debug

		database.ref("/folder/" + userID + "/" + currentDirectory + encodedFolderName).once("value").then(function(snapshot) {
			var folderContents = snapshot.val();
			var namesOfFilesAndFolders = Object.keys(folderContents);
			console.log("Alert:promptDeleteFolder: Contents - " + JSON.stringify(snapshot.val()));	// debug

			console.log(namesOfFilesAndFolders);

			// If the only thing within the clicked folder is the initializer (i.e. "0": 0), delete the folder
			if (namesOfFilesAndFolders.length === 0 || (namesOfFilesAndFolders.length === 1 && namesOfFilesAndFolders[0] === "0")) {
				console.log("Alert:promptDeleteFolder: Folder is empty; Deleting...");	// debug

				database.ref("/folder/" + userID + "/" + currentDirectory + encodedFolderName).remove().then(function(){
					console.log("Alert:promptDeleteFolder: Folder successfully deleted...");	// debug

					// Reload the 
					listDirectoryContent(user.data.uid, "/" + currentDirectory, database, updateFolderPane);
				}).catch(function (error) {
					console.log("Error:promptDeleteFolder: Internal Error Occurred! [" + error.code + " (" + error.message + ")]");	// debug
				});
			}

			// Else, prompt the user before doing so
			else {
				console.log("Alert:promptDeleteFolder: Folder is not empty!");	// debug
				// Insert the warning
				$("#deleteFolderModalBody").html("<h2>Are you sure you want to delete folder '" + folderName + "'?</h2><p style='color:red;'>The folder is not empty!</p>");
				
				// Define what to do when the cancel button is clicked...
				$("#deleteFolderModalCancel").off("click");
				$("#deleteFolderModalCancel").on("click", function() {
					$("#deleteFolderModal").modal("hide");
				});

				// Define what to do when the confirm button is clicked...
				$("#deleteFolderModalConfirm").off("click");
				$("#deleteFolderModalConfirm").on("click", function() {
					$("#deleteFolderModal").modal("hide");
					// deleteFolderWithContents();
				});

				// Show modal
				$("#deleteFolderModal").modal("show");
			}
		});
	}

/* File Manager Utility: downDirectory
		Description:
			Goes down a directory after the click of a folder element's Open button
		Expects:
			The variable "currentDirectory" must exist and be initialized in the beginning of the code as an empty string.
			Whenever the "currentDirectory" variable is changed, certain conditions must be met:
				The first character MUST NOT be a "/" under ANY CIRCUMSTANCES.
				If the "currentDirectory" is NOT EMPTY after the change, the last character MUST be a "/".
				If the "currentDirectory" variable is changed to reflect the home directory, it must become an EMPTY STRING.
		Parameters:
			string elemID - the id of the file element that was clicked
			string dest - the destination directory (must be a full path, with NO BEGINNING "/")
		Returns:
			N/A
*/
	function downDirectory(elemID, dest) {
		var folderName = ($("#" + elemID + "foldername").html()).replace(/&amp;/g, "&");
		console.log("currentDirectory: '" + currentDirectory + "'");	// debug
		console.log("Alert:downDirectory: Changing directory to '" + folderName + "' (/" + dest + ")");

		currentDirectory = dest;

		updatePathTracker("pathTracker", dest);

		listDirectoryContent(user.data.uid, "/" + currentDirectory, database, updateFolderPane);
	}

/* File Manager Utility: upDirectory
		Description:
			Goes up a directory after the click of a path tracker link
		Expects:
			The variable "currentDirectory" must exist and be initialized in the beginning of the code as an empty string.
			Whenever the "currentDirectory" variable is changed, certain conditions must be met:
				The first character MUST NOT be a "/" under ANY CIRCUMSTANCES.
				If the "currentDirectory" is NOT EMPTY after the change, the last character MUST be a "/".
				If the "currentDirectory" variable is changed to reflect the home directory, it must become an EMPTY STRING.
		Parameters:
			string levelNum - the level of depth within a user's directory tree
		Returns:
			N/A
*/
	function upDirectory(levelNum) {
		var dest;

		if (levelNum === 0) dest = "";
		else dest = $("#level" + levelNum).attr("title");

		console.log("Alert:upDirectory: Going up to " + dest);	// debug

		currentDirectory = dest;

		updatePathTracker("pathTracker", dest);

		listDirectoryContent(user.data.uid, "/" + currentDirectory, database, updateFolderPane);
	}

/* File Manager Utility: updatePathTracker
		Description:
			Updates the path tracker list so that the user can navigate up the file tree
		Expects:
			The path tracker is ASSUMED to be an "<ol>" element.
			The variable "currentDirectory" must exist and be initialized in the beginning of the code as an empty string.
			Whenever the "currentDirectory" variable is changed, certain conditions must be met:
				The first character MUST NOT be a "/" under ANY CIRCUMSTANCES.
				If the "currentDirectory" is NOT EMPTY after the change, the last character MUST be a "/".
				If the "currentDirectory" variable is changed to reflect the home directory, it must become an EMPTY STRING.
		Parameters:
			string pathTrackerID - the id of the path tracker
			string fullPath - the full path in the user's directory tree (must be a full path, with NO BEGINNING "/")
		Returns:
			N/A
*/
	function updatePathTracker(pathTrackerID, fullPath) {
		if(!pathTrackerID) {
			console.log("Error:updatePathTracker: Invalid Parameter(s)");
			return;
		} else if (typeof pathTrackerID !== "string" || typeof fullPath !== "string") {
			console.log("Error:updatePathTracker: Type Error!");
			return;
		} else if (fullPath[0] === "/") {
			console.log("Error:updatePathTracker: Invalid fullPath parameter (has forward slash prefix)!");
			return;
		} else if ((fullPath.length > 0) && (fullPath[fullPath.length-1] !== "/")) {
			console.log("Error:updatePathTracker: Invalid fullPath parameter (missing forward slash suffix)!");
			return;
		}
		
		// Count the number of "/" characters in the destination string to determine how many levels have been traversed
		var breadcrumbs = "<li><a id='level0' onclick='upDirectory(0)' href='#'>Home</a></li>";
		var bArr = [];
		var sub = fullPath;
		var levels = sub.split("/");
		var incrementalPaths = "";

		console.log("sub: " + levels + " " + levels.length);	// debug
		bArr.push(breadcrumbs);

		for (var i = 0; i < levels.length; i++) {
			if (i === levels.length-1){	// when the last element has been placed, update the pathTracker
				console.log(bArr/*.toString().replace(/,/g, "")*/);	// debug
				$("#" + pathTrackerID).html(bArr.toString().replace(/,/g, ""));
				return;
			}
			incrementalPaths += levels[i] + "/";

			var tempStr = "<li><a id='level" + (i + 1) + "' onclick='upDirectory(" + (i + 1) + ")' href='#' title='" + incrementalPaths + "'>" + bacpacDecode(levels[i]) + "</li>";
			breadcrumbs += tempStr;
			bArr.push(tempStr);
			// console.log("breadcrumbs: " + breadcrumbs);
			// console.log("    bArr: " + bArr);
		}
	}