var cheerio = require('cheerio');
var path = require('path');
var fs = require('fs');
var prism = require('./prism');
var publisher = require('./publisher');
var beautify = require('js-beautify').html;

/*
 * Hello
 */
module.exports = {

	/**
	 *
	 * @param {string} html
	 * @param {string} common
	 * @returns {string}
	 */
	process: function(html, tags, source) {
		var EMPTYLINE = /^\s*[\r\n]/gm;
		tags = tags.split(',');
		var $ = cheerio.load(html);
		$ = localization($);
		$ = headtags($, tags);
		$ = headertags($);
		$ = includetags($, source);
		$ = splitscreen($);
		$ = specialtags($);
		$ = highlite($);
		$ = maincontent($);
		$ = chromelinks($);
		$ = inittabs($);
		$ = stickys($);
		$('html').addClass('ts-docs');
		$('html').attr('spellcheck', false);
		return publisher.publish(
			beautify($.html().replace(EMPTYLINE, ''))
		);
	}
};

// Private .....................................................................

function maincontent($) {
	$('main').each(function(i, main) {
		main = $(main);
		var mainContent = $('<div data-ts="MainContent"></div>');
		mainContent.append(main.children());
		main.append(mainContent);
	});
	return $;
}

/**
 * Insert tags into HEAD section of HTML.
 */
function headtags($, tags) {
	inserttags($, tags, $('title'));
	lesstocss($);
	return $;
}

/**
 * LESS files get compiled, reflect that in LINK tags.
 */
function lesstocss($) {
	$('link').each(function(i, link) {
		var href = $(link).attr('href');
		href = href.replace('.less', '.css');
		$(link).attr('href', href);
	});
}

// Prettyprinting code snippets ................................................

/**
 * Insert them tags prettyprinted.
 */
function inserttags($, tags, target) {
	target.after($(tags.map(prettyprint).join('\n')));
}

/**
 * Prettyprint.
 */
function prettyprint(tag, i) {
	var tabs = i ? '\t\t' : '\n\t\t';
	return tabs + tag;
}

/**
 * Unindent.
 * @param {string} code
 * @returns {string}
 */
function unindent(code) {
	var tabs = /^\n+\s+/.exec(code)[0].replace(/\n/g, '');
	return code.split('\n').map(function(line, i) {
		return line.replace(tabs, '');
	}).join('\n').trim();
}

// Formatting code snippets ....................................................

/**
 * Hilite code snippets.
 */
function highlite($) {
	var script, code, klass, type, lang, gram;
	var figures = ['DoxMarkup', 'DoxScript'];
	$('figure').each(function(i, figure) {
		figure = $(figure);
		script = figure.find('script');
		figures.forEach(function(att) {
			if (figure.attr('data-ts') === att) {
				klass = att === 'DoxMarkup' ? 'language-markup' : 'language-javascript';
				type = script.attr('type') || 'text/plain';
				lang = klass.split('-')[1];
				gram = prism.languages[lang];
				code = unindent(script.text()).replace(/scrxpt/g, 'script');
				setup($, figure, script, klass, type, lang, gram, code);
				figure.attr('data-ts.code', encodeURIComponent(code));
			}
		});
	});
	$('[data-ts=DoxApi]').each(function(i, table) {
		script = $(table).find('script');
		if (script) {
			code = unindent(script.text());
			$(table).attr('data-ts.code', encodeURIComponent(code));
			script.remove();
		}
	});
	return $;
}

// Code snippet "chrome" .......................................................

/**
 * Replace SCRIPT with highlighted markup PRE.
 * @param {$} $
 * @param {$} figure
 * @param {$} script
 * @param {string} klass
 * @param {string} type
 * @param {string} lang
 * @param {string} gram
 * @param {string} code
 */
function setup($, figure, script, klass, type, lang, gram, code) {
	var html = prism.highlight(code, gram, lang);
	var runs = type.indexOf('runnable') > -1;
	var edit = type.indexOf('editable') > -1;
	var xxxx = figure.find('output')[0];
	var outs = !!xxxx;
	var flip = outs && !!($(xxxx).next('script')[0]); // output before script?
	var elem = $.parseHTML(getelement(klass, html, code, runs, edit, outs, flip));
	if (runs) {
		figure.addClass('runnable');
	}
	if (type === 'text/plain') {
		script.replaceWith(elem);
	} else {
		script.after(elem);
	}
	if (outs) {
		figure.find('output').remove();
	}
}

