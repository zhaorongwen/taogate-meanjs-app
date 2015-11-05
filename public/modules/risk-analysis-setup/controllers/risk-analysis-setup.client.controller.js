'use strict';

angular.module('risk-analysis-setup').controller('RiskAnalysisSetupController', ['$scope', '$stateParams', '$location',
	'Authentication','RiskCategories','RiskImpacts','RiskProbabilities','RiskSeverities','RiskSeverityAssignments', 'Risks', '$q', '_',
	function($scope, $stateParams, $location, Authentication, RiskCategories, RiskImpacts, RiskProbabilities, RiskSeverities,
			 RiskSeverityAssignments, Risks, $q, _) {

		// ------------- INIT -------------

		$scope.init = function(){
			RiskCategories.query(function(categories){
				RiskImpacts.query(function(impacts){
					RiskProbabilities.query(function(probabilities){
						RiskSeverities.query(function(severities){
							RiskSeverityAssignments.query(function(severityAssignments){
								Risks.query(function(risks){
									$scope.risks = risks;
									$scope.severityAssignments = severityAssignments;
									$scope.severities = severities;
									$scope.probabilities = probabilities;
									$scope.impacts = impacts;
									$scope.riskCategories = categories;
								});
							});
						});
					});
				});
			});
		};

		// ------- ROLES FOR BUTTONS ------

		var d = $q.defer();
		d.resolve(Authentication);

		d.promise.then(function(data){
			var obj = _.clone(data);
			$scope.userHasAuthorization = _.some(obj.user.roles, function(role){
				return role === 'superAdmin' || role === 'admin' || role === 'pmo';
			});
		});

// ---------------------------------------------------- RISKS & CATEGORIES --------------------------------------



		// ------------------- NG-SWITCH ---------------------

		$scope.switchRiskCategoryForm = {};

		$scope.selectRiskCategoryForm = function(category, string){
			if(string === 'view'){ $scope.switchRiskCategoryForm[category._id] = 'view';}
			if(string === 'new'){$scope.switchRiskCategoryForm[category._id] = 'new';}
			if(string === 'edit'){$scope.switchRiskCategoryForm[category._id] = 'edit';}
		};

		$scope.switchRiskForm = {};

		$scope.selectRiskForm = function(risk, string){
			if(string === 'view'){ $scope.switchRiskForm[risk._id] = 'view';}
			if(string === 'edit'){$scope.switchRiskForm[risk._id] = 'edit';}
		};

		// ----------------- REFRESH RISK CATEGORY LIST ------------

		$scope.riskCategoryList = function(){
			RiskCategories.query(function(categories){
				$scope.riskCategories = categories;
			});
		};

		// ------------------ CREATE RISK CATEGORY ----------------

		$scope.createRiskCategory = function() {
			$scope.error = null;

			var riskCategory = new RiskCategories ({
				name: 'New risk category',
				description: 'new category description',
				risks: []
			});

			riskCategory.$save(function(response) {
				$scope.riskCategoryList();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// ------------------- EDIT CATEGORY -----------------

		var originalEditRiskCategory = {};

		$scope.selectRiskCategory = function(category){
			originalEditRiskCategory[category._id] = _.clone(category);
			$scope.error = null;
			$scope.selectRiskCategoryForm(category, 'edit');
		};

		$scope.updateRiskCategory = function(category) {
			category.$update(function(response) {
				$scope.selectRiskCategoryForm(category, 'view');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.cancelEditRiskCategory = function(category){
			$scope.error = null;
			category.name = originalEditRiskCategory[category._id].name;
			category.description = originalEditRiskCategory[category._id].description;
			$scope.selectRiskCategoryForm(category, 'view');
		};

		// ------------------- REMOVE RISK CATEGORY -----------------

		$scope.removeRiskCategory = function(category) {
			$scope.error = null;
			category.$remove(function(response) {
				$scope.riskCategoryList();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};


		// ------------------ CREATE RISK ----------------

		$scope.createRisk = function(category) {
			$scope.error = null;

			var risk = new Risks ({
				name: 'New risk',
				description: 'New risk description'
			});

			risk.$save(function(riskRes) {
				category.risks.push(riskRes);
				category.$update(function(categoryRes) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// ------------------- EDIT RISK -----------------

		var originalEditRisk = {};

		$scope.selectEditRisk = function(category, risk){
			originalEditRisk[risk._id] = _.clone(risk);
			$scope.selectRiskForm(risk, 'edit');
		};

		$scope.updateRisk = function(category, risk) {
			Risks.update(risk, function(response) {
				$scope.selectRiskForm(risk, 'view');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.cancelEditRisk = function(risk){
			$scope.error = null;
			risk.name = originalEditRisk[risk._id].name;
			risk.description = originalEditRisk[risk._id].description;
			$scope.selectRiskForm(risk, 'view');
		};

		// ------------------- REMOVE RISK -----------------

		$scope.removeRisk = function(category, risk) {
			$scope.error = null;
			Risks.remove({},risk, function(res){
				category.risks = _.without(category.risks, risk);
			}, function(err){
				$scope.error = err.data.message;
			});
		};

// ------------------------------------------------------  IMPACTS ---------------------------------------------



        // ------------------- NG-SWITCH ---------------------

        $scope.switchImpactForm = {};

        $scope.selectImpactForm = function(impact, string){
            if(string === 'view'){ $scope.switchImpactForm[impact._id] = 'view';}
            if(string === 'new'){$scope.switchImpactForm[impact._id] = 'new';}
            if(string === 'edit'){$scope.switchImpactForm[impact._id] = 'edit';}
        };

        // ----------------- REFRESH IMPACT LIST ------------

        $scope.impactList = function(){
            RiskImpacts.query(function(impacts){
                $scope.impacts = impacts;
            });
        };

        // ------------------ CREATE IMPACT ----------------

        $scope.createImpact = function() {
            $scope.error = null;

            var impact = new RiskImpacts ({
                name: 'New impact',
                description: '',
                value: 0
            });

            impact.$save(function(response) {
                $scope.impactList();
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // ------------------- EDIT IMPACT -----------------

        var originalEditImpact = {};

        $scope.selectImpact = function(impact){
            originalEditImpact[impact._id] = _.clone(impact);
            $scope.error = null;
            $scope.selectImpactForm(impact, 'edit');
        };

        $scope.updateImpact = function(impact) {
            impact.$update(function(response) {
                $scope.selectImpactForm(impact, 'view');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.cancelEditImpact = function(impact){
            $scope.error = null;
            impact.name = originalEditImpact[impact._id].name;
            impact.description = originalEditImpact[impact._id].description;
            impact.value = originalEditImpact[impact._id].value;
            $scope.selectImpactForm(impact, 'view');
        };

        // ------------------- REMOVE IMPACT -----------------

        $scope.removeImpact = function(impact) {
            $scope.error = null;
            impact.$remove(function(response) {
                $scope.impactList();
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

// ------------------------------------------------------  PROBABILITIES ---------------------------------------------



        // ------------------- NG-SWITCH ---------------------

        $scope.switchProbabilityForm = {};

        $scope.selectProbabilityForm = function(probability, string){
            if(string === 'view'){ $scope.switchProbabilityForm[probability._id] = 'view';}
            if(string === 'new'){$scope.switchProbabilityForm[probability._id] = 'new';}
            if(string === 'edit'){$scope.switchProbabilityForm[probability._id] = 'edit';}
        };

        // ----------------- REFRESH PROBABILITY LIST ------------

        $scope.probabilityList = function(){
            RiskProbabilities.query(function(probabilities){
                $scope.probabilities = probabilities;
            });
        };

        // ------------------ CREATE PROBABILITY ----------------

        $scope.createProbability = function() {
            $scope.error = null;

            var probability = new RiskProbabilities ({
                name: 'New probability',
                description: '',
                value: 0
            });

            probability.$save(function(response) {
                $scope.probabilityList();
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // ------------------- EDIT PROBABILITY -----------------

        var originalEditProbability = {};

        $scope.selectProbability = function(probability){
            originalEditProbability[probability._id] = _.clone(probability);
            $scope.error = null;
            $scope.selectProbabilityForm(probability, 'edit');
        };

        $scope.updateProbability = function(probability) {
            probability.$update(function(response) {
                $scope.selectProbabilityForm(probability, 'view');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.cancelEditProbability = function(probability){
            $scope.error = null;
            probability.name = originalEditProbability[probability._id].name;
            probability.description = originalEditProbability[probability._id].description;
            probability.value = originalEditProbability[probability._id].value;
            $scope.selectProbabilityForm(probability, 'view');
        };

        // ------------------- REMOVE PROBABILITY -----------------

        $scope.removeProbability = function(probability) {
            $scope.error = null;
            probability.$remove(function(response) {
                $scope.probabilityList();
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };






// ---------------------------------------------------- SEVERITIES --------------------------------------

        // ------------------- DRAG AND DROP LISTENERS -------

        $scope.dragControlListeners = {
            //accept: function (sourceItemHandleScope, destSortableScope) {
            //    //override to determine drag is allowed or not. default is true.
            //    return true;
            //},
            //itemMoved: function (event) {
            //
            //},
            orderChanged: function(event) {
                for(var i = 0; i < $scope.severities.length; i++){
                    $scope.updateSeverity($scope.severities[i]);
                }
            }
            //containment: '#board',//optional param.
            //clone: true //optional param for clone feature.
        };

        /*
         event object - structure
         source:
         index: original index before move.
         itemScope: original item scope before move.
         sortableScope: original sortable list scope.
         dest:
         index: index after move.
         sortableScope: destination sortable scope.
         -------------
         sourceItemScope - the scope of the item being dragged.
         destScope - the sortable destination scope, the list.
         destItemScope - the destination item scope, this is an optional Param.(Must check for undefined).
         */


        // ------------------- NG-SWITCH SEVERITIES ---------------------

        $scope.selectSeverityForm = function(string){
            if(string === 'view'){ $scope.switchSeverityForm = 'view';}
            if(string === 'edit'){$scope.switchSeverityForm = 'edit';}
        };

        // ------------------- LIST OF SEVERITIES -----------------

        $scope.findSeverities = function() {
            RiskSeverities.query(function(severities){
                $scope.severities = severities;
            });
        };

        // ------------------- EDIT SEVERITY -----------------

        var originalSeverity;
        $scope.selectSeverity = function(severity){
            $scope.error = null;
            $scope.selectSeverityForm('view');
            $scope.severity = severity;
            originalSeverity = _.clone(severity);
        };

        $scope.updateSeverity = function(severity) {
            $scope.error = null;
            severity.position = _.indexOf($scope.severities, severity) + 1;
            severity.$update(function(response) {
                $scope.selectSeverityForm('view');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.cancelEditSeverity = function(severity){
            severity.name = originalSeverity.name;
            severity.value = originalSeverity.value;
            severity.description = originalSeverity.description;
            $scope.selectSeverityForm('view');
        };

        // ------------------- DELETE SEVERITY -----------------

        $scope.removeSeverity = function(severity) {
            $scope.error = null;
            severity.$remove(function(response) {
                $scope.severities = _.without($scope.severities, severity);
                for(var i = 0; i < $scope.severities.length; i++){
                    if($scope.severities[i].position > severity.position){
                        $scope.updateSeverity($scope.severities[i]);
                    }
                }
                $scope.severity = null;
                $scope.selectSeverityForm('view');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // ------------------- NEW -----------------

        $scope.createSeverity = function() {
            $scope.error = null;
            var severity = new RiskSeverities ({
                name: 'New priority value',
                value: 0,
                position: $scope.severities.length + 1
            });
            severity.$save(function(response) {
                $scope.findSeverities();
                $scope.selectSeverityForm(response._id, 'view');

            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };






    }
]);