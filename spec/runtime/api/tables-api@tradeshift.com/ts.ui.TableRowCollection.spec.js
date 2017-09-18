describe('ts.ui.TableRowCollection', function likethis() {
	/*
	 * Three methods patched to prevent Angular models entering our state.
	 */
	it('should do push, unshift and splice as expected', function() {
		var col = new ts.ui.TableRowCollection();

		// push
		var ret = col.push([4, 5, 6]);
		expect(col.length).toBe(ret);
		expect(col.length).toBe(1);

		// unshift
		ret = col.unshift([1, 2, 3]);
		expect(col.length).toBe(ret);
		expect(col.length).toBe(2);

		// splice
		ret = col.splice(0, 0, [7, 8, 9]);
		expect(col.length).toBe(3);
		ret = col.splice(0, 1, [10, 11, 12]);
		expect(col.length).toBe(3);
		col.splice(0, 1);
		expect(col.length).toBe(2);

		// finally
		expect(col[0]).toEqual([1, 2, 3]);
		expect(col[1]).toEqual([4, 5, 6]);
	});
});
