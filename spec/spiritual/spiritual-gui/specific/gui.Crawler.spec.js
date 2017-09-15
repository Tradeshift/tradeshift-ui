/**
 * The Crawler crawls the DOM tree.
 * TODO: Test for xframe crawlers!
 */
describe('gui.Crawler', function likethis() {
	var MARKUP = [
		'<ul class="gui-spirit level-1">',
		'<li class="level-1">1.1</li>',
		'<li class="level-1 skipchildren">1.2',
		'<ul class="gui-spirit level-2 stophere">',
		'<li class="level-2">1.3.1</li>',
		'<li class="level-2">1.3.2</li>',
		'<li class="level-2">1.3.3</li>',
		'</ul>',
		'</li>',
		'<li class="level-1">1.3</li>',
		'</ul>',
		'<ul class="gui-spirit level-1">',
		'<li class="level-1">2.1</li>',
		'<li class="level-1 skipchildren">2.2',
		'<ul class="gui-spirit level-2">',
		'<li class="level-2">2.3.1</li>',
		'<li class="level-2">2.3.2</li>',
		'<li class="level-2">2.3.3</li>',
		'</ul>',
		'</li>',
		'<li class="level-1">2.3</li>',
		'</ul>',
		'<ul class="gui-spirit level-1">',
		'<li class="level-1">3.1</li>',
		'<li class="level-1 skipchildren">3.2',
		'<ul class="gui-spirit level-2">',
		'<li class="level-2">3.3.1</li>',
		'<li class="level-2">3.3.2</li>',
		'<li class="level-2">3.3.3</li>',
		'</ul>',
		'</li>',
		'<li class="level-1">3.3</li>',
		'</ul>'
	].join('\n');

	/**
	 * Get item text as a number.
	 * @param {HTMLLiElement} item
	 * @returns {number}
	 */
	function getvalue(item) {
		var textnode = item.firstChild;
		var textdata = textnode.data.trim();
		return parseInt(textdata.replace(/\./g, ''), 10);
	}

	// Preparations ..............................................................

	/**
	 * Before test.
	 */
	beforeEach(function() {
		this.sandbox = document.createElement('main');
		gui.DOMPlugin.html(this.sandbox, MARKUP);
		document.body.appendChild(this.sandbox);
	});

	/**
	 * After test.
	 */
	afterEach(function() {
		this.sandbox.parentNode.removeChild(this.sandbox);
	});

	// Expectations ..............................................................

	/**
	 * Crawl everything without any directives going on.
	 */
	it('should crawl the entire tree', function() {
		new gui.Crawler().descend(this.sandbox, {
			handleElement: function(elm) {
				elm.setAttribute('visited', 'true');
			}
		});
		var visited = this.sandbox.querySelectorAll('[visited]');
		var allelms = this.sandbox.querySelectorAll('*');
		expect(visited.length).toBe(allelms.length);
	});

	/**
	 * The crawler can be used to search for spirits.
	 */
	it('should trigger handleSpirit() whenever a spirit is found', function() {
		var spirits = [];
		new gui.Crawler().descend(this.sandbox, {
			handleSpirit: function(spirit) {
				if (gui.Spirit.is(spirit)) {
					spirits.push(spirit);
				}
			}
		});
		expect(spirits.length).toBe(this.sandbox.querySelectorAll('.gui-spirit').length);
	});

	/**
	 * If 'handleElement' is implemented, run that before 'handleSpirit'.
	 * NOTE: These will some day be renamed 'onelement' and 'onspirit'.
	 */
	it('should evaluate the element before the spirit', function() {
		var testlist = [];
		new gui.Crawler().descend(this.sandbox, {
			handleElement: function(elm) {
				testlist.push(elm);
			},
			handleSpirit: function(spirit) {
				testlist.push(spirit);
			}
		});
		expect(testlist[0].nodeType).toBe(Node.ELEMENT_NODE);
	});

	/**
	 * Both handleElement and handleSpirit can
	 * return directives to control the crawler.
	 */
	it('should ignore the spirit if the element returns a directive', function() {
		var fail = false;
		new gui.Crawler().descend(this.sandbox, {
			handleElement: function(elm) {
				return gui.Crawler.SKIP_CHILDREN;
			},
			handleSpirit: function(spirit) {
				fail = true;
			}
		});
		expect(fail).toBe(false);
	});

	/**
	 * Loose type checking makes the directive CONTINUE work the same as no directive.
	 */
	it('...should continue, however, if that directive is 0 (zero)', function() {
		var test = false;
		new gui.Crawler().descend(this.sandbox, {
			handleElement: function(elm) {
				return gui.Crawler.CONTINUE;
			},
			handleSpirit: function(spirit) {
				test = true;
			}
		});
		expect(test).toBe(true);
	});

	/**
	 * SKIP_CHILDREN prevents further descend into the DOM tree,
	 * but the *siblings* should still be crawled (unlike STOP).
	 */
	it('should skip the children (not the siblings) if a directive says so', function() {
		var items = [],
			firstlevelitems = this.sandbox.querySelectorAll('li.level-1');
		function hasclass(elm, name) {
			return elm.className.indexOf(name) > -1; // IE no classList!
		}
		new gui.Crawler().descend(this.sandbox, {
			handleElement: function(elm) {
				if (elm.localName === 'li') {
					items.push(elm);
					if (hasclass(elm, 'skipchildren')) {
						return gui.Crawler.SKIP_CHILDREN;
					}
				}
			}
		});
		expect(items.length).toBe(firstlevelitems.length);
		expect(
			items.every(function(item) {
				return hasclass(item, 'level-1');
			})
		).toBe(true);
	});

	/**
	 * STOP should stop the crawler right then and there.
	 */
	it('should stop crawling (children and siblings) if a directive says so', function() {
		var items = [];
		new gui.Crawler().descend(this.sandbox, {
			handleElement: function(element) {
				if (element.localName === 'li') {
					items.push(element);
				}
			},
			handleSpirit: function(spirit) {
				if (spirit.css.contains('stophere')) {
					return gui.Crawler.STOP;
				}
			}
		});
		expect(items.length).toBe(2);
	});

	/**
	 * Crawl to the bottom of one branch before we crawl the sibling branch.
	 */
	it('should crawl the tree in continous document order or something like that', function() {
		var items = [];
		new gui.Crawler().descend(this.sandbox, {
			handleElement: function(elm) {
				if (elm.localName === 'li') {
					items.push(getvalue(elm));
				}
			}
		});
		var expected = [11, 12, 131, 132, 133, 13, 21, 22, 231, 232, 233, 23];
		expect(
			expected.every(function(number, index) {
				return items[index] === number;
			})
		).toBe(true);
	});

	/**
	 * The Crawler traverses all over the place.
	 */
	it('should also crawl upwards from time to time', function() {
		var tags = [],
			items = gui.Array.from(document.querySelectorAll('li'));
		new gui.Crawler().ascend(items.pop(), {
			handleElement: function(elm) {
				tags.push(elm.localName);
			}
		});
		var expected = ['li', 'ul', 'main', 'body', 'html'];
		expect(
			expected.every(function(tag, index) {
				return tags[index] === tag;
			})
		).toBe(true);
	});
});
