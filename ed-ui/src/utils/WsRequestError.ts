/** A clan socket request that failed: `serverMessage` is shown as is, otherwise it is a connection problem. */
export class WsRequestError extends Error {
	readonly serverMessage?: string;

	constructor(message: string, serverMessage?: string) {
		super(message);
		this.serverMessage = serverMessage;
	}
}
