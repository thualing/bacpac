//var param = getParameterByName("uid");
// param = M0XTf5QzEfMxw4...

// Google Firebase Initial Setup

    var firebaseConfig = {
        apiKey: "AIzaSyD98_8qlaeufS_1nwJ3Dv8auLi93AjhW5A",
        authDomain: "banpac-4d0af.firebaseapp.com",
        databaseURL: "https://banpac-4d0af.firebaseio.com",
        projectId: "banpac-4d0af",
        storageBucket: "banpac-4d0af.appspot.com",
        messagingSenderId: "1079004100386"
    };
  
    var app = firebase.initializeApp(firebaseConfig);	// Default App (REQUIRED)
    console.log('App: ' + app.name);
   
    var storageRef = firebase.storage();
  
    var user = { data: "" };
   
    var uid = getParameterByName("uid");
    var auth = firebase.auth();
    //var user = null;
    var database = firebase.database(app);
    readSessionData(user, getParameterByName("uid"), database, rsdCallback)//userId=getParameterByName("uid")
   
    var name;
   // var metadata = { 'contentType': file.type };
   // var fullPath = path + '/' + file.name;
    
    //var ref = storageRef.child(fullPath);

    //var user = firebase.auth().currentUser;
   // var ref = firebase.database().ref();
  // sessiondata(getParameterByName("uid"));
   // ref.getMetadata().then(function (metadata) {
        
        // Metadata now contains the metadata for 'images/forest.jpg'
    //}).catch(function (error) {
        // Uh-oh, an error occurred!
//  });
    //var userId = firebase.auth().currentUser.uid;
  
   
   
        //if fromotherusers != 0, display aFileOtherUserOwns_fileName0
       /* $("#btn1").on("click", function () {
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
        })*/
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
        function rsdCallback(data) {
            if (!data) {
                console.log("Error:rsdCallback: invalid session");
                window.location = "bacpac-login.html";
                return false;
            };
            switch (data.uid) {
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
                    main();
                    sharing();// run page
                    return true;
                    break;
                }
            }
        }

        function sharing()
        {//uid/fromOtherUsers/someOtherUser_Uid
            // var sharedwme = 
            var thead = document.getElementsByTagName('thead')[0];
            database.ref("/shared/uid/fromOtherUsers/someOtherUser_Uid/aFileOtherUserOwns_fileName0").once("value").then(function (snapshot) {
                user.data = snapshot.val();
                initTabs(snapshot.val());
                var tr = document.createElement('tr');
                var td = document.createElement('td');
                var td2 = document.createElement('td');
            //    var userdata = snapshot.val().replace("\"", "");
               
               // var td = document.createElement('td class="center"');
                //  th.innerText = snapshot.val().data + " --- " + JSON.stringify(snapshot.val());
                td2.innerText = JSON.stringify(snapshot.val())//file name?
                td.innerText = "hi";
                // td.innerText = "123";
                tr.appendChild(td2);
                tr.appendChild(td);
                thead.appendChild(tr);
                 console.log("Shared file: " + JSON.stringify(snapshot.val())); // debug
               // initTabs(snapshot.val());
               
            })
        }

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
            dbRef.ref("/folder/" + uid + fullPath).once("value").then(function (snapshot) {
                callback(snapshot.val());
            }).catch(function (error) {
                console.log(error);
            });

            return true;
        }

        function updateFolderPane(data) {
            if (!data) {
                console.log("Error:updateFolderPane: invalid data");
                return false;
            }
            console.log("Updating navigation tree: " + JSON.stringify(data));
            return true;
        }
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
    