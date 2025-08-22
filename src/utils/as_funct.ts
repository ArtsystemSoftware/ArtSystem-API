function as_api_version() {
    return process.env.API_VERSION;
}

const as_IsDev = () => {
    return process.env.NODE_ENV?.trim() === 'development';
}

export { as_api_version, as_IsDev };