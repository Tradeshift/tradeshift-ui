/**
 * Advanced text model. Renders as one or more paragraphs.
 * @extends {ts.ui.Model}
 * @using {ts.ui.Markdown} Markdown Converts (subset of) markdown to markup
 */
ts.ui.TextModel = (function using(Markdown) {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'text',

		/*
		 * The textual message that is intended to be communicated in textual form.
		 * @type {string}
		 */
		text: '',

		/**
		 * Bounce model to HTML. This (at least) produces one or more <p> tags
		 * @param @optional {Array<string>} tags If specified, decides what tags
		 * besides <p> to be parsed. If not, all supported tags will get parsed.
		 * @return {string}
		 */
		render: function(tags) {
			return Markdown.parse(this.text, tags || null);
		}
	});
})(ts.ui.Markdown);
