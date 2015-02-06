Provides an object (Location) that is used to retrieve coordinates / speed / etc from browsers and mobile devices.

**Advantages of this package over meteor's core package:**

    * Provides reactive and non reactive options to retrieve position
    * Manually stop and start watching positions (original watches continuously, horrible for battery)
    * Manually get a one time position
    * Options to automatically filter for distance between points, time between locations, and gps accuracy

**How to use:**

**To get a new coordinate(s)** - these functions retrieve coordinates from the gps and store the results, reactively, and in local storage automatically, they also return callbacks so you can add your own custom logic / processing.
   
   
**Location.locate**  -- Gets a single GPS coordinate upon call

````
Location.locate(function(pos){
});
````
   
**Location.startWatching** -- Continually pings the GPS for new positions, stores in local, and the reactive var

````
Location.startWatching(function(pos){
});
````
   
**Location.stopWatching** -- Stops the currently running watcher

````
Location.stopWatching(function(pos){
});
````

**To retrieve coordinates --**
 
**Location.getReactivePosition()** -- Retrieves a reactive variable that updates from locate and startWatching
   
**Location.getLastPosition()** -- Retrieves the stored non-reactive but Persistent (Local Storage)

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


**Filtering:**
* Distance: 
   Filters any GPS coordinate retreived from the GPS by distance. For example, if you change Locate.distanceFilter.range to 5, any GPS coordinates not 5 meters from the last coordiante retrieved will not be returned or saved.
* Accuracy:
   Filters any GPS coordinate retrieved from the GPS by accuracy. For example, if you change Locate.accuracyFilter.rating to 10, any GPS coordinates not 10 accuracy or more will not be returned or saved.
* Time:
   Filters any GPS coordinate retrieved from the GPS by time (in minutes). For example, if you change Locate.timeFilter.lapse to 1, any GPS coordinates not 1 minute or longer from the last coordinate retrieved will not be returned or saved.

You can use any of these filters in conjunction. To enable any or all of these:

*Location.distanceFilter.enabled = true;

*Location.accuracyFilter.enabled = true;

*Location.timeFilter.enabled = true;
