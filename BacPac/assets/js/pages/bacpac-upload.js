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
    for (var i = 0; i < files.length; i++) {
        var fd = new FormData();
        fd.append('file', files[i]);
    
        var currentFileName = files[i].name;
        fileNames += "<li>" + currentFileName + "</li>";

        //console.log(files[i]);
        console.log(files[i].name);

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
                    successFiles += "<li>" + currentFileName + "</li>";
                    $("#filesUploadModalBody").html("<span>Files Uploaded:</span>" + "<ul>" + fileNames + "</ul>");
                    $("#successUploadModalBody").html("<span>Successfully Uploaded:</span>" + "<ul>" + successFiles + "</ul>");
                    $("#uploadModal").modal('show');
                    
                }
            } else {
                console.log(data.error + ' Firebase image upload error');
                $("#failUploadModalBody").html("<span>Unsuccessful Uploads:</span>" + "<ul><li>" +currentFileName + " Reason: <strong>" + data.error +"</strong></li></ul>");
                $("#uploadModal").modal('show');
            }
            
        });
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

    console.log(file.size);
    // generate random string to identify each upload instance
    uploadName = generateRandomString(12); //(location function below)

    var plainFileName = "";

    arr.forEach(function (namePart, index) {
        if(index < arr.length - 1)
            plainFileName += namePart + "." ; //rebuilds the file name
    });

    plainFileName += arr.slice(-1)[0];
    var fullPath = path + '/' + plainFileName; // + arr.slice(-1)[0];
    //var fullPath = path + '/' + file.name;

    console.log(plainFileName);
    console.log(fullPath);
    //console.log(fullPath2);

    var uploadFile = storageRef.child(fullPath).put(file, metaData);

    // first instance identifier
    callBackData({id: uploadName, fileSize: fileSize, fileType: fileType, fileName: n});

    uploadFile.on('state_changed', function (snapshot) {
        if(file.size < 5 * 1024 * 1024) {
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
        }
    }, function (error) {
        if(file.size > 5 * 1024 * 1024) {
            callBackData({error: "File too large."});
        }
        else {
            callBackData({error: error});
        }
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
    database.ref("fileName/" + userId +"/" + fileName).set({
        'path' : filePath
    });
    database.ref("fileAttribute/" + userId + "/" + fileName).set({
        '0' : 0
    });
    database.ref("folder/" + userId + "/" + fileName).set({
        'name' : fileName,
        'path' : filePath
    });
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
            window.location = ("bacpac-login.html");
        }).catch(function(error){
            console.log(error);
        });
    }).catch(function(error){
        console.log("Internal Error Occurred! [" + error + "]");
    });
});


/* Utility: readSessionData */
/*function readSessionData(userId) {
    database.ref("/sessions/" + userId).once("value").then( function(snapshot){
        user = snapshot.val();
        console.log("Current User: " + JSON.stringify(user));
        pageInit(user);
    });
}*/

//Copied from utility.js
/*function readSessionData(targetVar, userId, dbRef, callback) {
    if (!userId) {
        console.log("Error:readSessionData: userId invalid");
        return false;
    } else if (!dbRef) {
        console.log("Error:readSessionData: dbRef invalid");
        return false;
    } else {
        dbRef.ref("/sessions/" + userId).once("value").then( function(snapshot){
            targetVar.data = snapshot.val();
            // console.log("Current User: " + JSON.stringify(snapshot.val())); // debug
            initTabs(snapshot.val());
            if(callback) {
                callback(snapshot.val());   // execute the callback
            }
        }).catch(function(err){
            console.log("Error:readSessionData:firebase.database: " + err);
        });
        return true;
    }
}*/

/* Utility: pageInit */
function pageInit(user) {
    // User Menu Info 
    $("#profileUsername").html((user.email).toString());
    setupLogoutProtocol("logoutBtn", database, auth);
}

//Copied from bacpac-file-manager.js
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
            main();     // run page
            return true;
            break;
        }
    }
}