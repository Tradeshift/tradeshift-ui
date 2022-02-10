macro @ {
	case {_
		$name
	} => {
		letstx $name_str = [makeValue(unwrapSyntax(#{$name}), #{here})];
		return #{$att[($name_str)]}
	}
}

export @;
