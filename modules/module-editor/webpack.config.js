const path = require('path');
const { patchExportedLibrary } = require('@journeyapps/reactor-lib-builder');
module.exports = (webpack) => {
  const monacoCompatibilityAliases = {
    'monaco-editor/esm/vs/editor/editor.worker.ts': path.join(
      __dirname,
      'node_modules',
      'monaco-editor',
      'esm',
      'vs',
      'editor',
      'editor.worker.js'
    ),
    'monaco-editor/esm': path.join(__dirname, 'node_modules', 'monaco-editor', 'esm')
  };

  webpack = patchExportedLibrary({
    w: webpack,
    module: 'monaco-editor',
    test: /monaco-patch\.js/,
    dir: __dirname
  });

  webpack = patchExportedLibrary({
    w: webpack,
    module: 'react-monaco-editor',
    dir: __dirname
  });

  let r = webpack.module.rules.find((v) => !!v['oneOf']);
  r.oneOf = [
    {
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            url: {
              //https://github.com/webpack-contrib/css-loader/issues/1342#issuecomment-881587038
              filter: (url) => !url.startsWith('data:image')
            }
          }
        }
      ]
    },
    ...r.oneOf
  ];

  return [
    {
      entry: {
        // Package each language's worker and give these filenames in `getWorkerUrl`
        'editor.worker': 'monaco-editor/editor/editor.worker',
        'json.worker': 'monaco-editor/languages/features/json/json.worker',
        'yaml.worker': 'monaco-yaml/yaml.worker'
      },
      output: {
        globalObject: 'self',
        filename: '[name].bundle.js',
        path: webpack.output.path
      },
      resolve: {
        ...webpack.resolve,
        alias: {
          ...webpack.resolve.alias,
          ...monacoCompatibilityAliases
        }
      }
    },
    {
      ...webpack,
      resolve: {
        ...webpack.resolve,
        alias: {
          ...webpack.resolve.alias,
          'lru-cache': path.join(__dirname, 'node_modules', 'lru-cache'),
          ...monacoCompatibilityAliases,
          'monaco-editor$': path.join(__dirname, 'monaco-patch.js')
        }
      },
      module: {
        ...webpack.module,
        rules: [
          ...webpack.module.rules,
          {
            test: /\.tmTheme/i,
            use: 'raw-loader'
          },
          {
            test: /\.(tmLanguage|wasm)$/,
            type: 'asset/resource'
          },
          {
            test: /\.json5$/i,
            loader: 'json5-loader',
            type: 'javascript/auto'
          }
        ],
        defaultRules: [
          {
            type: 'javascript/auto',
            resolve: {}
          },
          {
            test: /\.json$/i,
            type: 'json'
          }
        ]
      }
    }
  ];
};
