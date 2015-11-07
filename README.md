### Provides an abstraction (Location) from navigator.geolocation that is used to retrieve coordinates / speed / etc from browsers and mobile devices. ##

#### NOTE : This plugin is for *foreground* Geolocation, if you need *background* geolocation, use: [mirrorcell:background-geolocation-plus](https://atmospherejs.com/mirrorcell/background-geolocation-plus)

#### New For 1.1.3!
* Get The GPS Status Of Android / iOS and display a native prompt if GPS is Disabled That Takes the User to relevant settings pages -- Please look at the documentation below for an example.


### Advantages of this package over meteor's core package:
    * NEW - Get the GPS Status / Show Dialog  Natively.
    * Provides reactive and non reactive options to retrieve position
    * Manually stop and start watching positions (original watches continuously, horrible for battery)
    * Manually get a one time position
    * Options to automatically filter for distance between points, time between locations, and gps accuracy


**To retrieve the status of the GPS:**

**Location.getGPSState** 
````javascript
//Success Will fire upon completion of the GPS check
//State will be different for Android and iOS

//Android States:
//Enabled
//Disabled

//iOS States: (See IOS KClAuthorizationStatus Documentation for more information)
//NotDetermined -- Never asked user for auhtorization
//Denied -- Asked User for authorization but they denied
//Restricted -- Same As Not Determined

function success(state) {
   if(state === 'Enabled') {
      console.log("GPS Is Enabled");
   }
}

//This will fire if either your not running in a cordova application
//Or the plugin was not found for some reason
function failure() {
   console.log("Failed to get the GPS State");
}

//Options: The only option right now is to show 
//a dialog if gps is disabled. The dialog has a 
//button on it that directs the user to the settings
//page assocaited with enabling their gps for your app.
// Dialog : true means the pop up will appear
var options = {
   dialog: true
}

Location.getGPSState(success, failure, options);
````
Pictures Of said gps dialog:


![alt text](http://i.imgur.com/XGiF1zfl.png) ![alt text](http://i.imgur.com/zcgT1L9l.png)

### How to use:

**To get a new coordinate(s)** - these functions retrieve coordinates from the gps and store the results, reactively, and in local storage automatically, they also return callbacks so you can add your own custom logic / processing.
   
**Location.locate** - Gets a single GPS coordinate upon call

````javascript
Location.locate(function(pos){
   console.log("Got a position!", pos);
}, function(err){
   console.log("Oops! There was an error", err);
});
````
   
**Location.startWatching** -- Continually pings the GPS for new positions, stores in local storage, and the reactive var

````javascript
Location.startWatching(function(pos){
   console.log("Got a position!", pos);
}, function(err){
   console.log("Oops! There was an error", err);
});
````
   
**Location.stopWatching** -- Stops the currently running watcher

````javascript
Location.stopWatching();
````

**Location.setMockLocation** -- Sets a Mock (test) position. Useful for testing in the browser. you can set any combination of the fields, none are required. Each field's default is 0. Will update the local storage and reactive position object. 

````javascript
Location.setMockLocation({
   latitude : ...
   longitude : ...
   accuracy : ...
   speed : ...
   altitude : ...
   altitudeAccuracy : ...
   updatedAt : ...
});
````

**To retrieve coordinates** --
 
### Location.getReactivePosition()
    * Retrieves a reactive variable that updates from locate and startWatching
   
### Location.getLastPosition()
    * Retrieves the stored non-reactive but Persistent (Local Storage)

Both return object of :

````javascript
var pos = {
        latitude : ...
        longitude : ...
        accuracy : ...
        speed : ...
        altitude : ...
        altitudeAccuracy : ...
        updatedAt : ...
    }
````

### Filtering:
* Distance: 
   Filters any GPS coordinate retreived from the GPS by distance. For example, if you change Locate.distanceFilter.range to 5, any GPS coordinates not 5 meters from the last coordiante retrieved will not be returned or saved.
* Accuracy:
   Filters any GPS coordinate retrieved from the GPS by accuracy. For example, if you change Locate.accuracyFilter.rating to 10, any GPS coordinates not 10 accuracy or more will not be returned or saved.
* Time:
   Filters any GPS coordinate retrieved from the GPS by time (in minutes). For example, if you change Locate.timeFilter.lapse to 1, any GPS coordinates not 1 minute or longer from the last coordinate retrieved will not be returned or saved.

You can use any of these filters in conjunction. To enable any or all of these:

   * Location.enableAccuracyFilter(rating)

   * Location.enableDistanceFilter(distance)

   * Location.enableTimeFilter(span)

You can disable any of these by calling their specific disable function or Location.disableAllFilters()

### Setting GPS options

* setWatchOptions(optionsObject) -- Sets the options for Location.watchPosition ( see docs for navigator.geolocation.watchPosition for options)
* setGetPositionOptions(optionsObject) -- Sets the options for Location.locate ( see docs for navigator.geolocation.getCurrentPosition for options)

### Debug -
To Turn on debugging console message: Set Location.debug = true
