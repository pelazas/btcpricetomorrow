module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  verbose: false,
  collectCoverageFrom: [
    'controllers/*.js',
    'routes/*.js',
    'models/*.js',
    'services/*.js',
  ] 
};

