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
            user's username area)
        Expects:
            N/A
        Parameters:
            string userId - the ID of the current user to read
            FirebaseObject dbRef - the firebase.database() object
        Returns:
            true - if successful
            false - if invalid parameters
*/
function readSessionData(userId, dbRef) {
    if (!userId || !dbRef) return false;
    dbRef.ref("/sessions/" + userId).once("value").then( function(snapshot){
        user = snapshot.val();
        console.log("Current User: " + JSON.stringify(user));
    });
    return true;
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
            N/A
        Returns:
            N/A
*/
function initTabs() {
    $(".bacpacTab").click(function(event) {
        event.preventDefault();
        window.location = this.href + "?uid=" + user.uid + "&email=" + user.email;
    });
}