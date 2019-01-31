import typescript from 'rollup-plugin-typescript';
import { uglify } from "rollup-plugin-uglify";
import fs from 'fs-extra';
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

export default Object.keys(entries).map(name => ({
  input: entries[name] + '.ts',
  output: {
    name: moduleName,
    file: `dist/${name}.js`,
    format: 'umd'
  },
  sourceMap: isDev,
  ...config
}));
