import { execSync } from 'child_process';
import fs from 'fs-extra';
import typescript from 'rollup-plugin-typescript';
import { uglify } from "rollup-plugin-uglify";
import pkg from './package.json';

const task = process.env.npm_lifecycle_event;
const isDev = task === 'start';

const moduleName = pkg.name.replace(/^./, match => match.toUpperCase());
const entries = {
  index: 'src/index',
  collapsible: 'src/collapsible',
  toast: 'src/toast',
  modal: 'src/modal',
  tab: 'src/tab',
  carousel: 'src/carousel',
};
const config = {
  treeshake: {
    pureExternalModules: true,
    propertyReadSideEffects: false
  },
  plugins: [typescript()].concat(isDev ? [] : [uglify()])
};

fs.removeSync('./dist');
execSync('npx tsc', { cwd: process.cwd() })
emptyDirWithExclude('./dist/utils', ['event_emitter.d.ts'])

export default Object.keys(entries).map(name => ({
  input: entries[name] + '.ts',
  output: {
    name: moduleName,
    file: `dist/${name}.js`,
    format: 'umd',
    sourcemap: isDev,
  },
  ...config
}));

function emptyDirWithExclude(dir, exclude) {
  exclude.forEach(p => {
    fs.moveSync(dir + '/' + p, './tmp/' + p)
  })
  fs.emptyDirSync(dir)
  exclude.forEach(p => {
    fs.moveSync('./tmp/' + p, dir + '/' + p)
  })
}
