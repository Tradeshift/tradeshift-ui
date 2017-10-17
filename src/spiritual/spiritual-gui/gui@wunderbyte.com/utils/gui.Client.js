/**
 * Questionable browser identity and feature detection.
 * @TODO Load earlier by not using gui.Broadcast
 * @TODO Lazycompute properties when requested (not least scrollBarSize)
 */
gui.Client = (function() {
	var agent = navigator.userAgent.toLowerCase();

	/**
	 * Supports CSS feature?
	 * @param {String} feature
	 * @returns {boolean}
	 */
	function supports(feature) {
		var root = document.documentElement;
		var fixt = feature[0].toUpperCase() + feature.substring(1);
		return !['', 'Webkit', 'Moz', 'O', 'ms'].every(function(prefix) {
			return root.style[prefix ? prefix + fixt : feature] === undefined;
		});
	}

	function Client() {
		// user agent death match - this obviously needs some work
		this.isExplorer = agent.includes('msie') || agent.includes('trident') || agent.includes('edge');
		this.isExplorer9 = this.isExplorer && agent.includes('msie 9');
		this.isExplorer10 = this.isExplorer && agent.includes('msie 10');
		this.isExplorer11 = this.isExplorer && agent.includes('rv:11');
		this.isExplorer12 = this.isExplorer && agent.includes('rv:12'); // NOT TESTED!
		this.isEdge = this.isExplorer && agent.includes('edge');
		this.isWebKit = !this.isExplorer && (agent.includes('webkit') || agent.includes('opera'));
		this.isChrome = !this.isExplorer && this.isWebKit && agent.includes('chrome');
		this.isSafari = !this.isExplorer && this.isWebKit && !this.isChrome && agent.includes('safari');
		this.isGecko = !this.isExplorer && !this.isWebKit && !this.isOpera && agent.includes('gecko');
		this.isBlink = agent.includes('blink');
		this.isChromeApp = !!(window.chrome && window.chrome.app && window.chrome.app.runtime);

		/**
		 * Agent is one of "webkit" "firefox" "opera" or "explorer"
		 * @type {String}
		 */
		this.agent = function() {
			if (this.isWebKit) {
				return 'webkit';
			} else if (this.isGecko) {
				return 'gecko';
			} else if (this.isOpera) {
				return 'opera';
			}
			return 'explorer';
		}.call(this);

		/**
		 * System is "linux" "osx" "ios" "windows" "windowsmobile" "haiku" or "amiga".
		 */
		this.system = (function(shortlist) {
			var os = null;
			shortlist.every(function(test) {
				if (agent.includes(test)) {
					if (test.match(/ipad|iphone/)) {
						os = 'ios';
					} else {
						os = test.replace(/ /g, ''); // no spaces
					}
				}
				return os === null;
			});
			return os;
		})(['window mobile', 'windows', 'ipad', 'iphone', 'os x', 'linux', 'haiku', 'amiga']);

		/**
		 * Has touch support? Note that desktop Chrome has this.
		 * @TODO Investigate this in desktop IE10.
		 * @type {boolean}
		 */
		this.hasTouch = window.ontouchstart !== undefined || this.isChrome;

		/**
		 * Has native pointer events? Seems to work best if we hardcode `false`.
		 * @TODO: feature detect somewhing
		 * @type {boolean}
		 */
		this.hasPointers = false; // ( this.isExplorer && !this.isExplorer9 );

		/**
		 * Supports file blob?
		 * @type {boolean}
		 */
		this.hasBlob = window.Blob && (window.URL || window.webkitURL);

		/**
		 * Supports the History API?
		 * @type {boolean}
		 */
		this.hasHistory = !!(window.history && window.history.pushState);

		/**
		 * Is touch device? Not to be confused with {gui.Client#hasTouch}
		 * @type {boolean}
		 */
		this.isTouchDevice = (function(shortlist) {
			return shortlist.some(function(system) {
				return agent.includes(system);
			});
		})(['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']);

		/**
		 * Supports CSS transitions?
		 * @type {boolean}
		 */
		this.hasTransitions = supports('transition');

		/**
		 * Supports CSS transforms?
		 * @type {boolean}
		 */
		this.hasTransforms = supports('transform');

		/**
		 * Supports CSS animations?
		 * @type {boolean}
		 */
		this.hasAnimations = supports('animationName');

		/**
		 * Supports CSS 3D transform? (note https://bugzilla.mozilla.org/show_bug.cgi?id=677173)
		 * @type {boolean}
		 */
		this.has3D = supports('perspective');

		/**
		 * Supports flexible box module?
		 * @type {boolean}
		 */
		this.hasFlex = supports('flex');

		/**
		 * Has support for Proxy objects?
		 * http://wiki.ecmascript.org/doku.php?id=harmony:proxies
		 * @type {boolean}
		 */
		this.hasProxies = window.Proxy && window.Proxy.create;

		/**
		 * Has Performance API?
		 * @type {boolean}
		 */
		this.hasPerformance = window.performance && window.performance.now;

		/**
		 * Temp...
		 */
		Object.defineProperty(this, 'hasFlexBox', {
			get: function() {
				console.error('Depracated API is deprecated: hasFlexBox >> hasFlex');
			}
		});

		/**
		 * Supports requestAnimationFrame somewhat natively?
		 * @type {boolean}
		 */
		this.hasAnimationFrame = (function() {
			var win = window;
			return !!(
				win.requestAnimationFrame ||
				win.webkitRequestAnimationFrame ||
				win.mozRequestAnimationFrame ||
				win.msRequestAnimationFrame ||
				win.oRequestAnimationFrame
			);
		})();

		/**
		 * Supports HTMLTemplateElement?
		 * @type {boolean}
		 */
		this.hasTemplates = (function(template) {
			return 'content' in template;
		})(document.createElement('template'));

		/**
		 * Supports HTML imports?
		 * @type {boolean}
		 */
		this.hasImports = (function(link) {
			return 'import' in link;
		})(document.createElement('link'));

		/**
		 * Supports MutationObserver feature?
		 * @type {boolean}
		 */
		this.hasMutations = (function() {
			return !['', 'WebKit', 'Moz', 'O', 'Ms'].every(function(vendor) {
				return !gui.Type.isDefined(window[vendor + 'MutationObserver']);
			});
		})();

		/**
		 * DOM attributes have been moved to prototype chains
		 * and they do also expose JavaScript getters/setters?
		 * @see http://code.google.com/p/chromium/issues/detail?id=13175
		 * @see https://bugs.webkit.org/show_bug.cgi?id=49739
		 * @type {boolean}
		 */
		this.hasAttributesOnPrototype = (function(Client_) {
			if (Client_.isSafari || Client_.isEdge) {
				return false;
			} else if (Client_.isWebKit) {
				var rex = /chrom(e|ium)\/([0-9]+)\./;
				var raw = agent.match(rex);
				var ver = raw ? parseInt(raw[2], 10) : 0;
				return !ver || ver >= 44; // 43 should be ok, but still...
			}
			return true;
		})(this);

		/**
		 * Browsers disagree on the primary scrolling element.
		 * Is it document.body or document.documentElement?
		 * TODO: This has probably been fixed (in Chrome) by now...
		 * @see https://code.google.com/p/chromium/issues/detail?id=2891
		 * @type {HTMLElement}
		 */
		this.scrollRoot = null;

		/**
		 * Scrollbar default span in pixels.
		 * Note that this is zero on mobiles.
		 * @type {number}
		 */
		this.scrollBarSize = 0;

		/**
		 * Supports position fixed?
		 * @type {boolean}
		 */
		this.hasPositionFixed = false;

		/**
		 * Supports `{passive: true}` as the third parameter of an EventListener?
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
		 * @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/dom/passiveeventlisteners.js
		 * @type {boolean}
		 */
		this.hasPassiveEventListeners = (function() {
			var supportsPassiveOption = false;
			try {
				var opts = Object.defineProperty({}, 'passive', {
					get: function() {
						supportsPassiveOption = true;
					}
				});
				window.addEventListener('test', null, opts);
			} catch (e) {}
			return supportsPassiveOption;
		})();

		/**
		 * Compute some stuff that couldn't be determined parse time.
		 */
		this.$init = function() {
			if (!gui.CSSPlugin) {
				return;
			}
			var win = window,
				doc = document,
				html = doc.documentElement,
				body = doc.body,
				root = null;

			// make sure window is scrollable
			var temp = body.appendChild(
				gui.CSSPlugin.style(doc.createElement('div'), {
					position: 'absolute',
					height: '10px',
					width: '10px',
					top: '100%'
				})
			);

			// what element will get scrolled?
			win.scrollBy(0, 10);
			root = html.scrollTop ? html : body;
			this.scrollRoot = root;

			// supports position fixed?
			gui.CSSPlugin.style(temp, {
				position: 'fixed',
				top: '10px'
			});

			// restore scroll when finished
			var has = temp.getBoundingClientRect().top === 10;
			this.hasPositionFixed = has;
			body.removeChild(temp);
			win.scrollBy(0, -10);

			// compute scrollbar size
			var inner = gui.CSSPlugin.style(document.createElement('p'), {
				width: '100%',
				height: '200px'
			});
			var outer = gui.CSSPlugin.style(document.createElement('div'), {
				position: 'absolute',
				top: '0',
				left: '0',
				visibility: 'hidden',
				width: '200px',
				height: '150px',
				overflow: 'hidden'
			});
			outer.appendChild(inner);
			html.appendChild(outer);
			var w1 = inner.offsetWidth;
			outer.style.overflow = 'scroll';
			var w2 = inner.offsetWidth;
			if (w1 === w2) {
				w2 = outer.clientWidth;
			}
			html.removeChild(outer);
			this.scrollBarSize = w1 - w2;
		};
	}

	return new Client();
})();
