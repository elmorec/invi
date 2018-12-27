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
      const i = queue.shift();
      if (i !== undefined) {
        const result = behavior(i);
        if (result && typeof result.then === 'function') result.then(resolve);
        else setTimeout(() => {
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
