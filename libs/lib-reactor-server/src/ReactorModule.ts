import { ReactorModuleConfig } from './ReactorConfig';
import * as fs from 'fs';
import * as path from 'path';
import { reactorServerLogger } from './logging';
import { Log } from '@journeyapps/common-logger';

export interface ReactorModuleOptions {
  directory: string;
  resolveGlobalEnv: (key: string) => string | undefined;
}

export class ReactorModule {
  protected confFile: string;
  protected conf?: ReactorModuleConfig;
  protected confPackage?: { name: string; version: string };
  protected fragment: string | null;

  constructor(public options: ReactorModuleOptions) {
    this.confFile = path.join(options.directory, 'reactor.config.json');
    this.confPackage = require(path.join(options.directory, 'package.json'));
    this.fragment = null;
    if (fs.existsSync(this.confFile)) {
      this.conf = require(this.confFile);
    } else {
      throw new Error(`No config file for ${options.directory} at ${this.confFile}`);
    }
    this.getEnvs();
  }

  getEnvs(): Record<string, string> {
    return this.config.env.reduce(
      (env, key) => {
        const value = this.options.resolveGlobalEnv(key);
        if (value == null) {
          throw new Error(`Environment variable '${key}' required by Reactor module '${this.name}' is missing`);
        }
        env[key] = value;
        return env;
      },
      {} as Record<string, string>
    );
  }

  get name() {
    return this.config.name;
  }

  get packageJson(): { name: string; version: string } {
    return this.confPackage;
  }

  get config(): ReactorModuleConfig {
    return {
      ...this.conf,
      env: this.conf.env ?? []
    };
  }

  get loaderPayload(): { fragmentData: string; background: string } | null {
    if (this.config.loader) {
      if (!this.fragment) {
        this.fragment = fs.readFileSync(path.join(path.dirname(this.confFile), this.config.loader.fragment), {
          encoding: 'utf-8'
        });
      }

      return {
        background: this.config.loader.backgroundColor,
        fragmentData: this.fragment
      };
    }
    return null;
  }
}

export const loadModules = (options: { env: { MODULES: string[] } & { [key: string]: any } }): ReactorModule[] => {
  return options.env.MODULES.map((m) => {
    let directory = path.join(process.cwd(), m);
    if (m.startsWith('@')) {
      // this should be the directory that contains the reactor config file
      directory = path.resolve(path.dirname(require.resolve(m, { paths: [process.cwd()] })), '..');
    }
    const module = new ReactorModule({
      resolveGlobalEnv: (key) => {
        return options.env[key] as string;
      },
      directory: directory
    });
    reactorServerLogger.info(
      Log.green('Loaded module'),
      Log.bold(Log.cyan(module.name)),
      Log.purple(`${module.packageJson.name}@${module.packageJson.version}`),
      Log.gray(`slug: ${module.config.slug}`),
      Log.dim(directory)
    );
    reactorServerLogger.debug(Log.dim('Module environment'), Log.bold(module.name), module.config.env);
    return module;
  });
};
