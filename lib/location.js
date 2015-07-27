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

    if(Location._options.distanceFilter.enabled) {
        Location.debug && console.log("Filtering distance");
        var d = getDistance(old, pos);
        Location.debug && console.log("Distance Filter: Filter - " + Location._options.distanceFilter.range + ". Actual Distance - " + d);
        if(!(d >= Location._options.distanceFilter.range)) {
            return null;
        }
    }

    if(Location._options.timeFilter.enabled) {
        var tf = isSecondsAway(new Date(old.updatedAt), Location._options.timeFilter.span);
        Location.debug && console.log("Time Filter: Filter - Has Been " +
            Location._options.timeFilter.span + " Seconds? " + tf);
        if(!tf) {
            return null;
        }
    }

    if(Location._options.accuracyFilter.enabled && pos.coords.accuracy && !(isNaN(pos.coords.accuracy))) {
        Location.debug && console.log("Accuracy" + pos.coords.accuracy);
        if(pos.coords.accuracy > Location._options.accuracyFilter.rating) {
            Location.debug && console.log("Accuracy filter: Not accurate enough");
            return null;
        }
    }

    return pos;
}

function error(err) {
    Session.set('paulw:locationError', err);
}

Location = {
    _options : options,
    _watchOptions: watchOptions,
    _positionOptions: positionOptions,
    _position: null,
    _watching: false,
    _watchId: null,
    debug: false,
    //This function calls my native utils package to retrieve the state of the GPS and if
    //dialog is set to true, will show the user a prompt asking the user to turn on their GPS
    getGPSState: function(callback, failureCallback, options) {
        if(Meteor.isCordova && window && window.plugins && window.plugins.nativeUtils.getGPSState) {
            window.plugins.nativeUtils.getGPSState(callback, failureCallback, options);
        } else {
            //Throw enabled back if client is browser
            callback && callback('Enabled');
        } 
    },
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
    locate : function(callback, failureCallback) {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos) {
                Location.debug && console.log("Get Current Position Received New Position: " + JSON.stringify(pos));
                var filtered = filter(pos);

                if(filtered) {
                    var fixed = storePosition(filtered);

                    callback && callback(fixed)
                }

            }, failureCallback, this._positionOptions);
        }
    },
    startWatching : function(callback, failureCallback) {
        if (!this._watching && navigator.geolocation) {
            this._watchId = navigator.geolocation.watchPosition(function(pos) {
                Location.debug && console.log("Start Watching Received New Position: " + JSON.stringify(pos));
                var filtered = filter(pos);

                if(filtered) {
                    var fixed = storePosition(pos);

                    callback && callback(fixed);
                }

            }, failureCallback, this._watchOptions);
            this._watching = true;
        }
    },
    stopWatching : function() {
        if (this._watching && navigator.geolocation) {
            navigator.geolocation.clearWatch(this._watchId);
            this._watching = false
        }
    },
    setMockLocation : function(pos) {
        var p = {
            coords: {
                latitude: pos.latitude || 0,
                longitude: pos.longitude || 0,
                accuracy: pos.accuracy || 0,
                altitudeAccuracy: pos.altitudeAccuracy || 0,
                speed: pos.speed || 0,
                heading: pos.heading || 0
            },
            timestamp: pos.updatedAt || (new Date()).getTime()
        };

        storePosition(p);
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
        this._options.distanceFilter.range = distance;
    },
    disableDistanceFilter: function() {
        this._options.distanceFilter.enabled = false;
    },
    enableTimeFilter: function(span) {
        this._options.timeFilter.enabled = true;
        this._options.timeFilter.span = span;
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
        Location.debug && console.log("Getting distance for", p1, p2)
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(p2.coords.latitude - p1.latitude);
        var dLong = rad(p2.coords.longitude - p1.longitude);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(p1.latitude)) * Math.cos(rad(p2.coords.latitude)) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d; // returns the distance in meters
    } else {
        // TODO: console log or throw error? Return what here?
        return null;
    }
};

function isSecondsAway(date, seconds) {
    var now = new Date();
    Location.debug && console.log("Time Calc: " + (now.getTime() - date.getTime()));
    Location.debug && console.log(seconds + " Seconds: " + (seconds * 1000) + ' In Milliseconds');

    return !((now.getTime() - date.getTime()) <= (seconds * 1000))
};

