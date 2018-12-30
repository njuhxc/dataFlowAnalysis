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
 
// command line utility for extracting all JavaScript code embedded through <script> tags from an HTML page
// and dumping it to stdout
// TODO: doesn't extract JavaScript code from HTML attributes yet

/*global require process console*/

var parseFiles = require('./parsing').parseFiles,
    escodegen = require('escodegen').generate;

console.log(parseFiles(process.argv.slice(2)).scripts.map(escodegen).join(''));