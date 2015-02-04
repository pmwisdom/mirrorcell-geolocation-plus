Provides an object (Location) that is used to retrieve coordinates / speed / etc from mobile browsers and mobile devices.

**Advantages of this package over meteor's core package:**

    * Provides reactive and non reactive options to retrieve position
    * Manually stop and start watching positions (original watches continuously, horrible for battery)
    * Manually get a one time position
    * Options to automatically filter for distance between points, time between locations, and gps accuracy

**How to use:**

    To get a new coordinate(s) - these functions retrieve coordinates from geolocation and store them, reactively, and in local storage automatically, they also have callbacks so you can

    Location.locate(function(pos))
    Location.startWatching(function(pos))
    Location.stopWatching(function(pos))

    To retrieve coordinates --

    Location.getReactivePosition -- Reactive
    Location.getLastPosition -- Non-Reactive but Persistent (Local Storage)

    Returns object of :
    var pos = {
        latitude : ...
        longitude : ...
        accuracy : ...
        speed : ...
        altitude : ...
        altitudeAccuracy : ...
        updatedAt : ...
    }


**Coming soon....**

*Filtering:
    *Distance:
    *Accuracy:
    *Time:
