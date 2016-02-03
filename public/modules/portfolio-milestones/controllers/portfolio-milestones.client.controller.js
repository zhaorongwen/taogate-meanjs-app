'use strict';

angular.module('portfolio-milestones').controller('PortfolioMilestonesController', ['$scope', '$stateParams', '$location', '$q', '_', 'Authentication',
	'Portfolios', 'Projects', 'ProjectMilestones', 'PortfolioMilestones', 'GateProcesses',
	'MilestoneStates', 'PortfolioMilestoneTypes', 'ProjectMilestoneTypes', 'LogStatusIndicators',
	'$modal', '$log',
	function($scope, $stateParams, $location, $q, _, Authentication,
			 Portfolios, Projects, ProjectMilestones, PortfolioMilestones, GateProcesses,
             MilestoneStates, PortfolioMilestoneTypes, ProjectMilestoneTypes, LogStatusIndicators, $modal, $log) {

		var vm = this;

		// ------------- INIT -------------

		vm.initError = [];

		vm.init = function(){

			//Projects.query({'selection.selectedForDelivery': true}, function(projects){
			//	vm.projects = _.filter(projects, function(project){return project.process !== null;});
			//}, function(err){
			//	vm.initError.push(err.data.message);
			//});

			Portfolios.query(function(portfolios){
				//vm.portfolios = portfolios;
				vm.portfolioTrees = createNodeTrees(portfolios);
			}, function(err){
				vm.initError.push(err.data.message);
			});

			GateProcesses.query(function(gateProcesses){
				vm.gateProcesses = gateProcesses;
			}, function(err){
				vm.initError.push(err.data.message);
			});

            MilestoneStates.query(function(milestoneStates){
				vm.milestoneStates = milestoneStates;
			}, function(err){
				vm.initError.push(err.data.message);
			});

            PortfolioMilestoneTypes.query(function(portfolioMilestoneTypes){
				vm.portfolioMilestoneTypes = portfolioMilestoneTypes;
			}, function(err){
				vm.initError.push(err.data.message);
			});

            ProjectMilestoneTypes.query(function(projectMilestoneTypes){
				vm.projectMilestoneTypes = projectMilestoneTypes;
			}, function(err){
				vm.initError.push(err.data.message);
			});

			LogStatusIndicators.query(function(logStatusIndicators){
				vm.logStatuses = logStatusIndicators;
			}, function(err){
				vm.initError.push(err.data.message);
			});

		};

		// ------- ROLES FOR BUTTONS ------

		var d = $q.defer();
		d.resolve(Authentication);

		d.promise.then(function(data){
			var obj = _.clone(data);
			vm.userHasAuthorization = _.some(obj.user.roles, function(role){
				return role === 'superAdmin' || role === 'admin' || role === 'pmo';
			});
		});


		// ------ TREE RECURSIONS -----------

		var createNodeTrees = function(strategicNodes){
			var nodeTrees = [];
			strategicNodes.forEach(function(node){
				if(node.parent === null){
					nodeTrees.push(
						{node : node, nodeTrees : []}
					);
				}
			});
			var recursionOnNodeTrees = function(nodeTrees){
				nodeTrees.forEach(function(node){
					strategicNodes.forEach(function(strategicNode){
						if(strategicNode.parent !== null){
							if(node.node._id === strategicNode.parent){
								node.nodeTrees.push(
									{node : strategicNode, nodeTrees : []}
								);
							}
						}
					});
					recursionOnNodeTrees(node.nodeTrees);
				});
			};
			recursionOnNodeTrees(nodeTrees);
			return nodeTrees;
		};


		// ------------------- NG-SWITCH ---------------------


		vm.switchHeaderForm = {};
		vm.selectHeaderForm = function(string, portfolioMilestone){
			if(string === 'view'){ vm.switchHeaderForm[portfolioMilestone._id] = 'view';}
			if(string === 'edit'){vm.switchHeaderForm[portfolioMilestone._id] = 'edit';}
		};

        vm.switchStatusForm = {};
        vm.selectStatusForm = function(string, portfolioMilestone){
            if(string === 'view'){ vm.switchStatusForm[portfolioMilestone._id] = 'view';}
            if(string === 'edit'){vm.switchStatusForm[portfolioMilestone._id] = 'edit';}
        };

		vm.switchAssociatedProjectMilestoneForm = {};
		vm.selectAssociatedProjectMilestoneForm = function(string, portfolioMilestone){
			if(string === 'view'){ vm.switchAssociatedProjectMilestoneForm[portfolioMilestone._id] = 'view';}
			if(string === 'edit'){vm.switchAssociatedProjectMilestoneForm[portfolioMilestone._id] = 'edit';}
		};


		// ------------------- UTILITIES ---------------------

		var allowNull = function(obj){
			if(obj){return obj._id;} else {return null;}
		};

		vm.sortMilestones = function(milestone) {
			return new Date(milestone.statusReview.currentRecord.estimateDeliveryDate);
		};

		vm.sortByCreated = function(object){
			return new Date(object.created);
		};


		// ------------------- OTHER VARIABLES ---------------------

		vm.portfolioMilestoneDetails = 'header';

		// ------------- SELECT VIEW PORTFOLIO ------------

		var originalPortfolioMilestone = {};

		vm.selectPortfolio = function(portfolio) {
			vm.error = {};
			vm.selectedPortfolio = null;
			vm.portfolioMilestones = null;

			vm.selectedPortfolioMilestone = null;
			originalPortfolioMilestone = {};

			vm.selectedPortfolio = portfolio;

			PortfolioMilestones.query({
				portfolio: portfolio._id
			}, function (res) {
				vm.portfolioMilestones = res;
			}, function (err) {
				vm.error = err.data.message;
			});
		};

		vm.cancelViewPortfolio = function(){
			vm.error = null;
			vm.selectedPortfolio = null;
			vm.portfolioMilestones = null;

		};



		// ------------- NEW PROJECT CHANGE REQUEST ------------


		vm.openNewPortfolioCRRaisedOnDate = function($event){
			$event.preventDefault();
			$event.stopPropagation();
			vm.newPortfolioCRRaisedOnDateOpened = true;
		};

		vm.newPortfolioMilestone = {};

		vm.createNewPortfolioMilestone = function(portfolio){
			var newPortfolioMilestone = new PortfolioMilestones({
				portfolio: portfolio._id,
				type : vm.newPortfolioMilestone.type,
				name : vm.newPortfolioMilestone.name
			});
			newPortfolioMilestone.$save(function(res) {
				// Clear new form
				vm.newPortfolioMilestone = {};
				// Refresh the list of milestone
				vm.portfolioMilestones.push(res);
				// Select in view mode the new review
				vm.selectPortfolioMilestone(portfolio, res);
				// Close new review form done directly in the view's html
			}, function(err) {
				vm.error = err.data.message;
			});
		};

		vm.cancelNewPortfolioMilestone = function(){
			vm.newPortfolioMilestone = {};
		};


		// ------------- SELECT MILESTONE ------------

		var portfolioMilestoneFromList = {};
		// Required to update the list when milestones details
		// in the details pane that are also reported in the list of milestone requests

		vm.selectPortfolioMilestone = function(portfolio, portfolioMilestone){
			$q.all([
				PortfolioMilestones.get({
					portfolioMilestoneId:portfolioMilestone._id }).$promise,
				PortfolioMilestones.getAvailableProjectMilestones(
					{ portfolioId : portfolio._id, portfolioMilestoneId: portfolioMilestone._id }).$promise,
				Projects.query(
					{ portfolio : portfolio._id }).$promise
			]).then(function(data) {
				portfolioMilestoneFromList[portfolioMilestone._id] = portfolioMilestone;
				originalPortfolioMilestone[portfolioMilestone._id] = _.cloneDeep(data[0]);
				vm.selectedPortfolioMilestone = data[0];
				vm.availableProjectMilestones = data[1];
				vm.availableProjects = data[2];
			}, function(err){
				vm.error = err.data.message;
			});

		};



		// -------------------------------------------------------- HEADER -------------------------------------------------


		vm.editHeader = function(portfolioMilestone){
			vm.selectHeaderForm('edit', portfolioMilestone);
		};

		vm.saveEditHeader = function(portfolioMilestone){
			// Clean-up deepPopulate
			var copyPortfolioMilestone = _.cloneDeep(portfolioMilestone);
			copyPortfolioMilestone.portfolio = _.get(copyPortfolioMilestone.portfolio, '_id');
			// Update server header
			PortfolioMilestones.updateHeader(
				{
					portfolioMilestoneId : copyPortfolioMilestone._id
				}, copyPortfolioMilestone,
				function(res){
					// Update details pane view with new saved details
					originalPortfolioMilestone[portfolioMilestone._id].name = portfolioMilestone.name;
					originalPortfolioMilestone[portfolioMilestone._id].description = portfolioMilestone.description;
					originalPortfolioMilestone[portfolioMilestone._id].state = portfolioMilestone.state;
					originalPortfolioMilestone[portfolioMilestone._id].type = portfolioMilestone.type;
					// Update list of reviews with new date / name
					portfolioMilestoneFromList[portfolioMilestone._id].name = portfolioMilestone.name;
					// Close edit header form and back to view
					vm.selectHeaderForm('view', portfolioMilestone);
				},
				function(err){vm.error = err.data.message;}
			);
		};

		vm.cancelEditHeader = function(portfolioMilestone){
			portfolioMilestone.name = originalPortfolioMilestone[portfolioMilestone._id].name;
			portfolioMilestone.description = originalPortfolioMilestone[portfolioMilestone._id].description;
			portfolioMilestone.state = originalPortfolioMilestone[portfolioMilestone._id].state;
            portfolioMilestone.type = originalPortfolioMilestone[portfolioMilestone._id].type;
			vm.selectHeaderForm('view', portfolioMilestone);
		};


		vm.deletePortfolioMilestone = function(portfolioMilestone){
			PortfolioMilestones.remove(
				{portfolioMilestoneId: portfolioMilestone._id},
				portfolioMilestone, function(res){
					vm.portfolioMilestones = _.without(vm.portfolioMilestones, _.find(vm.portfolioMilestones, _.matchesProperty('_id',portfolioMilestone._id)));
					vm.cancelNewPortfolioMilestone();
					vm.selectedPortfolioMilestone = null;
					originalPortfolioMilestone = {};
				}, function(err){
					vm.error = err.data.message;
				});
		};


        // -------------------------------------------------------- STATUS -------------------------------------------------

        vm.baselineDeliveryDateOpened = {};
        vm.openBaselineDeliveryDate = function(portfolioMilestone, $event){
            $event.preventDefault();
            $event.stopPropagation();
            vm.baselineDeliveryDateOpened[portfolioMilestone._id] = true;
        };

        vm.estimateDeliveryDateOpened = {};
        vm.openEstimateDeliveryDate = function(portfolioMilestone, $event){
            $event.preventDefault();
            $event.stopPropagation();
            vm.estimateDeliveryDateOpened[portfolioMilestone._id] = true;
        };

        vm.actualDeliveryDateOpened = {};
        vm.openActualDeliveryDate = function(portfolioMilestone, $event){
            $event.preventDefault();
            $event.stopPropagation();
            vm.actualDeliveryDateOpened[portfolioMilestone._id] = true;
        };

        vm.editStatus = function(portfolioMilestone){
            vm.selectStatusForm('edit', portfolioMilestone);
        };

        vm.saveEditStatus = function(portfolioMilestone){
            // Clean-up deepPopulate
            var copyPortfolioMilestone = _.cloneDeep(portfolioMilestone);
            copyPortfolioMilestone.project = _.get(copyPortfolioMilestone.project, '_id');
            copyPortfolioMilestone.gate = _.get(copyPortfolioMilestone.gate, '_id');
            // Update server header
            PortfolioMilestones.updateStatus( { portfolioMilestoneId : copyPortfolioMilestone._id }, copyPortfolioMilestone,
                function(res){
                    // Update the "estimate delivery date" and the "final" in the gate from the list
                    portfolioMilestoneFromList[portfolioMilestone._id].statusReview.currentRecord.completed = portfolioMilestone.statusReview.currentRecord.completed;
                    portfolioMilestoneFromList[portfolioMilestone._id].statusReview.currentRecord.estimateDeliveryDate = portfolioMilestone.statusReview.currentRecord.estimateDeliveryDate;
                    // Change the selected CR
                    originalPortfolioMilestone[portfolioMilestone._id].statusReview.currentRecord.baselineDeliveryDate = portfolioMilestone.statusReview.currentRecord.baselineDeliveryDate;
                    originalPortfolioMilestone[portfolioMilestone._id].statusReview.currentRecord.estimateDeliveryDate = portfolioMilestone.statusReview.currentRecord.estimateDeliveryDate;
                    originalPortfolioMilestone[portfolioMilestone._id].statusReview.currentRecord.actualDeliveryDate = portfolioMilestone.statusReview.currentRecord.actualDeliveryDate;
                    originalPortfolioMilestone[portfolioMilestone._id].statusReview.currentRecord.status = portfolioMilestone.statusReview.currentRecord.status;
                    originalPortfolioMilestone[portfolioMilestone._id].statusReview.currentRecord.completed = portfolioMilestone.statusReview.currentRecord.completed;
                    originalPortfolioMilestone[portfolioMilestone._id].statusReview.currentRecord.statusComment = portfolioMilestone.statusReview.currentRecord.statusComment;
                    vm.selectStatusForm('view', portfolioMilestone);
                },
                function(err){
                    vm.error = err.data.message;
                }
            );
        };

        vm.cancelEditStatus = function(portfolioMilestone){
            portfolioMilestone.statusReview.currentRecord.baselineDeliveryDate = originalPortfolioMilestone[portfolioMilestone._id].statusReview.currentRecord.baselineDeliveryDate;
            portfolioMilestone.statusReview.currentRecord.estimateDeliveryDate = originalPortfolioMilestone[portfolioMilestone._id].statusReview.currentRecord.estimateDeliveryDate;
            portfolioMilestone.statusReview.currentRecord.actualDeliveryDate = originalPortfolioMilestone[portfolioMilestone._id].statusReview.currentRecord.actualDeliveryDate;
            portfolioMilestone.statusReview.currentRecord.status = originalPortfolioMilestone[portfolioMilestone._id].statusReview.currentRecord.status;
            portfolioMilestone.statusReview.currentRecord.completed = originalPortfolioMilestone[portfolioMilestone._id].statusReview.currentRecord.completed;
            portfolioMilestone.statusReview.currentRecord.statusComment = originalPortfolioMilestone[portfolioMilestone._id].statusReview.currentRecord.statusComment;
            vm.selectStatusForm('view', portfolioMilestone);
        };



        // ----------------------------------------------- ASSOCIATED PROJECT MILESTONES -------------------------------------------------


		// Used only to show the details of the milestone (adding/removing all done on main ctrl/view)
		var modalProjectMilestone = function (size, milestone) {

			var modalInstance = $modal.open({
				templateUrl: 'modules/portfolio-milestones/views/associated-project-milestone.client.view.html',
				controller: function ($scope, $modalInstance, milestone) {
					$scope.selectedProjectMilestone = milestone;
					$scope.projectMilestoneDetails = 'header';
					$scope.cancelModal = function () {
						$modalInstance.dismiss();
					};
				},
				size: size,
				resolve: {
					milestone: function (ProjectMilestones) {
						return ProjectMilestones.get(
							{ projectMilestoneId:milestone._id },
							function(res){ return res; },
							function(err){ return err; }
						);
					}
				},
				backdrop: 'static',
				keyboard: false
			});
		};

		vm.viewProjectMilestone = function(milestone){
			modalProjectMilestone('lg', milestone);
		};

		vm.addProjectMilestone = function(portfolioMilestone, projectMilestone){
			PortfolioMilestones.addProjectMilestone({
				portfolioMilestoneId : portfolioMilestone._id,
				projectMilestoneId : projectMilestone._id
			}, projectMilestone, function(res){
                portfolioMilestone.associatedProjectMilestones.push(projectMilestone);
				vm.availableProjectMilestones = _.without(vm.availableProjectMilestones, projectMilestone);
			}, function(err){
				vm.error = err.data.message;
			});
		};

		vm.removeProjectMilestone = function(portfolioMilestone, projectMilestone){
			PortfolioMilestones.removeProjectMilestone({
				portfolioMilestoneId : portfolioMilestone._id,
				projectMilestoneId : projectMilestone._id
			}, projectMilestone, function(res){
                portfolioMilestone.associatedProjectMilestones = _.without(portfolioMilestone.associatedProjectMilestones, projectMilestone);
				vm.availableProjectMilestones.push(projectMilestone);
			}, function(err){
				vm.error = err.data.message;
			});
		};



	}
]);