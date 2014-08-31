"use strict";
var debug = {};
var DISTANCE = 1 

angular.module('modelvizControllers', []).controller('entityCtrl',


function($scope, entityAPIservice, $element) {

	var id = 'EAID_67E9811F_AD9D_412c_BD94_43A741DCE7ED'
	var id2 = 'EAID_DB27CB55_ADE6_4fb5_B29E_A08E2486D620'
	var enumcase = 'EAID_E76CBAE3_28FE_4b23_8DF9_FC2520AD9367'
	var class3 = 'EAID_2D74DA5E_06F1_4e70_9B3C_46CF7F88331D'
	var dataType1 = 'EAID_96501059_5A26_482f_9B87_89B7336A4418'
	var textUml = '8ac5ae19c779:Identifiable'
	var owlClass = 'http://semanticscience.org/resource/SIO_010377'
	$scope.element = {};

	var v = new Visualiser($scope, $element, entityAPIservice)
	v.getNewData(textUml, DISTANCE,$scope)

});

/*
 * VIZUALI(S/Z)ER ==============
 * 
 */

var Visualiser = function($scope, $element, api) {

	var self = this;

	self.$element = $element;
	self.$scope = $scope;
	self.api = api;

	var PROCESSED = undefined;
	var EMAP = undefined;
	var ASSOMAP = undefined;
	var PROXYMAP = undefined;

	var graph = new joint.dia.Graph();
	var paper = new joint.dia.Paper({
		el : self.$element,
		// width : self.$element[0].offsetWidth, // $('#diagram').width(),
		// height : self.$element[0].offsetHeight, // $('#diagram').height(),
		model : graph,
		gridSize : 1
	});

	$scope.testHeight = self.$element[0].offsetHeight;
	$scope.testWidth = self.$element[0].offsetWidth;

	paper.on('cell:pointerdblclick', function(cellView, evt, x, y) {
		console.log('cell view ' + cellView.model.id + ' was clicked');
		if (cellView.model._ENTITY !== undefined && cellView.model.attributes.type != 'myUML.Package') {
			//self.init({}, {}, {});
			graph.clear();
			// $scope.diagramstyle = { 'width': 10 , 'height' : 10, 'float':
			// 'left'};
			self.getNewData(cellView.model.id, DISTANCE, $scope); // todo: level param
		}
	});

	paper.on('cell:pointerclick', function(cellView, evt, x, y) {
		console.log('cell view ' + cellView.model.id + ' was clicked');
		if ( cellView.model._ENTITY !== undefined) {
			$scope.name = cellView.model._ENTITY.name;
			$scope.description = cellView.model._ENTITY.description;			
		}
		debug = cellView
	});

	var onBlank = false;
	$scope.myMouse = {}
	var ydown = 0;
	var currentValue = 1.0;
	var scale = 0.0
	var modifier = undefined;

	paper.on('blank:pointerdown', function(evt, x, y) {
		onBlank = true;
	})

	paper.on('cell:pointerdown', function(cellView,evt, x, y) {
		console.log(cellView)
//		cellView.model.attr({
//		    rect: { fill: 'blue' },
//		    text: { fill: 'white', 'font-size': 15 },
//		    '.myrect2': { fill: 'red' }
//		});
	})

	$scope.myMouse.up = function(evt) {
		onBlank = false;
		$scope.diagramstyle = {
			'cursor' : 'default'
		};
	}

	$scope.myMouse.move = function(evt) {

		if (onBlank) {

			if (evt.altKey) {
				$scope.diagramstyle = {
					'cursor' : 'ns-resize'
				};
				modifier = 'altKey';
			} else if (evt.shiftKey) {
				$scope.diagramstyle = {
					'cursor' : 'move'
				};
				modifier = 'shiftKey';
			} else {
				modifier = undefined;
				onBlank = false;
				$scope.diagramstyle = {
					'cursor' : 'default'
				};
			}
			$scope.mLocation = event.pageX + "-" + evt.pageY + " Alt: "
					+ evt.altKey
			if (modifier == 'altKey') {
				if (event.pageY > ydown) {
					currentValue += 0.01
				} else {
					currentValue -= 0.01
				}
				ydown = event.pageY;
				paper.scale(currentValue)
			} else if (modifier == 'shiftKey') {

			}
		}
	}

	self.addCell = function(o) {
		graph.addCell(o)
	}

	self.doLayout = function() {
		var dim = joint.layout.DirectedGraph.layout(graph, {
			setLinkVertices : true,
			nodeSep : 30,
			rankSep : 100,
			rankDir: "BT"
		});
		console.log(dim);
		if (self.$element[0].offsetWidth > dim.width) {
			paper.fitToContent(self.$element[0].offsetWidth, dim.height, 10);
		} else {
			paper.fitToContent(dim.width, dim.height, 10);
		}
		$scope.diagramstyle = {
			'width' : dim.width + 10,
			'height' : dim.height + 10
		};
		// note: see also resize directive (currenly not used)
		return dim;
	}

	self.init = function(e, a, p) {
		EMAP = e;
		ASSOMAP = a;
		PROXYMAP = p;
	}

	self.initAppend = function ( e,a,p) {
		EMAP = $.extend({}, EMAP, e);
		if ( ASSOMAP === undefined) {
			ASSOMAP = {};
		}
		_.each ( Object.keys( a), function(id) {
		     if (  ASSOMAP[ id] === undefined ) {
		    	 ASSOMAP[ id ] = a[ id];
		     }	else {
		    	 if ( ASSOMAP[ id].length < a[ id].length ) {
		    		 ASSOMAP[ id] = a [ id];
		    	 } 
		     }
		});
		
		PROXYMAP = p; //todo: remove
	}
	
	self.getEntityIDs = function() {
		if (EMAP === undefined) {
			return [];
		} else {
			return Object.keys(EMAP);
		}
	}

	self.getNode = function(id) {
		var res = PROXYMAP[id]
		if (res === undefined) {
			res = EMAP[id];
		} else {
			console.log("GOT PROXY FOR " + id)
		}
		return res
	}

	self.setProxyNode = function(id, proxyNode) {
		if (PROXYMAP[id] !== undefined) {
			console.log("WARNING. Proxy is already set for  " + id)
		}
		PROXYMAP[id] = proxyNode
	}

	self.isProcessed = function(id) {
		if (PROCESSED[id] === undefined) {
			return false
		} else {
			return true
		}
	}

	self.setProcessed = function(id) {
		PROCESSED[id] = "DONE"
	}

	self.getAssociationEndIDs = function() {
		return Object.keys(ASSOMAP)
	}

	self.getAssociationEnds = function(id) {
		var res = ASSOMAP[id]
		if (res === undefined) {
			// console.log("DEBUG Check : Identifier "+id+" not found")
		}
		return res
	}

}
/*
 * Create hashmap of Entities based on their id
 * 
 */
