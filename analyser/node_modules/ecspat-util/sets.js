/*******************************************************************************
 * Copyright (c) 2012 IBM Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *     Max Schaefer    - additional API
 *******************************************************************************/

/**
 * Simple ADT for sets containing numbers.
 * 
 * Empty sets are represented by undefined;
 * singleton sets are represented by their only element;
 * sets of size greater than one are represented as ordered arrays of their
 * elements.
 */
 
 /*global require module*/
 
if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
    /** The canonical empty set. */
    exports.empty = void(0);
    
    /** Checks whether set is empty. */
    exports.isEmpty = function(set) {
	return set === void(0);
    };
    
    /** Checks whether set contains x. */
    exports.contains = function(set, x) {
	switch(typeof set) {
	case 'undefined':
	    return false;

	case 'number':
	    return set === x;

	default:
	    var lo = 0, hi = set.length-1, mid, elt;
	    while(lo <= hi) {
		mid = (lo+hi) >> 1;
		elt = set[mid];
		if(elt === x) {
		    return true;
		} else if(elt < x) {
		    lo = mid+1;
		} else {
		    hi = mid-1;
		}
	    }
	    return false;  
	}
    };
  
    /** Adds x to set, possibly mutating set in the process, and returns the resulting set. */
    exports.add = function(set, x) {
	switch(typeof set) {
	case 'undefined':
	    return x;

	case 'number':
	    if(set < x)
		return [set, x];
	    if(set > x)
		return [x, set];
	    return set;
	    
	default:
	    var lo = 0, hi = set.length-1, mid, elt;
	    while(lo <= hi) {
		mid = (lo+hi) >> 1;
		elt = set[mid];
		if(elt < x) {
		    lo = mid+1;
		} else if(elt > x) {
		    hi = mid-1;
		} else {
		    return set;
		}
	    }
	    set.splice(lo, 0, x);
	    return set;
	}
    };
  
    /** Invokes a function on every element in a set. */
    exports.forEach = function(a, fn) {
	switch(typeof a) {
	case 'number':
	    fn(a);
	    break;
	case 'object':
	    a.forEach(fn);
	    break;
	}
    };
    
    /** Maps a function over a set, returning an array of results. */
    exports.map = function(a, fn) {
	switch(typeof a) {
	case 'undefined':
	    return [];
	case 'number':
	    return [fn(a)];
	default:
	    return a.map(fn);
	}
    };
    
    /** If set is non-empty, picks one of its elements and invokes the callback with that element and the rest of the set
     * as arguments; otherwise, does nothing. */
    exports.choose = function(a, fn) {
	switch(typeof a) {
	case 'undefined':
	    break;
	case 'number':
	    fn(a, void(0));
	    break;
	default:
	    switch(a.length) {
	    case 1:
		fn(a[0], void(0));
		break;
	    case 2:
		fn(a[0], a[1]);
		break;
	    default:
		fn(a.pop(), a);
	    }
	}
    };
  
    /** Pretty-print set, using pp_elt to pretty-print individual elements. */
    exports.pp = function(a, pp_elt, pp_elt_recv) {
	switch(typeof a) {
	case 'undefined':
	    return '{}';
	case 'number':
	    return "{ " + pp_elt.call(pp_elt_recv, a) + " }";
	default:
	    return "{ " + a.map(pp_elt, pp_elt_recv).join(', ') + " }";
	}
    };
    
    exports.toArray = function(a) {
	switch(typeof a) {
	case 'undefined':
	    return [];
	case 'number':
	    return [a];
	default:
	    return a;
	}
    };
});