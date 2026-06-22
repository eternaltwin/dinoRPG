let serverReady = true;

const setReady = (ready: boolean) => {
	console.log(`Updating server state to ${ready ? 'release' : 'hold'} traffic`);

	serverReady = ready;
};

const isReady = () => serverReady;

export default {
	setReady,
	isReady
};
