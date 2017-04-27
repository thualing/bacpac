//var param = getParameterByName("uid");
// param = M0XTf5QzEfMxw4...

// Google Firebase Initial Setup

    var firebaseConfig = {
        apiKey: "AIzaSyD98_8qlaeufS_1nwJ3Dv8auLi93AjhW5A",
        authDomain: "banpac-4d0af.firebaseapp.com",
        databaseURL: "https://banpac-4d0af.firebaseio.com",
        storageBucket: "banpac-4d0af.appspot.com",
        messagingSenderId: "1079004100386"
    };
  
    var app = firebase.initializeApp(firebaseConfig);	// Default App (REQUIRED)
    console.log('App: ' + app.name);
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
    var storageRef = firebase.storage().ref();
  
    var user = { data: "" };
   

    var auth = firebase.auth();
    //var user = null;
    var database = firebase.database();
    readSessionData(user, getParameterByName("uid"), database);
   // readSessionData(getParameterByName("uid"));
    //var file = parameters.file;
    //var path = parameters.path;
    var name;
   // var metadata = { 'contentType': file.type };
   // var fullPath = path + '/' + file.name;
    
    //var ref = storageRef.child(fullPath);

    //var user = firebase.auth().currentUser;
    var ref = firebase.database().ref();
  // sessiondata(getParameterByName("uid"));
   // ref.getMetadata().then(function (metadata) {
        
        // Metadata now contains the metadata for 'images/forest.jpg'
    //}).catch(function (error) {
        // Uh-oh, an error occurred!
//  });
    //var userId = firebase.auth().currentUser.uid;
    function info(user) {
        firebase.database().ref("sessions/" + param)({
            email: user.email,
            uid: user.uid,
            emailVerified: user.emailVerified,
            isAnonymous: user.isAnonymous,
            providerData: user.providerData,

        }).then(function (snapshot) {
            var user = snapshot.val();
            console.log("Current User: " + JSON.stringify(user));
        })
        
    }
   
    function readSessionData(userId) {
        database.ref("/sessions/" + user.uid).once("value").then(function (snapshot) {
            user = snapshot.val();
            console.log("Current User: " + JSON.stringify(user));
            pageInit(user);
        });
    }
    function pageInit(user) {
        // User Menu Info 
        $("#profileUsername").html((user.email).toString());
    }
        //if fromotherusers != 0, display aFileOtherUserOwns_fileName0
        $("#btn1").on("click", function () {
            // info(user);
            console.log(info(user))
        });
        //then(function(){
       // console.log("Signing Out");
        // firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
        // var username = snapshot.val().username;

        $("#btn1").on("click", function () {
            function sessiondata(uid) {
                database.ref("/sharing/" + uid).once("value").then(function (snapshot) {
                    user = snapshot.val();
                    console.log("Current User: " + JSON.stringify(user));
                });
            }
        })
        //var newPostKey = firebase.database().ref(sKey).push().key;

      //  var thead = document.getElementsByTagName('thead')[0];
      /*  ref.on("child_added", function (child) {
            console.log(child.key + ': ' + child.val());
            var tr = document.createElement('tr');
            var th = document.createElement('th');
            th.innerText = child.val().email + " --- " + JSON.stringify(child.val());
            tr.appendChild(th);
            thead.appendChild(tr);
        });*/
        $("#logoutBtn").on("click", function () {
            auth.signOut().then(function () {
                console.log("Signing Out");
                window.location = ("bacpac-login.html");
            }).catch(function (error) {
                console.log(error);
            });
        });
        $(document).ready(function () {
            /* ---------- Datable ---------- */
            $('.datatable').dataTable({
                "sDom": "<'row'<'col-lg-6'l><'col-lg-6'f>r>t<'row'<'col-lg-12'i><'col-lg-12 center'p>>",
                "sPaginationType": "bootstrap",

                "oLanguage": {
                    "sLengthMenu": "_MENU_ records per page"
                }

            });
           /* $("#btn1").on("click", function () {
                var thead = document.getElementsByTagName('thead')[0];
                ref.on("child_added", function (child) {
                    console.log(child.key + ': ' + child.val());
                    var tr = document.createElement('tr');
                    var th = document.createElement('th');
                    th.innerText = child.val().email + " --- " + JSON.stringify(child.val());
                    tr.appendChild(th);
                    thead.appendChild(tr);
                });


            });*/
        })
    