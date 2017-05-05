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
                    sharedwithme();// run page
                    thatishared();
                    return true;
                    break;
                }
            }
        }
     
       
        function sharedwithme()
        {
          
            var tr = document.createElement('tr');
            var thead = document.getElementsByTagName('thead')[0];
            database.ref("/shared/uid/fromOtherUsers/").once("value").then(function (snapshot) {
                var info = snapshot.val();
                var UID = Object.keys(info);//otheruserid
                var td2 = document.createElement('td');
                database.ref("/shared/uid/fromOtherUsers/" + UID + "/aFileOtherUserOwns_fileName0").once("value").then(function (snapshot) {
                    var info2 = snapshot.val();

                    //database.ref("roster/")once("value").then(function (snapshot){ var info3 = snapshot.val(); var email = Object.keys(info);...}
                    //"/roster" + email + "/uid" UID


                    //     if (snapshot.val() == "fileName0.fileExt")//if no file has been shared
                    //     return;
                    initTabs(user);
                    //    var tr = document.createElement('tr');
                    // var td = document.createElement('td');
                 //   var td2 = document.createElement('td');
                    //    var userdata = snapshot.val().replace("\"", "");
                    //snapshot.val()=filename w/ extension
                    // var td = document.createElement('td class="center"');
                    //  th.innerText = snapshot.val().data + " --- " + JSON.stringify(snapshot.val());
                 //   console.log(Object.keys(info2));
                    td2.innerText = JSON.stringify(info2)//file name
                    //  td.innerText = Object.keys(info);
                //    tr.appendChild(td2);
                    //    tr.appendChild(td);
               //     thead.appendChild(tr);
                    console.log("Shared file: " + JSON.stringify(snapshot.val())); // debug
                    // initTabs(snapshot.val());

                })
                tr.appendChild(td2);
                thead.appendChild(tr);
              //  if (Object.keys(info) == "someOtherUser_Uid")//if no file has been shared
                //       return;
               initTabs(user);
              //  var tr = document.createElement('tr');
                var td = document.createElement('td');
              //  var td2 = document.createElement('td');
            //    var userdata = snapshot.val().replace("\"", "");
               //snapshot.val()=filename w/ extension
               // var td = document.createElement('td class="center"');
                //  th.innerText = snapshot.val().data + " --- " + JSON.stringify(snapshot.val());
             //   console.log(Object.keys(info));
             
              //  td2.innerText = JSON.stringify(info)//file name?
                td.innerText = UID;//otheruserid
                // td.innerText = "123";
                // tr.appendChild(td2);
            
                tr.appendChild(td);
              //  thead.appendChild(tr);
             //    console.log("Shared file: " + JSON.stringify(snapshot.val())); // debug
               // initTabs(snapshot.val());
             
                
            })
         
            thead.appendChild(tr);
        }

        function thatishared() {
          
            var thead = document.getElementsByTagName('thead')[1];
            var i;
          
            //var user_char = {};
            database.ref("/shared/" + uid + "/withOtherUsers/").once('value').then(function(snapshot){
                for (i = 0; i < 3; i++){
               // console.log(Object.keys(snapshot.val()));
                //var filename = Object.keys(snapshot.val());
               /* snapshot.forEach(function (childSnapshot) {
                    //var td = document.createElement('td');// cell with file name
                

                    
                    var childData = childSnapshot.val();
                    // var childKey2 = childSnapshot.key;
                    console.log(childKey);//1st filename
                    console.log(JSON.stringify(childData));//uid: email

                    //var tr = document.createElement('tr');
                    // var td = document.createElement('td');
                    // td.innerText = child.val().email + " --- " + JSON.stringify(child.val());
                    // tr.appendChild(td);
                    // table.appendChild(tr);

                    user_char[childKey] = childData;
                  
                    tr.appendChild(td);
                 //   thead.appendChild(tr);
                })*/

               // store_user_char(user_char);
              
              //  td.innerText = user_char;
                    var info = snapshot.val();//hold filename
                    var filename = Object.keys(info);//filename array
                    var tr = document.createElement('tr');//make row
                    var td2 = document.createElement('td');//make cell in row// cell with email
                    var td = document.createElement('td');// cell with file name

                 //   console.log(filename);
                    // if (filename == undefined)
                    //    break;
                    // for (var p in filename) {
           
                 //   var id = database.ref("/shared/" + uid + "/withOtherUsers/");
                  //  id.on('child_added', function (snapshot) {
                    database.ref("/shared/" + uid + "/withOtherUsers/").once('value').then(function (snapshot) {
                        var info2 = snapshot.val();//hold other user id
                        var UID = Object.keys(info2);//OTHERUSERUID
                        // td2.innerText = UID;
                      
                      //  console.log(UID);
                        //   var td2 = document.createElement('td')
                        database.ref("/shared/" + uid + "/withOtherUsers/" + filename + "/" + UID).once("value").then(function (snapshot) {
                            //  for (i = 0; i < 2; i++) {

                            var info3 = snapshot.val();//hold's other user's email
                            initTabs(user);

                          //  var allValues = [];
                           // var usedKeys = {};

                                   
                            var string = JSON.stringify(info3);

                            string2 = string.replace(/['"]+/g, '');
                             
                           td2.innerText = string2;//display other user's email
                            /*   for (var i = 0; i < filename.length; ++i) {
                                   // If the parent object does not have a matching sub-object, skip to the
                                   // next iteration of the loop


                                   var subKeys = Object.keys(string2);
                                   for (var j = 0; j < subKeys.length; ++j) {
                                       if (usedKeys[subKeys[j]]) {
                                           continue;
                                       }
                                       usedKeys[subKeys[j]] = true;
                                       allValues.push(string2[subKeys[j]]);
                                       //  console.log(allValues);
                                       td2.innerText = allValues;
                                   }
                               }*/
                            //   tr.appendChild(td2);

                        })

                        // tr.appendChild(td2);
                            
                    })
                    
                    //    if (filename == undefined)
                    //    break;
                    tr.appendChild(td2);
                    thead.appendChild(tr);
                  
                    initTabs(user);
                    
                    
                   // var string3 = filename.replace('%2E', '.').replace('%20', '');
                    td.innerText = filename;//otheruserid
                   
                    // tr.appendChild(td2);
                    
                    tr.appendChild(td);
              
                     }
                })
            
            
            thead.appendChild(tr);
        }

       /* var store_user_char = function (user_char) {
            char_obj = user_char;
            console.log(char_obj);
            for (var key in char_obj) {
                if (char_obj.hasOwnProperty(key)) {
                    console.log(key);
                }
            }
        }*/

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
        