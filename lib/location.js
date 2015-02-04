var options = {
    persistent: true,
    lazyLastPosition: false,
    distanceFilter: {
        enabled: false,
        range: 5 // Meters
    },
    timeFilter: {
        enabled: false,
        lapse: 1 // Minutes
    },
    accuracyFilter: {
        enabled: false,
        rating: 12 // Accuracy rating
    }
};

var reactiveLocation = new ReactiveVar(null);

var watchOptions = {
    enableHighAccuracy: true,
    maximumAge: 0
};
var positionOptions = {
  enableHighAccuracy: true,
    maximumAge: 0
};


function storePosition(pos) {

    var p = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        altitudeAccuracy: pos.coords.altitudeAccuracy,
        speed: pos.coords.speed,
        heading: pos.coords.heading,
        updatedAt: pos.timestamp
    };

    var string = JSON.stringify(p);

    options.persistent && localStorage && localStorage.setItem('paulw:lastPosition', string);

    reactiveLocation.set(p);
}

function filter(pos) {
    var old = Location && Location.getLastPosition();


    if(!old) return pos; // We havent gotten a single position yet

    if(options.distanceFilter.enabled) {
        //console.log("Filtering distance");
        var d = getDistance(old, pos);
        //console.log("Distance Filter: Filter - " + options.distanceFilter.range + ". Actual Distance - " + d);
        if(!(d >= options.distanceFilter.range)) {
            return null;
        }
    }

    if(Location.options.timeFilter.enabled) {
        var tf = isMinutesAway(new Date(old.updatedAt), Location.options.timeFilter.lapse);
        //console.log("Time Filter: Filter - " + Location.options.timeFilter.lapse + ". has been minutes " + tf);
        if(!tf) {
            return null;
        }
    }

    if(Location.options.accuracyFilter.enabled && old.coords.accuracy) {
        //console.log("Accuracy" + old.coords.accuracy);
        if(old.coords.accuracy > options.accuracyFilter.rating) {
            //console.log("Accuracy filter: Not accurate enough");
            return null;
        }
    }

    return pos;
}

function error(err) {
    Session.set('paulw:locationError', err);
}

Location = {
    options : options,
    _position: null,
    _watching: false,
    _watchId: null,

    getReactivePosition : function() {
        return reactiveLocation;
    },
    getLastPosition : function() {
        if(options.persistent) {
            var lastPos = localStorage.getItem('paulw:lastPosition');
            if (lastPos)
                return JSON.parse(lastPos);
            else
                return null;
        } else {
            console.log("Location Error: You've set perstitent storage to false");
        }
    },
    locate : function(callback) {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos) {

                var filtered = filter(pos);

                if(filtered) {
                    storePosition(pos);

                    callback && callback(pos)
                }

            }, error, positionOptions);
        }
    },
    startWatching : function(callback) {
        if (!this._watching && navigator.geolocation) {
            this._watchId = navigator.geolocation.watchPosition(function(pos) {

                var filtered = filter(pos);

                if(filtered) {
                    storePosition(pos);

                    callback && callback(pos)
                }

            }, error, watchOptions);
            this._watching = true;
        }
    },
    stopWatching : function() {
        if (this._watching && navigator.geolocation) {
            navigator.geolocation.clearWatch(this._watchId);
            this._watching = false
        }
    }
};

//Helpers

function rad(x) {
    return x * Math.PI / 180;
};

function getDistance(p1, p2) {
    if (p1 && p2) {
        //console.log("Getting distance for", p1, p2)
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(p2.coords.latitude - p1.coords.latitude);
        var dLong = rad(p2.coords.longitude - p1.coords.longitude);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(p1.coords.latitude)) * Math.cos(rad(p2.coords.latitude)) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d; // returns the distance in meters
    } else {
        // TODO: console log or throw error? Return what here?
        return null;
    }
};

function isMinutesAway(date, minutes) {
    var now = new Date();
    //console.log("Time Calc: " + (now.getTime() - date.getTime()));
    //console.log(minutes + " Mins: " + (minutes * 60 * 1000));

    return !((now.getTime() - date.getTime()) <= (minutes * 60 * 1000))
};

