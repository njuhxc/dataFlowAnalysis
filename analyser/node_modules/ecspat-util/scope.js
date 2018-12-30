/*******************************************************************************
 * Copyright (c) 2012 IBM Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/

/**
 * Scope objects keep track of name binding. Each scope object represents
 * either the global scope, a function scope, a catch clause scope, or
 * a 'with' scope.
 */
 
 /*global require module*/

if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
  var ast = require('./ast'),
      decls = require('./decls');
  
  // abstract base class of all scopes
  function Scope(outer, decls) {
    this.outer = outer;
    this.decls = decls;
  }
  
  // is x a global variable in this scope?
  Scope.prototype.isGlobal = function(x) {
    return !this.isLocal(x) && this.outer.isGlobal(x);
  };
  
  // does x have a declaration at the global level?
  Scope.prototype.isDeclaredGlobal = function(x) {
    return this.outer.isDeclaredGlobal();
  };
  
  // look up x among the local declarations in this scope
  Scope.prototype.localLookup = function(x) {
    for(var i=0;i<this.decls.length;++i)
      if(decls.getDeclName(this.decls[i]) === x)
        return this.decls[i];
    return null;
  };
  
  // is x a local variable declared in this scope?
  Scope.prototype.isLocal = function(x) { return !!this.localLookup(x); };
  
  // look up x in this or an enclosing scope
  Scope.prototype.lookup = function(x) {
    return this.localLookup(x) || this.outer && this.outer.lookup(x);
  };
  
  Scope.prototype.enclosingFunction = function() {
	return this.outer && this.outer.enclosingFunction();
  };
  
  // object representing the global scope
  function GlobalScope(root) {
    Scope.call(this, null, decls.collectDecls(root, []));
  }
  GlobalScope.prototype = Object.create(Scope.prototype);
  
  GlobalScope.prototype.isGlobal = function(x) { return true; };
  GlobalScope.prototype.isLocal = function(x) { return false; };
  GlobalScope.prototype.possibleWithBindings = function(x) { return []; };
  GlobalScope.prototype.isDeclaredGlobal = function(x) {
    return !!this.localLookup(x);
  };
    
  // constructor representing a function scope;
  // we add a fake declaration for the 'arguments' array and count the function
  // expression (if it is named) as a local declaration, but only if there isn't
  // a shadowing local variable
  function FunctionScope(outer, fn) {
    this.fn = fn;
    Scope.call(this, outer, fn.params.concat(decls.collectDecls(fn.body, [])));
    if(!this.isLocal('arguments'))
		this.decls.push(new ast.Identifier('arguments'));
    if(this.fn.type === 'FunctionExpression' && this.fn.id && !this.isLocal(this.fn.id.name))
		this.decls.push(this.fn);
  }
  FunctionScope.prototype = Object.create(Scope.prototype);
  
  // list of enclosing with statements that may bind x
  FunctionScope.prototype.possibleWithBindings = function(x) {
    if(this.isLocal(x))
      return [];
    return this.outer.possibleWithBindings(x);
  };
  
  FunctionScope.prototype.enclosingFunction = function() {
	return this.fn;
  };
  
  // constructor representing a catch clause scope
  function CatchScope(outer, cc) {
    Scope.call(this, outer, [cc.param]);
  }
  CatchScope.prototype = Object.create(Scope.prototype);
  
  CatchScope.prototype.isLocal = function(x) { return x === this.decls[0].name || this.outer.isLocal(x); };
  
  CatchScope.prototype.possibleWithBindings = function(x) {
    if(x === this.decls[0].name)
      return [];
    return this.outer.possibleWithBindings(x);
  };
  
  // constructor representing a with scope
  function WithScope(outer, with_stmt) {
    Scope.call(this, outer, []);
    this.with_stmt = with_stmt;
  }
  WithScope.prototype = Object.create(Scope.prototype);
  
  WithScope.prototype.isLocal = function(x) { return this.outer.isLocal(x); };
  
  WithScope.prototype.possibleWithBindings = function(x) {
    var bindings = this.outer.possibleWithBindings(x);
    bindings.unshift(this.with_stmt);
    return bindings;
  };
  
  exports.Scope = Scope;
  exports.GlobalScope = GlobalScope;
  exports.FunctionScope = FunctionScope;
  exports.CatchScope = CatchScope;
  exports.WithScope = WithScope;
});