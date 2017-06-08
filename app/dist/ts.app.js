(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.ts || (g.ts = {})).app = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.broadcast = broadcast;
exports.subscribe = subscribe;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Broadcast Message to one or more apps.
 * @param {array|string} appIds List of apps to receive the message, supports glob
 * Examples:
 * * ['Tradeshift.Developer', 'Tradeshift.DeveloperDemo'] (matches Tradeshift.Developer and Tradeshift.DeveloperDemo)
 * * 'Tradeshift.Developer' (matches Tradeshift.Developer)
 * * '*' (matches any app)
 * * 'Tradeshift.*' (matches all Tradeshift apps)
 * * 'Tradeshift.??Y' (matches Tradeshift.Buy, Tradeshift.Pay, etc.)
 * @param {string} key The key/subject of the event
 * @param {object} data Data to be sent with the event
 */
function broadcast(appIds, key, data) {
	var content = stringify(appIds, key, data);
	parent.postMessage(content, '*');
}

/**
 * Subscribe to messages from one or more apps.
 * @param {array|string} appIds List of apps to receive the message, supports glob
 * @return {Listener} Listener object
 */
function subscribe(appIds) {
	return new Listener(appIds);
}

var BROADCAST_PREFIX = 'app-broadcast:';

/**
 * Message listener for one or more apps.
 */

var Listener = function () {
	function Listener() {
		_classCallCheck(this, Listener);

		this.events = new Map();
	}
	/**
  * Create the listener.
  * @param {array|string} appIds 
  */
	// appIds = appIds;


	_createClass(Listener, [{
		key: 'on',


		/**
   * Listen to message and call handler.
   * @param {string} key The key/subject of the event.
   * @param {function} callback The handler of the event.
   * @return {Listener} Listener object
   */
		value: function on(key, callback) {
			var _this = this;

			if (!key || !callback) {
				console.warn('We need two parameters key and callback');
				return this;
			}
			if (this.events.has(key)) {
				this.off(key);
				return this;
			}
			var handler = function handler(e) {
				if (typeof e.data !== 'string' || !e.data.includes(BROADCAST_PREFIX) || !e.data.includes(key)) {
					return _this;
				}
				var content = e.data.replace(BROADCAST_PREFIX, '');
				var data = JSON.parse(content);
				if (data.key !== key) {
					return _this;
				}
				if (callback) {
					callback(data);
				}
			};
			window.addEventListener('message', handler);
			this.events.set(key, handler);
			return this;
		}

		/**
   * Stop listen to message.
   * @param {string} key The key/subject of the event.
   * @return {Listener} Listener object
   */

	}, {
		key: 'off',
		value: function off(key) {
			if (!key) {
				console.warn('We need the parameter of key');
				return this;
			}
			if (this.events.has(key)) {
				var handler = this.events.get(key);
				window.removeEventListener('message', handler);
				this.events.delete(key);
			}
			return this;
		}

		/**
   * Temporarily stop receiving events, but keep all handlers.
   * @param {string} key The key/subject of the event.
   * @return {Listener} Listener object
   */

	}, {
		key: 'pause',
		value: function pause(key) {
			if (!key) {
				console.warn('We need the parameter of key');
				return this;
			}
			if (!this.events.has(key)) {
				console.warn('Can\'t find the message of ' + key);
				return this;
			}
			var handler = this.events.get(key);
			window.removeEventListener('message', handler);
			return this;
		}

		/**
   * Resume a listener after a pause().
   * @param {string} key The key/subject of the event.
   * @return {Listener} Listener object
   */

	}, {
		key: 'resume',
		value: function resume(key) {
			if (!key) {
				console.warn('We need the parameter of key');
				return this;
			}
			if (!this.events.has(key)) {
				console.warn('Can\'t find the message of ' + key);
				return this;
			}
			var handler = this.events.get(key);
			window.addEventListener('message', handler);
			return this;
		}

		/**
   * Stop listening to all registered handlers.
   */

	}, {
		key: 'clear',
		value: function clear() {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this.events.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var key = _step.value;

					this.off(key);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			return this;
		}
	}]);

	return Listener;
}();

// Private .................................................................

/**
 * Encode broadcast to be posted.
 * @param {array|string} appIds List of apps to receive the message, supports glob
 * @param {string} key The key/subject of the event
 * @param {object} data Data to be sent with the event
 * @return {string} message
 */


var stringify = function stringify(appIds, key, data) {
	var prefix = BROADCAST_PREFIX;
	var content = {};
	content.appIds = appIds || '';
	content.key = key || '';
	content.data = data || {};
	var subfix = '';
	try {
		subfix = JSON.stringify(content);
	} catch (e) {
		console.warn(e);
	}
	return prefix + subfix;
};
},{}]},{},[1])(1)
});