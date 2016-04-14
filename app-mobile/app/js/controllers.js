'use strict';

/* Controllers */

angular.module('safoAppMobile.controllers', [])
	.controller('home', ['$scope', '$rootScope', 'SafoUser', function($scope, $rootScope, SafoUser) {
		$rootScope.nav = 'home';
	}])
	.controller('catalogue', ['$scope', '$rootScope', '$routeParams', '$location', '$filter', 'SafoDatas', '$modal', 'SafoCart', function($scope, $rootScope, $routeParams, $location, $filter, SafoDatas, $modal, SafoCart) {
		$rootScope.nav = 'catalogue';
		$scope.produit_nav = 'tous';
		//$('body').removeClass('nav-expanded');
        $scope.limit = 10
        $scope.produits = [];
        $scope.query = {};
        $scope.assortiment = false;

        if(SafoDatas.getClient()) {
            $scope.produitsOriginal = SafoDatas.getProduitsClient();
        } else {
            $scope.produitsOriginal = SafoDatas.getProduits();
        }

        $scope.produits = $scope.produitsOriginal;

        $scope.departements = SafoDatas.getDepartements();
        $scope.rayons = SafoDatas.getRayons();
        $scope.familles = SafoDatas.getFamilles();
        $scope.fournisseurs = SafoDatas.getFournisseurs();
        $scope.marques = SafoDatas.getMarques();

        $scope.tarifs = SafoDatas.getTarifs();
        $scope.stocks = SafoDatas.getStocks();
		
		$scope.swipeRedirect = function($redirect)
		{
		      $scope.produit_nav = $redirect;
		      loadProduits();
		};

        $scope.loadMore = function() {

            $scope.limit = $scope.limit + 10;
        };

        $scope.update = function() {
            $scope.limit = 10;
            $scope.nbProduits = 0;
            $scope.nbProduitsNouveaute = 0;
            $scope.nbProduitsPromo = 0;

            if(!$scope.query.recherche) {
                delete $scope.query.recherche;
            }
            
            if(!$scope.query.famille) {
                delete $scope.query.famille;
            }

            if(!$scope.query.marque) {
                delete $scope.query.marque;
            }

            if(!$scope.query.fournisseur) {
                delete $scope.query.fournisseur;
            }

            if(!$scope.query.rayon) {
                delete $scope.query.rayon;
            }

            if(!$scope.query.departement) {
                delete $scope.query.departement;
            }

            $scope.produitsFiltered = $filter('filter')($scope.produits, $scope.filterProduits);
        };
        
        $scope.order = function (item) {
        		$scope.produit = item;
        	    var modalInstance = $modal.open({
        	      templateUrl: 'partials/popup.html',
        	      controller: popupCtrl,
        	      size: 'lg',
        	      resolve: {
        	        produit: function () {
        	            return $scope.produit;
        	        }
        	      }
        	    });
        };

        $scope.filterProduits = function(produit) {

            if($scope.query.assortiment && !produit.assortiment) {

                return false;
            }

            if($scope.query.departement && produit.departement != $scope.query.departement) {

                return false;
            }

            if($scope.query.rayon && produit.rayon != $scope.query.rayon) {

                return false;
            }

            if($scope.query.famille && produit.famille != $scope.query.famille) {

                return false;
            }

            if($scope.query.fournisseur && produit.fournisseur != $scope.query.fournisseur) {

                return false;
            }

            if($scope.query.marque && produit.marque != $scope.query.marque) {

                return false;
            }

            if($scope.query.recherche) {
                var words = $scope.query.recherche.toLowerCase().split(" ");

                var libelle = produit.libelle.toLowerCase();
                var marque = produit.marque.toLowerCase();
                var fournisseur = produit.fournisseur.toLowerCase();
                var famille = produit.famille.toLowerCase();
                var rayon = produit.rayon.toLowerCase();
                var ean = produit.ean13.toString();
                for (var k in words) {
                    var word = words[k];

                    if(libelle.indexOf(word) === -1 &&
                       ean.indexOf(word) === -1 &&
                       marque.indexOf(word) === -1 && 
                       fournisseur.indexOf(word) === -1 &&
                       famille.indexOf(word) === -1 &&
                       rayon.indexOf(word) === -1) {

                        return false;
                    }
                }
            }

            $scope.nbProduits += 1;
            
            if(produit.nouveautes) {
                $scope.nbProduitsNouveaute += 1;
            }

            if(produit.promotions) {
                $scope.nbProduitsPromo += 1;
            }

            if($scope.query.promotions && !produit.promotions) {

                return false;
            }

            if($scope.query.nouveautes && !produit.nouveautes) {

                return false;
            }
            
            return true;
        };

        $scope.addToCart = function (product, quantity) {
        	if (quantity !== null) {
        		SafoCart.add(product, quantity);
        		SafoCart.update();
        	}
    	};
          
        var loadProduits = function () {
            delete $scope.query.promotions;
            delete $scope.query.nouveautes;
            $scope.limit = 10;
            if ($scope.produit_nav == 'tous') {
                $scope.swipeLeft = 'tous';
                $scope.swipeRight = 'nouveautes';
            }
            if ($scope.produit_nav == 'nouveautes') {
                $scope.swipeLeft = 'tous';
                $scope.swipeRight = 'promotions';
                $scope.query.nouveautes = true;
            }
            if ($scope.produit_nav == 'promotions') {
                $scope.swipeLeft = 'nouveautes';
                $scope.swipeRight = 'promotions';
                $scope.query.promotions = true;
            }
            $scope.update();
        };

        $scope.changeAssortiment = function(assortiment) {
            if(assortiment) {
                $scope.query.assortiment = true;
            } else {
                delete $scope.query.assortiment;
            }
            loadProduits();
        }

        if(SafoDatas.getClient() && SafoDatas.getClient().assortiment_id) {
            $scope.changeAssortiment(true);
        } else {
            loadProduits();
        }

	}])
    .controller('import', ['$scope', '$rootScope', '$location', '$route', '$window', 'SafoDB', 'SafoUser', 'SafoSynchro', 'SafoDatas', function($scope, $rootScope, $location, $route, $window, SafoDB, SafoUser, SafoSynchro, SafoDatas) {
        $rootScope.nav = 'import';
        
        $scope.user = null;
        if(!SafoUser.getUser()) {
            var db = SafoDB.getDBUser();
            db.get('USER', function(err, doc) {
                if(err) {
                    $location.path('/connexion');
                }
                $scope.user = doc;
                $scope.$apply();
            });
        } else {
            $scope.user = SafoUser.getUser();
        }

        $scope.admin = false;
        
        var updateInfo = function() {
            SafoSynchro.getNbDocuments(function(nbDocs) {
                $scope.nbDocs = nbDocs;
                $scope.$apply();
            });
        }
        var updatePushInfo = function() {

        }

        $scope.pull = function() {
            SafoSynchro.pull(function() {
                updateInfo();
            });
        }

        $scope.push = function() {
            SafoSynchro.push(function() {
            });
        }

        $scope.pullFast = function() {
            SafoSynchro.pullFast(function() {
                updateInfo();
            });
        }

        $scope.deleteDatabase = function() {
            SafoDB.deleteDB(function(err, doc) {
                $route.reload();
            });
        }

        $scope.deletePanier = function() {
            SafoDB.deleteDBCart(function(err, doc) {
            	$window.location.reload();
            });
        }

        $scope.deleteCommandes = function() {
            SafoDB.deleteDBOrder(function(err, doc) {
            	$window.location.reload();
            });
        }

        $scope.deleteUser = function() {
            SafoDB.deleteDBUser(function(err, doc) {
                SafoUser.resetUser();
                $route.reload();
            });
        }

        updateInfo();
        updatePushInfo();
    }])
    .controller('clients', ['$scope', '$rootScope', '$routeParams', '$location', '$filter', 'SafoDatas', 'SafoCart', function($scope, $rootScope, $routeParams, $location, $filter, SafoDatas, SafoCart) {
        $rootScope.nav = 'clients';
        //$('body').removeClass('nav-expanded');
        $scope.limit = 10;
        $scope.clients = [];
        $scope.query = {};

        SafoDatas.setClient(null);
        $rootScope.client = null;
        $scope.chooseClient = function(client) {
            SafoDatas.setClient(client);
            SafoCart.init();
            $location.path('/catalogue');
        };
        
        $scope.clients = SafoDatas.getClients();

        $scope.loadMore = function() {
            $scope.limit = $scope.limit + 10;
        };

        $scope.update = function() {
            $scope.limit = 10;
        };
    }])
    .controller('panier', ['$scope', '$rootScope', '$routeParams', '$location', '$filter', '$modal', 'SafoDatas', 'SafoCart', 'SafoOrders', function($scope, $rootScope, $routeParams, $location, $filter, $modal, SafoDatas, SafoCart, SafoOrders) {
        $rootScope.nav = 'panier';
        //$('body').removeClass('nav-expanded');
        $scope.produits = SafoCart.getProducts();
        $scope.nbProduct = SafoCart.getNbProduct();
        $scope.updateCart = function(product, quantity) {
        	SafoCart.add(product, quantity);
    		SafoCart.update();
        }
        $scope.remove = function(key) {
        	SafoCart.remove(key);
    		SafoCart.update();
        }
        
        $scope.confirm = function (cartForm) {
    		$scope.cartForm = cartForm;
    	    var modalInstance = $modal.open({
    	      templateUrl: 'partials/confirm.html',
    	      controller: confirmCtrl,
    	      size: 'lg',
    	      resolve: {
    	    	cartForm: function () {
    	            return $scope.cartForm;
    	        }
    	      }
    	    });
        }
        
        $scope.product = function (item) {
    		$scope.produit = item;
    	    var modalInstance = $modal.open({
    	      templateUrl: 'partials/popup.html',
    	      controller: popupCtrl,
    	      size: 'lg',
    	      resolve: {
    	        produit: function () {
    	            return $scope.produit;
    	        }
    	      }
    	    });
        }
        
        $scope.deleteCart = function () {
        	SafoCart.delete();
        	$location.path('/catalogue');
    	}
        
        $scope.continueCart = function () {
        	$location.path('/catalogue');
    	}
        
        $scope.parseFloat = function(value)
        {
            return parseFloat(value).toFixed(2);
        }
        
        $scope.getTotal = function(){
            var total = 0;
            for(var key in $scope.produits){
                var product = $scope.produits[key];
                total += (parseFloat(product.prix) * parseFloat(product.quantity) * product.product.pcb);
            }
            return total.toFixed(2);
        }
        
    }])
	.controller('commandes', ['$scope', '$rootScope', '$routeParams', '$location', 'SafoDatas', 'SafoSynchro', '$filter', '$route', function($scope, $rootScope, $routeParams, $location, SafoDatas, SafoSynchro, $filter, $route) {
		$rootScope.nav = 'commandes';
		$scope.synchro = false;
		if(SafoDatas.getClient()) {
			$scope.orders = SafoDatas.getCommandesClient();
		} else {
			$scope.orders = SafoDatas.getCommandes();
		}
        $scope.parseFloat = function(value)
        {
            return parseFloat(value).toFixed(2);
        }
        
        $scope.getTotal = function(){
            var total = 0;
            for(var key in $scope.orders){
                var commande = $scope.orders[key];
                for (var i in commande.produits) {
                	var product = commande.produits[i];
                	total += (parseFloat(product.prix) * parseFloat(product.quantity) * product.pcb);
                }
            }
            return total.toFixed(2);
        }
        
        $scope.resend = function(commande){
        	$scope.synchro = true;
        	var instance = new PouchDB('orders');
        	commande.statut = 'ATTENTE';
        	instance.put(commande, function(err, response) { 
        		if(!err) {
        			SafoDatas.updateAllCommandes(function() {
    					$route.reload();
    				});
    			} else {
    				console.log(err); 
    				$scope.synchro = false;
    				} 
    		});
        }


	}])
    .controller('connexion', ['$scope', '$rootScope', '$routeParams', '$location', '$filter', 'SafoDB', 'SafoUser', function($scope, $rootScope, $routeParams, $location, $filter, SafoDB, SafoUser) {
        $rootScope.nav = 'import';

        $scope.erreur = null;
        $scope.isInConnexion = false;
        $scope.infos = {};

        $scope.auth = function(infos)
        {
            $scope.isInConnexion = true;
            $scope.erreur = null;
            SafoDB.getRemoteDB(infos.username, infos.password).login(infos.username, infos.password, {ajax: {
    headers: {
      Authorization: 'Basic ' + window.btoa(infos.username + ':' + infos.password)
    }
  }}).then(function(response) {
                $scope.isInConnexion = false;
                $scope.erreur = null;

                SafoUser.update(response.name, infos.username, infos.password, function() {
                    $location.path('/import');
                    $scope.$apply();
                });
            }).catch(function (error) {
                $scope.isInConnexion = false;
                $scope.infos.password = "";
                if(error.name == "unauthorized") {
                    $scope.erreur = "Le login et/ou le mot de passe sont incorrectes";
                } else if(error.name == "unknown_error") {
                    $scope.erreur = "Une erreur est survenue (pas de connexion internet)";
                } else if(error.message) {
                    $scope.erreur = error.message + ' (' + error.name +')';                
                } else {
                    $scope.erreur = "Une erreur est survenue";
                }
                $scope.$apply();
            });
        }

    }])
    ;
var popupCtrl = function($scope, $modalInstance, produit, SafoCart, SafoDatas){
	$scope.produit = produit;
	$scope.addToCart = function (quantity) {
		SafoCart.add(produit, quantity);
		SafoCart.update();
	    $modalInstance.close();
	};

    $scope.tarifs = SafoDatas.getTarifs();
    $scope.stocks = SafoDatas.getStocks();
    $scope.promos = SafoDatas.getPromos();

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
var confirmCtrl = function($scope, $modalInstance, cartForm, SafoCart, SafoOrders, $location, SafoDatas){
	$scope.cartForm = cartForm;
	$scope.order = function (cartForm) {
	    var commande = SafoOrders.generateCommande(cartForm.inputDateLivraison, cartForm.inputCommentaire, cartForm.inputNotes);
	    commande.save(function() {
	    	SafoCart.delete();
	    	SafoDatas.updateCommandes(function () {
	    	    $modalInstance.close();
	        	$location.path('/commandes');
	    	});
	    });
	};

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
