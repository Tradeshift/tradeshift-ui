// test/edbml/tst.test1.edbml
edbml.declare('tst.test1.edbml').as(function $edbml() {
	'use strict';
	var out = $edbml.$out;
	out.html += '<h1>OK</h1>';
	return out.write();
});

// test/edbml/tst.test2.edbml
edbml.declare('tst.test2.edbml').as(function $edbml(text) {
	'use strict';
	var out = $edbml.$out,
		$txt = edbml.safetext;
	if (text) {
		out.html += '<h1>' + $txt(text) + '</h1>';
	}
	return out.write();
});

// test/edbml/tst.test3.edbml
edbml.declare('tst.test3.edbml').as(function $edbml() {
	'use strict';
	var out = $edbml.$out,
		$txt = edbml.safetext,
		model = $edbml.$input(tst.ModelOne);
	out.html += '<h1>' + $txt(model.text) + '</h1>';
	return out.write();
}).withInstructions([{
	input: {
		name: 'model',
		type: 'tst.ModelOne'
	}
}]);

// test/edbml/tst.test4.edbml
edbml.declare('tst.test4.edbml').as(function $edbml(classname) {
	'use strict';
	var out = $edbml.$out,
		$att = $edbml.$att;
	$att.class = classname;
	out.html += '<h1 id="testh1" ' + $att.$('class') + '>Hello World</h1>';
	return out.write();
});
