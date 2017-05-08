// Initialize Firebase
var config = {
    apiKey: "AIzaSyD98_8qlaeufS_1nwJ3Dv8auLi93AjhW5A",
    authDomain: "banpac-4d0af.firebaseapp.com",
    databaseURL: "https://banpac-4d0af.firebaseio.com",
    projectId: "banpac-4d0af",
    storageBucket: "banpac-4d0af.appspot.com",
    messagingSenderId: "1079004100386"
};
firebase.initializeApp(config);

var storageRef = firebase.storage().ref();
var database = firebase.database();
var auth = firebase.auth();

// Firebase Authentication Safeguard
//var user = null;
//readSessionData(getParameterByName("uid"));

var user = {data:""};
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

//New Drag & Drop scripts
//Credit: https://hurlatunde.github.io/articles/2017-01/multiple-drag-and-drop-file-uploading-to-firebase-storage
var obj = $("#drop-zone");
obj.on('dragenter', function (e) {
	e.stopPropagation();
    e.preventDefault();
    $(this).css('border', '2px solid #0B85A1');
});

obj.on('dragover', function (e) {
    e.stopPropagation();
    e.preventDefault();
});

obj.on('drop', function (e) {
    
    $(this).css('border', '2px dotted #0B85A1');
    e.preventDefault();
    var files = e.originalEvent.dataTransfer.files;
    
    //We need to send dropped files to Server
    handleFileUpload(files, obj);
});
    
$(document).on('dragenter', function (e) {
    e.stopPropagation();
    e.preventDefault();
});

$(document).on('dragover', function (e) {
    e.stopPropagation();
    e.preventDefault();
    obj.css('border', '2px dotted #0B85A1');
});

$(document).on('drop', function (e) {
    e.stopPropagation();
    e.preventDefault();
});
    
// automatically submit the form on file select
$('#drop-zone-file').on('change', function (e) {
    var files = $('#drop-zone-file')[0].files;
    handleFileUpload(files, obj);
});

$("#uploadModal").on("hidden.bs.modal", function(e) {
    $("#successUploadModalBody").html("");
    $("#failUploadModalBody").html("");
});
    
function handleFileUpload(files, obj) {

    var fileNames = "";
    var successFiles = "";
    var failFiles = "";
    var currentFileName = "";

    for (var i = 0; i < files.length; i++) {
        var fd = new FormData();
        fd.append('file', files[i]);
    
        currentFileName = files[i].name;
        fileNames += "<li>" + currentFileName + "</li>";

        //console.log(files[i]);
        //console.log("Current File: " + currentFileName);

        if(files[i].size > 5 * 1024 * 1024 )
        {
        	failFiles += "<li>" + currentFileName + " Reason: <strong>" + "File size too large" +"</strong></li>";
        }
        else
        {
	        fireBaseImageUpload({
	            'file': files[i],
	            'path': "files/" + uid //Storage Bucket path to store files.
	        }, function (data) {
	            //console.log(data);
	            if (!data.error) {
	                if (data.progress) {
	                    // progress update to view here
	                }
	                if (data.downloadURL) {
	                    // update done
	                    // download URL here "data.downloadURL"
	                }
	            } 
	            else 
	            {
	                console.log(data.error + ' Firebase image upload error');
	            }
	        });
	        successFiles += "<li>" + currentFileName + "</li>";
    	}

    	//console.log("SuccessFiles: " +successFiles);
    	$("#filesUploadModalBody").html("<span>Files:</span>" + "<ul>" + fileNames + "</ul>");
    	if(successFiles != "")
	    	$("#successUploadModalBody").html("<span>Successfully Uploaded:</span>" + "<ul>" + successFiles + "</ul>");
        if(failFiles != "")
        	$("#failUploadModalBody").html("<span>Unsuccessful Uploads:</span>" + "<ul>" + failFiles + "</ul>");
        $("#uploadModal").modal('show');
    }
};
    
