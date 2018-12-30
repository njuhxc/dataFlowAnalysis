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
 * Utility functions to collect all variable and function declarations in a subtree.
 */
 
 /*global require module*/
 
if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
  var ast = require('./ast');

  function getDeclName(decl) {
    if(decl.type === 'Identifier')
      return decl.name;
    return decl.id.name;
  }
  
  function collectDecls(nd, accu) {
      if(!nd)
	  return accu;

      if(nd.type === 'FunctionDeclaration' ||
	 nd.type === 'VariableDeclarator') {
	  accu.push(nd);
      } else if(nd.type !== 'FunctionExpression') {
	  ast.forEachChild(nd, function(ch) {
              collectDecls(ch, accu);
	  });
      }
      return accu;
  }
  
  exports.collectDecls = collectDecls;
  exports.getDeclName = getDeclName;
});