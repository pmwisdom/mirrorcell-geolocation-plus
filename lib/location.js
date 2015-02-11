var options = {
    persistent: true,
    lazyLastPosition: false,
    distanceFilter: {
        enabled: false,
        range: 5 // Meters
    },
    timeFilter: {
        enabled: false,
        span: 120 // Seconds
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

    return p;
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
        var tf = isSecondsAway(new Date(old.updatedAt), Location.options.timeFilter.span);
        //console.log("Time Filter: Filter - " + Location.options.timeFilter.lapse + ". has been minutes " + tf);
        if(!tf) {
            return null;
        }
    }

    if(Location.options.accuracyFilter.enabled && old.coords.accuracy && !(isNaN(old.coords.accuracy))) {
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
    _watchOptions: watchOptions,
    _positionOptions: positionOptions,
    _position: null,
    _watching: false,
    _watchId: null,

    getReactivePosition : function() {
        return reactiveLocation.get();
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
                    var fixed = storePosition(filtered);

                    callback && callback(fixed)
                }

            }, error, this._positionOptions);
        }
    },
    startWatching : function(callback) {
        if (!this._watching && navigator.geolocation) {
            this._watchId = navigator.geolocation.watchPosition(function(pos) {

                var filtered = filter(pos);

                if(filtered) {
                    var fixed = storePosition(pos);

                    callback && callback(fixed);
                }

            }, error, this._watchOptions);
            this._watching = true;
        }
    },
    stopWatching : function() {
        if (this._watching && navigator.geolocation) {
            navigator.geolocation.clearWatch(this._watchId);
            this._watching = false
        }
    },
    setWatchOptions : function(options) {
        if(!options) {
            console.log("You must provide an options object");
        } else {
            this._watchOptions = options;
        }
    },
    setGetPositionOptions : function(options) {
        if(!options) {
            console.log("You must provide an options object");
        } else {
            this._positionOptions = options;
        }
    },
    enableAccuracyFilter: function(rating) {
        this._options.accuracyFilter.enabled = true;
        this._options.accuracyFilter.rating = rating;
    },
    disableAccuracyFilter: function() {
        this._options.accuracyFilter.enabled = false;
    },
    enableDistanceFilter: function(distance) {
        this._options.distanceFilter.enabled = true;
        this._options.distanceFilter.distance = distance;
    },
    disableDistanceFilter: function() {
        this._options.distanceFilter.enabled = false;
    },
    enableTimeFilter: function(span) {
        this._options.timeFilter.enabled = true;
        this._options.timeFilter.distance = span;
    },
    disableTimeFilter: function() {
        this._options.timeFilter.enabled = false;
    },
    disableAllFilters: function() {
        this._options.accuracyFilter.enabled = false;
        this._options.distanceFilter.enabled = false;
        this._options.timeFilter.enabled = false;
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

function isSecondsAway(date, minutes) {
    var now = new Date();
    //console.log("Time Calc: " + (now.getTime() - date.getTime()));
    //console.log(minutes + " Mins: " + (minutes * 60 * 1000));

    return !((now.getTime() - date.getTime()) <= (seconds * 1000))
};

