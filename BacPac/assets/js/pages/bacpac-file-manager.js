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

		/* Init the user's front end file manager */
		listDirectoryContent(user.data.uid, "/", database, updateFolderPane);

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
								var elementID = "file" + counter;
								var elementDropdownID = "folder" + counter + "dropdown";
								var fileName = decodeURIComponent(key);
								// var fileNameHtmlSafe = fileName.replace(/'+/g, "%27").replace(/"+/g, "%22");

								// Insert elements into the UI that are identifiable via unique ids (i.e. "file1, file2,..., fileN") and class "fileElement"
								// these elements, when clicked, will call the function specified by the "onclick" attrubute

								// Button
								/*
								fileElements += "<div class='dropdown'><button id='file" + i + "' type='button' class='fileElement btn btn-info btn-block dropdown-toggle' data-toggle='dropdown'>" + decodeURIComponent(key) + "</button><ul id='folder" + i + "dropdown' class='dropdown-menu'><li><a href='#'>HI</a></li></ul></div>";
								*/

								// Dropdown Option Menu
								
/*								fileElements += "<div class='dropdown col-xs-6 col-md-3' style='text-align: left'>    <div id='" + elementID + "' class='fileElement dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>    <a href='#' class='thumbnail row'>    <span class='glyphicon glyphicon-file' style='font-size: xx-large'></span>" + fileName + "</a>    </div>    <ul id='" + elementDropdownID + "' class='dropdown-menu' style='position: static'>    <li class='dropdown-header'>Options</li>    <li>    <a href='#'>Download</a>    </li>    <li>    <a href='#'>Properties</a>    </li>    <li>    <a href='#' style='color:red'>Delete</a>    </li>    </ul>    </div>";*/

								// Custom 1
								fileElements += "<div class='col-xs-6 col-md-3' style='padding-top: 10px'>\
									<div id='" + elementID + "' class='fileElement' title='Click For File Options'>\
										<div role='button' class='thumbnail'>\
											<div onclick='optionMenu(" + '"' + elementID + '"' + ")'>\
												<span class='glyphicon glyphicon-file' style='font-size: large;display: block; word-wrap: break-word; width: inherit'></span>\
												<span id='" + elementID + "filename' style='display: block; word-wrap: break-word; width: inherit; font-size: medium'>" + fileName + "</span>\
												<div id='" + elementID + "OptionMenu' class='fileOptionMenu container-fluid hidden'>\
													<div class='row'>\
														<button class='fileOptionMenuBtn btn btn-block btn-primary' onclick='promptDownloadFromElement(" + '"' + elementID + '",' + '"' + uid + '"' + ")'>Open/Download</button>\
														<button class='fileOptionMenuBtn btn btn-block btn-info' onclick='promptShareFromElement(" + '"' + elementID + '",' + '"' + uid + '"' + ")'>Sharing</button>\
														<button class='fileOptionMenuBtn btn btn-block btn-default' onclick='promptPropertiesFromElement(" + '"' + elementID + '",' + '"' + uid + '"' + ")'>Properties</button>\
														<button class='fileOptionMenuBtn btn btn-block btn-danger' onclick='promptDeleteFromElement(" + '"' + elementID + '",' + '"' + uid + '"' + ")'>Delete</button>\
													</div>\
												</div>\
											</div>\
										</div>\
									</div>\
								</div>";
								

								// Collapsible Option Menu
								/*fileElements += "<div class='col-md-12' style='text-align: left'>    <div id='" + elementID + "' class='fileElement' style='text-align: inherit'>    <a href='#" + elementDropdownID + "' role='button' class='thumbnail btn btn-info row' data-toggle='collapse' aria-expanded='false' aria-controls='" + elementDropdownID + "'>    <span class='glyphicon glyphicon-file' style='font-size: xx-large'></span>" + fileName + "</a>    <div class='collapse' id='" + elementDropdownID + "'>    <ul class='well'>    <li><button href='#'>Download</button></li>    <li><button href='#'>Properties</button></li>    <li><button>Delete</button></li>    </ul>    </div>    </div>    </div>";*/

								counter++;
								break;
							}
							case "folder": {
								var elementID = "folder" + counter;
								var folderName = decodeURIComponent(key);
								// console.log(result + " " + key);	// debug
								folderElements += "<div class='col-xs-6 col-md-3' style='padding-top: 10px'>\
									<div id='" + elementID + "' class='fileElement' title='Click For File Options'>\
										<div role='button' class='thumbnail'>\
											<div onclick='folderMenu(" + '"' + elementID + '"' + ")'>\
												<span class='glyphicon glyphicon-folder-open' style='font-size: large;display: block; word-wrap: break-word; width: inherit'></span>\
												<span id='" + elementID + "foldername' style='display: block; word-wrap: break-word; width: inherit; font-size: medium'>" + folderName + "</span>\
												<div id='" + elementID + "OptionMenu' class='fileOptionMenu container-fluid hidden'>\
													<div class='row'>\
														<button class='fileOptionMenuBtn btn btn-block btn-primary' onclick=''>Open</button>\
														<button class='fileOptionMenuBtn btn btn-block btn-danger' onclick=''>Delete</button>\
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
		var fileName = $("#" + elemID + "filename").html();	// get file name from the inner html of the clicked file element
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
		var fileName = $("#" + elemID + "filename").html();
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

				// Sift through the usernames for partial/complete matches to searchTerm and place partial/complete matches into the user display
				usernames.forEach(function(uname, unameIndex, returnedArray){
					if (uname.includes(searchTerm)) {	// if there's a match, place it in the UI in the following button template:
						matchCount++;
						resultHTML += "\
						<button class='btn btn-info' style='width:100%' onclick='addUserToShare(" + '"' + elemID + '",' + '"' + userID + '",' + '"' + decodeURIComponent(uname) + '",' + '"' + snapshot.val()[uname]["uid"] + '"' + ")'>\
							" + decodeURIComponent(uname) + "\
						</button>";
					}

					// if this is the last element in the username array, output resultHTML to the UI
					if (unameIndex === returnedArray.length - 1) {
						switch(resultHTML){	// if no matches were found
							case "": {
								console.log("User not found...");
								resultHTML = "<p style='color:white; font-style:oblique;'>No Users Found</p>";
								break;
							}
							default: {
								console.log("There are " + matchCount + " matches");
								break;
							}
						}
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
		var fileName = $("#" + elemID + "filename").html();	// get file name from the inner html of the clicked file element

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
			console.log("Error:distinguishEntity: Internal Error Occurred! [" + error.code + " (" + error.message + ")]");
			callback("error", key);
		});
		return true;
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
		dbRef.ref("/folder/" + uid + fullPath).once("value").then(function(snapshot){
			callback(snapshot.val());
		}).catch(function(error){
			console.log("Error:listDirectoryContent: Internal Error Occurred! [" + error.code + " (" + error.message + ")]");
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
		$("#addFolder").click(function (event) {
			$("#addFolderModal").modal('show');
		});
		$("#makeFolderButton").click(function (event) {
			console.log($("#folderNameText").val());
			var folderNameText = $("#folderNameText").val();

			database.ref("folder/" + uid + "/" + currentDirectory).once("value").then(function (snapshot) {
				var directoryContents = snapshot.val();
				var nameOfStuff = Object.keys(directoryContents);
				// console.log(nameOfStuff);
				if (nameOfStuff.includes(folderNameText)) {
					console.log("Alert:setupAddFolderButton: Duplicate folder found! Consider a different name...");
				}
				else {
					console.log("Alert:setupAddFolderButton: Adding empty folder to the current directory: '/" + currentDirectory + "'");
					database.ref("folder/" + uid +"/" + currentDirectory + "/" + folderNameText).set({
						'0' : 0
					}).then(function() {
						console.log("Alert:setupAddFolderButton: Successfully added empty folder!");
						console.log("Alert:setupAddFolderButton: Reloading Directory Display... ");

						// Reload the user's front end file manager
						listDirectoryContent(user.data.uid, "/" + currentDirectory , database, updateFolderPane);

						// Close the add Folder modal
						$("#addFolderModal").modal("hide");
					}).catch(function(error) {
						console.log("Error:setupAddFolderButton: Internal Error Occurred! [" + error.code + " (" + error.message + ")]");
					});
				}
			});
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
		var fileName = $("#" + elemID + "filename").html();
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
			?
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
		dbRef.ref("/folder/" + userID + "/" + currentDirectory + "/" + encodedFileName).remove().then(function(){	// delete from /folder
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