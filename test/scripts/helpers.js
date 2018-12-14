function runQueue(args, behavior, expectation, timeout = 100) {
  const queue = args.slice();
  if (typeof expectation !== 'function') {
    expectation = behavior;
    timeout = expectation;
    behavior = function () { };
  }
  return new Promise(resolve => {
    run();
    function run() {
      let i = queue.shift();
      if (i !== undefined) {
        behavior(i);
        setTimeout(() => {
          expectation(i);
          setTimeout(run, timeout);
        }, 0);
      } else resolve();
    }
  });
}

function sleep(ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
