/**
 * Spirit of the time.
 * @extends {ts.ui.Spirit}
 * @using {gui.Combo.chained}
 */
ts.ui.TimeSpirit = (function using(chained) {
	var mytick = 'mytick';
	var time = 1000;
	var issame = false;
	var firsttime = null;

	return ts.ui.Spirit.extend({
		/**
		 * Setup on enter.
		 */
		onenter: function() {
			this.super.onenter();
			ts.ui.moment.suppressDeprecationWarnings = true;
			this.tick.add(mytick).start(mytick, time);
			this.att.add('datetime');
		},

		/**
		 * @param {gui.Tick} tick
		 */
		ontick: function(tick) {
			this.super.ontick(tick);
			if (tick.type === mytick) {
				this._setText();
			}
		},

		/**
		 * @param {gui.Att} att
		 */
		onatt: function(att) {
			this.super.onatt(att);
			if (att.name === 'datetime') {
				this._setText();
			}
		},

		// Private ......................................................

		/**
		 * Set the time to the element text
		 * Just show the datetime if it is an invalid time
		 */
		_setText: function() {
			var datetime = this.att.get('datetime');
			var realtime = this.att.get('realtime');
			if (!datetime) {
				return;
			}
			if (realtime && !issame) {
				this.element.textContent = this._getTime(datetime, realtime);
				this.element.title = ts.ui.moment(datetime).format('MMM Do YYYY, h:mm:ss a');
				return;
			}
			if (ts.ui.moment(datetime).isValid()) {
				this.element.textContent = ts.ui.moment(datetime).fromNow();
				this.element.title = ts.ui.moment(datetime).format('MMM Do YYYY, h:mm:ss a');
			} else {
				if (parseInt(datetime, 10) && ts.ui.moment(parseInt(datetime, 10)).isValid()) {
					datetime = parseInt(datetime, 10);
					this.element.textContent = ts.ui.moment(datetime).fromNow();
					this.element.title = ts.ui.moment(datetime).format('MMM Do YYYY, h:mm:ss a');
				} else {
					this.element.textContent = datetime;
					this.element.title = datetime;
				}
			}
		},

		/**
		 * Get the time base on the real time
		 * @param {string} datetime
		 * @param {string} realtime
		 */
		_getTime: function(datetime, realtime) {
			var newdatetime = null;
			var timespan = null;
			if (!ts.ui.moment(datetime).isValid()) {
				if (parseInt(datetime, 10)) {
					datetime = parseInt(datetime, 10);
				} else {
					return datetime;
				}
			}
			if (!ts.ui.moment(realtime).isValid()) {
				if (parseInt(realtime, 10)) {
					realtime = parseInt(realtime, 10);
				} else {
					return ts.ui.moment(datetime).fromNow();
				}
			}
			issame = ts.ui.moment().isSame(realtime, 'minute');
			if (issame) {
				return ts.ui.moment(datetime).fromNow();
			}
			if (!firsttime) {
				firsttime = ts.ui.moment();
				timespan = firsttime.diff(realtime);
				newdatetime = ts.ui.moment(datetime).add(timespan);
				return ts.ui.moment(newdatetime).fromNow();
			}
			var duration = ts.ui.moment().diff(firsttime);
			timespan = ts.ui.moment().diff(realtime);
			newdatetime = ts.ui
				.moment(datetime)
				.add(timespan)
				.subtract(duration);
			return ts.ui.moment(newdatetime).fromNow();
		}
	});
})(gui.Combo.chained);
