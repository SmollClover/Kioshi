# Kioshi

### A Simple Discord Bot that handles Perks for Server Boosters

> This Bot was designed for personal use. There's no guarantee for it to be stable when used by someone else and I will not provide any Support for running/using this Project

---

## Setup Instructions

> Make sure to have NodeJS installed. I've built this Bot on NodeJS v18.1.0

Create a `.env` file in the project root directory with the following data inside of it

```env
TOKEN=YOUR_DISCORD_BOT_TOKEN
MONGO_URI=YOUR_MONGO_URI
```

Go into `./src/common/Emojis.ts` and change the Emojis for the Bot to use

### Using NVM

```bash
$ nvm install
$ nvm use
```

### Yarn

```bash
$ yarn install
$ yarn start
```

### NPM

```bash
$ npm install
$ npm start
```

### Scopes

-   bot
-   applications.commands

### Privileged Gateway Intents

-   Server Members Intent

### Permission

-   Manage Channels
-   Read Messages/View Channels
-   Send Messages
-   Send Messages in Threads
-   Manage Messages
-   Embed Links
-   Attach Files
-   Read Message History
-   Mention Everyon
-   Use External Emojis
-   Use External Stickers
-   Add Reactions
-   Use Slash Commands

### Template Invite Link

`https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=414464863312&scope=bot%20applications.commands`