function fireBaseImageUpload(parameters, callBackData) {

    // expected parameters to start storage upload
    var file = parameters.file;
    var path = parameters.path;
    var uploadName;

    //just some error check
    if (!file) { callBackData({error: 'file required to interact with Firebase storage'}); }
    if (!path) { callBackData({error: 'Node name required to interact with Firebase storage'}); }

    var metaData = {'contentType': file.type};
    var arr = file.name.split('.');
    var fileSize = formatBytes(file.size); // get clean file size (function below)
    var fileType = file.type;
    var n = file.name;

    //console.log(file.size);
    // generate random string to identify each upload instance
    uploadName = generateRandomString(12); //(location function below)

    var plainFileName = "";

    arr.forEach(function (namePart, index) {
        if(index < arr.length - 1)
            plainFileName += namePart + "." ; //rebuilds the file name
    });

    plainFileName += arr.slice(-1)[0];
    var fullPath = path + '/' + plainFileName; // + arr.slice(-1)[0];
    //var fullPath2 = path + '/' + file.name;

    //console.log(plainFileName);
    //console.log(fullPath);
    //console.log(fullPath2);

    var uploadFile = storageRef.child(fullPath).put(file, metaData);

    // first instance identifier
    callBackData({id: uploadName, fileSize: fileSize, fileType: fileType, fileName: n});

    uploadFile.on('state_changed', function (snapshot) {

        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progress = Math.floor(progress);
        callBackData({
            progress: progress,
            element: uploadName,
            fileSize: fileSize,
            fileType: fileType,
            fileName: n});
        var dBPath = fullPath;
        //var dBFileName = arr[0] + "%2E" + arr.slice(-1)[0];

        //Replaces "." "#" "$" "[" "]" with their respective ASCII codes
        var dBFileName = encodeURI(plainFileName).replace(/\./g, '%2E').replace(/\#/g, '%23').replace(/\$/g,'%24').replace(/\[/g,'%5B').replace(/\]/g,'%5D');
        console.log(uid);
        writeUploadToDB(uid, dBFileName, dBPath);

    }, function (error) {

            callBackData({error: error});

    }, function () {
        var downloadURL = uploadFile.snapshot.downloadURL;
        callBackData({
            downloadURL: downloadURL,
            element: uploadName,
            fileSize: fileSize,
            fileType: fileType,
            fileName: n});
    });
}

/* Creates a record of file in DB*/
function writeUploadToDB(userId, fileName, filePath) {
	var decodedFileName = decodeURI(fileName).replace(/\%2E/g, '.').replace(/\%23/g, '#').replace(/\%24/g,'$').replace(/\%5B/g,'[').replace(/\%5D/g,']');

    database.ref("fileName/" + userId +"/" + fileName).set({
        'path' : filePath
    });
    database.ref("fileAttribute/" + userId + "/" + fileName).set({
        '0' : 0
    });
    database.ref("folder/" + userId + "/" + fileName).set({
        'name' : decodedFileName,
        'path' : filePath
    });
    console.log("Decoded File Name: " + decodedFileName);
}

function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Byte';
    var k = 1000;
    var dm = decimals + 1 || 3;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/* Action: Logout Button click */
$("#logoutBtn").on("click", function(){
    database.ref("/sessions/" + user.uid).remove().then(function(){
        console.log("Session Ended...");
        auth.signOut().then(function(){
            console.log("Signing Out");
            window.location = ("index.html");
        }).catch(function(error){
            console.log(error);
        });
    }).catch(function(error){
        console.log("Internal Error Occurred! [" + error + "]");
    });
});

/* Utility: pageInit */
function pageInit(user) {
    // User Menu Info 
    $("#profileUsername").html((user.email).toString());
    setupLogoutProtocol("logoutBtn", database, auth);
}

//Copied from bacpac-file-manager.js
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

//Copied from bacpac-file-manager.js
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
            auth.currentUser.reload();
            console.log("photoURL: " + data.photoURL);
            $("#profilePicture").attr("src", data.photoURL);
            applyProfileData("profileUsername", data.email);
            return true;
            break;
        }
    }
}