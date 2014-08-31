var debug = {};

angular.module('modelvizControllers', []).controller('entityCtrl',

function($scope, entityAPIservice, $element) {

	var id = 'EAID_67E9811F_AD9D_412c_BD94_43A741DCE7ED'
	var id2 = 'EAID_DB27CB55_ADE6_4fb5_B29E_A08E2486D620'
	$scope.element = {};
	var vz = {}

	entityAPIservice.getEntity(id2, 4).success(function(response) {
		$scope.entity = response;
		console.log(response)
		vz = new Visualizer($element, response)
		$scope.wWidth = vz.dim.width
		$scope.wHeight = vz.dim.height
	});

	$scope.myMouse = {}
	var ydown = -10 ;
	var currentValue = 1.0;
	var scale = 0.0
//	paper.on('blank:pointerdown', function(evt, x, y) { 
//	    alert('pointerdown on a blank area in the paper.')
//	})
	$scope.myMouse.doClick = function (event) { 
		$scope.mLocation = event.clientX + "-" +event.clientY + " Button: " +event.altKey
		if ( event.altKey) { 
	      if ( ydown < -1) {		
		    ydown = event.clientY		    
	      }	      
	      if ( event.clientY > ydown) { 
	        currentValue += 0.05
	      }else {
		    currentValue -= 0.05	    	  
	      }
		  vz.paper.scale( currentValue )
	    } else {
	    	ydown = -10
	    }
		if ( event.ctrlKey) { 
			currentValue = 1.0
			vz.paper.scale(1.0)
		}
	}
});


/*
 * MODE THESE TO FACTORY ... OR SERVICe
 * 
 */

var Visualizer = function ( $element, rootEntity) { 

	var PROCESSED = {};		
	this.$element = $element;
	this.rootEntity = rootEntity;
	var EMAP = buildEntityMap( rootEntity );

	var getNode = function getNode(id) {
		var res = this.EMAP[id]
		if (res === undefined) {
			// console.log("DEBUG Check : Identifier "+id+" not found")
		}
		return res
	}
	
	
	 
}

function buildEntityMap(entity) {

	var map = {}
	if (entity != undefined) {
		map[entity.identifier] = createNode(entity)
		for (var i = 0; i < entity.relatedEntities.length; ++i) {
			// todo: we may process same entities multiple times if loops
			map = $.extend({}, map, buildEntityMap(entity.relatedEntities[i]))
		}
	}
	return map
}


Visualizer.prototype createDiagram = function() {

	
	var graph = new joint.dia.Graph;
	var paper = new joint.dia.Paper({
		el : this.$element,
		width : this.$element[0].offsetWidth, // $('#diagram').width(),
		height : this.$element[0].offsetHeight, // $('#diagram').height(),
		model : graph,
		gridSize : 1
	});
	paper.on('cell:pointerdblclick', function(cellView, evt, x, y) {
		console.log('cell view ' + cellView.model.id + ' was clicked');
		if (cellView.model._ENTITY !== undefined) {
					debug = cellView.model;
		}
	});
	// paper.scale(0.5)
	console.log("Initial offset: Width " + $element[0].offsetWidth
			+ ". Height " + $element[0].offsetHeight)
	console.log("Initial style : Width " + $element[0].style.width
			+ ". Height " + $element[0].style.height)
	debug = rootEntity
	var rest = this.buildGraph(rootEntity)

	_.each(Object.keys(this.EMAP), function(k) {
		var node = this.EMAP[k]
		graph.addCell(node)
	})

	_.each(rest.associations, function(r) {
		graph.addCell(r);
	});
	_.each(rest.parentChild, function(r) {
		graph.addCell(r);
	});

	var dim = joint.layout.DirectedGraph.layout(graph, {
		setLinkVertices : false
	});
	console.log("Width: " + dim.width + " Height: " + dim.height)
	return {
		'dim' : dim,
		'graph' : graph,
		'paper' : paper
	}
}



