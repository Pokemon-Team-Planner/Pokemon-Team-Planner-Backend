# Backend for Pokemon Team Planner

![pokemon team planner logo](readme-assets/pokemon-team-planner-logo-outlined.png)

## Node.js backend to serve pokemon data, API for pokemon teams and handle user authentication

This is the backend for my Pokemon Team Planner app in which you can plan Pokemon teams for Pokemon games and share them online. You can share teams either anonymously or with your user account. It has restful API endpoints for pokemon teams and basic endpoints for user creation and login. It also serves some static JSON-data such as supported games and game specific pokedexes with all the pokemon data.

API endpoints (with example requests and responses)
* [create_team_anonymous](requests\create_team_anonymous.rest)
* [create_team](requests\create_team.rest)
* [create_user](requests\create_user.rest)
* [delete_team](requests\delete_team.rest)
* [get_all_teams](requests\get_all_teams.rest)
* [get_all_users](requests\get_all_users.rest)
* [get_team](requests\get_team.rest)
* [login](requests\login.rest)
* [update_team](requests\update_team.rest)

## Flowchart

```mermaid
flowchart 
  f(Frontend)
  b(Backend)
  db(("Database
  (MongoDB)"))
  
  f -->|"Static JSON 
  (pokedexes, games)"| b
  f -->|Team API| b
  f -->|User authentication| b
  p>POST request] -->|User creation| b
  b -->db
```

## Installation instructions

1. clone this project
2. run `npm install`
3. create mongodb cluster for example at mongodb.com with two collections 'test' and 'production'
4. create `.env` file to project root:
```ini
TEST_MONGODB_URI=mongodb+srv://username:password@address #Copy address for test from mongodb.com
MONGODB_URI=mongodb+srv://username:password@address #Copy address for production from mongodb.com
PORT=3001
SECRET=mysecret #Change this to a random 512-bit string (64 characters)
```
5. run `npm run dev` or `npm start`

## Contributing

For now this is a Full Stack course project of mine. Maybe in the future I could accept contributions. Feel free to send me ideas or feedback though! :)

## Known issues (work in progress)

* While users can be created through an endpoint, the frontend does not yet support it from UI. There is also not yet support for password change nor user deletion.

* Commenting and liking Pokemon teams would be nice to have.