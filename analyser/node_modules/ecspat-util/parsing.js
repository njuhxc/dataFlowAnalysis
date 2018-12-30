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

/** Utility functions for parsing HTML and JS files. */

/*global require exports */

var fs = require('fs'),
    esprima = require('esprima'),
    path = require('path'),
    htmlparser = require('htmlparser');

function parseJS(src) {
	return esprima.parse(src, {
		range: true,
		tolerant: true,
		loc: true,
		comment: true
	});
}

function walkDOM(node, baseurl, prog) {
	if (node.type === 'script') {
		if (!node.attribs || !node.attribs.type || node.attribs.type.match(/JavaScript/i)) {
			var script_code;
			if (node.attribs && node.attribs.src) {
				var script_path = path.resolve(baseurl, node.attribs.src);
				script_code = fs.readFileSync(script_path, 'utf-8');
			} else {
				script_code = node.children[0].raw;
			}
			prog.scripts.push(parseJS(script_code));
		}
	} else if (node.type === 'tag') {
		if (node.children) node.children.forEach(function(ch) {
			walkDOM(ch, baseurl, prog);
		});
	} else if (Array.isArray(node)) {
		node.forEach(function(ch) {
			walkDOM(ch, baseurl, prog);
		});
	}
}

function handleHTMLFile(prog, file) {
	var handler = new htmlparser.DefaultHandler();
	var HTMLparser = new htmlparser.Parser(handler);
	var html = fs.readFileSync(file, 'utf-8');
	HTMLparser.parseComplete(html);
	walkDOM(handler.dom, path.dirname(file), prog);
}

function handleJSFile(prog, file) {
	var script_code = fs.readFileSync(file, 'utf-8');
	prog.scripts.push(parseJS(script_code));
}

// parse a given collection of HTML and JS files
exports.parseFiles = function(files) {
	var prog = {
		type: 'ScriptCollection',
		scripts: []
	};
	files.forEach(function(file) {
		if (file.match(/\.js/)) handleJSFile(prog, file);
		else handleHTMLFile(prog, file);
	});
	return prog;
};