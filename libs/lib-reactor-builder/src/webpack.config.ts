import * as path from 'path';
import webpack, { Configuration, ExternalItem } from 'webpack';
import * as fs from 'fs';
import TerserPlugin from 'terser-webpack-plugin';
import { WatchIgnorePlugin } from './WatchIgnorePlugin';
import { patchExportedLibrary, patchImportedLibrary } from './utils';

export interface ModuleWebpackConfigContext {
  webpack: typeof webpack;
}

export const generateCommonWebpack = (dir: string): Configuration => {
  const p = require(path.join(dir, 'package.json'));
  const reactor = require(path.join(dir, 'reactor.config.json'));
  const production = process.env.NODE_ENV === 'production';
  const is_reactor_core = p.name === '@journeyapps/reactor-mod';

  // check for dependent reactor modules
  const externals: ExternalItem[] = Object.keys(p.dependencies).filter((depName) => {
    return fs.existsSync(path.join(dir, 'node_modules', depName, 'reactor.config.json'));
  });

  const external_libraries: { lib: string; aliased?: boolean; test?: RegExp }[] = [
    { lib: 'react' },
    { lib: 'react/jsx-runtime' },
    { lib: 'react/jsx-dev-runtime' },
    { lib: 'react-dom' },
    { lib: 'react-dom/client' },
    { lib: '@emotion/react', aliased: true },
    { lib: '@emotion/styled', aliased: true },
    { lib: 'lodash' },
    { lib: 'mobx', aliased: true },
    { lib: 'mobx-react', aliased: true },
    { lib: 'luxon' },
    { lib: '@fortawesome/fontawesome-svg-core', aliased: true },
    { lib: '@fortawesome/free-solid-svg-icons', aliased: true },
    { lib: '@fortawesome/react-fontawesome', aliased: true },
    { lib: '@journeyapps-labs/common-tree' },
    { lib: '@journeyapps-labs/common-utils' },
    { lib: '@journeyapps-labs/common-logger' },
    { lib: '@journeyapps/reactor-lib-utils' },
    { lib: '@projectstorm/react-workspaces-behavior-divider-dropzone', aliased: true },
    { lib: '@projectstorm/react-workspaces-behavior-panel-dropzone', aliased: true },
    { lib: '@projectstorm/react-workspaces-behavior-resize', aliased: true },
    { lib: '@projectstorm/react-workspaces-core', aliased: true },
    { lib: '@projectstorm/react-workspaces-dropzone-plugin-tabs', aliased: true },
    { lib: '@projectstorm/react-workspaces-dropzone-plugin-tray', aliased: true },
    { lib: '@projectstorm/react-workspaces-model-floating-window', aliased: true },
    { lib: '@projectstorm/react-workspaces-model-tabs', aliased: true },
    { lib: '@projectstorm/react-workspaces-model-tray', aliased: true }
  ];

  let config = {
    entry: [path.join(dir, 'dist', 'index.js')],
    output: {
      publicPath: path.join('/module', reactor.slug, '/'),
      path: path.join(dir, 'dist-module'),
      filename: 'bundle.js',
      library: p.name,
      libraryTarget: 'umd',
      assetModuleFilename: '[hash][ext][query]'
    },
    externalsType: 'umd',
    externals: ['stream/web', ...externals],
    watchOptions: {
      ignored: ['**/*.ts', '**/node_modules/**', '**/dist-module/**']
    },
    resolveLoader: {
      modules: [path.join(__dirname, '../node_modules'), 'node_modules']
    },
    resolve: {
      extensions: ['.json', '.js', '.jsx'],
      alias: {
        'process/browser': require.resolve('process/browser')
      },
      modules: [
        path.join(__dirname, '../../../node_modules'),
        path.join(dir, '../../node_modules'),
        path.join(dir, 'node_modules')
      ],
      fallback: {
        https: require.resolve('https-browserify'),
        http: require.resolve('stream-http'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        os: require.resolve('os-browserify/browser'),
        crypto: require.resolve('crypto-browserify'),
        zlib: require.resolve('browserify-zlib'),
        assert: require.resolve('assert/'),
        fs: false,
        tty: false
      }
    },
    ignoreWarnings: [/Failed to parse source map/],
    optimization: {
      minimizer: [
        new TerserPlugin({
          minify: TerserPlugin.terserMinify,
          parallel: true,
          terserOptions: {
            ecma: 2017,
            keep_classnames: true
          }
        })
      ]
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          enforce: 'pre',
          use: ['source-map-loader']
        },
        // some libraries have their files with preserve JSX enabled
        {
          test: /\.jsx$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', { targets: 'defaults' }], '@babel/preset-react']
            }
          }
        },
        {
          oneOf: [
            {
              test: /\.(woff|woff2|eot|ttf|otf|svg|png|gif|ico)$/,
              type: 'asset/resource'
            },
            {
              test: /\.css$/,
              use: [
                'style-loader',
                {
                  loader: 'css-loader'
                }
              ]
            }
          ]
        }
      ]
    },
    plugins: [
      new WatchIgnorePlugin(),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      }),
      new webpack.DefinePlugin({
        'process.browser': 'true'
      }),
      // It will add the banner message after minimizers and any asset manipulation
      new webpack.BannerPlugin({
        raw: true,
        footer: true,
        banner: `window.reactorModuleLoaded('${reactor.slug}')`,
        stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT
      })
    ],
    devtool: production ? 'source-map' : 'cheap-module-source-map',
    mode: production ? 'production' : 'development'
  } as webpack.Configuration;

  config = external_libraries.reduce((prev, cur) => {
    if (is_reactor_core) {
      return patchExportedLibrary({
        w: prev,
        alias: cur.aliased!!,
        module: cur.lib,
        test: cur.test,
        dir: dir
      });
    }
    return patchImportedLibrary({
      w: prev,
      module: cur.lib
    });
  }, config);

  return config;
};
