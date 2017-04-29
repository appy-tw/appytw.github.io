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