Visualiser.prototype.buildEntityMap = function(entity) {
	var self = this;
	var map = {}
	if (entity !== undefined) {
		map[entity.identifier] = entity;

		// console.log( entity.identifier,entity.name,entity.type)
		for (var i = 0; i < entity.relatedEntities.length; ++i) {

			// map = $.extend({}, map, self
			// .buildEntityMap(entity.relatedEntities[i]))

			// we may have duplicates due to loops etc. Select entity based on
			// neighbourLevelso that we can
			// display "borderline entities" which may miss parents etc.
			// differently:
			var map2 = self.buildEntityMap(entity.relatedEntities[i]);
			var keys = Object.keys(map2);
			_.each(keys, function(k) {
				if (map[k] === undefined) {
					map[k] = map2[k]
				} else {
					if (map[k].neighbourLevel < map2[k].neighbourLevel) {
						console.log("LEVELS " + map2[k].neighbourLevel + " "
								+ map[k].neighbourLevel)
						map[k] = map2[k];
					}
				}
			});
		}
	}
	return map
}

Visualiser.prototype.buildNodeMap = function(entity) {
	var self = this;
	var nMap = {};
	var map = self.buildEntityMap(entity);
	_.each(Object.keys(map), function(id) {
		nMap[id] = self.createNode(map[id]);
	});
	return nMap
}

