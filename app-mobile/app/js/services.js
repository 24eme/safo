'use strict';

angular.module('safoAppMobile.services', [])
    .factory('SafoDB', ['$rootScope', 'SafoConfig', function($rootScope, SafoConfig) {
        var db = {};

        db.init = function() {
            db.db = new PouchDB(SafoConfig.db.name, {adapter : SafoConfig.db.adapter});
            db.db_order = new PouchDB(SafoConfig.db.order.name, {adapter : SafoConfig.db.order.adapter});
            db.db_user = new PouchDB(SafoConfig.db.user.name, {adapter : SafoConfig.db.user.adapter});
        };

        db.getDB = function() {
            
            return db.db;
        };

        db.deleteDB = function(callback) {
            PouchDB.destroy(SafoConfig.db.name, function(err, info) {  db.db = new PouchDB(SafoConfig.db.name, {adapter : SafoConfig.db.adapter}); callback(err, info); });
        };

        db.getRemoteDB = function(username, password) {

            return new PouchDB(db.getRemoteUrl(username, password));
        };

        db.getRemoteUrl = function(username, password) {

            return SafoConfig.db.remote_url.replace("://", "://"+username+":"+password+"@");
        };

        db.getDBOrder = function() {

            return db.db_order;
        };

        db.getDBUser = function() {

            return db.db_user;
        };

        db.deleteDBOrder = function(callback) {
            PouchDB.destroy(SafoConfig.db.order.name, function(err, info) { db.db_order = new PouchDB(SafoConfig.db.order.name, {adapter : SafoConfig.db.order.adapter}); callback(err, info); });
        };

        db.deleteDBCart = function(callback) {
            PouchDB.destroy('cart', function(err, info) { callback(err, info); });
        };

        db.deleteDBUser = function(callback) {
            PouchDB.destroy(SafoConfig.db.user.name, function(err, info) { db.db_user = new PouchDB(SafoConfig.db.user.name, {adapter : SafoConfig.db.user.adapter}); callback(err, info); });
        };

        db.getOrdersDb = function() {
        	return SafoConfig.db.order.name;
        };
        
        db.getRemoteOrdersDB = function(username, password) {

        	return SafoConfig.db.order.remote_url.replace("://", "://"+username+":"+password+"@");
        };

        return db;
    }])
    .factory('SafoUser', ['$rootScope', 'SafoDB', function($rootScope, SafoDB) {
        var user = {};

        user.init = function() {
           user.user = null;
           user.getFromDB();
        };

        user.getFromDB = function() {
            var db = SafoDB.getDBUser();
            db.get('USER', function(err, doc) {
                if(err) {
                    return;
                }

                user.user = doc;
            });
        };

        user.getUser = function() {

            return user.user;
        };

        user.resetUser = function() {

            user.user = null;
        };

        user.update = function(name, username, password, callback) {
            var db = SafoDB.getDBUser();

            db.get('USER', function(err, doc) {

                if(err && err.name == "not_found") {
                   doc = {};
                   doc._rev = null;
                } else if(err) {
                    return;
                }

                var doc_user = {
                'name': name,
                'username': username,
                'password': password
                };

                db.put(doc_user, 'USER', doc._rev, function(err, response) {
                    if(err) {
                        return;
                    }
                    db.user = user.getFromDB();
                    callback();
                });
            });
        }

        return user;
    }])
	.factory('SafoDatas', ['$rootScope', '$filter', 'SafoDB', 'SafoUser', function($rootScope, $filter, SafoDB, SafoUser) {
		var datas = {};
        datas.produits = [];
        datas.departements = [];
        datas.rayons = [];
        datas.familles = [];
        datas.fournisseurs = [];
        datas.marques = [];
        datas.tarifs = [];
        datas.stocks = [];
		datas.promos = [];
        datas.produitsClient = [];
		datas.clients = [];
        datas.client = null;
        datas.username = null;
        datas.commandes = [];
        datas.commandesClient = [];
        datas.nbCommandesAtt = 0;

        datas.init = function() {
            this.updateCommandes(function(){return;});
        }

		datas.update = function() {
            this.updatePromos();
            this.updateProduits();
            this.updateClients();
            this.updateTarifs();
            this.updateStocks();
		};

        datas.updateFast = function() {
            this.updatePromos();
            this.updateTarifs();
            this.updateStocks();
        };
        
        datas.updateCommandes = function(callback) {
        	var datas = this;
        	datas.updateAllCommandes(function() {
        		datas.updateCommandesClient(function() {
                    $rootScope.$apply();
                	callback();
                });
            });
        }
        
        datas.setUsernameCommandes = function(username, callback) {
        	var instance = new PouchDB('orders');
            datas.commandes.forEach(function(doc) {
            	if(doc.statut == 'ATTENTE') {
            		doc.username = username;
            		instance.put(doc, function(err, response) { if(!err) {
            			console.log('add ok');
            		} else {console.log(err)} });
            	}
            });
            callback();
        }
        
        datas.updateProduits = function() {
            this.produits = [];
            this.produitsClient = [];
            this.departements = [];
            this.rayons = [];
            this.familles = [];
            this.fournisseurs = [];
            this.marques = [];

            var db = SafoDB.getDB();
            var obj = this;

            $rootScope.isInUpdate.push(true);
            db.allDocs(
                {startkey: "ARTICLE-0000000", endkey: "ARTICLE-9999999", include_docs: true, attachments: true}, 
                function(err, response) {
                    var departements = [];
                    var rayons = [];
                    var familles = [];
                    var fournisseurs = [];
                    var marques = [];
                    response.rows.forEach(function(row, id) {
                        row.doc.nouveautes = (row.doc.date_creation > '2014-03-01');
                        if(row.doc._attachments && row.doc._attachments["petite.jpg"]) {
                            db.getAttachment(row.doc._id, 'petite.jpg', function(err, res) { 
                                row.doc.image_petite_url = URL.createObjectURL(res);
                            });
                            db.getAttachment(row.doc._id, 'normale.jpg', function(err, res) { 
                                row.doc.image_normale_url = URL.createObjectURL(res);
                            });
                        }

                        if(row.doc.departement && row.doc.departement.trim()) {
                            departements.push(row.doc.departement);
                        }

                        if(row.doc.rayon && row.doc.rayon.trim()) {
                            rayons.push(row.doc.rayon);
                        }

                        if(row.doc.famille && row.doc.famille.trim()) {
                            familles.push(row.doc.famille);
                        }

                        if(row.doc.fournisseur && row.doc.fournisseur.trim()) {
                            fournisseurs.push(row.doc.fournisseur);
                        }

                        if(row.doc.marque && row.doc.marque.trim()) {
                            marques.push(row.doc.marque);
                        }

                        row.doc.promotions = false;
                        if(datas.promos[row.doc._id] && Object.keys(datas.promos[row.doc._id]).length > 0) {
                            row.doc.promotions = true;
                        }

                        obj.produits.push(row.doc);
                    });

                    
                    obj.departements = $filter('orderBy')($filter('unique')(departements), "toString()");
                    obj.rayons = $filter('orderBy')($filter('unique')(rayons), "toString()");
                    obj.familles = $filter('orderBy')($filter('unique')(familles), "toString()");
                    obj.fournisseurs = $filter('orderBy')($filter('unique')(fournisseurs), "toString()");
                    obj.marques = $filter('orderBy')($filter('unique')(marques), "toString()");

                    $rootScope.isInUpdate.pop();
                    $rootScope.$apply();
            });
        }

        datas.updateClients = function() {
            this.clients = [];
            this.client = null;

            var db = SafoDB.getDB();
            var obj = this;

            $rootScope.isInUpdate.push(true);
            db.allDocs(
                    {startkey: "CLIENT-C000000", endkey: "CLIENT-C999999", include_docs: true}, 
                    function(err, response) {
                        response.rows.forEach(function(row, id) {
                            obj.clients.push(row.doc);
                        });
                    $rootScope.isInUpdate.pop();
                    $rootScope.$apply();
            });
        }

        datas.updateTarifs = function() {

            var db = SafoDB.getDB();
            var obj = this;
            obj.tarifs = [];

            $rootScope.isInUpdate.push(true);
            db.get('TARIFS', function(err, doc) {
                if(doc) {
                	obj.tarifs = doc.articles;
                }
                $rootScope.isInUpdate.pop();
                $rootScope.$apply();
            });
        }

        datas.updateStocks = function() {

            var db = SafoDB.getDB();
            var obj = this;
            obj.stocks = [];

            $rootScope.isInUpdate.push(true);
            db.get('STOCKS', function(err, doc) {
                if(doc) {
                	obj.stocks = doc.articles;
                }
                $rootScope.isInUpdate.pop();
                $rootScope.$apply();
            });
        }

        datas.updatePromos = function() {

            var db = SafoDB.getDB();
            var obj = this;
            obj.promos = [];

            $rootScope.isInUpdate.push(true);
            db.get('PROMOS', function(err, doc) {
                if(doc) {
                	obj.promos = doc.articles;
                }
                $rootScope.isInUpdate.pop();
                $rootScope.$apply();
            });
        }
        
        datas.updateCommandesClient = function(callback) {
        	 var client = datas.client;
             datas.commandesClient = [];
        	 if (client) {
        		 datas.commandes.forEach(function(doc) {
                     if(client && client._id == doc.client_id) {
                     	 datas.commandesClient.push(doc);
                     }
                 });
        	 }
        	 callback();
        }

        datas.updateAllCommandes = function(callback) {
            datas.commandes = [];
            datas.nbCommandesAtt = 0;
            
            $rootScope.isInUpdate.push(true);
            var instance = new PouchDB('orders');
			instance.allDocs({include_docs: true}, function(err, response) { 
				if(!err) {
					for(var i in response.rows) {
						var order = response.rows[i].doc;
						datas.commandes.push(order);
						if (order.statut == 'ATTENTE') {
							datas.nbCommandesAtt = datas.nbCommandesAtt + 1;
						}
					}
					$rootScope.nbCommandesAtt = datas.nbCommandesAtt;
	                $rootScope.isInUpdate.pop();
	                $rootScope.$apply();
	                callback();
				}
			});
        }
        
        datas.pushedCommandes = function(callback) {
        	var instance = new PouchDB('orders');
        	var traitement = 0;
            datas.commandes.forEach(function(doc) {
            	if(doc.statut == 'ATTENTE') {
            		traitement = traitement + 1;
            		doc.statut = 'VALIDE';
            		instance.put(doc, function(err, response) { if(!err) {
            			console.log('add ok');
            			if (traitement == datas.nbCommandesAtt) {
            				datas.updateAllCommandes(function() {
            						callback();
            				});
            			}
            		} else {console.log(err)} });
            	}
            });
            callback();
        };

		datas.getProduits = function(){
			return this.produits;
		};
        datas.getDepartements = function(){
            return this.departements;
        };
        datas.getRayons = function(){
            return this.rayons;
        };
        datas.getFamilles = function(){
            return this.familles;
        };
        datas.getFournisseurs = function(){
            return this.fournisseurs;
        };
        datas.getMarques = function(){
            return this.marques;
        };
        datas.getTarifs = function(){
            return this.tarifs;
        };
        datas.getStocks = function(){
            return this.stocks;
        };
        datas.getPromos = function(){
            return this.promos;
        };
		datas.getCommandes = function(){
			return this.commandes;
		};
        datas.getCommandesClient = function(){
            return this.commandesClient;
        };
		datas.getNbCommandesAtt = function() {
			return this.nbCommandesAtt;
		}
        datas.getProduitsClient = function(){
            return this.produitsClient;
        };
		datas.getClients = function(){
			return this.clients;
		};
        datas.setClient = function(client) {
            datas.client = client;
            $rootScope.client = client;
            datas.produitsClient = [];
            datas.commandesClient = [];
            $rootScope.isInUpdate.push(true);
            datas.produits.forEach(function(doc) {
                doc.assortiment = false;
                doc.prix = null;
                doc.prixOriginal = null;
                doc.pvc = null;
                doc.promotions = false;

                if(!client) {
                    doc.promotions = (datas.promos[doc._id] && Object.keys(datas.promos[doc._id]).length > 0);
                } else { 
                    if(datas.tarifs[doc._id] && datas.tarifs[doc._id][datas.client.tarif_id]) {
                        var tarif = datas.tarifs[doc._id][datas.client.tarif_id];
                        doc.prix = tarif.prix;
                        doc.prixOriginal = tarif.prix;
                        doc.pvc = tarif.pvc;

                        if(datas.promos[doc._id] && datas.promos[doc._id][datas.client.enseigne_id]) {
                            doc.promotions = true;
                            doc.prix = datas.promos[doc._id][datas.client.enseigne_id];
                        }

                        if(datas.promos[doc._id] && datas.promos[doc._id][datas.client._id]) {
                            doc.promotions = true;
                            doc.prix = datas.promos[doc._id][datas.client._id];
                        }

                        if(doc.assortiments && datas.client.assortiment_id && doc.assortiments[datas.client.assortiment_id]) {
                            doc.assortiment = true;
                        }

                        datas.produitsClient.push(doc);
                    }
                }
            });
            datas.commandes.forEach(function(doc) {
                if(client && client._id == doc.client_id) {
                	 datas.commandesClient.push(doc);
                }
            });
            $rootScope.isInUpdate.pop();
        }
        datas.getClient = function() {

            return datas.client;
        }
		return datas;
	}])
    .factory('SafoSynchro', ['$rootScope', 'SafoDB', 'SafoDatas', 'SafoUser', function($rootScope, SafoDB, SafoDatas, SafoUser) {
        var synchro = {};
        synchro.init = function() {
            $rootScope.synchro = false;
            $rootScope.synchroPush = false;
        };

        synchro.getNbDocuments = function(callback) {
            var db = SafoDB.getDB();
            db.info().then(function (info)  {
                callback(info.doc_count);
            });
        };

        synchro.pull = function(callback) {
            if($rootScope.synchro) {
                return;
            }

            $rootScope.synchro = true;
            $rootScope.synchroErreur = null;

            var updatePercentage = function() {
                $rootScope.synchroPourcentage = Math.round(cur / max * 100);
                $rootScope.$apply();
            }

            var remoteSeq = 0;
            var cur = 0;
            var max = 1;
            var synchroStart = false;

            SafoDB.getRemoteDB(SafoUser.getUser().username, SafoUser.getUser().password).then(function(response) {
                var db_remote = response;
               
                db_remote.info().then(function (info)  { 
                    remoteSeq = info.update_seq;
                    updatePercentage();
                    var db = SafoDB.getDB();
                    db.replicate.from(SafoDB.getRemoteUrl(SafoUser.getUser().username, SafoUser.getUser().password))
                    .on("change", function (info) {
                        if(!synchroStart) {
                            synchroStart = true;
                            max = remoteSeq - info.last_seq;
                        }
                        cur = max - (remoteSeq - info.last_seq); 
                        updatePercentage();
                    })
                    .on("complete", function(info) {
                        if(!synchroStart) {
                            synchroStart = true;
                            max = remoteSeq - info.last_seq;
                            if(max == 0) {
                                max = 1;
                            }
                        }
                        cur = max;
                        updatePercentage();
                        db.compact();
                        synchroStart = false;
                        $rootScope.synchro = false;
                        $rootScope.$apply();
                        SafoDatas.update();
                        callback();
                     })
                    .on("error", function(err) { 
                        synchroStart = false;
                        $rootScope.synchro = false;
                        $rootScope.synchroErreur = synchro.getMessageError(err);
                        $rootScope.$apply();
                    });
                }).catch(function (err) {
                    synchroStart = false;
                    $rootScope.synchro = false;
                    $rootScope.synchroErreur = synchro.getMessageError(err);
                    $rootScope.$apply();
                });
            }).catch(function(err) {
                synchroStart = false;
                $rootScope.synchro = false;
                $rootScope.synchroErreur = synchro.getMessageError(err);
                $rootScope.$apply();
            });

        };
        
        synchro.push = function(callback) {
            if($rootScope.synchroPush) {
                return;
            }

            $rootScope.synchroPush = true;
            $rootScope.synchroPushErreur = null;

            var updatePushPercentage = function() {
                $rootScope.synchroPushPourcentage = Math.round(cur / max * 100);
                $rootScope.$apply();
            }

            var remoteSeq = SafoDatas.nbCommandesAtt;
            var cur = 0;
            var max = 1;
            var synchroStart = false;
            SafoDatas.setUsernameCommandes(SafoUser.getUser().username, function() {
            	SafoDatas.updateAllCommandes(function() {
	            var replication = PouchDB.replicate(SafoDB.getOrdersDb(), SafoDB.getRemoteOrdersDB(SafoUser.getUser().username, SafoUser.getUser().password))
	                .on("change", function (info) {
	                    if(!synchroStart) {
	                        synchroStart = true;
	                        max = remoteSeq - info.last_seq;
	                    }
	                    cur = max - (remoteSeq - info.last_seq);
	                })
	                .on("complete", function(info) {
	                    if(!synchroStart) {
	                        synchroStart = true;
	                        max = remoteSeq - info.last_seq;
	                        if(max == 0) {
	                            max = 1;
	                        }
	                        updatePushPercentage();
	                    }
	                    SafoDatas.pushedCommandes(function() {
	                    	cur = max;
	                        updatePushPercentage();
	                        $rootScope.synchroPush = false;
	                        synchroStart = false;
	                        callback();
	                        $rootScope.$apply();
	                    });
	                 })
	                .on("error", function(err) {
	                    synchroStart = false;
	                    $rootScope.synchroPush = false;
	                    $rootScope.synchroPushErreur = synchro.getMessageError(err);
	                    $rootScope.$apply();
	                });
            	});
            });
        };

        synchro.pullFast = function(callback) {
            if($rootScope.synchro) {
                return;
            }

            $rootScope.synchro = true;
            $rootScope.synchroPourcentage = 0;
            $rootScope.synchroErreur = null;

            var db = SafoDB.getDB();

            db.replicate.from(SafoDB.getRemoteUrl(SafoUser.getUser().username, SafoUser.getUser().password), {doc_ids: ["STOCKS", "PROMOS", "TARIFS"]})
                .on("complete", function(info) {
                    $rootScope.synchro = false;
                    $rootScope.synchroPourcentage = 100;
                    $rootScope.$apply();
                    SafoDatas.updateFast();
                    callback();
                 })
                .on("error", function(err) {
                    $rootScope.synchro = false;
                    $rootScope.synchroErreur = synchro.getMessageError(err);
                    $rootScope.$apply();
                });
        };


        synchro.getMessageError = function(error) {
            var message = "Une erreur est survenue (pas de connexion internet) [" + error.name + "]";

            if(error.message) {
                var message = error.message + " [" + error.name + "]";
            }

            return message;
        }

        return synchro;
    }])
	.factory('SafoCart', ['$rootScope', 'SafoDatas', function($rootScope, SafoDatas) {
		
		var cart = {
				products: {},
				type: 'Panier'
		};
		
		cart.getClient = function() {
			return SafoDatas.getClient();
		}
		
		cart.getId = function() {
			var client = this.getClient();
			if (client) {
				return 'PANIER-' + client._id;
			}
			return 'PANIER';
		};
		
		cart.init = function() {
			var cart = this;
			cart.products = {};
			var instance = new PouchDB('cart');
			$rootScope.nbProducts = 0;
			instance.get(cart.getId(), function(err, panier) {
				if (panier) {
					cart.products = panier.products;
					cart.update();
					$rootScope.$apply();
				}
			});
		};
		
		cart.add = function(product, quantity) {
			var cart = this;
			var instance = new PouchDB('cart');
			var produits = cart.products;
			var find = false;
			var key;
			var id = cart.getId();
			for (key in produits) {
				if(produits[key].product._id == product._id) {
					produits[key].quantity = quantity;
					find = true;
				}
			}
			if (!find) {
				produits[product._id] = {'product': product, 'quantity': quantity, 'prix': product.prix};
			}
			instance.get(id, function(err, panier) {
				if (!panier) {
					var panier = {_id: id};
				}
				panier.products = produits;
				instance.put(panier, function(err, response) { if(!err) {console.log('add ok');} else {console.log(err)} });
			});
			this.products = produits;
		};
		
		cart.remove = function (key) {
			var instance = new PouchDB('cart');
			var produits = this.products;
			var id = this.getId();
			delete produits[key];
			this.products = produits;
			instance.get(id, function(err, panier) { 
				if (!panier) {
					var panier = {_id: id};
				}
				panier.products = produits;
				instance.put(panier, function(err, response) { if(!err) {console.log('remove ok');} else {console.log(err)} });
			});
		};
		
		cart.getNbProduct = function () {
			var nb = 0;
			var key;
			for(key in this.products) {
				nb++
			}
			return nb;
		};
		
		cart.update = function () {
			$rootScope.nbProducts = this.getNbProduct();
			$rootScope.cartProducts = this.getProducts();
		};
		
		cart.getNbTotalProduct = function () {
			var nb = 0;
			var key;
			for(key in this.products) {
				nb += this.products[key].quantity;
			}
			return nb;
		};
		
		cart.getTotal = function() {
			var total = 0;
			var key;
			for(key in this.products) {
				total += (parseFloat(this.products[key].quantity) * parseFloat(this.products[key].prix));
			}
			return total;
		};
		
		cart.getProducts = function () {
			return this.products;
		};
		
		cart.delete = function() {
			var cart = this;
			var instance = new PouchDB('cart');
			cart.products = {};
			instance.get(cart.getId(), function(err, panier) {
				if (panier) {
					instance.remove(panier, function(err, response) { });
				}
				cart.update();
				$rootScope.$apply();
			});
		}
		
		return cart;
	}])
	.factory('SafoOrders', ['$rootScope', 'SafoDatas', 'SafoCart', function($rootScope, SafoDatas, SafoCart) {
		var order = {
				client_id: null,
				client: null,
				produits: {},
				identifiant: null,
				date: null,
				date_livraison: null,
				commentaire: null,
				notes: null,
				statut: null,
				type: 'Commande'
		};
		
		order.getClient = function() {
			return SafoDatas.getClient();
		}
		
		order.getId = function(clientId, identifiant) {
			return 'COMMANDES-' + clientId + '-' + identifiant;
		};
		
		order.save = function(callback) {
			var order = this;
			var instance = new PouchDB('orders');
			instance.get(order._id, function(err, ord) {
				if (ord) {
					instance.remove(ord, function(err, response) { 
						if(!err) {
							console.log('remove ok');
							instance.put(order, function(err, response) { if(!err) {console.log('add ok');callback();} else {console.log(err)} });
						} else {
							console.log(err)
						}
					});
				} else {
					instance.put(order, function(err, response) { if(!err) {console.log('add ok');callback();} else {console.log(err)} });
				}
				
			});
		};
		
		order.generateCommande = function(dateLivraison, commentaire, notes) {
			var order = this;
			var date = new Date();
			var client = this.getClient();
			order.identifiant = date.getTime();
			order.client_id = client._id;
			order.client = client;
			order._id = order.getId(client._id, date.getTime());
			order.produits = {};
			order.date = date.toISOString();
			order.date_livraison = null;
			if (dateLivraison) {
				order.date_livraison = dateLivraison.toISOString();
			}
			order.commentaire = commentaire;
			order.notes = notes;
			order.statut = 'ATTENTE';

			var p = SafoCart.getProducts();
			var produits = {};
			for (var key in p) {
				produits[p[key].product._id] = {
						_id: p[key].product._id,
						libelle: p[key].product.libelle,
						pcb: p[key].product.pcb,
						prix: p[key].prix,
						quantity: p[key].quantity,
						image_petite_url: p[key].product.image_petite_url
				};
			}
			order.produits = produits;
			
			return order;
		};
		
		return order;
	}])
	;
