mA = angular.module("msApp2", []);

mA.controller("MainCtrl", ["$scope",
    function($scope) {
        $scope.models = [];

        // add a model!
        $scope.addModel = function() {
            // should use AngularJS Service here to create a new model
            // ...but that's for later...
            $scope.models.push({});
        };

        $scope.save = function(model){
            console.log("SAVE: ", model);
            model.saved = true;
        };

        $scope.delete = function(model){
            console.log("DELETE: ", model);
            var idx = $scope.models.indexOf(model);
            if (idx > -1) {
                $scope.models.splice(idx, 1);
            }
        };

        $scope.propTotal = function() {
            var s = 0;
            for(var i = 0; i < $scope.models.length; i++) {
                // check if is numeric...
                v = parseInt($scope.models[i].prop, 10);
                if (isNaN(v)) {
                    return "NaN";
                } else {
                    s += v;
                }
            }
            return s;
        };

        // NOTE: this gets called everytime the value of "propTotal()" changes.
        $scope.$watch("propTotal()", function() {
            // alias
            models = $scope.models;
            $scope.diffs = [];
            for(var i = 0; i < models.length; i++) {
                $scope.diffs.push(i > 0 ? (models[i].prop - models[i-1].prop) : "n/a");
            }
        });
    }
]);