/*
 * Create hashmap of associations to be visualised as edges based on association
 * Map contains list of associations ends per association id
 * 
 */
Visualiser.prototype.buildAssociationMap = function(nodeMap) {
	var self = this;
	var idList = Object.keys(nodeMap);
	var assoMap = {}
	_.each(idList, function(id) {
		var node = nodeMap[id];
		var e = node._ENTITY;
		_.each(_.filter(e.attributes, function(a) {
			return a.associationIdentifier !== null && ( a.type == 'associationEnd' )
		}), function(a) {
			var asEnd = {
				entityId : id,
				end : a,
				associationName : a.associationName
			};
			if (assoMap[a.associationIdentifier] === undefined) {
				assoMap[a.associationIdentifier] = [ asEnd ];
			} else {
				assoMap[a.associationIdentifier].push(asEnd)
			}
		})
	});
	return assoMap;
}

/*
 * Create Graph nodes from Entities
 * 
 */
Visualiser.prototype.createNode = function(entity) {

	var self = this;
	var e = undefined;
	var attributes = _.filter(entity.attributes, function(a) {
		// || self.getAssociationEnds( a.associationIdentifier ) === undefined
		return (a.type == "attribute" || a.type == "associationDefinition"); // todo: owl direct properties. probs where entity is the domain
		// UI
		// should
		// be
		// configurable
	}).map(function(a) {
		var m = " [" + myUML.multiplicity(a) + "]";
		if (m === " []") {
			m === "";
		}
		if (a.type == "associationDefinition") {
			return a.name // a.name == a.typeName (a.type -> property. a.name
			// is "convenience field")
		} else {
			return a.name + ":" + a.typeName + m;
		}
	})

	var node = myUML.createClassNode(entity, attributes)
	return node

}
Visualiser.prototype.getNewData = function(entityId, levels,$scope) {
	var self = this

	self.api.getEntity(entityId, levels).success(function(response) {
		console.log("GOT NEW DATA: " + response)
		self.createDiagram(response)		
		$scope.name = response.name;
		$scope.description = response.description;			
		debug = response;
	});
}

/*
 * createDiagram
 * 
 */
Visualiser.prototype.createDiagram = function(rootEntity) {

	var self = this
	var EMAP = self.buildNodeMap(rootEntity);
	var ASSOMAP = self.buildAssociationMap(EMAP);
	self.initAppend(EMAP, ASSOMAP, {})

	/*
	 * FIRST NODES
	 */

	// todo : some nodes may have edges to primitives which may cause errors
	// when filtered out:
	var info = 0
	_.each(self.getEntityIDs(), function(id) {
		var node = self.getNode(id)
		if (node._ENTITY.type != 'primitive') {
			self.addCell(node)
			info = info + 1;
		}
	})
	console.log("Non-primitives: " + info);
	info = 0;

	// show primitives as package attributes (todo: create proxynode (which is
	// the package) for primitives)
	var pkgAttrs = [];

	_.each(self.getEntityIDs(), function(id) {
		var node = self.getNode(id)
		if (node._ENTITY.type == 'primitive') {
			pkgAttrs.push("primitive: " + node._ENTITY.name);
			info = info + 1;
		}

	})
	console.log("Primitives: " + info)

	var packageEntity = {
		identifier : rootEntity.packageIdentifier,
		name : rootEntity.packageName
	};

	var pkgNode = myUML.createPackage(packageEntity, pkgAttrs);

	_.each(self.getEntityIDs(), function(id) {
		var node = self.getNode(id)
		if (node._ENTITY.type == 'primitive') {
			self.setProxyNode(id, pkgNode)
			// graph.addCell( node)
		}
	})

	self.addCell(pkgNode);

	var rootNode = self.getNode(rootEntity.identifier);

	/*
	 * AND THEN EDGES
	 */

	var depEdge = myUML.createSemanticEdge(rootNode, "partOf", pkgNode);
	self.addCell(depEdge);

	info = 0;
	var edges = self.createEdges();

	_.each(edges.associationEdges, function(e) {
		console.log(e.cid)
		info = info + 1;
		self.addCell(e);
	});
	console.log("Association edges: " + info);
	info = 0;
	_.each(edges.parentChildEdges, function(r) {
		self.addCell(r);
		info = info + 1;
	});
	console.log("Dependency/parent child edges: " + info)

	self.doLayout();
} // createDiagram

