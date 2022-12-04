export class ErrorFormator extends Error {
	errorCode: number;
	message: string;

	constructor(errorCode: number, message: string) {
		super();
		this.errorCode = errorCode;
		this.message = message;
	}
}