/**
 * @param {string} klass
 * @param {string} html
 * @param {string} code
 * @param {boolean} runs
 * @param {boolean} outs
 * @param {boolean} flip
 */
function getelement(klass, html, code, runs, edit, outs, flip) {
	var output = outs ? getoutput(code) : '';
	var x = {
		show: outs || runs,
		outs: outs,
		runs: runs,
		flip: flip
	};
	return [
		'<input type="hidden" value="' + encodeURIComponent(JSON.stringify(x)) + '"/>',
		'<div class="tabpanels">',
			[outs ? (flip ? output : '') : ''],
		'<pre class="prism ' + klass + '">',
		'<code>' + html + '</code>',
		'</pre>',
			[outs ? (flip ? '' : output) : ''],
		'</div>'
	].join('\n');
}

/**
 * @param {string} code
 * @returns {string}
 */
function getoutput(code) {
	return '<div class="output">' + code + '</div>';
}

// Typography ..................................................................

/**
 * Needed for hyphens:auto work via CSS.
 * @param {$} $
 */
function localization($) {
	var html = $('html');
	if (!html.attr('lang')) {
		html.attr('lang', 'en-us');
	}
	return $;
}

/**
 * Fix headers of all types by enclosing content in a SPAN.
 * This (undocumented) setup ensures that multiple columns
 * of text (which we don't use on Docs) have their headers
 * propertly lined up on the imagined grid baseline.
 * @param {$} $
 * @returns {$}
 */
function headertags($) {
	var i = 1; while (i <= 6) {
		headertype($, $('h' + i));
		i++;
	}
	return $;
}

/**
 * Resolve weird object tags that can pull content from other files.
 * just so that we don't copy paste and/or forget to update something.
 * (Cheerio cannot parse `object[type=text/html]` so we'll match `type`.
 */
function includetags($, source) {
	$('object[data]').each(function(index, include) {
		include = $(include);
		var full = include.attr('data') || '';
		var cuts = full.split('#');
		var href = cuts[0];
		var hash = cuts[1];
		var html = '';
		if (href) {
			var file = path.dirname(source) + '/' + href;
			file = path.normalize(file);
			if (fs.existsSync(file)) {
				var pre = preparsers(include, $);
				var post = postparsers(include, $);
				html = fetchinclude(file, hash, pre, post);
			} else {
				console.log('Human error: "' + file + '" not found!!!');
				console.log(badinclude(file));
				html = badinclude(file);
			}
			include.replaceWith(html);
		} else {
			console.log('Human error: hash id expected');
		}
	});
	return $;
}

/**
 * Mount the file in a temporary DOM
 * and extract the outerHTML of target.
 * @param {string} file
 * @param @optional {string} id Omit to include the *whole* document
 * @param {Array<function>} parsers

 */
function fetchinclude(file, id, preparsersArray, postparsersArray) {
	var src = fs.readFileSync(file, {encoding: 'UTF-8'});
	var $ = cheerio.load(src);
	var clone, html;
	if (id) {
		var elm = $('#' + id);
		if (elm[0]) {
			clone = elm.clone();
			preparsersArray.forEach(function(parse) {
				clone = parse(clone);
			});
			html = clone.html();
			postparsersArray.forEach(function(parse) {
				html = parse(html);
			});
			return html;
		} else {
			console.log('Human error: "#' + id + '" not found in "' + file + '"');
			return badinclude('#' + id);
		}
	} else {
		// basically these would be the tabs,so we will
		// just bypass preparsers and postparsers here...
		return $.html(); // $(':root').html();
	}
}

/**
 * Compile list of functions that will modify the input DOM somehow.
 * @param {$} include
 * @param {$} $
 */
function preparsers(include, $) {
	var parsers = [];
	include.find('replace[id]').each(function(index, replace) {
		replace = $(replace);
		parsers.push(function(clone) {
			var oldelm = clone.find('#' + replace.attr('id'));
			if (oldelm) {
				oldelm.replaceWith(replace.html());
			}
			return clone;
		});
	});
	return parsers;
}