Visualiser.prototype.createAssociationEdge = function(ends) {
	var self = this;

	if (ends.length !== 2) {

		console
				.log("WARNING: can currently handle only binary assosiations. Number of ends: "
						+ ends.length)
		_.each(ends, function(e) {
			console.log("    Entity: " + e.entityId + " Association: "
					+ e.end.associationIdentifier + ". Attribute id="
					+ e.end.identifier)
		})
		return undefined

	} else {

		var e1 = ends[0];
		var e2 = ends[1];
		var node1 = self.getNode(e1.entityId);
		var node2 = self.getNode(e2.entityId);

		var associationName = e1.associationName;
		if (e1.associationName != e2.associationName) {
			console
					.log("FATAIL. Assosiation ends do not match. Role names must be the same");
			associationName = "SOMETHING WRONG. Ends belong to different associations";
		}
		if (associationName == null) {
			associationName = "";
		}
		if (node1 === undefined || node2 === undefined) {
			console.log("FATAL. Cannot resolve nodes")
		}
		// source->target
		return myUML.createEdge(associationName, node1, node2, e1.end, e2.end);
	}
}

Visualiser.prototype.createEdges = function() {
	var self = this;

	var associationEdges = []

	_.each(self.getAssociationEndIDs(), function(id) {
		var ends = self.getAssociationEnds(id);
		var edge = self.createAssociationEdge(ends);
		if (edge !== undefined) {
			associationEdges.push(edge);
		}
	});

	var parentChildEdges = []

	_.each(self.getEntityIDs(), function(id) {
		var source = self.getNode(id);

		_.each(source._ENTITY.attributes,
				function(a) {
					if (a.type === 'dependency') {
						
						var target = self.getNode(a.typeIdentifier); // todo:
																		// is
																		// this
						// ok. Type of
						// dependency ?
						if (target != undefined) { // todo: we should this for
													// all
							// things. Some entities may
							// fall outside the inclusion
							// todo: check how role names and assocoation names
							// are/should be used
							var name = a.name;
							if ( name === undefined || name === "") {
								name = a.dependencyQualifier;
							} else if ( a.dependencyQualifier !== undefined || a.dependencyQualifier != "") {
								name = name + "("+a.dependencyQualifier+")"
							}
							var edge = myUML.createSemanticEdge(source, name,
									target);
							console.log("DEP: " + source._ENTITY.name + " "
									+ target._ENTITY.name)
							parentChildEdges.push(edge);
						}
					}
				});

		_.each(source._ENTITY.parentIDs, function(p) {
			var parent = self.getNode(p);

			if (parent != undefined) {
				var asso = myUML.createParentChildEdge(parent, source);
				if (asso == undefined) {
					alert("SOMETHING WRONG...");
				} else {
					parentChildEdges.push(asso);
				}
			} else {
				console.log("Parent class " + p + " not found. Neighbor")
			}
		})
	})

	return {
		'associationEdges' : associationEdges,
		'parentChildEdges' : parentChildEdges
	}
}
