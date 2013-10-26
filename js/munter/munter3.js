msa = angular.module("msApp", ["ngResource"]);

msa.controller("GuidePlanCtrl", ["$scope", "waypoint",
    function($scope, waypoint) {
		$scope.waypoints = [];
		// Munter System units		
		
		 $scope.addWaypoint = function() {
            // should use AngularJS Service here to create a new model
            // ...but that's for later...
            $scope.waypoints.push({});
        };

		
		$scope.elevationUnits = {
            m: "m",
            ft: "ft"
        };
		
		$scope.distanceUnits = {
			mi: "mi",
			km: "km"
		};

		$scope.methods = {
			munter: "munter",
			chauvin: "chauvin",
			technical: "tech",
			manual: "manual"
		};
		
		
        // balling out of control with a model!
        // default selected...
        $scope.waypoint = new waypoint({
            elevationUnit: $scope.elevationUnits.ft,
            distanceUnit: $scope.distanceUnits.mi,
        });
		
		
		//----------------------------------------------------------------------------------------------------------
		// declare arrays
		//----------------------------------------------------------------------------------------------------------
		var waypoints = 4;
		var eastings = new Array();		
		var northings = new Array();
		var elevations = new Array();
		var elevationChanges = new Array();
		var linearDistances = new Array();
		var actualDistances = new Array();
		var distances = new Array();
		var methods = new Array();
		var showMethodInputs = new Array();
		var rates = new Array();
		var pitches = new Array();
		var hours = new Array();
		var minutes = new Array();
		var times = new Array();
		var bearings = new Array();
		var aspects = new Array();
		var notes = new Array();
		var tourName = $scope.waypoint.tourName;
		var tourDate = $scope.waypoint.tourDate;
		var utmDatum = $scope.waypoint.utmDatum;
		
		
		//---------------------------------------------------------------------------------------------------------------
		// repopulate arrays when input changes
		//---------------------------------------------------------------------------------------------------------------
		$scope.change = function() {
			
			// transfer user inputs into arrays
			
			eastings[0] = $scope.waypoint.easting0;
			eastings[1] = $scope.waypoint.easting1;
			eastings[2] = $scope.waypoint.easting2;
			eastings[3] = $scope.waypoint.easting3;
			
			northings[0] = $scope.waypoint.northing0;
			northings[1] = $scope.waypoint.northing1;
			northings[2] = $scope.waypoint.northing2;
			northings[3] = $scope.waypoint.northing3;
			
			elevations[0] = $scope.waypoint.elevation0;
			elevations[1] = $scope.waypoint.elevation1;			
			elevations[2] = $scope.waypoint.elevation2;			
			elevations[3] = $scope.waypoint.elevation3;			
			
			actualDistances[1] = Number($scope.waypoint.actualDistance1);
			actualDistances[2] = Number($scope.waypoint.actualDistance2);
			actualDistances[3] = Number($scope.waypoint.actualDistance3);
			
			methods[1] = $scope.waypoint.method1;
			methods[2] = $scope.waypoint.method2;
			methods[3] = $scope.waypoint.method3;
			
			rates[1] = $scope.waypoint.rate1;
			rates[2] = $scope.waypoint.rate2;
			rates[3] = $scope.waypoint.rate3;

			pitches[1] = $scope.waypoint.pitch1;
			pitches[2] = $scope.waypoint.pitch2;
			pitches[3] = $scope.waypoint.pitch3;

			hours[1] = $scope.waypoint.hour1;
			hours[2] = $scope.waypoint.hour2;
			hours[3] = $scope.waypoint.hour3;

			minutes[1] = $scope.waypoint.minute1;
			minutes[2] = $scope.waypoint.minute2;
			minutes[3] = $scope.waypoint.minute3;
			
			aspects[1] = $scope.waypoint.aspect1;
			aspects[2] = $scope.waypoint.aspect2;
			aspects[3] = $scope.waypoint.aspect3;
			
			notes[0] = $scope.waypoint.note0;
			notes[1] = $scope.waypoint.note1;
			notes[2] = $scope.waypoint.note2;
			notes[3] = $scope.waypoint.note3;
			
			
//			// cycle through arrays, populate & make calculations
//			for (var i=1; i<waypoints; i++)
//			{		 
//				elevationChanges[i] = $scope.calcElevationChange(i);		// calculate and populate elevation changes in meters
//			
//				linearDistances[i] = $scope.calcLinearDistance(i); 		// calculate & populate linear distances in meters based off of UTM
//				
//				distances[i] = $scope.distanceToUse(i);						// if user has entered an actual distance, use that for further calculations, if not use linear distance
//				
//				times[i] = $scope.calcTime(i);			// calculate & populate times in seconds	
//
//				bearings[i] = $scope.calcBearing(i);		// calculate & populate bearings
//			}
			
		};

		//--------------------------------------------------------------------------------------------------------------------------------------------
		// functions for populating arrays
		//--------------------------------------------------------------------------------------------------------------------------------------------
		
		// calculates linear distance between two UTM coordinates in meters
		$scope.calcLinearDistance = function(i) {
			// ##################################################
			// PG: I added this to fix an error. If you only have one waypoint (i.e. "i == 0") you can't calculate distance!
			if ($scope.waypoints.length < 2) {
				// not sure what you want to return here...
				return null;  
			}
			// ##################################################

			return  Math.sqrt(Math.pow($scope.waypoints[i].easting-$scope.waypoints[i-1].easting,2)+Math.pow($scope.waypoints[i].northing-$scope.waypoints[i-1].northing,2));
		};
			
		// calculates bearing between two UTM coordinates in degrees
		$scope.calcBearing = function(row) {
			var angle;
			angle = Math.atan((eastings[row]-eastings[row-1])/(northings[row]-northings[row-1]));  	// in radians
			
			angle = angle*180/Math.PI;  																					// in degrees
					
			if (northings[row-1]>northings[row]) {																		// adjust so 0>=angle>360
				angle = angle + 180;
			}
			else if (eastings[row-1]>eastings[row]) {
				angle=angle+360;
			}
			
			angle = Math.round(angle);
			
			return angle;
		};
		
		// calculates time for a row depending on method chosen in seconds
		$scope.calcTime = function(i) {
			switch($scope.waypoints[i].method) {
				case "munter":
					return ($scope.distance(i)/1000 + Math.abs($scope.elevationChange(i)/100)) / ($scope.waypoints[i].rate/3600);
				case "chauvin":
					return ($scope.distance(i)) + Math.abs($scope.elevationChange(i)/60) * ($scope.waypoints[i].rate*60);
				case "tech":
					return $scope.waypoints[i].pitches * ($scope.waypoints[i].rate*60);
				case "manual":
					return $scope.waypoints[i].hours*3600 + $scope.waypoints[i].minutes*60;
			}
		};

		// decides whether to use calculated or user input distance and returns distance to use in meters
		$scope.distance = function(i) {
			if ($scope.waypoints[i].actualDistance) {
				return normalize($scope.waypoints[i].actualDistance, $scope.waypoint.distanceUnit);
			}
			else {
				return $scope.calcLinearDistance(i);
			}
		};
		
		// calculates elevation change in meters
		$scope.elevationChange = function(i) {
			return normalize($scope.waypoints[i].elevation - $scope.waypoints[i-1].elevation, $scope.waypoint.elevationUnit);
		};
		
		
		
		//---------------------------------------------------------------------------------------------------------------------------------------------
		// setters & getters for information for trip summary page
		//---------------------------------------------------------------------------------------------------------------------------------------------
		var maxElevation;
		var minElevation;
		var elevationGain;
		var elevationLoss;
		var totalDistance;
		
		$scope.setMaxElevation = function() {
			maxElevation = 0;
			maxElevation = Math.max.apply(Math, elevations.filter(Number));
		};
		
		$scope.getMaxElevation = function() {
			return maxElevation;
		};
		
		$scope.setMinElevation = function() {
			minElevation = maxAllowedElevation;
			minElevation = Math.min.apply(Math, elevations.filter(Number));
		};
		
		$scope.getMinElevation = function() {
			return minElevation;
		};
		
		$scope.setElevationGain = function() {		
			elevationGain = 0;
			
			for (var i=1; i<waypoints; i++)
			{
				if (elevationChanges[i] > 0) {
					elevationGain = elevationGain + elevationChanges[i];
				}
			}
		};
		
		$scope.getElevationGain = function() {
			return Math.round(unNormalize(elevationGain, $scope.waypoint.elevationUnit));
		};
		
		$scope.setElevationLoss = function() {		
			elevationLoss = 0;
			
			for (var i=1; i<waypoints; i++)
			{
				if (elevationChanges[i] < 0) {
					elevationLoss = elevationLoss + elevationChanges[i];
				}
			}
		};
		
		$scope.getElevationLoss = function() {
			return Math.round(Math.abs(unNormalize(elevationLoss, $scope.waypoint.elevationUnit)));
		};

		$scope.setTotalDistance = function() {		
			totalDistance = 0;
			
			for (var i=1; i<waypoints; i++)
			{
				totalDistance = totalDistance + distances[i];
			}
		};
		
		$scope.getTotalDistance = function() {
			return Math.round(10*unNormalize(totalDistance, $scope.waypoint.distanceUnit))/10; 
		};
		

		//-----------------------------------------------------------------------------------------------------------
		// functions to display calculated values on input page
		//-----------------------------------------------------------------------------------------------------------		
	
		// display distance for a particular row, formatted and converted to output units
		$scope.prettyDistance = function(val) {
			var dist = unNormalize(val, $scope.waypoint.distanceUnit);
			
			if (dist<20) {
				return Math.round(10*dist)/10;
			}
			else {
				return Math.round(dist);
			}
		};
		
		$scope.showLinearDistance = function(i) {
			if (i==0) {
				return false;
			}
			else {
				return $scope.waypoints[i-1].easting && $scope.waypoints[i-1].northing && $scope.waypoints[i].easting && $scope.waypoints[i].northing
				&& $scope.isValidUTM($scope.waypoints[i-1].easting) && $scope.isValidUTM($scope.waypoints[i-1].northing) && $scope.isValidUTM($scope.waypoints[i].easting) && $scope.isValidUTM($scope.waypoints[i].northing);
			}	
		};
	
		$scope.prettyTime = function(val) {
			var h = Math.floor(val/3600);
			var m = Math.round((val - 3600*h)/60);
		
			return h<(7*24) ? [h + ":", (m < 10 ? "0" : "") + m].join("") : "way too much...";			
		};
		
		$scope.showTime = function(i) {
		
			if (!$scope.waypoints[i].method) {
				return false;
			};
			
			switch($scope.waypoints[i].method) {			
				case "munter":
					return ($scope.showLinearDistance(i) || $scope.waypoints[i].actualDistance) && $scope.waypoints[i].elevation && $scope.waypoints[i-1].elevation && $scope.waypoints[i].rate
							&& $scope.isValidElevation($scope.waypoints[i].elevation) && $scope.isValidElevation($scope.waypoints[i-1].elevation) && $scope.isValidRate($scope.waypoints[i].rate);
				case "chauvin":
					return ($scope.showLinearDistance(i) || $scope.waypoints[i].actualDistance) && $scope.waypoints[i].elevation && $scope.waypoints[i-1].elevation && $scope.waypoints[i].rate
							&& $scope.isValidElevation($scope.waypoints[i].elevation) && $scope.isValidElevation($scope.waypoints[i-1].elevation) && $scope.isValidRate($scope.waypoints[i].rate);
				case "tech":
					return $scope.waypoints[i].pitches && $scope.waypoints[i].rate 
							&& $scope.isValidPitches($scope.waypoints[i].pitches) && $scope.isValidRate($scope.waypoints[i].rate);
				case "manual":
					return $scope.waypoints[i].hours && $scope.waypoints[i].minutes
						&& $scope.isValidHours($scope.waypoints[i].hours) && $scope.isValidMinutes($scope.waypoints[i].minutes);
			}
			
			return showMethodInputs[i];
		};
		
		
		//-----------------------------------------------------------------------------------------
		// functions related to methods input row
		//-----------------------------------------------------------------------------------------
		
		$scope.showRateInput = function(i) {
			var show;
			
			switch($scope.waypoints[i].method) {
				case "munter":
					show = true;
					break;
				case "chauvin":
					show = true;
					break;
				case "tech":
					show = true;
					break;
				case "manual":
					show = false;
					break;
			}

			return show && $scope.waypoints[i].showMethodInput;
		};
		
		
		$scope.showPitchesInput = function(i) {
			var show;
			
			switch($scope.waypoints[i].method) {
				case "munter":
					show = false;
					break;
				case "chauvin":
					show = false;
					break;
				case "tech":
					show = true;
					break;
				case "manual":
					show = false;
					break;
			}
			
			return show && $scope.waypoints[i].showMethodInput;;
		};
		
		
		$scope.showTimeInput = function(i) {
			var show;
			
			switch($scope.waypoints[i].method) {
				case "munter":
					show =  false;
					break;
				case "chauvin":
					show =  false;
					break;
				case "tech":
					show =  false;
					break;
				case "manual":
					show =  true;
					break;
			}
			
			return show && $scope.waypoints[i].showMethodInput;;
		};
		
		
		$scope.rateUnits = function(i) {
			switch($scope.waypoints[i].method) {
				case "munter":
					return "units / hr";
				case "chauvin":
					return "min / 60m";
				case "tech":
					return "min / pitch";
				case "manual":
					return "";
			}
		};
			

		
		// --------------------------------------------------
		//  Data validation
		// --------------------------------------------------
		
		var maxAllowedRate = 300;
		var maxAllowedDistance = 50000;			
		var maxAllowedElevation = 50000;			
		var maxAllowedPitches = 100;	
		var maxAllowedUTM = 10000000;
		var maxAllowedHours = 100;
		var maxAllowedMinutes = 600;

		
		// test if inputs is valid
		$scope.isValidRate = function(val) {
			return !val || val=="." || (isNumber(val) && val>0 && val<=maxAllowedRate);
		};
		
		$scope.isValidUTM = function(val) {
			return !val || (isNumber(val) && val>0 && val<=maxAllowedUTM);
		};
		
		$scope.isValidDistance = function(val) {
            return !val || val=="." ||  (isNumber(val) && val>=0 && val<=maxAllowedDistance);
        };
		
		$scope.isValidElevation = function(val) {
            return !val || val=="."  || val=="-" ||  (isNumber(val) && val<=maxAllowedElevation);
        };
		
		$scope.isValidPitches = function(val) {
            return !val || val=="." ||  (isNumber(val) && val>=0 && val<=maxAllowedPitches);
        };		
		
		$scope.isValidHours = function(val) {
            return !val || val=="." ||  (isNumber(val) && val>=0 && val<=maxAllowedHours);
        };
		
		$scope.isValidMinutes = function(val) {
            return !val || val=="." ||  (isNumber(val) && val>=0 && val<=maxAllowedMinutes);
        };
		
		$scope.isValidEverything = function(){
			return $scope.isValidRate($scope.waypoint.rate) && $scope.isValidDistance($scope.waypoint.distance) && $scope.isValidElevation($scope.waypoint.elevation) && $scope.isValidPitches($scope.waypoint.pitches);
		};

		
    }
]);

