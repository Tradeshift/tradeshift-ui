/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Solver for cubic Bézier curve with implicit control points at (0,0) and (1.0, 1.0)
 * @class
 * @classdesc Calculates the Y coordinate for a given X coordinate on a Bézier curve.
 * @see https://github.com/adobe/webkit/blob/master/Source/WebCore/platform/graphics/UnitBezier.h
 * @see https://stackoverflow.com/questions/11696736/recreating-css3-transitions-cubic-bezier-curve/11697909#11697909
 * @see https://github.com/jacobcpeters/Unit-Bezier
 * @param {number} p1x Control point x1
 * @param {number} p1y Control point y1
 * @param {number} p2x Control point x2
 * @param {number} p2y Control point y2
 * @constructor
 */
gui.UnitBezier = function(p1x, p1y, p2x, p2y) {
	// Calculate the polynomial coefficients, implicit first and last control points are (0,0) and (1,1).
	this.cx = 3.0 * p1x;
	this.bx = 3.0 * (p2x - p1x) - this.cx;
	this.ax = 1.0 - this.cx - this.bx;
	this.cy = 3.0 * p1y;
	this.by = 3.0 * (p2y - p1y) - this.cy;
	this.ay = 1.0 - this.cy - this.by;
};

gui.UnitBezier.prototype = {
	/**
	 * An epsilon to determine the acceptable error for the answer.
	 * @type {number}
	 */
	epsilon: 1e-6,

	/**
	 * Gets the x coordinate of the Bézier curve at a given percentage through the curve.
	 * @private
	 * @param   {number} t Percentage through the curve 0 <= t <= 1
	 * @returns {number} x coordinate of curve.
	 */
	sampleCurveX: function(t) {
		// `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
		return ((this.ax * t + this.bx) * t + this.cx) * t;
	},

	/**
	 * Gets the y coordinate of the Bézier curve at a given percentage through the curve.
	 * @private
	 * @param   {number} t Percentage through the curve 0 <= t <= 1
	 * @returns {number} y coordinate of curve.
	 */
	sampleCurveY: function(t) {
		return ((this.ay * t + this.by) * t + this.cy) * t;
	},

	/**
	 * Gets the derivative of the Bézier curve at a given percentage through the curve.
	 * @private
	 * @param   {number} t Percentage through the curve 0 <= t <= 1
	 * @returns {number} Derivative of curve.
	 */
	sampleCurveDerivativeX: function(t) {
		return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
	},

	/**
	 * Gets the percentage through the curve that a given x coordinate appears on the curve.
	 * @private
	 * @param   {number} x Desired coordinate 0 <= x <= 1
	 * @returns {number} Percentage through curve.
	 */
	solveCurveX: function(x) {
		var t0;
		var t1;
		var t2;
		var x2;
		var d2;
		var i;

		// First try a few iterations of Newton's method -- normally very fast.
		for (t2 = x, i = 0; i < 8; i++) {
			x2 = this.sampleCurveX(t2) - x;
			if (Math.abs(x2) < this.epsilon) {
				return t2;
			}
			d2 = this.sampleCurveDerivativeX(t2);
			if (Math.abs(d2) < this.epsilon) {
				break;
			}
			t2 = t2 - x2 / d2;
		}

		// Fall back to the bisection method for reliability.
		t0 = 0.0;
		t1 = 1.0;
		t2 = x;
		if (t2 < t0) {
			return t0;
		}
		if (t2 > t1) {
			return t1;
		}
		while (t0 < t1) {
			x2 = this.sampleCurveX(t2);
			if (Math.abs(x2 - x) < this.epsilon) {
				return t2;
			}
			if (x > x2) {
				t0 = t2;
			} else {
				t1 = t2;
			}
			t2 = (t1 - t0) * 0.5 + t0;
		}

		// Failure.
		return t2;
	},

	/**
	 * Calculates the Y coordinate for a given X coordinate on a Bézier curve.
	 * @public
	 * @param   {number} x The x coordinate (time through animation).
	 * @returns {number} The y coordinate (interpolation factor).
	 */
	solve: function(x) {
		return this.sampleCurveY(this.solveCurveX(x));
	}
};
