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
var user = null;
readSessionData(getParameterByName("uid"));


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
    
function handleFileUpload(files, obj) {
    for (var i = 0; i < files.length; i++) {
        var fd = new FormData();
        fd.append('file', files[i]);
    
        console.log(files[i]);
        fireBaseImageUpload({
            'file': files[i],
            'path': "files/" + user.uid //Storage Bucket path to store files.
        }, function (data) {
            //console.log(data);
            if (!data.error) {
                if (data.progress) {
                    // progress update to view here
                }
                if (data.downloadURL) {
                    // update done
                    // download URL here "data.downloadURL"
                    alert("Upload complete.");
                }
            } else {
                console.log(data.error + ' Firebase image upload error');
                alert("Unsuccessful Upload.");
            }
        });
    }
};
    
function fireBaseImageUpload(parameters, callBackData) {

    // expected parameters to start storage upload
    var file = parameters.file;
    var path = parameters.path;
    var name;

    //just some error check
    if (!file) { callBackData({error: 'file required to interact with Firebase storage'}); }
    if (!path) { callBackData({error: 'Node name required to interact with Firebase storage'}); }

    var metaData = {'contentType': file.type};
    var arr = file.name.split('.');
    var fileSize = formatBytes(file.size); // get clean file size (function below)
    var fileType = file.type;
    var n = file.name;

    // generate random string to identify each upload instance
    uploadName = generateRandomString(12); //(location function below)

    //var fullPath = path + '/' + name + '.' + arr.slice(-1)[0];
    var fullPath = path + '/' + file.name;

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

    var dBPath = encodeURIComponent(fullPath).replace('.', '%2E');
    var dBFileName = encodeURIComponent(n).replace('.', '%2E')
    writeUploadToDB(user.uid, dBFileName, dBPath);
}

/* Creates a record of file in DB*/
function writeUploadToDB(userId, fileName, filePath) {
    database.ref("fileName/" + userId +"/" + fileName).set({
        'path' : filePath
    });
}

function generateRandomString(length) {
    var chars = "abcdefghijklmnopqrstuvwxyz";
    var pass = "";
    for (var x = 0; x < length; x++) {
        var i = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(i);
    }
    return pass;
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
        pageInit(user);
    });
}

/* Utility: pageInit */
function pageInit(user) {
    // User Menu Info 
    $("#profileUsername").html((user.email).toString());
}