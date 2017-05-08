/* Utility: Query String Parameter Retriever 
        Description:
            grabs the url parameter specified by "name"
        Expects:
            N/A
        Parameters:
            string name - the name of the url parameter to grab
            (optional) string url - the url to search in
        Returns: string
*/
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

/* Utility: Random String Generator
        Description:
            generates a random string of characters.
        Expects:
            N/A
        Parameters:
            int length - the desired length of the returned random string
        Returns: string
*/
function generateRandomString(length) {
    var chars = "abcdefghijklmnopqrstuvwxyz";
    var pass = "";
    for (var x = 0; x < length; x++) {
        var i = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(i);
    }
    return pass;
}

/* Universal Utility: readSessionData
        Description:
            grab's the current user's session data from the database
            for updating the page's relevant elements with that data (i.e the
            user's username area). Also overrides <a></a> element redirects by
            calling initTabs().
        Expects:
            before calling this function, targetVar must be instantiated in your
            .js file as an object with a member "data"

            EXAMPLE: =====================================================================================
                var db = firebase.database();
                .
                .
                .
                var user = { data: "" };
                .
                .
                .
                readSessionData(user, getParameterByName("uid"), db);
            end EXAMPLE: =================================================================================
        Parameters:
            Object targetVar - the page's .js file's user variable to store object data to
            string userId - the ID of the current user to read
            FirebaseObject dbRef - a reference to the firebase.database() object
            (optional) Function callback - a function to run after readSessionData succesfully executes; it is passed the user variable
        Returns:
            true - if successful
            false - if invalid parameters
*/
function readSessionData(targetVar, userId, dbRef, callback) {
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
}

/* Universal Utility: initTabs
        Description:
            sets the event listeners of the site module tabs so that each tab,
            when clicked, passes the current user's UID and email to the querystring
            (for retrieval using function "getParameterByName()")
        Expects:
            each module tab's "a" tag must have class "bacpacTab", like below:

            EXAMPLE: =====================================================================================
                        .
                        .
                        .
                        <!-- start: Main Menu -->
                        <div id="sidebar-left" class="col-lg-2 col-sm-1">
                            <!-- Search Bar -->
                            <input type="text" class="search hidden-sm" placeholder="..." />

                            <!-- Navbar Tabs -->
                            <div class="nav-collapse sidebar-nav collapse navbar-collapse bs-navbar-collapse">
                                <ul class="nav nav-tabs nav-stacked main-menu">
                                    <!-- Tab 1: Dashboard -->
                                    <li>
           OVER HERE >>>>>>>            <a class="bacpacTab" href="bacpac.html">
                                            <i class="fa fa-bar-chart-o"></i>
                                            <span class="hidden-sm"> Dashboard</span>
                                        </a>
                                    </li>
                        .
                        .
                        .
            end EXAMPLE ===================================================================================

        Parameters:
            Object user - the user object containing firebase.auth().CurrentUser
        Returns:
            N/A
*/
function initTabs(user) {
    if (!user) {
        console.log("Error:initTabs: '" + user + "' is an invalid user");
        return false;
    } else {
        console.log("User - " + JSON.stringify(user));
        $(".bacpacTab").click(function(event) {
            event.preventDefault();
            window.location = this.href + "?uid=" + user.uid + "&email=" + user.email;
            // console.log(this.href + "?uid=" + user.uid + "&email=" + user.email);    // debug
        });
    }
}

/* Universal Utility: setupLogoutProtocol
        Description:
            Initializes the page's logout button with the proper protocols to logout.
            Adds a click event listener to the element specified by logoutButtonID to do so.
        Expects:
            The element that will have the event listener applied to it IS ASSUMED to be a button
            (i.e. <button>...</button>)
        Parameters:
            string logoutButtonID - the ID of the logout button element
            Object dbRef - a reference to the firebase.database() object
            Object authRef - a reference to the firebase.auth() object
            (optional) Function callback - a callback to run after this function completes; It is not passed any parameters.
        Returns:
            false - if invalid parameters
            true - if call succeeded
*/
function setupLogoutProtocol(logoutButtonID, dbRef, authRef, callback) {
    if (!logoutButtonID || !dbRef) {
        console.log("Error:setupLogoutProtocol: invalid parameter(s)");
        return false;
    } else if (logoutButtonID === '') {
        console.log("Error:setupLogoutProtocol: invalid element ID");
        return false;
    }
    /* Action: Logout Button click */
    $("#" + logoutButtonID).on("click", function() {
        dbRef.ref("/sessions/" + user.data.uid).remove().then(function(){
            console.log("Session Ended...");
            authRef.signOut().then(function(){
                console.log("Signing Out");
                window.location = ("index.html");
            }).catch(function(error){
                console.log(error);
            });
        }).catch(function(error){
            console.log("Internal Error Occurred! [" + error + "]");
        });
    });

    if (callback) callback();

    return true;
}

/* Universal Utility: bacpacEncode
        Description:
            Encodes the specified string to URL standards, and additionally encodes it further with Google Firebase Database standards
            Note: Per Google Firebase Standards, this function also encodes "." (period), "$" (dollar sign), "[" (left bracket), "]" (right bracket), "#" (hash), and "/" (forward slash)
                This function also reverts encoding for the "@" symbol (i.e. if str has the "@" symbol in it, it will remain unencoded)
*/
function bacpacEncode(str) {
    return encodeURIComponent(str).replace(/\./g, "%2E").replace(/\$/g, "%24").replace(/\[/g, "%5B").replace(/\]/g, "%5D").replace(/#/g, "%23").replace(/\//g, "%2F").replace(/%40/g, "@");
}

/* Universal Utility: bacpacDecode
        Description:
            Performs the reverse operation of bacpacEncode
*/
function bacpacDecode(str) {
    return decodeURIComponent(str).replace(/%2E/g, ".").replace(/%24/g, "$").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/%23/g, "#").replace(/%2F/g, "/");
}