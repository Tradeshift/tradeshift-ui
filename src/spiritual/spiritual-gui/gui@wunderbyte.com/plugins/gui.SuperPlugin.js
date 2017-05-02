/**
 * We used to keep a clientside `super` implementation around, but it
 * was obscuring the stacktraces. The long term plan was to implement
 * super methods using Proxys, but that also turned out to be complex
 * if not impossible. So now we just use the respected `call` pattern.
 * We have however rigged it up so that the Grunt build task will
 * replace the old `this.super` syntax with the new pattern during
 * some compile step. If you're not using the build tool, you would go
 * about this super-businnes like outlined in this implementation...
 * @extends {gui.Plugin}
 * @using {gui.Plugin.prototype} suber
 */
gui.SuperPlugin = (function using(suber) {
	return gui.Plugin.extend({
		onconstruct: function() {
			suber.onconstruct.call(this);
			console.error(
				[
					"Note that 'this.super' doesn't really exist. You can either:",
					"1) compile the script serverside using 'grunt-spiritual-build' or",
					"2) use the pattern 'SuperClass.prototype.methodname.apply(this)'",
					'(the Grunt task basically just applies this pattern to the code)'
				].join('\n')
			);
		}
	});
})(gui.Plugin.prototype);
