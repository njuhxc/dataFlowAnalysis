/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Max Schaefer - initial API and implementation
 *******************************************************************************/

/** Smart completion for JavaScript. 
 *
 * This module only contains some top-level driver code. The actual cleverness
 * happens in DAIN (the dynamic API inferencer) and ecsptr (the static
 * pointer analysis) which are pulled in as dependencies. */

/*global require process console*/

var analysis = require('ecsptr/analysis'),
    ast = require("ecspat-util/ast"),
    visitor = require('ecspat-util/scoped_visitor'),
    sets = require('ecspat-util/sets');
    fs = require("fs");
    

//console.log('start!');
// simple command line processing
var files = process.argv.slice(2);
//console.log(files);
var no_dom = false,
    no_tweaks = false;
if (files[0] === '--no-dom') {
	no_dom = true;
	files.shift();
}
if (files[0] === '--no-tweaks') {
	no_tweaks = true;
	files.shift();
}
if (files[0][0] === '-') {
	console.log("Usage: node complete.js [--no-dom] [--no-tweaks] FILE...");
	process.exit(-1);
}

file1 = files[0].split("/");
//console.log(file1.length);
f = file1[file1.length-1];
version = file1[file1.length-2];
//console.log(version);
f2 = f.split(".");
f3 = f2[0];
//console.log(f3);
// analyse the input files
var sol = analysis.analyse(files, {
    fake_values: !no_tweaks,
    implicit_receivers: !no_tweaks,
    no_dom: no_dom
});
var prog = sol.program;
var time_building_constraints = sol.time_building_constraints;
var time_solving_constraints = sol.time_solving_constraints;
//console.log(sol.hook);
//console.log(sol.outgoing_constraints);
//sol.prototype.printSolution;
var constraints = "";
var con_id = "";

sol.var_manager.forEachVariable(function(absvar, absvar_idx) {
			var absvals = sol.points_to[absvar_idx];
			if (absvals != sets.empty && (absvar.pp_absvar || absvar.id || ast.getAttribute(absvar, 'isParam'))) {
			//console.log(sol.var_manager.pp_absvar(absvar_idx) + " -> " + sets.pp(absvals, sol.val_manager.pp_absval, sol.val_manager));
			constraints += sol.var_manager.pp_absvar(absvar_idx) + "," + sets.pp(absvals, sol.val_manager.pp_absval, sol.val_manager) + "\n";
			//console.log(absvar_idx + "->" + absvals);
			con_id += absvar_idx + "," + absvals + "\n";
			}
		});
		
//console.log(constraints,con_id);

/*
if(!fs.existsSync(version)){

fs.mkdir(version,  function(err) {
   if (err) {
       return console.error(err);
   }
})
}

fs.writeFile(version+'/'+f3+'__constraints.txt', constraints,  function(err) {
   if (err) {
       return console.error(err);
   }
})

*/
if(!fs.existsSync(version)){

fs.mkdir(version,  function(err) {
   if (err) {
       return console.error(err);
   }
})
}

fs.writeFile(version+'/'+f3+'__conid.csv', con_id,  function(err) {
   if (err) {
       return console.error(err);
   }
})

// find completion problem
/*
visitor.visit(prog, {}, function(nd, ctxt) {
        if (nd) {
		if (nd.type === 'MemberExpression' && !nd.computed && nd.property.name.substring(0, 2) === '$$' ) {
		    //console.log(nd);
			checkPropName(nd.object, nd.property.name.substring(2), ctxt, nd);
		}
	}
	return true;
});

// check that property 'name' is among the properties of 'base'
function checkPropName(base, name, ctxt, nd) {
    //console.log(name);
	var start = +new Date();
	var props = getPropNames(base);
	//console.log(props);
	var time_getnames = +new Date() - start;
	var idx = props.indexOf(name);
	var msg;
	if (idx === -1) {
		msg = "property " + name + " not found; number of suggestions: " + props.length + " (" + props + ")";
	} else {
		msg = "property " + name + " found; position: " + idx + "; number of suggestions: " + props.length;
	}
	msg += "; building constraints: " + time_building_constraints + "ms; solving constraints: " + time_solving_constraints + "ms";
	console.log(msg);
}

function pointsTo(v) {
	if (typeof v !== 'number') v = sol.var_manager.absvar2idx(v);
	return sol.points_to[v];
}

function getPropNames(base) {
    // get prop names of this object
    //console.log(base);
    //console.log(pointsTo(base));
    var vals = addAll([], sets.map(pointsTo(base), getValPropNames));
    // filter out names from our framework models and from truncation tests
    //console.log(vals);
    vals = vals.filter(function(prop) {
	return !prop.match(/^(new_)?function_\d+(_\d+)?/) && 
	       !prop.match(/^objlit_\d+(_\d+)?/) && 
	       !prop.match(/^\$\$[a-zA-Z0-9_$]+$/);
    });
    //console.log(vals);
    return vals;
}

//get the prototype of vals pointing to the var base
function getValPropNames(val_idx, rank) {
    //console.log(val_idx);
    var val = sol.val_manager.idx2absval(val_idx);
    //console.log(val);
    var names = ast.getAttribute(val, 'propnames');
    //console.log(names);
    if (names) {
	return names;
    } else {
	names = [];
	sol.var_manager.allFields(val).forEach(function(info) {
	    var field_name = info[0],
	        field_from_source = info[1];
	    if(field_from_source) {
		var field = sol.var_manager.mkAbsField(val, field_name);
		var vals = sets.map(pointsTo(field), function(idx) {
		    return sol.val_manager.idx2absval
		});
		add(names, field_name);
	    }
	});
	ast.setAttribute(val, 'propnames', names);
	var proto_field = sol.var_manager.mkAbsField(val, '$$proto$$');
	var protos = pointsTo(proto_field);
	addAll(names, sets.map(protos, getValPropNames));
	ast.setAttribute(val, 'propnames', names);
	return names;
    }
}
					
function add(array, elt) {
    for (var i = 0, m = array.length; i < m; ++i)
	if (array[i] === elt)
	    return array;
    array[i] = elt;
    return array;
}

function addAll(array, arrays) {
    for (var i = 0, m = arrays.length; i < m; ++i)
	for (var j = 0, n = arrays[i].length; j < n; ++j)
	    add(array, arrays[i][j]);
    return array;
}
*/
