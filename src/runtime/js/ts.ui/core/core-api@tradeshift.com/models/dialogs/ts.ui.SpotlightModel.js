/**
 * Advanced dialog model.
 * @extends {ts.ui.Model}
 * @using {ts.ui.Dialog} Dialog
 * @using {gui.Combo#chained} chained
 * @using {gui.Type} Type
 * @using {gui.Object} GuiObject
 * @using {ts.ui.String} Constants
 * @using {string} primary
 * @using {string} secondary
 * @using {string} tertiary
 */
ts.ui.SpotlightModel = (function using(CoverSpirit, chained, Type, GuiObject, Constants, primary, secondary, tertiary) {
    /**
     * Get JSON for button where the properties of the passed
     * JSON will overwrite the given (default) label and type.
     * The {ts.ui.DialogSpirit} may modify the `type` property.
     * @param {object} json Button configuration
     * @param {string} id So that we can find it later
     * @param {string} label Default label
     * @param {string} type Default type
     * @returns {object}
     */

	return ts.ui.Model.extend({

		steps: [],

		onconstruct: function() {
			this.super.onconstruct();
			this.steps = this.steps || [];
		},

		isOffScreen: function(content) {
			var rect = content.getBoundingClientRect();
			return (rect.right + rect.width || rect.top + rect.height) < 0 ||
                (rect.right > window.innerWidth || rect.top > window.innerHeight);
		},

		open: function() {
			var titleText = this.step.title;
			var hintText = this.step.hint;
			var radius = this.step.radius;
			var targetElement = this.step.element;

			targetElement.scrollIntoView({
				behavior: 'smooth',
				block: 'end'
			});

			var targetPos;
			if (targetElement) {
				targetPos = this.getPosition(targetElement);
			}

			var cover = ts.ui.CoverSpirit.getCover('ts-spotlightcover');
			var existingContent = document.querySelectorAll('.ts-spotlight-content');
			var existingButton = document.querySelectorAll('.ts-spotlight-close-button');

			if (existingContent.length) {
				existingContent[0].remove();
			}

			if (existingButton.length) {
				existingButton[0].remove();
			}

			var content = document.createElement('div');
			content.className = 'ts-spotlight-content';
			content.style.position = 'absolute';
			content.style.color = 'white';
			content.style.opacity = 1;

			content.style.left = targetPos.x + radius + 22 + 'px';
			content.style.top = targetPos.y + (radius / 6) + 'px';

			content.style.fontWeight = 'normal';
			content.style.paddingRight = '10px';
			content.style.zIndex = '3999';
			content.style.width = '300px';

			var closeButton = document.createElement('button');
			closeButton.className = 'ts-spotlight-close-button ts-primary';
			closeButton.setAttribute('data-ts', 'Button');
			closeButton.style.position = 'absolute';

			closeButton.style.top = '20px';
			closeButton.style.right = '20px';
			closeButton.style.width = '100px';
			closeButton.style.height = '100px';
			closeButton.style.opacity = 1;
			closeButton.style.backgroundColor = 'transparent';
			closeButton.style.zIndex = '999999';
			closeButton.addEventListener('click', function(e) {
				cover.fadeOut();
				content.parentNode.removeChild(content);
				closeButton.parentNode.removeChild(closeButton);
				e.preventDefault();
				return false;
			}, true);

			var iconButton = document.createElement('i');
			iconButton.className = 'ts-icon-close';
			iconButton.style.fontSize = '33px';

			closeButton.appendChild(iconButton);

			var title = document.createElement('h4');
			title.className = 'ts-spotlight-title';
			title.style.textTransform = 'uppercase';
			title.innerHTML = titleText;

			var text = document.createElement('p');
			text.className = 'ts-spotlight-text ';
			text.innerHTML = hintText;

			content.appendChild(title);
			content.appendChild(text);

			document.getElementsByTagName('body')[0].appendChild(content);
			document.getElementsByTagName('body')[0].appendChild(closeButton);

			if (this.isOffScreen(content)) {
				content.style.left = targetPos.x - (radius * 1.8) + 'px';
				content.style.textAlign = 'right';
			}

			cover.position({
				y: targetPos.y,
				x: targetPos.x,
				w: radius,
				h: radius
			});

			cover.fadeIn();

			window.addEventListener('keydown', function(e) {
				console.log('keydown');
				if ((e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)) {
					cover.fadeOut();
					content.parentNode.removeChild(content);
					closeButton.parentNode.removeChild(closeButton);
					e.preventDefault();
					return false;
				}
			}, true);

			return this;
		},

		getPosition: function(el) {
			var elWidth = el.clientWidth;
			var elHeight = el.clientHeight;

			var rect = el.getBoundingClientRect();

			var xPos = rect.left + (elWidth / 2) - (this.step.radius / 2);
			var yPos = rect.top + (elHeight / 2) - (this.step.radius / 2);

			return {
				x: xPos,
				y: yPos
			};
		},

		onevent: function(e) {
			this.super.onevent(e);
			console.log(e);
		}

	});
}(
    ts.ui.CoverSpirit,
    gui.Combo.chained,
    gui.Type,
    gui.Object,
    ts.ui.String,
    ts.ui.CLASS_PRIMARY,
    ts.ui.CLASS_SECONDARY,
    ts.ui.CLASS_TERTIARY
));
