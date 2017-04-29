angular.module('mgo-angular-wizard').directive('wzStep', () => ({
    restrict: 'EA',
    replace: true,
    transclude: true,

    scope: {
        wzTitle: '@',
        title: '@'
    },

    require: '^wizard',

    templateUrl(element, attributes) {
      return attributes.template || "step.html";
    },

    link($scope, $element, $attrs, wizard) {
        $scope.title = $scope.title || $scope.wzTitle;
        wizard.addStep($scope);
    }
}));
