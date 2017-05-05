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
   // var otheruser = {};
    var uid = getParameterByName("uid");
  //  console.log(uid);
    var auth = firebase.auth();
    //var user = null;
    var database = firebase.database(app);
   readSessionData(user, getParameterByName("uid"), database, rsdCallback)//userId=getParameterByName("uid")
  // readshareData(otheruser, getParameterByName("uid"), database, rsdCallback);
   // var name;
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
               // window.location = "bacpac-login.html";
                return false;
            };
            switch (data.uid) {
                case null: {
                    // not found
                    console.log("Error: User ID not found");
                   // window.location = "bacpac-login.html";
                    return false;
                    break;
                }
                case '': {
                    // invalid found
                    console.log("Error: User ID not found");
                  //  window.location = "bacpac-login.html";
                    return false;
                    break;
                }
                default: {
                    // all clear; login is valid
                    applyProfileData("profileUsername", data.email);
                    main();
                  //  sharedwithme();// run page
                    thatishared();
                    return true;
                    break;
                }
            }
        }
     
       
        function sharedwithme()
        {
          
            var thead = document.getElementsByTagName('thead')[0];
            var i;

            database.ref("/shared/" + uid + "/fromOtherUsers/").once('value').then(function (snapshot) {
                for (i = 0; i < 3; i++) {
                    // console.log(Object.keys(snapshot.val()));
                    //var filename = Object.keys(snapshot.val());

                    //  td.innerText = user_char;
                    var info = snapshot.val();//hold filename
                    var filename = Object.keys(info)[i];//filename array
                    var tr = document.createElement('tr');//make row
                    var td2 = document.createElement('td');//make cell in row// cell with email
                    var td = document.createElement('td');// cell with file name
                    var one = snapshot.child(filename).val();//uid:email
                    console.log(one);
                    var uids = Object.keys(one);//array of otheruserids
                    console.log(uids);//array of otheruserids
                    for (var j = 0; j < uids.length; j++) {
                        // var email = one[uids[i]];//only giving 1st uid in array
                        //  var email = one[uids[j]];
                        email.push(one[uids[j]]);
                        //    console.log(JSON.stringify(one[uids[j]]));
                        //  td2.innerText = email;
                        //  td2.innerText = email;
                    }
                    td2.innerText = email;
                    //  }
                    console.log(email);
                    //   td2.innerText[0] = email;

                    // var three = snapshot.child(filename).getPriority();
                    // console.log(three);


                    tr.appendChild(td2);
                    thead.appendChild(tr);

                    initTabs(user);


                    var string3 = filename.replace('%2E', '.').replace('%20', '');
                    td.innerText = string3;//otheruserid
                    tr.appendChild(td);

                }
            })
            thead.appendChild(tr);
        }

        function thatishared() {

            var thead = document.getElementsByTagName('thead')[1];
            var i;

            database.ref("/shared/" + uid + "/withOtherUsers/").once('value').then(function (snapshot) {
                for (i = 0; i < 10; i++) {
                    // console.log(Object.keys(snapshot.val()));
                    //var filename = Object.keys(snapshot.val());
                    var email = [];
                    //  td.innerText = user_char;
                    var info = snapshot.val();//hold filename
                    var filename = Object.keys(info)[i];//filename array
                    var tr = document.createElement('tr');//make row
                    var td2 = document.createElement('td');//make cell in row// cell with email
                    var td = document.createElement('td');// cell with file name
                    var one = snapshot.child(filename).val();//uid:email
                    console.log(one);
                   var uids = Object.keys(one);//array of otheruserids
                    console.log(uids);//array of otheruserids
                    // td2.innerText = two;
                  for (var j = 0; j < uids.length; j++) {
                   // var email = one[uids[i]];//only giving 1st uid in array
                     //  var email = one[uids[j]];
                    email.push(one[uids[j]]);
                //    console.log(JSON.stringify(one[uids[j]]));
                        //  td2.innerText = email;
                  //  td2.innerText = email;
                   }
                    console.log(email);
                    td2.innerText = email;
                
                   // var three = snapshot.child(filename).getPriority();
                   // console.log(three);
               
             
                    tr.appendChild(td2);
                    thead.appendChild(tr);

                    initTabs(user);


                    var string3 = filename.replace('%2E', '.').replace('%20', '');
                    td.innerText = string3;//otheruserid
                    tr.appendChild(td);

                }
            })
            thead.appendChild(tr);
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
        