Visualizer.prototype createNode = function (entity) {

	var uml = joint.shapes.uml;
	var e
	var attrs = _.filter(entity.attributes, function(a) {
		return a.typeType == 'primitive'
	}).map(function(a) {
		return a.name
	})
	// todo: show entities which fall outside the "diagram area" (ie.f. which
	// are not in EMAP) as attributes and entity labels (generalizations)
	switch (entity.type) {
	case "primitive":
		e = new myUML.Datatype({
			id : entity.identifier,
			size : {
				width : 200,
				height : 60
			},
			name : "" + entity.name
		})
		break;
	case "interface":
		e = new uml.Interface({
			id : entity.identifier,
			size : {
				width : 200,
				height : (16 * attrs.length + 40)
			},
			name : "" + entity.name,
			attributes : attrs
		})
		break;
	case "abstractClass":
		e = new uml.Abstract({
			id : entity.identifier,
			size : {
				width : 200,
				height : (16 * attrs.length + 30)
			},
			name : "" + entity.name,
			attributes : attrs
		})
		break;
	default:
		e = new uml.Class({
			id : entity.identifier,
			size : {
				width : 200,
				height : (16 * attrs.length + 30)
			},
			name : "" + entity.name,
			attributes : attrs
		})
	}
	e.attr('text/font-size', 12);
	e._ENTITY = entity
	return e

}

Visualizer.prototype buildGraph = function (entity) {

	var root = getNode(entity.identifier)
	if (this.PROCESSED[entity.identifier] !== undefined) {
		return {
			'associations' : [],
			'parentChild' : []
		}
	}
	this.PROCESSED[entity.identifier] = "DONE"
	var uml = joint.shapes.uml;

	var associations = []
	_.each(_.filter(entity.attributes, function(a) {
		return a.typeType != 'primitive'
	}), function(e) {
		var target = this.getNode(e.typeIdentifier)
		if (target !== undefined) {
			// console.log(entity.name+" "+target._ENTITY.name+" "+e.name+'
			// '+e.navigable)
			var asso = {};
			if ( e.aggregation == "shared") {
				asso = new uml.Aggregation({
					source : {
						id : root.id
					},
					target : {
						id : target.id
					}
				})				
			} else if ( e.aggregation == "composite") {
				asso = new uml.Composition({
					source : {
						id : root.id
					},
					target : {
						id : target.id
					}
				})
				
			} else {
				asso = new uml.Association({
					source : {
						id : root.id
					},
					target : {
						id : target.id
					}
				})
				if (e.navigable) {
					asso.attr('.marker-target', {
						fill : 'red',
						d : 'M 10 0 L 0 5 L 10 10 z'
					})
				} else {
					asso.attr('.marker-target', {
						fill : 'orange',
						d : 'M 10 0 L 0 5 L 10 10 z'
					})
				}
			}
			
			if ( e.atype == "dependencyAssociation") { 
				asso.attr('.connection', { 'stroke-dasharray': '3,3' })				
			}
			if ( e.name != "") {
				asso.attr(".name",e.name)
				asso.label(0, {
				    position: .5,
				    attrs: {
				        rect: { fill: 'white' },
				        text: { fill: 'black', text: e.name }
				    }
				});
			}
			
			asso._ENTITY = e
			associations.push(asso)
		}
	})

	var parentChild = []
	_.each(entity.parentIDs, function(p) {
		var target = this.getNode(p)
		if (target != undefined) {
			switch (target._ENTITY.type) {
			case "interface":
				var asso = new uml.Implementation({
					source : {
						id : root.id
					},
					target : {
						id : target.id
					}
				})
				parentChild.push(asso)
				break;
			default:
				var asso = new uml.Generalization({
					source : {
						id : root.id
					},
					target : {
						id : target.id
					}
				})
				parentChild.push(asso)
			}
		} else {
			console.log("FATAL Parent class " + p + " not found")
		}
	})

	for (var i = 0; i < entity.relatedEntities.length; i++) {
		var res = buildGraph(entity.relatedEntities[i])
		associations = associations.concat(res.associations)
		parentChild = parentChild.concat(res.parentChild)
	}
	return {
		'associations' : associations,
		'parentChild' : parentChild
	}
}


