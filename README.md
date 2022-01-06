# Playa

Playa Unified Game Framework

# Build & debug

To install and build playa libraries run:

```bash
yarn
yarn build
```

For cross-lib development link libs by running the following. This is the process for testing changes on a dependency repo that has not been merged into develop yet. If you have local changes in both playa-core and playa-iw, playa-iw must be built with the link to playa-core enabled prior to linking playa-iw-template-game to playa-iw. You can see if a dependency is linked by looking in the node_modules folder and seeing if that dependency is a symlink.

```bash
# create link from lib folder
yarn link
# this creates a symlink to this directory which can be found at ~/.config/yarn/link

# link to existing yarn linked module
yarn link  ${name}

# actual use case
# create a yarn link to playa-core run this in the root of playa-core
yarn link
# to link to playa-core from playa-iw run this in the root of playa-iw
yarn link playa-core
#create a yarn link to playa-iw run this in the root of playa-iw
yarn link
# to link to playa-iw from playa-iw-template-game run this in the root of playa-iw-template-game
yarn link playa-iw
# to link to playa-core from playa-iw-template-game run this in the root of playa-iw-template-game
yarn link playa-core  # only needed if you have local changes needing testing in playa-core
# to remove a yarn link to playa-core from playa-iw or playa-iw-template-game run this in the root of playa-iw or playa-iw-template-game
yarn unlink playa-core
# to remove the yarn link for playa-core or playa-iw run this from the root of playa-core or playa-iw respectively
yarn unlink
# After unlinking run the following to restore npm refs to previously yarn linked dependencies.
yarn install --force
```

To test integration of this lib run:

```bash
# build game
yarn build-dev

# or build and rebuild on change
yarn watch

# launch a dev server to run the game (proxied to gsdev02)
yarn launch

# or a combination of `watch` and `launch`
yarn start
```

The `launch` (and `start`) command makes use of [playa-cli](https://github.com/igtinteractive/playa-cli) to serve the game in a local SKB environment. By default it proxies to rgs-gsdev02, but any appended options will be passed through. For example if you'd prefer to use a local GLR:

```bash
# builds the game and launches the dev server on port 3333, using glrs from ./GLR/bonusPlay/
yarn launch --port 3333 --glr bonusPlay
```

A complete [list of options](https://github.com/igtinteractive/playa-cli#usage) is documented in the playa-cli repository.
