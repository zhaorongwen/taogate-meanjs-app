'use strict';

angular.module('people-setup').controller('PeopleSetupController', ['$scope', '$stateParams', '$location',
	'Authentication','People', 'PeoplePortfolioGroups', 'PeopleProjectGroups',
    'PeopleRoles', 'PeopleCategories', 'PeopleCategoryValues', '$q','_',
	function($scope, $stateParams, $location, Authentication, People, PeoplePortfolioGroups, PeopleProjectGroups,
             PeopleRoles, PeopleCategories, PeopleCategoryValues, $q, _) {


		// ------------- INIT -------------

        $scope.initError = [];

		$scope.init = function(){
            PeopleRoles.query(function(roles){
                $scope.peopleRoles = roles;
            }, function(err){
                $scope.initError.push(err.data.message);
            });
            PeoplePortfolioGroups.query(function(portfolioGroups){
                $scope.peoplePortfolioGroups = portfolioGroups;
            }, function(err){
                $scope.initError.push(err.data.message);
            });
            PeopleProjectGroups.query(function(projectGroups){
                $scope.peopleProjectGroups = projectGroups;
            }, function(err){
                $scope.initError.push(err.data.message);
            });
            People.query(function(people){
                $scope.people = people;
            }, function(err){
                $scope.initError.push(err.data.message);
            });
            PeopleCategories.query(function(peopleCategories){
                $scope.peopleCategories = peopleCategories;
            }, function(err){
                $scope.initError.push(err.data.message);
            });
            PeopleCategoryValues.query(function(peopleCategoryValues){
                $scope.peopleCategoryValues = peopleCategoryValues;
            }, function(err){
                $scope.initError.push(err.data.message);
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


// ------------------------------------------------------  PEOPLE ---------------------------------------------



		// ------------------- NG-SWITCH ---------------------

		$scope.switchPersonForm = {};

		$scope.selectPersonForm = function(person, string){
			if(string === 'view'){ $scope.switchPersonForm[person._id] = 'view';}
			if(string === 'new'){$scope.switchPersonForm[person._id] = 'new';}
			if(string === 'edit'){$scope.switchPersonForm[person._id] = 'edit';}
		};

		// ------------------- LIST OF PEOPLE -----------------

		$scope.findPeople = function() {
			People.query(function(people){
				$scope.people = _.clone(people);
			},function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// ------------------- EDIT -----------------


		$scope.selectPerson = function(person){
			$scope.selectPersonForm(person, 'edit');
		};

		$scope.updatePerson = function(person) {
			person.$update(function(response) {
				$scope.findPeople();
				$scope.selectPersonForm(person, 'view');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.cancelEditPerson = function(person){
			$scope.findPeople();
			$scope.selectPersonForm(person, 'view');
		};

		// ------------------- DELETE -----------------

		$scope.removePerson = function(person) {
			person.$remove(function(response) {
				$scope.findPeople();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// ------------------- NEW -----------------

		$scope.createPerson = function() {
			var person = new People ({
				name: 'New person',
				title: '',
				email: '',
				phone: ''
			});
			person.$save(function(response) {
				$scope.findPeople();
				$scope.selectPersonForm(response._id, 'view');

			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};






// ------------------------------------------------------ PROJECT GROUPS --------------------------------------



		// ------------------- NG-SWITCH ---------------------

		$scope.switchProjectGroupForm = {};

		$scope.selectProjectGroupForm = function(group, string){
			if(string === 'view'){ $scope.switchProjectGroupForm[group._id] = 'view';}
			if(string === 'new'){$scope.switchProjectGroupForm[group._id] = 'new';}
			if(string === 'edit'){$scope.switchProjectGroupForm[group._id] = 'edit';}
		};

		// ----------------- REFRESH GROUP LIST ------------

		$scope.projectGroupList = function(){
			PeopleProjectGroups.query(function(groups){
				$scope.peopleProjectGroups = groups;
			});
		};

		// ------------------ CREATE GROUP ----------------

		$scope.createProjectGroup = function() {
			$scope.error = null;

			var peopleProjectGroup = new PeopleProjectGroups ({
				name: 'New project stakeholder group',
				description: '',
				roles: []
			});

			peopleProjectGroup.$save(function(response) {
				$scope.projectGroupList();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// ------------------- EDIT GROUP -----------------

		var originalEditProjectGroup = {};

		$scope.selectProjectGroup = function(group){
			originalEditProjectGroup[group._id] = _.clone(group);
			$scope.error = null;
			$scope.selectProjectGroupForm(group, 'edit');
		};

		$scope.updateProjectGroup = function(group) {
			group.$update(function(response) {
				$scope.selectProjectGroupForm(group, 'view');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.cancelEditProjectGroup = function(group){
			$scope.error = null;
			group.name = originalEditProjectGroup[group._id].name;
			group.description = originalEditProjectGroup[group._id].description;
			$scope.selectProjectGroupForm(group, 'view');
		};

		// ------------------- REMOVE GROUP -----------------

		$scope.removeProjectGroup = function(group) {
			$scope.error = null;
			group.$remove(function(response) {
				$scope.projectGroupList();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};






// ------------------------------------------------------ PORTFOLIO GROUPS --------------------------------------






        // ------------------- NG-SWITCH ---------------------

        $scope.switchPortfolioGroupForm = {};

        $scope.selectPortfolioGroupForm = function(group, string){
            if(string === 'view'){ $scope.switchPortfolioGroupForm[group._id] = 'view';}
            if(string === 'new'){$scope.switchPortfolioGroupForm[group._id] = 'new';}
            if(string === 'edit'){$scope.switchPortfolioGroupForm[group._id] = 'edit';}
        };

        // ----------------- REFRESH GROUP LIST ------------

        $scope.portfolioGroupList = function(){
            PeoplePortfolioGroups.query(function(groups){
                $scope.peoplePortfolioGroups = groups;
            });
        };

        // ------------------ CREATE GROUP ----------------

        $scope.createPortfolioGroup = function() {
            $scope.error = null;

            var peoplePortfolioGroup = new PeoplePortfolioGroups ({
                name: 'New portfolio stakeholder group',
                description: '',
                roles: []
            });

            peoplePortfolioGroup.$save(function(response) {
                $scope.portfolioGroupList();
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // ------------------- EDIT GROUP -----------------

        var originalEditPortfolioGroup = {};

        $scope.selectPortfolioGroup = function(group){
            originalEditPortfolioGroup[group._id] = _.clone(group);
            $scope.error = null;
            $scope.selectPortfolioGroupForm(group, 'edit');
        };

        $scope.updatePortfolioGroup = function(group) {
            group.$update(function(response) {
                $scope.selectPortfolioGroupForm(group, 'view');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.cancelEditPortfolioGroup = function(group){
            $scope.error = null;
            group.name = originalEditPortfolioGroup[group._id].name;
            group.description = originalEditPortfolioGroup[group._id].description;
            $scope.selectPortfolioGroupForm(group, 'view');
        };

        // ------------------- REMOVE GROUP -----------------

        $scope.removePortfolioGroup = function(group) {
            $scope.error = null;
            group.$remove(function(response) {
                $scope.portfolioGroupList();
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };






// ------------------------------------------------------ ROLES --------------------------------------



        $scope.switchRoleForm = {};

        $scope.selectRoleForm = function(role, string){
            if(string === 'view'){ $scope.switchRoleForm[role._id] = 'view';}
            if(string === 'edit'){$scope.switchRoleForm[role._id] = 'edit';}
        };



        // ------------------ CREATE ROLE ----------------

		$scope.createRole = function(group) {
			$scope.error = null;

			var peopleRole = new PeopleRoles ({
				name: 'New role',
				description: 'New role description'
			});

			peopleRole.$save(function(roleRes) {
				group.roles.push(roleRes);
				group.$update(function(groupRes) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// ------------------- EDIT ROLE -----------------

		var originalEditRole = {};

		$scope.selectEditRole = function(group, role){
			originalEditRole[role._id] = _.clone(role);
			$scope.selectRoleForm(role, 'edit');
		};

		$scope.updateRole = function(group, role) {
			PeopleRoles.update(role, function(response) {
				$scope.selectRoleForm(role, 'view');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.cancelEditRole = function(role){
			$scope.error = null;
			role.name = originalEditRole[role._id].name;
			role.description = originalEditRole[role._id].description;
			$scope.selectRoleForm(role, 'view');
		};

		// ------------------- REMOVE ROLE -----------------

		$scope.removeRole = function(group, role) {
			$scope.error = null;
			PeopleRoles.query({_id:role._id}, function(res){
				var resRole = res[0];
				resRole.$remove(function(roleResp) {
                    $scope.portfolioGroupList();
					$scope.projectGroupList();
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			});
		};







// ------------------------------------------------------ STAKEHOLDER CATEGORIES --------------------------------------




        // ------------------- NG-SWITCH ---------------------

        $scope.switchCategoryForm = {};

        $scope.selectCategoryForm = function(category, string){
            if(string === 'view'){ $scope.switchCategoryForm[category._id] = 'view';}
            if(string === 'new'){$scope.switchCategoryForm[category._id] = 'new';}
            if(string === 'edit'){$scope.switchCategoryForm[category._id] = 'edit';}
        };

        $scope.switchCategoryValueForm = {};

        $scope.selectCategoryValueForm = function(categoryValue, string){
            if(string === 'view'){ $scope.switchCategoryValueForm[categoryValue._id] = 'view';}
            if(string === 'edit'){$scope.switchCategoryValueForm[categoryValue._id] = 'edit';}
        };


        // ------------------ CREATE CATEGORY ----------------

        $scope.createCategory = function() {
            $scope.error = null;

            var category = new PeopleCategories ({
                name: 'New stakeholder category',
                categoryValues: []
            });

            category.$save(function(res) {
                $scope.peopleCategories.push(res);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // ------------------- EDIT CATEGORY (HEADER ONLY) -----------------

        var originalEditCategory = {};

        $scope.selectCategory = function(category){
            originalEditCategory[category._id] = _.clone(category);
            $scope.error = null;
            $scope.selectCategoryForm(category, 'edit');
        };

        $scope.updateCategory = function(category) {
            PeopleCategories.update({
                _id: category._id,
                name: category.name,
                description: category.description
            }, function(category){
                $scope.selectCategoryForm(category, 'view');
            },function(errorResponse){
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.cancelEditCategory = function(category){
            $scope.error = null;
            category.name = originalEditCategory[category._id].name;
            category.description = originalEditCategory[category._id].description;
            $scope.selectCategoryForm(category, 'view');
        };


        // ------------------- REMOVE CATEGORY -----------------

        $scope.removeCategory = function(category) {
            $scope.error = null;

            PeopleCategories.remove({},category, function(res){
                $scope.peopleCategories = _.without($scope.peopleCategories, category);
            }, function(err){
                $scope.error = err.data.message;
            });
        };


        // ------------------ CREATE CATEGORY VALUE ----------------

        $scope.createCategoryValue = function(category) {
            $scope.error = null;

            var categoryValue = new PeopleCategoryValues ({
                name: 'New stakeholder category value'
            });

            categoryValue.$save(function(categoryValueRes) {
                // Add values to the view category
                category.categoryValues.push(categoryValueRes);
                // Clean the array from deep populate and get only _ids
                var copyCategory = _.clone(category);
                copyCategory.categoryValues = _.map(_.get(copyCategory, 'categoryValues'), function(value){
                    return value._id;
                });
                // Add the created value to the Category's categoryValues array
                PeopleCategories.update({
                    _id: copyCategory._id,
                    categoryValues:copyCategory.categoryValues
                }, function(category){
                    // do something on success response
                },function(errorResponse){
                    $scope.error = errorResponse.data.message;
                });

            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // ------------------- EDIT CATEGORY VALUE -----------------

        var originalEditCategoryValue = {};

        $scope.selectEditCategoryValue = function(category, categoryValue){
            originalEditCategoryValue[categoryValue._id] = _.clone(categoryValue);
            $scope.selectCategoryValueForm(categoryValue, 'edit');
        };

        $scope.updateCategoryValue = function(category, categoryValue) {
            PeopleCategoryValues.update(categoryValue, function(response) {
                $scope.selectCategoryValueForm(categoryValue, 'view');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.cancelEditCategoryValue = function(categoryValue){
            $scope.error = null;
            categoryValue.name = originalEditCategoryValue[categoryValue._id].name;
            categoryValue.description = originalEditCategoryValue[categoryValue._id].description;
            $scope.selectCategoryValueForm(categoryValue, 'view');
        };

        // ------------------- REMOVE CATEGORY VALUE -----------------

        $scope.removeCategoryValue = function(category, categoryValue) {
            $scope.error = null;
            PeopleCategoryValues.remove({},categoryValue, function(value){
                category.categoryValues = _.without(category.categoryValues, categoryValue);
            }, function(err){
                $scope.error = err.data.message;
            });
        };



	}
]);
