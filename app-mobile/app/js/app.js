'use strict';


// Declare app level module which depends on filters, and services
angular.module('safoAppMobile', [
  'ngRoute',
  'ngAnimate',
  'ngTouch',
  'infinite-scroll',
  'ui.unique',
  'ui.bootstrap.modal',
  'ui.bootstrap.transition',
  "template/modal/backdrop.html",
  "template/modal/window.html",
  'safoAppMobile.filters',
  'safoAppMobile.config',
  'safoAppMobile.services',
  'safoAppMobile.directives',
  'safoAppMobile.controllers',
  'mobile-angular-ui.pointer-events',     /* prevents actions on disabled elements */
  'mobile-angular-ui.fastclick',          /* provides touch events with fastclick */
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider
  	.when('/', {templateUrl: 'partials/home.html', controller: 'home'})
  	.when('/catalogue', { templateUrl : 'partials/catalogue.html', controller: 'catalogue' })
    .when('/clients', { templateUrl : 'partials/clients.html', controller: 'clients' })
  	.when('/import', { templateUrl : 'partials/import.html', controller: 'import' })
  	.when('/panier', { templateUrl : 'partials/panier.html', controller: 'panier' })
  	.when('/commandes', { templateUrl : 'partials/commandes.html', controller: 'commandes' })
    .when('/connexion', { templateUrl : 'partials/connexion.html', controller: 'connexion' })
  	.otherwise({redirectTo: '/'});
}])
.run(['$rootScope', 'SafoDB', 'SafoUser', 'SafoSynchro', 'SafoDatas', 'SafoCart', 'SafoOrders', function ($rootScope, SafoDB, SafoUser, SafoSynchro, SafoDatas, SafoCart, SafoOrders) {
  $rootScope.client = null;
	$rootScope.isInUpdate = [];
  SafoDB.init();
  SafoUser.init();
  SafoSynchro.init();
  SafoDatas.init();
  SafoDatas.update();
}]);
