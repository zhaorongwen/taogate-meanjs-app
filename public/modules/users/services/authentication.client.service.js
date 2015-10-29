'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$q',
	function($q) {
		var _this = this;




		_this._data = {
			user: window.user
		};



		return _this._data;
	}
]);
