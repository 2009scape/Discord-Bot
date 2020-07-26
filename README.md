#2009scape Discord bot

### Installation & Running

1. Create a .env file and enter DISCORD_TOKEN=<your discord bot token>
2. Run `yarn` or `npm i`
3. Run `yarn start` or `npm start`

### Debugging

`gyp ERR! command "/usr/bin/node" "/usr/bin/node-gyp" "rebuild"`

This error occurs when your node version is too new.

1. Install nvm
1. `nvm install 10.22.0`
2. `nvm use 10.22.0`