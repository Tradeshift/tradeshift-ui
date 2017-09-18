/**
 * Convert (super-simplistic subset of) markdown to markup.
 * @see {ts.ui.TextModel}
 @ @see {ts.ui.tablerows.edbml}
 * using {function} linkparser
 */
ts.ui.Markdown = (function using(linkparser) {
	// make sure to always parse tags in the same order (h is for H1-H4)
	var ORDER = ['h', 'strong', 'em', 'strike', 'code', 'a', 'ul', 'ol'];

	// looks complex enough to compile only once...
	var SINGLENEWLINE = /(^|[^\n])\n(?!\n)/g;

	/*
	 * Mapping tagnames to functions that will parse a single line of markdown.
	 * @type Map<string, function>
	 */
	var parsers = {
		// headers H1-H4
		h: blockfunction([
			[/^####/, '<h4>$</h4>'],
			[/^###/, '<h3>$</h3>'],
			[/^##/, '<h2>$</h2>'],
			[/^#/, '<h1>$</h1>']
		]),

		// unordered lists
		ul: blockfunction([
			[/^ {6}\*/, '<ul><ul><ul><ul><li>$</li></ul></ul></ul></ul>'],
			[/^ {4}\*/, '<ul><ul><ul><li>$</li></ul></ul></ul>'],
			[/^ {2}\*/, '<ul><ul><li>$</li></ul></ul>'],
			[/^\*/, '<ul><li>$</li></ul>']
		]),

		// ordered lists
		ol: blockfunction([
			[/^ {6}\d+\./, '<ol><ol><ol><ol><li>$</li></ol></ol></ol></ol>'],
			[/^ {3}\d+\./, '<ol><ol><ol><li>$</li></ol></ol></ol>'],
			[/^ {2}\d+\./, '<ol><ol><li>$</li></ol></ol>'],
			[/^\d+\./, '<ol><li>$</li></ol>']
		]),

		// bold text
		strong: inlinefunction([[/\*\*(.*?)\*\*/g, '<strong>$1</strong>']]),

		// italic text
		em: inlinefunction([[/\*(.*?)\*/g, '<em>$1</em>']]),

		// strike text
		strike: inlinefunction([[/~~(.*?)~~/g, '<del>$1</del>']]),

		// code and tech terms (TODO: also support blockcode ```)
		code: inlinefunction([[/`(.*?)`/g, '<code>$1</code>']]),

		// links (scroll down for implementation)
		a: linkparser
	};

	/**
	 * Creates a function to parse inline tags.
	 * @param {Array<Array<string|RegExp>} rules
	 * @return {function}
	 */
	function inlinefunction(rules) {
		return function(input) {
			return rules.reduce(function(result, rule) {
				var regx = rule[0];
				var html = rule[1];
				return result.replace(regx, html);
			}, input);
		};
	}

	/**
	 * Creates a function to parse block level content.
	 * @param {Array<Array<string|RegExp>} rules
	 * @return {function}
	 */
	function blockfunction(rules) {
		return function(input, output) {
			rules.some(function(rule) {
				var regx = rule[0];
				var html = rule[1];
				var post;
				if (regx.test(input)) {
					post = input.replace(regx, '');
					output = enclose(html, post);
				}
				return !!output;
			});
			return output;
		};
	}

	/**
	 * Insert that string.
	 * @param {string} outer
	 * @param {string} inner
	 * @returns {string}
	 */
	function enclose(outer, inner) {
		return outer.replace('$', inner.trim());
	}

	/**
	 * Post-processing for valid markup.
	 * TODO(jmo@): Nested lists should still render in items, not next to them!
	 * @param {string} markup
	 * @returns {string}
	 */
	function sanitize(markup) {
		var ul = /<\/ul>\n<ul>/g;
		var ol = /<\/ol>\n<ol>/g;
		var nl = '\n';
		return [1, 2, 3].reduce(function fix(insanity) {
			return insanity.replace(ul, nl).replace(ol, nl);
		}, markup);
	}

	/**
	 * Catch spelling mistakes.
	 * @param {Array|null} tags
	 */
	function validate(tags) {
		(tags || []).forEach(function(tag) {
			if (ORDER.indexOf(tag) === -1) {
				throw new Error('Not supported: "$tag"'.replace('$tag', tag));
			}
		});
		return tags;
	}

	/**
	 * Collect parsers needed to resolve given tagnames. Note
	 * that if no tags are specified, we support all of them.
	 * @param {Array<string} List of tagnames
	 * @return {Array<function>}
	 */
	function getparsers(tags) {
		tags = tags || ORDER;
		return ORDER.filter(function(tag) {
			return tags.indexOf(tag) > -1;
		}).map(function(tag) {
			return parsers[tag];
		});
	}

	/**
	 * Split string on newlines (or double newlines)
	 * and run each segment by a function to fix it.
	 * @param {string} string
	 * @param {function} action
	 * @param {boolean} doubles
	 */
	function eachline(string, action, doubles) {
		var x2 = /\n{2,}/;
		return string
			.split(doubles ? x2 : '\n')
			.map(action)
			.join('\n');
	}

	/**
	 * Parse single line of markdown.
	 * @param {string} line
	 * @returns {string}
	 */
	function parseline(line, lineParsers) {
		return lineParsers.reduce(function(result, parse) {
			return parse(result) || result;
		}, line.trimRight());
	}

	/**
	 * Split on double-newlines, then add paragraph tags
	 * when the first tag isn't a block level element.
	 * @param {string} html All resolved except P tags.
	 * @returns {string}
	 */
	function paragraphs(html) {
		var doubles = true,
			exclude = /^<(h|ul|ol|li|pre)/;
		return eachline(
			html,
			function(section) {
				return unhack(
					eachline(linehack(section), function(line) {
						return exclude.test(line) ? line : enclose('<p>$</p>', unhack(line, true));
					})
				);
			},
			doubles
		);
	}

	/**
	 * Markdown requires double newlines (for historic reasons) to render a
	 * paragraph, but we would like to support single newline for `BR` breaks,
	 * so we'll insert a string sequence that may later be parsed in context.
	 * @param {string} string
	 * @returns {string}
	 */
	function linehack(string) {
		return string.replace(SINGLENEWLINE, '$1 %%%'); // some unlikely string
	}

	/**
	 * Replace temp string sequence with either nothing or a `BR` linebreak.
	 * @param {string} string
	 * @param @optional {boolean} breaks
	 * @returns {string}
	 */
	function unhack(string, breaks) {
		return string.replace(/%%%/g, breaks ? '<br/>' : '');
	}

	// Public ....................................................................

	/*
	 * Finally we expose a single method to convert markdown to markup.
	 * @param {string} markdown
	 * @returns {string} HTML
	 * @param {Array<string>} tagnames Optional *whitelist* of tagnames
	 */
	return {
		parse: function(markdown, tagnames) {
			var allParsers = getparsers(validate(tagnames));
			var safetxt = edbml.safetext(markdown);
			return paragraphs(
				sanitize(
					eachline(safetxt, function(line) {
						return parseline(line, allParsers);
					})
				)
			);
		}
	};
})(
	// LINKS ..................................................................

	/**
	 * Routine to parse links in the format init[text](href)post.
	 * Regexp for this was not really maintainable (extensible).
	 * @using {RegExp} txt
	 * @using {RegExp} url
	 */
	(function using(txt, url) {
		var init, text, href, post, last, html, test;

		/**
		 * We support links of markdown like this (text)[href].
		 * But it is too late when we realize it is wrong.
		 * We have to support both,(text)[href] and [text](href).
		 * We transfer [text](href) to (text)[href] when developer use the right one
		 * Todo:@Leo Delete the code when we know all developer use the right one.
		 * @param {string} markdown
		 * @returns {string} unnormalized link markdown.
		 */
		function unnormalize(line) {
			if (line.indexOf('](') < 0) {
				return line;
			}
			line = line
				.split('](')
				.map(function(cut) {
					var normal = cut;
					if (isnormaltext(cut)) {
						var l = normal.lastIndexOf('[');
						normal = normal.substr(0, l) + normal.substr(l).replace('[', '(');
					}
					if (isnormalurl(cut)) {
						var f = normal.indexOf(')');
						normal = normal.substr(0, f + 1).replace(')', ']') + normal.substr(f + 1);
					}
					return normal;
				})
				.join(')[');
			return line;
		}

		function isnormaltext(cut) {
			return cut.split('[').length > cut.split(']').length;
		}

		function isnormalurl(cut) {
			return cut.split(')').length > cut.split('(').length;
		}

		function link() {
			return '<a data-ts="Button" data-ts.type="$type" data-ts.data="$data">$text</a>'
				.replace('$type', ts.ui.ACTION_SAFE_LINK)
				.replace('$data', edbml.safeattr(href))
				.replace('$text', edbml.safetext(text));
		}

		function parsecut(cut, idx, all) {
			var ends = all.length - 1 === idx;
			if (url.test(cut)) {
				href = gethref(cut.replace(txt, ''), ends);
			}
			var res = text && href ? donecut() : '';
			if (txt.test(cut)) {
				text = gettext(cut.replace(url, ''));
			}
			return res;
		}

		function gethref(cut, ends) {
			post = ends ? cut.replace(url, '') : '';
			test = url.exec(cut);
			return test ? test[0].slice(0, -1) : '';
		}

		function gettext(cut) {
			last = getlastindex(cut);
			init = cut.substr(0, last);
			return cut.slice(last + 1);
		}

		function getlastindex(cut) {
			var left = cut.lastIndexOf('(');
			var right = cut.lastIndexOf(')');
			if (left < 0) {
				return -1;
			}
			if (left <= right) {
				return getlastindex(cut.substr(0, left - 1));
			}
			return left;
		}

		function donecut() {
			html = init + link() + post;
			reset();
			return html;
		}

		function reset() {
			init = '';
			text = '';
			href = '';
			post = '';
		}

		return function linkparser(line) {
			reset();
			line = unnormalize(line);
			return (
				line
					.split(')[')
					.map(parsecut)
					.join('') || line
			);
		};
	})(/\(.+$/, /^.+\]/)
);
