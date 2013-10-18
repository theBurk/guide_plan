mA = angular.module("msApp2", []);

mA.controller("RepeatModelCtrl", ["$scope",
    function($scope) {
        $scope.models = [];

        // add a model!
        $scope.addModel = function() {
            // should use AngularJS Service here to create a new model
            // ...but that's for later...
            $scope.models.push({
                // name: "",
                // prop1: "",
                // prop2: ""
            });
        };

        $scope.save = function(model){
            console.log("SAVE: ", model);
            model.saved = true;
        };

        $scope.delete = function(model){
            console.log("DELETE: ", model);
            // JS method for removing an element from an Array is "pop(...)"
            $scope.models.pop(model);
        };
    }
]);