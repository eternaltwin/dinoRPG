export const dinozPlacement: placement = {
	noFliped: {
		0: {
			top: 50,
			left: 47
		},
		1: {
			top: 45,
			left: 43
		},
		2: {
			top: 44,
			left: 41
		},
		3: {
			top: 38,
			left: 38
		},
		4: {
			top: 36,
			left: 35
		},
		5: {
			top: 32,
			left: 35
		},
		6: {
			top: 29,
			left: 30
		},
		7: {
			top: 26,
			left: 25
		},
		8: {
			top: 23,
			left: 23
		},
		9: {
			top: 20,
			left: 22
		}
	},
	fliped: {
		0: {
			top: 60,
			left: 137
		},
		1: {
			top: 55,
			left: 141
		},
		2: {
			top: 54,
			left: 143
		},
		3: {
			top: 48,
			left: 146
		},
		4: {
			top: 46,
			left: 149
		},
		5: {
			top: 42,
			left: 149
		},
		6: {
			top: 39,
			left: 154
		},
		7: {
			top: 36,
			left: 159
		},
		8: {
			top: 33,
			left: 157
		},
		9: {
			top: 30,
			left: 162
		}
	}
};
interface placement {
	fliped: {
		[size: number]: {
			top: number;
			left: number;
		};
	};
	noFliped: {
		[size: number]: {
			top: number;
			left: number;
		};
	};
}
