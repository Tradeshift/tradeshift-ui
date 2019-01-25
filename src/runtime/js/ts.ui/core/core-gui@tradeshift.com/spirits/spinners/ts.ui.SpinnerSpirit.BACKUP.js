/**
 * Spirit of the spin.
 * @using {gui.Combo#chained} chained
 * @extends {ts.ui.Spirit}
 */
ts.ui.SpinnerSpirit = (function using(chained) {
	return ts.ui.Spirit.extend(
		{
			/**
			 * Support `data-ts.spinning="boolean"` attribute.
			 */
			spinning: function(is) {
				if (is) {
					var opt = ts.ui.SpinnerSpirit.topbar();
					var top = this.css.contains('ts-topbarspinner');
					this.spin(this.element, top ? opt : null);
				} else {
					this.stop();
				}
			},
			/**
			 
			 * Start spinning.
			 * @param @optional {element} element
			 * @param @optional {object} options
			 * @returns {ts.ui.SpinnerSpirit}
			 */
			spin: chained(function(element, options) {
				element = element || this.element;
				var opts = ts.ui.SpinnerSpirit.defaults(options);
				if (this._spinner) {
					this.stop();
				}
				this._spinner = new ts.ui.Spinner(opts).spin();
				element.appendChild(this._spinner.el);
				if (opts.message) {
					this._textelement = document.createElement('div');
					this._textelement.className = 'ts-spinner-text';
					this._textelement.style.top = opts.top;
					this._textelement.style.color = opts.color;
					this._textelement.innerHTML = opts.message;
					element.appendChild(this._textelement);
				}
				if (opts.cover) {
					this._updateblocking(true);
				}
			}),

			/**
			 * Stop spinning.
			 * @returns {ts.ui.SpinnerSpirit}
			 */
			stop: chained(function() {
				this._updateblocking(false);
				if (this._spinner) {
					this._spinner.stop();
					this._spinner = null;
				}
				if (this._textelement) {
					this._textelement.parentNode.removeChild(this._textelement);
					this._textelement = null;
				}
			}),

			// Private .................................................................

			/**
			 * ts.ui.Spinner
			 */
			_spinner: null,

			/**
			 * html element
			 */
			_textelement: null,

			/**
			 * ID (and classname) of the spinner cover.
			 * @type {string}
			 */
			_coverid: 'ts-spinnercover',

			/**
			 * Current dialog blocks?
			 * @type {number}
			 */
			_blocking: false,

			/**
			 * Update blocking status.
			 * @param {boolean} blocking
			 */
			_updateblocking: function(blocking) {
				if (blocking) {
					if (!this._blocking) {
						this._cover().fadeIn();
						this._blocking = true;
					}
				} else {
					if (this._blocking) {
						this._cover().fadeOut();
						this._blocking = false;
					}
				}
			},

			/**
			 * Get-create CoverSpirit for dialog things. First
			 * run creates the spirit and appends it to BODY.
			 * @returns {ts.ui.CoverSpirit}
			 */
			_cover: function() {
				return ts.ui.CoverSpirit.getCover(this._coverid);
			}
		},
		{
			// Static ...............................................................

			/**
			 * Default or modified configuration.
			 * @param @optional {object} options
			 */
			defaults: function(options) {
				var opts = {
					lines: 12, // The number of lines to draw
					length: 22, // The length of each line
					width: 6, // The line thickness
					radius: 22, // The radius of the inner circle
					scale: 1, // Scales overall size of the spinner
					corners: 1, // Corner roundness (0..1)
					color: '#555', // #rgb or #rrggbb or array of colors
					opacity: 0.5, // Opacity of the lines
					rotate: 0, // The rotation offset
					direction: 1, // 1: clockwise, -1: counterclockwise
					speed: 1, // Rounds per second
					trail: 60, // Afterglow percentage
					fps: 12, // Frames per second when using setTimeout() as a fallback for CSS
					zIndex: 40000, // The z-index (defaults to 4000)
					className: 'spinner', // The CSS class to assign to the spinner
					top: '37.2%', // Top position relative to parent
					left: '50%', // Left position relative to parent
					shadow: false, // Whether to render a shadow
					hwaccel: true, // Whether to use hardware acceleration
					message: '', // Text under the spinner
					cover: false // Has a cover
				};
				if (options) {
					gui.Object.extend(opts, options);
				}
				return opts;
			},

			/**
			 * TopBar spinner modifications.
			 * @returns {object}
			 */
			topbar: function() {
				return {
					radius: 5,
					length: 5,
					width: 2,
					position: 'absolute',
					color: 'rgb(255,255,255)'
				};
			}
		}
	);
})(gui.Combo.chained);
