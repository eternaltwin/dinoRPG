export class ExpectedError extends Error {
	constructor(message = '') {
		super(message);
	}
}

export class OutdatedError extends ExpectedError {}
