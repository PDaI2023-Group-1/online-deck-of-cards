# Online Deck Of Cards (group 1)

This is a student project made for a general project course on Q3/2023.

First some general information about the project and at the end of the document instructions on running the application.

Project subject was simply an online deck of playing cards for simulating an experience of playing cards with friends over a real table. Also we had some ideas of creating custom game configurations and all these grand things but due to time constraints and unforseen circumstances (read: basic implementation was harder than thought)

## A web development practice project

The goal of the projecty was to improve the groups understanding of web develoment tools and techniques.

The project consists of basically three smaller projects: websocket server, rest server and the client.

This subject felt good as previously we had made a React application as part of another course and most of the group were somewhat familiar with the "library". Same goes for the Node backend. Everyone had worked with it before (at least once).

So we chose the following stack. We decided these based on familiarity factors, nothing too familiar but at least one person in the group would know the basics of each. This was done to try avoid "brickwalls" where nobody could help a person who got stuck.

- SolidJS (ui and game)
- NodeJS (WebSockets)
- Express (Rest API)
- TypeScript (everywhere)
- Google Cloud Platform

### More on the tech

We used TypeScript as nowadays it seems to be **THE** way to write JavaScript. Nobody in the group was familiar with the superset, but we decided that learning it would be beneficial because of its popularity. Lack of familiarity with it lead to the messy types defined in the declaration files and also duplicating same types on the WS client and the server.

We also adopted ESLint and Prettier because of their popularity.

The setup of those tools are a bit messy, we probably could have setup project wide rules from a single source instead of the current implementation of each sub-project having their own.

We choce Solid because it looked a lot like React but promised better performance. SolidJS is also noticeably newer and less used compared to React, Vue or any other of the major frameworks. This seemed like a great way to learn a different "frontend paradigm" without having to learn new syntax/losing JSX.

Node WebSockets and Express were chosen because of the mentality that we probably should keep both front- and backend same language for consistency.

We also choce not to use WebGL or similar because it seemed like the native APIs would be enough for something small like this. This proved out to be a mistake. The native APIs were great at first for the start but as more features needed to be added the complexity sky rocketed and in hindsight WebGL or similar would have been better after learning the basics.

Altho using native browser/js features turned out the be bad for this usecase but it was great for learning some more advanced handling of the web tooling available.

# Setting Up The Dev Environment

You will need to create three .env files, note the required key value pairs are also in the `.env.template` files located in their respective folders

| File (location)    | KEY              | VALUE                                              |
| ------------------ | ---------------- | -------------------------------------------------- |
| /backend/ws/.env   | SECRET_KEY       | "some_string_that_matches string in **rest**/.env" |
| /backend/rest/.env | SECRET_KEY       | "some_string_that_matches string in **ws**/.env"   |
|                    | SERVER_PORT      | number (must match port in VITE_DEV_API_URL)       |
| /fontend/.env      | VITE_DEV_API_URL | http://127.0.0.1:8080                              |
|                    | VITE_API_URL     | http://127.0.0.1:8080                              |
|                    | VITE_ENV         | dev                                                |
|                    | VITE_WS_URL      | localhost                                          |
|                    | VITE_WS_PORT     | 8080                                               |

After this is done you must install dependencies in each 'project', you can do this manually by navigating to `frontend/`, `backend/ws` and `backend/rest` seperately and running `npm install`.

After you can run `npm start` in the frontend directory and also `npm run dev` in the ws and rest. Please note that you need to keep each one process open while developing.

Alternatively if you have Make installed you can just run `make deps` in the entire project root `/` once that is complete you can run `make dev` to actually start the application locally (on windows you might need to use git bash or similar)
