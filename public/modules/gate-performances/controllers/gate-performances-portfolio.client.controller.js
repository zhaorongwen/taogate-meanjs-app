'use strict';

angular.module('gate-performances').controller('GatePerformancesPortfolioController', ['$scope', '$stateParams', '$location', 'Authentication',
    'GatePerformances','Projects','Portfolios', 'GateProcessTemplates', '_','$q','$modal',
    function($scope, $stateParams, $location, Authentication, GatePerformances, Projects, Portfolios, GateProcessTemplates, _, $q, $modal) {

        var vm = this;

        // ----------- INIT ---------------

        vm.isResolving = false;
        
        vm.initError = [];

        vm.init = function(){

            Portfolios.query(function(portfolios){
                vm.portfolios = portfolios;
                vm.portfolioTrees = createNodeTrees(portfolios);
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


        // ------ PORTFOLIO SELECTION -----------

        vm.selectPortfolio = function(portfolio){
            
            vm.selectedProjectProfile = null;
            vm.selectedPortfolio = portfolio || {name: 'Unassigned'};

            vm.error = null;
            vm.isResolving = true;
            GatePerformances.portfolioPerformances(
                {
                    _id: (portfolio && portfolio._id) || null,
                    name : vm.selectedPortfolio.name,
                    budget : vm.selectedPortfolio.budget || null
                },
                function(res){
                    vm.isResolving = false;
                    vm.portfolioPerformances = res;
                    console.log(res);
                },
                function(err){
                    vm.error = err;
                    vm.isResolving = false;
                }
            );
        };

        // ------ PROJECT SELECTION -----------

        vm.projectProfileDetails = 'financial';

        var modalProjectProfile = function (size, profile) {

            var modalInstance = $modal.open({
                templateUrl: 'modules/gate-performances/views/project-profile.client.view.html',
                controller: function ($scope, $modalInstance, profile) {

                    $scope.profile = profile;

                    $scope.cancelModal = function () {
                        $modalInstance.dismiss();
                    };
                },
                size: size,
                resolve: {
                    profile: function () {
                        return profile;
                    }
                },
                backdrop: 'static',
                keyboard: false
            });

        };

        vm.selectProjectProfile = function(profile){
            modalProjectProfile('lg', profile);
        };






    }
]);
