const exec = require('child_process').exec;
const pkg = require('./package.json');

let pkgs = [
  ...Object.keys(pkg.dependencies || []).map(name => [name, '--save']),
  ...Object.keys(pkg.devDependencies || []).map(name => [name, '--save-dev'])
];

run();

function run() {
  const [pkgName, opt] = pkgs.shift();

  console.log('updating', pkgName, opt);

  exec(`npm uninstall ${pkgName} ${opt}`, function (e, stdout, stderr) {
    exec(`npm install ${pkgName} ${opt}`, function (e, stdout, stderr) {
      if (pkgs.length) run()
    })
  })
}
