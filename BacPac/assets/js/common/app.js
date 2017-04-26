

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCvPRRrZtSCnP0tI96mo0MRTZLRz6J5BQY",
    authDomain: "test-3bb30.firebaseapp.com",
    databaseURL: "https://test-3bb30.firebaseio.com",
    projectId: "test-3bb30",
    storageBucket: "test-3bb30.appspot.com",
    messagingSenderId: "444683041317"
  };
  firebase.initializeApp(config);


const messaging = firebase.messaging();
messaging.requestPermission()
.then(function() {
	console.log('Have Permission');
	})
	
.catch(function(err) {
	console.log('Error Occured.');
	})
	