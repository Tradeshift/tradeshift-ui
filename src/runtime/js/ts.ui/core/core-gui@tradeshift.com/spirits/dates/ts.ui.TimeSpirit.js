/**
 * Spirit of the time.
 * @extends {ts.ui.Spirit}
 * @using {Moment.js} moment
 * @using {gui.Combo.chained}
 */
ts.ui.TimeSpirit = (function using(moment, chained) {
	var mytick = 'mytick';
	var time = 1000;
	var issame = false;
	var firsttime = null;

	/**
	 * There's two problems. First, our language code `no` for Nynorsk is not
	 * correctly declared in V4 as `nn-NO` according to the ISO standard and
	 * second, Nynorsk is not defined in the Moment.js list of languages :/
	 * We'll have to use Bokmål here, which for our purpose is identical.
	 * @param {string|null} code
	 * @returns {string}
	 */
	function nynorsk(code) {
		return code ? (code.toLowerCase() === 'no' ? 'nb-no' : code) : code;
	}

	/**
	 * Configure locale in Moment. The replaced underscore character has to do
	 * with some invalid language code that emerged from the depths of Grails.
	 * @param {string|null} code
	 */
	(function localize(code) {
		moment.locale(nynorsk(code.toLowerCase()).replace('_', '-'));
	})(document.documentElement.lang || 'en-US');

	return ts.ui.Spirit.extend({
		/**
		 * Set up innerHTML.
		 */
		onconfigure: function() {
			this.super.onconfigure();
			this.element.innerHTML = this._getInnerHTML();
		},

		/**
		 * Setup on enter.
		 */
		onenter: function() {
			this.super.onenter();
			moment.suppressDeprecationWarnings = true;
			this.tick.add(mytick).start(mytick, time);
			this.att.add('datetime');
		},

		/**
		 * @param {gui.Tick} tick
		 */
		ontick: function(tick) {
			this.super.ontick(tick);
			if (tick.type === mytick) {
				this._update();
			}
		},

		/**
		 * @param {gui.Att} att
		 */
		onatt: function(att) {
			this.super.onatt(att);
			if (att.name === 'datetime') {
				this._update();
			}
		},

		// Private .................................................................

		/**
		 * The Time element itself can be localized with the `lang` attribute,
		 * although this feature is TBH really just used for the unit tests.
		 */
		_update: function() {
			var newcode = this.element.lang;
			var oldcode = moment.locale();
			newcode ? moment.locale(nynorsk(newcode)) : void 0;
			this._setText();
			newcode ? moment.locale(oldcode) : void 0;
		},

		/**
		 * Set the time to the element text.
		 * Just show the datetime if it is an invalid time.
		 * @param {string|null} langcode
		 */
		_setText: function(langcode) {
			var datetime = this.att.get('datetime');
			var realtime = this.att.get('realtime');
			var element = this.dom.q('span');
			if (!datetime || !element) {
				return;
			}
			if (realtime && !issame) {
				element.textContent = this._getTime(datetime, realtime);
				element.setAttribute('data-ts.title', moment(datetime).format('MMM Do YYYY, h:mm:ss a'));
				return;
			}
			if (moment(datetime).isValid()) {
				element.textContent = moment(datetime).fromNow();
				element.setAttribute('data-ts.title', moment(datetime).format('MMM Do YYYY, h:mm:ss a'));
			} else {
				if (parseInt(datetime, 10) && moment(parseInt(datetime, 10)).isValid()) {
					datetime = parseInt(datetime, 10);
					element.textContent = moment(datetime).fromNow();
					element.setAttribute('data-ts.title', moment(datetime).format('MMM Do YYYY, h:mm:ss a'));
				} else {
					element.textContent = datetime;
					element.setAttribute('data-ts.title', datetime);
				}
			}
		},

		_getInnerHTML: function() {
			return '<span data-ts="Tooltip" data-ts.title=""></span>';
		},

		/**
		 * Get the time base on the real time
		 * @param {string} datetime
		 * @param {string} realtime
		 */
		_getTime: function(datetime, realtime) {
			var newdatetime = null;
			var timespan = null;
			if (!moment(datetime).isValid()) {
				if (parseInt(datetime, 10)) {
					datetime = parseInt(datetime, 10);
				} else {
					return datetime;
				}
			}
			if (!moment(realtime).isValid()) {
				if (parseInt(realtime, 10)) {
					realtime = parseInt(realtime, 10);
				} else {
					return moment(datetime).fromNow();
				}
			}
			issame = moment().isSame(realtime, 'minute');
			if (issame) {
				return moment(datetime).fromNow();
			}
			if (!firsttime) {
				firsttime = moment();
				timespan = firsttime.diff(realtime);
				newdatetime = moment(datetime).add(timespan);
				return moment(newdatetime).fromNow();
			}
			var duration = moment().diff(firsttime);
			timespan = moment().diff(realtime);
			newdatetime = ts.ui
				.moment(datetime)
				.add(timespan)
				.subtract(duration);
			return moment(newdatetime).fromNow();
		}
	});
})(ts.ui.moment, gui.Combo.chained);
