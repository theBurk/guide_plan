msa = angular.module("msApp", ["ngResource"]);

msa.controller("MunterSystemCtrl", ["$scope", "MunterTrip",
    function($scope, MunterTrip) {
		// Munter System units		
        
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
        $scope.munterTrip = new MunterTrip({
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
		var tourName = $scope.munterTrip.tourName;
		var tourDate = $scope.munterTrip.tourDate;
		var utmDatum = $scope.munterTrip.utmDatum;
		
		
		//---------------------------------------------------------------------------------------------------------------
		// repopulate arrays when input changes
		//---------------------------------------------------------------------------------------------------------------
		$scope.change = function() {
			
			// transfer user inputs into arrays
			
			eastings[0] = $scope.munterTrip.easting0;
			eastings[1] = $scope.munterTrip.easting1;
			eastings[2] = $scope.munterTrip.easting2;
			eastings[3] = $scope.munterTrip.easting3;
			
			northings[0] = $scope.munterTrip.northing0;
			northings[1] = $scope.munterTrip.northing1;
			northings[2] = $scope.munterTrip.northing2;
			northings[3] = $scope.munterTrip.northing3;
			
			elevations[0] = $scope.munterTrip.elevation0;
			elevations[1] = $scope.munterTrip.elevation1;			
			elevations[2] = $scope.munterTrip.elevation2;			
			elevations[3] = $scope.munterTrip.elevation3;			
			
			actualDistances[1] = Number($scope.munterTrip.actualDistance1);
			actualDistances[2] = Number($scope.munterTrip.actualDistance2);
			actualDistances[3] = Number($scope.munterTrip.actualDistance3);
			
			methods[1] = $scope.munterTrip.method1;
			methods[2] = $scope.munterTrip.method2;
			methods[3] = $scope.munterTrip.method3;
			
			rates[1] = $scope.munterTrip.rate1;
			rates[2] = $scope.munterTrip.rate2;
			rates[3] = $scope.munterTrip.rate3;

			pitches[1] = $scope.munterTrip.pitch1;
			pitches[2] = $scope.munterTrip.pitch2;
			pitches[3] = $scope.munterTrip.pitch3;

			hours[1] = $scope.munterTrip.hour1;
			hours[2] = $scope.munterTrip.hour2;
			hours[3] = $scope.munterTrip.hour3;

			minutes[1] = $scope.munterTrip.minute1;
			minutes[2] = $scope.munterTrip.minute2;
			minutes[3] = $scope.munterTrip.minute3;
			
			aspects[1] = $scope.munterTrip.aspect1;
			aspects[2] = $scope.munterTrip.aspect2;
			aspects[3] = $scope.munterTrip.aspect3;
			
			notes[0] = $scope.munterTrip.note0;
			notes[1] = $scope.munterTrip.note1;
			notes[2] = $scope.munterTrip.note2;
			notes[3] = $scope.munterTrip.note3;
			
			
			// cycle through arrays, populate & make calculations
			for (var i=1; i<waypoints; i++)
			{		 
				elevationChanges[i] = $scope.calcElevationChange(i);		// calculate and populate elevation changes in meters
			
				linearDistances[i] = $scope.calcLinearDistance(i); 		// calculate & populate linear distances in meters based off of UTM
				
				distances[i] = $scope.distanceToUse(i);						// if user has entered an actual distance, use that for further calculations, if not use linear distance
				
				times[i] = $scope.calcTime(i);			// calculate & populate times in seconds	

				bearings[i] = $scope.calcBearing(i);		// calculate & populate bearings
			}
			
		};

		//--------------------------------------------------------------------------------------------------------------------------------------------
		// functions for populating arrays
		//--------------------------------------------------------------------------------------------------------------------------------------------
		
		// calculates linear distance between two UTM coordinates in meters
		$scope.calcLinearDistance = function(row) {
			return  Math.sqrt(Math.pow(eastings[row]-eastings[row-1],2)+Math.pow(northings[row]-northings[row-1],2));
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
		
		// calculates time for a row depending on method chosen
		$scope.calcTime = function(row) {
			switch(methods[row]) {
				case "munter":
					return (distances[row]/1000 + Math.abs(elevationChanges[row])/100) / (rates[row]/3600);
				case "chauvin":
					return (distances[row] + Math.abs(elevationChanges[row]))/60 * (rates[row]*60);
				case "tech":
					return pitches[row] * (rates[row]*60);
				case "manual":
					return hours[row]*3600 + minutes[row]*60;
			}
		};

		// decides whether to use calculated or user input distance
		$scope.distanceToUse = function(row) {
			if (actualDistances[row]) {
				return normalize(actualDistances[row], $scope.munterTrip.distanceUnit);
			}
			else {
				return linearDistances[row];
			}
		};
		
		// calculates elevation change in meters
		$scope.calcElevationChange = function(row) {
			return normalize(elevations[row]-elevations[row-1], $scope.munterTrip.elevationUnit);
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
			return Math.round(unNormalize(elevationGain, $scope.munterTrip.elevationUnit));
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
			return Math.round(Math.abs(unNormalize(elevationLoss, $scope.munterTrip.elevationUnit)));
		};

		$scope.setTotalDistance = function() {		
			totalDistance = 0;
			
			for (var i=1; i<waypoints; i++)
			{
				totalDistance = totalDistance + distances[i];
			}
		};
		
		$scope.getTotalDistance = function() {
			return Math.round(10*unNormalize(totalDistance, $scope.munterTrip.distanceUnit))/10; 
		};
		

		//-----------------------------------------------------------------------------------------------------------
		// functions to display calculated values on input page
		//-----------------------------------------------------------------------------------------------------------		
	
		// display distance for a particular row, formatted and converted to output units
		$scope.displayLinearDistance = function(row) {
			var dist = linearDistances[row];
			
			dist = unNormalize(dist, $scope.munterTrip.distanceUnit);
			
			if (dist<20) {
				return Math.round(10*dist)/10;
			}
			else {
				return Math.round(dist);
			}
		};
		
		$scope.showLinearDistance = function(row) {
			return eastings[row-1] && northings[row-1] && eastings[row] && northings[row]
			&& $scope.isValidUTM(eastings[row-1]) && $scope.isValidUTM(northings[row-1]) && $scope.isValidUTM(eastings[row]) && $scope.isValidUTM(northings[row]);
		};
	
		$scope.displayTime = function(row) {
			var h = Math.floor(times[row]/3600);
			var m = Math.round((times[row] - 3600*h)/60);
		
			return h<(7*24) ? [h + ":", (m < 10 ? "0" : "") + m].join("") : "way too much...";			
		};
		
		$scope.showTime = function(row) {
			
			if (!methods[row]) {
				return false;
			};
			
			switch(methods[row]) {			
				case "munter":
					return distances[row] && elevations[row] && elevations[row-1] && rates[row]
							&& $scope.isValidElevation(elevations[row]) && $scope.isValidElevation(elevations[row-1]) && $scope.isValidRate(rates[row]);
				case "chauvin":
					return distances[row] && elevations[row] && elevations[row-1] && rates[row]
							&& $scope.isValidElevation(elevations[row]) && $scope.isValidElevation(elevations[row-1]) && $scope.isValidRate(rates[row]);
				case "tech":
					return pitches[row] && rates[row] 
							&& $scope.isValidPitches(pitches[row]) && $scope.isValidRate(rates[row]);
				case "manual":
					return hours[row] && minutes[row]
						&& $scope.isValidHours(hours[row]) && $scope.isValidMinutes(minutes[row]);
			}
			
			return showMethodInputs[row];
		};
		
		
		//-----------------------------------------------------------------------------------------
		// functions related to methods input row
		//-----------------------------------------------------------------------------------------
		
		// set row to show method input for
		$scope.setShowMethodInputs = function(row){
			for (var i=1; i<waypoints; i++)
			{
				if (i==row) {
					showMethodInputs[i] = true;
				}
				else {
					showMethodInputs[i] = false;
				}
			}
		};
		
		$scope.showRateInput = function(row) {
			var show;
			
			switch(methods[row]) {
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
			
			return show && showMethodInputs[row];
		};
		
		
		$scope.showPitchesInput = function(row) {
			var show;
			
			switch(methods[row]) {
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
			
			return show && showMethodInputs[row];
		};
		
		
		$scope.showTimeInput = function(row) {
			var show;
			
			switch(methods[row]) {
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
			
			return show && showMethodInputs[row];
		};
		
		
		$scope.rateUnits = function(row) {
			switch(methods[row]) {
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
			return $scope.isValidRate($scope.munterTrip.rate) && $scope.isValidDistance($scope.munterTrip.distance) && $scope.isValidElevation($scope.munterTrip.elevation) && $scope.isValidPitches($scope.munterTrip.pitches);
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
//  into some sort of MunterTrip model, or something like that. We've already defined the components above (elevation, units, distance, etc.)
//  and now we need to add some structure. Even though this is going to get confusing, its utility will become apparent when we start
//  doing things like creating lists of MunterTrips, saving them to a database, loading them from a database (lookup CRUD), editing them,
//  etc.
// For the time being, don't worry about "$resource"...that will come up later when we integrate this with a database for persistence
msa.factory("MunterTrip", ["$resource",
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