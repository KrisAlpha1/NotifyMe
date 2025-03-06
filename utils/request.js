module.exports = {
  queryParams: (params = {}) => {
    return new URLSearchParams(params).toString();
  },
};
