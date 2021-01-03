const context = {
    getEnvironnement: () => {
        const environment = process.env.NODE_ENV || 'development';
        return environment === 'development' ? 'dev' : 'prod';
    }
}
export default context;