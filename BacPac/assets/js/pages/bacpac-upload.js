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
            'path': "files/"
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
            } else {
                console.log(data.error + ' Firebase image upload error');
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
    name = generateRandomString(12); //(location function below)

    //var fullPath = path + '/' + name + '.' + arr.slice(-1)[0];
    var fullPath = path + '/' + file.name;

    var uploadFile = storageRef.child(fullPath).put(file, metaData);

    // first instance identifier
    callBackData({id: name, fileSize: fileSize, fileType: fileType, fileName: n});

    uploadFile.on('state_changed', function (snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progress = Math.floor(progress);
        callBackData({
            progress: progress,
            element: name,
            fileSize: fileSize,
            fileType: fileType,
            fileName: n});
    }, function (error) {
        callBackData({error: error});
    }, function () {
        var downloadURL = uploadFile.snapshot.downloadURL;
        callBackData({
            downloadURL: downloadURL,
            element: name,
            fileSize: fileSize,
            fileType: fileType,
            fileName: n});
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