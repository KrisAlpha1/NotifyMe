const AppStore = {
  sockets: {},
};

module.exports = {
  set: (key, value) => {
    AppStore[key] = {
      ...(AppStore[key] ?? {}),
      ...value,
    };
  },
  get: (key) => {
    return AppStore[key];
  },
};
