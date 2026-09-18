module.exports = {
  betterAuth: (config) => ({
    options: config,
    api: {
      getSession: jest.fn(),
    },
  }),
  prismaAdapter: () => ({}),
  fromNodeHeaders: () => new Headers(),
  toNodeHandler: () => (req, res) => res.end(),
};
