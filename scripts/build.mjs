import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { rollup, watch as rollupWatch } from 'rollup';

const watch = process.argv.includes('--watch');

await rm('dist', { recursive: true, force: true });
await mkdir('dist/assets', { recursive: true });
await cp('public', 'dist', { recursive: true });

const options = {
  input: 'src/index.jsx',
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    nodeResolve({ browser: true, extensions: ['.mjs', '.js', '.json', '.jsx'] }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx'],
      presets: [['@babel/preset-react', { runtime: 'automatic' }]]
    })
  ],
  output: {
    file: 'dist/assets/index.js',
    format: 'iife',
    sourcemap: true,
    name: 'TestciApp'
  }
};

const css = `${await readFile('src/index.css', 'utf8')}\n${await readFile('src/App.css', 'utf8')}`;
await writeFile('dist/assets/index.css', css);

if (watch) {
  rollupWatch(options).on('event', (event) => {
    if (event.code === 'BUNDLE_END') {
      console.log('Built. Watching for changes...');
    }
    if (event.code === 'ERROR') {
      console.error(event.error);
    }
  });
} else {
  const bundle = await rollup(options);
  await bundle.write(options.output);
  await bundle.close();
  await writeFile(
    'dist/index.html',
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="React app" />
    <link rel="apple-touch-icon" href="/logo192.png" />
    <link rel="manifest" href="/manifest.json" />
    <title>React App</title>
    <link rel="stylesheet" href="/assets/index.css" />
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>
`
  );
}
