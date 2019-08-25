module.exports = {
  exclude: [
    './src/index.ts',
    './src/utils/*'
  ],
  includeDeclarations: true,
  tsconfig: 'tsconfig.json',
  out: './docs',
  excludePrivate: true,
  excludeProtected: true,
  excludeExternals: true,
  ignoreCompilerErrors: true,
  listInvalidSymbolLinks: true,
  hideGenerator: false,
  theme: 'minimal'
};
