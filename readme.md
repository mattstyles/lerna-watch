
# lerna-watch

> Evaluates the local dependencies of a target package and executes scripts within them inside a [lerna](https://lerna.js.org/)-powered monorepo.

[![npm](https://img.shields.io/npm/v/lerna-watch?style=flat-square)](https://www.npmjs.com/package/lerna-watch)
[![License](https://img.shields.io/github/license/mattstyles/lerna-watch.svg)](https://github.com/mattstyles/lerna-watch/blob/master/license)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## Getting Started

Install using:

```sh
npm install -D lerna-watch
```

Then add a `package.json` script to your project root:

```json
scripts: {
  "start": "lerna-watch app"
}
```

`app` references a package in your lerna-powered monorepo.

This command will run a command in the `app` package, which defaults to `dev`, and run commands in all local (i.e. inside your monorepo) dependencies, which defaults to `watch`.

You could use `npx` to spin this up instead:

```sh
npx lerna-watch app
```

Run `npx lerna-watch -h` for additional information, or read on.

Happy hacking!

## Motivation

Monorepos are a good way to organise your project/s, and lerna is a good way to help manage them.

Monorepos typically consist of one or more application packages (those packages which constitute a runnable application) and several dependency packages which support those applications.

`lerna-watch` is a complementary package that builds on lerna tooling to help set up a development environment for a package within your monorepo.

To get started let’s assume that your monorepo contains one or more application packages and several dependency packages.

```
packages
├── app
├── ui
└── utils
```

In this monorepo there is an `app` package which forms the heart of project, and two dependencies, `ui` and `utils`, which support it.

`lerna` allows you to setup a monorepo with this structure, but makes no assumptions about how you build and run projects within it.

> `lerna-watch` is opinionated as it expects each package to have a life-cycle of its own.

In our example above each of the packages has its own `build`, `test`, and `watch` scripts. The `app` package additionally has a `dev` script which is used to create a development environment to that package.

In order to setup a development environment where we can hack on any of those packages we need to run a few scripts, which is where `lerna-watch` can help.

```sh
lerna-watch app
```

This command tells `lerna-watch` that `app` is our top-level package. From there it uses `lerna` to evaluate the local dependencies, `ui` and `utils`, and set up their development scripts too.

In this example the following commands will be executed, and their output will be interleaved:

```
app     dev
ui      watch
utils   watch
```

Typically `dev` will execute a bundling tool (i.e. parcel, webpack, rollup, maybe next or nuxt) which do the heavy lifting of setting up a development build with features such as source maps, hot-reload/fast-refresh, incremental builds etc. By default most of these will perform an incremental build when code changes, including code within `node_modules`. It is this feature will allows `lerna-watch` to operate.

When you perform changes within the `app` package the bundler will pick up those changes, perform an incremental build, and then either refresh your browser (or other environment) or expect you to perform this step manually.

When you perform changes within `ui` or `utils` then the executed `watch` script (common in these sorts of packages to rebuild to package) will fire, rebuilding the dependency, which will trigger a change in `node_modules` which is, in turn, picked up by the `app` bundler and very shortly the results of your coding labours will be visible.

## Configuration

`lerna-watch` is deceptively non-complex, mostly because it builds on (and is dependent upon) tooling like `lerna` and bundlers to do all the heavy lifting. `lerna-watch` builds a full local dependency tree and executes configured scripts.

> Standing on the shoulders of giants is one of the many pleasures of open source software.

By default `dev` will be executed in the context (lerna calls this `scope`) of the target package and `watch` will run in the local dependencies.

To alter the defaults change one or both configuration items within `lerna.json`:

```json
"watch": {
  "commands": {
    "target": "start",
    "watch": "bundle"
  }
}
```

Note that whilst not enforced it is certainly expected that these scripts are long-lived. A `build` script will typically exit when finished, which is not the aim with `lerna-watch` (although the dependency graph it generates _could_ be leveraged to action a different task, such as running tests as described in the next section).

> We want an environment that provides a fast refresh loop between making coding changes and seeing the output of those changes.

## Flat modules

`lerna` couples well with [yarn@1/workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) ([pnpm](https://pnpm.js.org/) has this feature, as will/should [npm@7](https://blog.npmjs.org/post/186983646370/npm-cli-roadmap-summer-2019)) and workspaces typically create a flat(ish) `node_modules` structure.

This is useful for `lerna-watch` as it means that the _least_ amount of work can be performed to see changes.

For mature projects top-level packages will typically have a deep tree of local dependencies. Given our earlier example it is quite possible that `app` does not depend on `utils` directly, rather `ui` does, such that the dependency graph would look something like:

```
app
└── ui
    └── utils
```

With a flat structure `ui` and `utils` end up at the same level within `node_modules` and, as such, a change in `utils` **only** requires a rebuild of `utils`, even though `ui` depends on it. The bundling mechanism within `app` (and dependency management as is typical within JS and Node) ensures that **only** `utils` and then `app` need to be rebuilt.

In our trivial example the time saving is likely minimal, however, over time the dependency graph will grow and those leaf node (bottom-level dependencies) may end up triggering multiple builds of intermediary packages. This could get expensive, particularly if you do smart things with your builds (Typescript and flow are smart things, but expensive things, the same is true for things that manipulate images or SVG).

If your project does not hoist dependencies to the root (i.e. uses `npm<7` and installs into each package) then `lerna-watch` will continue to work. As lower-level packages are built, their dependents will also build, and this will bubble up to the top-level package, although this may result in a couple of rebuilds as each direct dependency of `app` which are effected by the changes you have performed will rebuild, each one triggering an `app` rebuild.

> A flat dependency structure, as typically provided by workspaces, helps efficiency of building but there is also a potential drawback, depending on your incremental setup.

If you rely on running tests as part of your `watch` scripts (which is generally a good idea, _if_ you can afford it) then they **will not** run for intermediary packages.

Within the `app->ui->utils` structure used as an example, a change in `utils` will not trigger any action within `ui`, hence no tests will be run in that package. Tests can be run as a result of your scripts within `utils` and `app` as they both react to the change, however, it is possible that the change _broke_ the tests for `ui` and nothing here will inform you.

This is a drawback that is not easily worked around. Nor is it trivial to add it to `lerna-watch`.

The easiest solution here is likely to run your tests on a slower cadence such as running when you perform a commit (which you likely already do right?) rather than on save. Whilst this cadence is slower to visualise test failures, the trade-off is significantly faster incremental builds, depending on your requirements this is often enough. If your monorepo is large then running **all** your tests on commit may still be prohibitively expensive, in which case you could leverage the dependency graph that `lerna-watch` generates to run tests (`lerna-watch@1.1` will include a `-c` flag which you can use to specify different scripts to run).

## Programmatic use

`lerna-watch` also exposes a programmatic interface.

```js
const { watch } = require('lerna-watch')

watch({
  target: 'app',
  cwd: 'path'
})
```

`cwd` is used by `@lerna/project` to specify the project root, you could create the `Project` object yourself and specify that using `project` in the parameters passed to `watch`.

```js
const Project = require('@lerna/project')
const { watch } = require('lerna-watch')

const project = new Project('root-path')

watch({
  target: 'app',
  project: project
})
```

If you inadvertently supply both `project` and `cwd`, then `project` will take precedence.

## Contributing

Pull requests are always welcome, the project uses the [standard](http://standardjs.com) code style. Please run `npm test` to ensure all tests are passing and add tests for any new features or updates.

For bugs and feature requests, [please create an issue](https://github.com/mattstyles/lerna-watch/issues).

## License

MIT
