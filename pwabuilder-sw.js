
//import Firebase
importScripts('https://www.gstatic.com/firebasejs/5.0.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.0.0/firebase-messaging.js');


//This is the "Offline copy of pages" service worker

//Install stage sets up the index page (home page) in the cache and opens a new cache

 //============================================================================================================//
     //INSTALL API
   //============================================================================================================//
self.addEventListener('install', function(event) {
    var indexPage = new Request('index.html');
    event.waitUntil(
      fetch(indexPage).then(function(response) {
        return caches.open('pwabuilder-offline').then(function(cache) {
          console.log('[PWA Builder] Cached index page during Install'+ response.url);
          return cache.put(indexPage, response);
        });
    }));
  });
  
  
  //============================================================================================================//
     //FETCH API CALLED
   //============================================================================================================//
  
  //If any fetch fails, it will look for the request in the cache and serve it from there first
  self.addEventListener('fetch', function(event) {
    var updateCache = function(request){
      return caches.open('pwabuilder-offline').then(function (cache) {
        return fetch(request).then(function (response) {
          console.log('[PWA Builder] add page to offline'+response.url)
          return cache.put(request, response);
        });
      });
    };


    //============================================================================================================//
     //UPDATE THE CACHE
   //============================================================================================================//
  
    event.waitUntil(updateCache(event.request));
  
    event.respondWith(
      fetch(event.request).catch(function(error) {
        console.log( '[PWA Builder] Network request Failed. Serving content from cache: ' + error );
  
        //Check to see if you have it in the cache
        //Return response
        //If not in the cache, then return error page
        return caches.open('pwabuilder-offline').then(function (cache) {
          return cache.match(event.request).then(function (matching) {
            var report =  !matching || matching.status == 404?Promise.reject('no-match'): matching;
            return report
          });
        });
      })
    );
  })
  

  //============================================================================================================//
     //FIREBASE PUSH MESSAGES
   //============================================================================================================//
//Change Keys
  var config = {
    apiKey: "",
    authDomain: "progressive-apps-builder.firebaseapp.com",
    databaseURL: "https://progressive-apps-builder.firebaseio.com",
    projectId: "progressive-apps-builder",
    storageBucket: "progressive-apps-builder.appspot.com",
    messagingSenderId: ""
  };
firebase.initializeApp(config);

var messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  var notificationTitle = payload.data.title;
  var notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});
// [END background_handler]