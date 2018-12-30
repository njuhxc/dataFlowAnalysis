/*******************************************************************************
 * @license
 * Copyright (c) 2012 VMware, Inc. All Rights Reserved.
 * THIS FILE IS PROVIDED UNDER THE TERMS OF THE ECLIPSE PUBLIC LICENSE
 * ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION OF THIS FILE
 * CONSTITUTES RECIPIENTS ACCEPTANCE OF THE AGREEMENT.
 * You can obtain a current copy of the Eclipse Public License from
 * http://www.opensource.org/licenses/eclipse-1.0.php
 *
 * Contributors:
 *     Andrew Eisenberg (VMware) - initial API and implementation
 *     Max Schaefer              - added support for scope tracking
 ******************************************************************************/

/*global require module*/
if(typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define(function(require, exports) {
    var esprima = require("esprima"),
        ast = require("./ast"),
        scope = require("./scope");
    
    /**
     * Generic AST visitor.
     *
     * @param node The AST node to visit
     * @param Object context any extra data required to pass between operations
     * @param operation function(node, context, [isInitialOp]) an operation on the AST node and the data.  Return falsy if the visit should no longer continue. Return truthy to continue.
     * @param [postoperation] (optional) function(node, context, [isInitialOp]) an operation that is exectuted after visiting the current node's children; will only be invoked if operation returns true for the current node
     */
    exports.visit = function(node, context, operation, postoperation) {
	var i, key, child, children;
	
	if (operation(node, context, true)) {
	    if(context)
		var old_parent = context.parent, old_childIndex = context.childIndex;
	    for(i=0; i<ast.getNumChild(node); ++i) {
		// skip over some nodes that are arguably terminals
		if(node.type === 'MemberExpression' && !node.computed && i === 1 ||
		   ast.isFunctionNode(node) && i === 0 ||
		   node.type === 'Property' && i === 0 ||
		   node.type === 'VariableDeclarator' && i === 0)
		    continue;
		child = ast.getChild(node, i);
		if(context)
		    context.parent = node, context.childIndex = i;
		this.visit(child, context, operation, postoperation);
	    }
	    if(context)
		context.parent = old_parent, context.childIndex = old_childIndex;
	    if(postoperation)
		postoperation(node, context, false);
	}
    };
    
    /**
     * JavaScript AST visitor that maintains scope.
     *
     * @param node The AST node to visit
     * @param {scope:Scope,...} context any extra data required to pass between operations; if scope is not set, it defaults to the global scope
     * @param operation function(node, context, [isInitialOp]) an operation on the AST node and the data.  Return falsy if the visit should no longer continue. Return truthy to continue.
     * @param [postoperation] (optional) function(node, context, [isInitialOp]) an operation that is exectuted after visiting the current node's children; will only be invoked if operation returns true for the current node
     */
    exports.visitWithScope = function(node, context, operation, postoperation) {
	if(!context.scope)
	    context.scope = new scope.GlobalScope(node);
	exports.visit(node, context,
		      function(node, context) {
			  try {
			      return operation.apply(this, arguments);
			  } finally {
			      switch(node && node.type) {
			      case 'FunctionDeclaration':
			      case 'FunctionExpression':
				  context.scope = new scope.FunctionScope(context.scope, node);
				  break;
			      case 'CatchClause':
				  context.scope = new scope.CatchScope(context.scope, node);
				  break;
			      case 'WithStatement':
				  context.scope = new scope.WithScope(context.scope, node);
				  break;
			      }
			  }
		      },
		      function(node, context) {
			  if(node &&
			     (node.type === 'FunctionDeclaration' ||
			      node.type === 'FunctionExpression' ||
			      node.type === 'CatchClause' ||
			      node.type === 'WithStatement')) {
			      context.scope = context.scope.outer;
			  }
			  return postoperation && postoperation.apply(this, arguments);
		      });
    };
});