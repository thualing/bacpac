$(document).ready(function () {
	console.log("Dashboard initialized...");
	
});

$(document).on("keydown", function(event){
	if(event.which === 13) {	// if the enter key was pressed
		// Do nothing
	}
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







/* Main */
	function main() {
		var picUrl = "";
		console.log("Dashboard: Main initiated");

		/* Load user email... */
		$("#dashboardEmail").html(user.data.email);

		/* Load current profile picture */
		if (!user.data.photoURL) {
			console.log("Error:main: no profile picture url!");
		} else {
			$("#dashboardPhoto").attr("src", user.data.photoURL);
		}

		/* Setup change profile picture button action */
		$("#dashboardChangePhotoButton").off("click").on("click", function() {
			// get the full list of files that the user has 
			database.ref("/fileName/" + user.data.uid + "/").once("value").then(function (snapshot) {
				var numOfImageFiles
				var listOfFiles = snapshot.val();
				var fileKeys = Object.keys(listOfFiles);

				// Clear modal
				$("#photoselectionArea").html("");

				// Fill the UI with only image files you own
				fileKeys.forEach(function (element, index, arr) {
					console.log("element:" + element);
					if (element !== 0 && element !== "0") {
						storage.ref("/files/" + user.data.uid + "/" + bacpacDecode(element)).getMetadata().then(function (metadata) {
							// console.log("metadata: " + JSON.stringify(metadata));

							// if the file is an image...
							if ((metadata.contentType).includes("image")) {
								// console.log(element + " is an image!");
								// console.log(metadata.downloadURLs);

								var oldHTML = $("#photoselectionArea").html();
								var thumbnail = "\
								<div class='col-xs-6 col-md-3' style='display: block;'>\
									<a href='#' class='thumbnail' onclick='setProfilePicture(" + '"' + metadata.downloadURLs[0] + '"' + ")'>\
										<img src='" + metadata.downloadURLs[0] + "' alt='" + metadata.contentType + "'>\
									</a>\
								</div>";
								$("#photoselectionArea").html(oldHTML + thumbnail);
							}
						});
					} else if (arr.length <= 1) {
						$("#photoselectionArea").html("<h3 style='color:red;'>You don't have any photos!</h3>");
					}
				});
			});


			$("#myModal").modal("show");
		});
	}









/* Dashboard: rsdCallback*/
	function rsdCallback(data) {
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
				auth.currentUser.reload();
				console.log("photoURL: " + data.photoURL);
				$("#profilePicture").attr("src", data.photoURL);
				applyProfileData("profileUsername", data.email);
				main();		// run page
				return true;
				break;
			}
		}
	}

/* Dashboard Utility: setProfilePicture

*/
	function setProfilePicture(downloadUrl){
		auth.currentUser.updateProfile({
			photoURL: downloadUrl
		}).then(function () {
			auth.currentUser.reload();

			// Update the sessions db
			database.ref("/sessions/" + user.data.uid + "/photoURL").set(downloadUrl);

			// Place in the profile pic area and photo pane
			$("#profilePicture").attr("src", downloadUrl);
			$("#dashboardPhoto").attr("src", downloadUrl);
			$("#myModalClose").click();
			console.log(" profile pic updated successfully");
		}, function (error) {
			console.log("Error:setProfilePicture:" + error.code + " " + error.message);
		});
	}

/* Dashboard Utility: applyProfileData
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