/**
 * Compile list of functions that will modify the final HTML somehow.
 * @param {$} include
 * @param {$} $
 */
function postparsers(include, $) {
	var parsers = [];
	include.find('replace[input][output]').each(function(index, replace) {
		replace = $(replace);
		parsers.push(function(html) {
			var input = replace.attr('input');
			var output = replace.attr('output');
			while (html.indexOf(input) > -1) {
				html = html.replace(input, output);
			}
			return html;
		});
	});
	return parsers;
}

/**
 * If something went wrong, display wrong doing on the screen.
 * @param {string} message
 * @returns {string}
 */
function badinclude(message) {
	return [
		'<div data-ts="Note">',
		'	<i class="ts-icon-error"></i>',
		'	<p><code>' + message + '</code> not found :/</p>',
		'</div>'
	].join('\n');
}

/**
 * The `.splitscreen` is `display:table` so that `max-width`
 * doesn't work (according to the spec), so we'll wrap all
 * splitscreens inside a `display:block` element.
 * @param {$} $
 * @returns {$}
 */
function splitscreen($) {
	$('.splitscreen').each(function(i, tag) {
		$(tag).wrap('<div class="splitscreen-container"></div>');
	});
	return $;
}

/**
 * @param {$} $
 * @returns {$}
 */
function specialtags($) {
	$('att').each(function(i, tag) {
		var txt = $(tag).text();
		var att = txt.split('=')[0];
		var val = txt.split('="')[1];
		$(tag).replaceWith(
			'<code class="attr-pair">' +
			'<span>' + att + '</span>' +
			(val ? '="<span>' + val.slice(0, -1) + '</span>"' : '') +
			'</code>'
		);
	});
	$('elm').each(function(i, tag) {
		$(tag).replaceWith('<code class="el">' + $(tag).text() + '</code>');
	});
	$('val').each(function(i, tag) {
		$(tag).replaceWith('<code class="attr-value">' + $(tag).text() + '</code>');
	});
	return $;
}

/**
 * Fix headers of type.
 * @param {$} $
 * @param {$} headers
 */
function headertype($, headers) {
	headers.each(function(i, h) {
		h = $(h);
		h.html(spanheader(h.html()));
	});
}

/**
 * Enclose HTML in SPAN.
 * @param {string} html
 * @returns {string}
 */
function spanheader(html) {
	return '<span>' + html + '</span>';
}

// Tabs ........................................................................

/**
 * Initialize the tabs long before the Runtime boots
 * up, so that the layout doesn't appear to jump.
 */
function inittabs($) {
	var head = $('head');
	if (head.find('link[rel=prefetch]').length) {
		head.append('<script>ts.dox.tabs()</script>');
	}
	return $;
}

// Chrome links ................................................................

/**
 * The HTML output makes it possible to navigate links *without* the chrome
 * (and this will also make it possible for some robots to crawl the site).
 * At runtime, the {ts.dox.LinkSpirit} will detect if we are running inside
 * the chrome and then convert the `href` back to originally authored `/#`.
 * @param {$} $
 * returns {$}
 */
function chromelinks($) {
	$('a[data-ts=Button]').each(function(i, a) {
		var link = $(a);
		var href = link.attr('href');
		if (href && href.startsWith('/#')) {
			link.attr('href', href.replace('/#', '/dist/'));
		}
	});
	return $;
}

// Stickys .....................................................................

function stickys($) { // eslint-disable-line no-unused-vars
	const newissue = 'https://github.com/Tradeshift/tradeshift-ui/issues/new';
	const tooltip = 'Submit new issue';
	const body = $('body');
	if (!body.hasClass('nosticky')) {
		body.first().append(
			`<aside data-ts="Note" class="sticky ts-bg-yellow">
			  <p>If you find a bug or need a feature…</p>
		    <menu class="ts-buttons">
		      <li>
		        <a data-ts="Button" target="_blank" href="${newissue}" title="${tooltip}" class="ts-secondary">
		          <span>Create GitHub Issue…</span>
		        </a>
		      </li>
			  </menu>
			</aside>`);
	}
	return $;
}