// --------------------------------------------------
//  Angular Models
// --------------------------------------------------
// Ok, so here's where things get a bit more complicated...
// Earlier (above) I was touting the importance of MVC (Model-View-Controller) or MVVM (Model-View-View-Model) architectures. Cool.
// So far we've only dealt with Views and Controllers; so what about Models? We've sort of hacked a model in place by using $scope,
//  which is fine, but that doesn't scale. In essence, we want to encapsulate all of the parameters that define a time calculation
//  into some sort of waypoint model, or something like that. We've already defined the components above (elevation, units, distance, etc.)
//  and now we need to add some structure. Even though this is going to get confusing, its utility will become apparent when we start
//  doing things like creating lists of waypoints, saving them to a database, loading them from a database (lookup CRUD), editing them,
//  etc.
// For the time being, don't worry about "$resource"...that will come up later when we integrate this with a database for persistence
msa.factory("waypoint", ["$resource",
    function($resource) {
        return $resource("some/RESTful/url/:id", {id: "@id"});
    }
]);

// --------------------------------------------------
//  Angular Filters
// --------------------------------------------------
// Sweet! A simple display function for time! Notice that despite the fancy declaration as an AngularJS Filter, this is really just a function!
// Also note that, because we've "jammed" this filter onto our "msa" object (i.e. our AngularJS Module/Application), it is available anywhere
//  within our application and can be reused.
msa.filter("prettyTime", function(){
    return function(time) {
        var h = Math.floor(time/3600);
        var m = Math.round((time - 3600*h)/60);
        // returns a string of the format: hh:mm:ss
        // the "join(<delimiter>)" function is a sweet native JS function on Arrays (things liek [el0, el1, ..., elN])
        //   that concats the Array elements separated by the <delimiter> string that you can specify (in this case, a colon ":")
        return h<(7*24) ? [h + " hr ", (m < 10 ? "0" : "") + m + "  min"].join("") : "way too much...";
    };
});

// --------------------------------------------------
//  Utils
// --------------------------------------------------
// a function to convert from miles/kilometers/feet to meters
function normalize(value, units) {
	switch(units) {
		case "mi":
			return value * 1609;
		case "km":
			return value * 1000;
		case "ft":
			return value / 3.281;
		case "m":
			return value;
	}
};

function unNormalize(value, units) {
	switch(units) {
		case "mi":
			return value / 1609;
		case "km":
			return value / 1000;
		case "ft":
			return value * 3.281;
		case "m":
			return value;
	}
};


function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n) ;
}

// --------------------------------------------------
//  Mucking Around!
// --------------------------------------------------
msa.controller("BurkCtrl", ["$scope",
    function($scope) {
        $scope.mOptions = {
            1: "blue",
            2: "red",
            3: "green"
        };
    }
]);