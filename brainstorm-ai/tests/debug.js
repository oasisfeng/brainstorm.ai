console.time('Jest-Init');
console.log('Starting Jest initialization:', new Date().toISOString());

process.on('beforeExit', () => {
  console.timeEnd('Jest-Init');
  console.log('Jest initialization completed:', new Date().toISOString());
});

// Export empty object to make this a valid ES module
export default {};