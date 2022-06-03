## Description

This project aims to evaluate the Quake 3 game log and provide reports of kills and deaths of players

## Installation

```bash
$ npm i yarn
$ yarn install
```

## Running the app

```bash
# development
$ yarn start 

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Available endpoints

# Report (grouped information) for each match and a player ranking.
http://localhost:3000/report/kills

# Report of deaths grouped by death cause for each match.
http://localhost:3000/report/deaths
