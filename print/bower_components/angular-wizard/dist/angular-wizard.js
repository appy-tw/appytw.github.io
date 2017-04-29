/**
 * Easy to use Wizard library for AngularJS
 * @version v0.4.0 - 2014-04-25 * @link https://github.com/mgonto/angular-wizard
 * @author Martin Gontovnikas <martin@gon.to>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
angular.module('templates-angularwizard', ['step.html', 'wizard.html']);

angular.module("step.html", []).run(["$templateCache", $templateCache => {
  $templateCache.put("step.html",
    "<section ng-show=\"selected\" ng-class=\"{current: selected, done: completed}\" class=\"step\" ng-transclude>\n" +
    "</section>");
}]);

angular.module("wizard.html", []).run(["$templateCache", $templateCache => {
  $templateCache.put("wizard.html",
    "<div>\n" +
    "    <div class=\"steps\" ng-transclude></div>\n" +
    "    <ul class=\"steps-indicator steps-{{steps.length}}\" ng-if=\"!hideIndicators\">\n" +
    "      <li ng-class=\"{default: !step.completed && !step.selected, current: step.selected && !step.completed, done: step.completed && !step.selected, editing: step.selected && step.completed}\" ng-repeat=\"step in steps\">\n" +
    "        <a ng-click=\"goTo(step)\">{{step.title || step.wzTitle}}</a>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "</div>\n" +
    "");
}]);

angular.module('mgo-angular-wizard', ['templates-angularwizard']);

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

angular.module('mgo-angular-wizard').directive('wizard', () => ({
    restrict: 'EA',
    replace: true,
    transclude: true,

    scope: {
        currentStep: '=',
        onFinish: '&',
        hideIndicators: '=',
        editMode: '=',
        name: '@'
    },

    templateUrl(element, attributes) {
      return attributes.template || "wizard.html";
    },

    controller: ['$scope', '$element', 'WizardHandler', function($scope, $element, WizardHandler) {

        WizardHandler.addWizard($scope.name || WizardHandler.defaultName, this);
        $scope.$on('$destroy', () => {
            WizardHandler.removeWizard($scope.name || WizardHandler.defaultName);
        });

        $scope.steps = [];

        $scope.$watch('currentStep', step => {
            if (!step) return;
            var stepTitle = $scope.selectedStep.title || $scope.selectedStep.wzTitle;
            if ($scope.selectedStep && stepTitle !== $scope.currentStep) {
                $scope.goTo(_.findWhere($scope.steps, {title: $scope.currentStep}));
            }

        });

        $scope.$watch('[editMode, steps.length]', () => {
            var editMode = $scope.editMode;
            if (_.isUndefined(editMode) || _.isNull(editMode)) return;

            if (editMode) {
                _.each($scope.steps, step => {
                    step.completed = true;
                });
            }
        }, true);

        this.addStep = step => {
            $scope.steps.push(step);
            if ($scope.steps.length === 1) {
                $scope.goTo($scope.steps[0]);
            }
        };

        $scope.goTo = step => {
            unselectAll();
            $scope.selectedStep = step;
            if (!_.isUndefined($scope.currentStep)) {
                $scope.currentStep = step.title || step.wzTitle;
            }
            step.selected = true;
        };

        function unselectAll() {
            _.each($scope.steps, step => {
                step.selected = false;
            });
            $scope.selectedStep = null;
        }

        this.next = function(draft) {
            var index = _.indexOf($scope.steps , $scope.selectedStep);
            if (!draft) {
                $scope.selectedStep.completed = true;
            }
            if (index === $scope.steps.length - 1) {
                this.finish();
            } else {
                $scope.goTo($scope.steps[index + 1]);
            }
        };

        this.goTo = step => {
            var stepTo;
            if (_.isNumber(step)) {
                stepTo = $scope.steps[step];
            } else {
                stepTo = _.findWhere($scope.steps, {title: step});
            }
            $scope.goTo(stepTo);
        };

        this.finish = () => {
            if ($scope.onFinish) {
                $scope.onFinish();
            }
        };

        this.cancel = this.previous = () => {
            var index = _.indexOf($scope.steps , $scope.selectedStep);
            if (index === 0) {
                throw new Error("Can't go back. It's already in step 0");
            } else {
                $scope.goTo($scope.steps[index - 1]);
            }
        };
    }]
}));

function wizardButtonDirective(action) {
    angular.module('mgo-angular-wizard')
        .directive(action, () => ({
        restrict: 'A',
        replace: false,
        require: '^wizard',

        link($scope, $element, $attrs, wizard) {

            $element.on("click", e => {
                e.preventDefault();
                $scope.$apply(() => {
                    $scope.$eval($attrs[action]);
                    wizard[action.replace("wz", "").toLowerCase()]();
                });
            });
        }
    }));
}

wizardButtonDirective('wzNext');
wizardButtonDirective('wzPrevious');
wizardButtonDirective('wzFinish');
wizardButtonDirective('wzCancel');

angular.module('mgo-angular-wizard').factory('WizardHandler', () => {
   var service = {};
   
   var wizards = {};
   
   service.defaultName = "defaultWizard";
   
   service.addWizard = (name, wizard) => {
       wizards[name] = wizard;
   };
   
   service.removeWizard = name => {
       delete wizards[name];
   };
   
   service.wizard = name => {
       var nameToUse = name;
       if (!name) {
           nameToUse = service.defaultName;
       }
       
       return wizards[nameToUse];
   };
   
   return service;
});
