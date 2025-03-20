# Keycloak Sandbox Project

This project provides a sandbox environment for experimenting with Keycloak authentication in a JavaScript application. It includes a Docker setup for Keycloak, a simple Node.js backend, and a basic HTML/JavaScript frontend.

## Prerequisites

- Docker
- Docker Compose
- Node.js
- npm

## Project Structure

This project is organized as a monorepo using Lerna and npm workspaces. The main components are:

- `/packages/frontend`: Contains a simple HTML/JavaScript application that demonstrates Keycloak authentication
- `/packages/backend`: Contains a Node.js Express application with Keycloak-protected endpoints
- `/packages/scripts`: Contains utility scripts for managing Keycloak realms programmatically
- `docker-compose.yml`: Configuration for the Keycloak Docker container
- `lerna.json`: Configuration for the Lerna monorepo

## Getting Started

### Environment Configuration

This project uses multiple `.env` files to manage environment variables:

#### Root `.env` File

The root `.env` file configures the Keycloak server. A sample `.env.example` file is provided as a template:

```
# Keycloak Configuration
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KC_DB=dev-file
KEYCLOAK_PORT=8080
```

To set up your environment:

1. Copy the `.env.example` file to create a new `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Customize the values in the `.env` file as needed.

#### Backend `.env` File

The backend also requires its own `.env` file with the following variables:

```
REALM=proxym
KEYCLOAK_URL=http://localhost:8080
CLIENT_ID=my-app
REDIRECT_URI=http://localhost:3000/callback
FRONTEND_URI=http://localhost:63342
REDIRECT_FRONTEND_URI=http://localhost:63342/js-keycloak-sandbox/frontend/index.html
SESSION_SECRET=my-custom-secret-key
```

To set up the backend environment:

1. Create a `.env` file in the `packages/backend` directory with the above variables
2. Adjust the values as needed for your environment
3. For security in production, make sure to use a strong, unique value for `SESSION_SECRET`

All `.env` files are excluded from version control for security reasons, while the `.env.example` file is committed as a template.

### Starting Keycloak

To start the Keycloak server, run the following command in the project directory:

```bash
docker-compose up -d
```

This will start Keycloak in detached mode. The server will be available at http://localhost:${KEYCLOAK_PORT} (default: http://localhost:8080).

### Stopping Keycloak

To stop the Keycloak server, run:

```bash
docker-compose down
```

To stop the server and remove the volumes (this will delete all data), run:

```bash
docker-compose down -v
```

## Accessing Keycloak Admin Console

Once Keycloak is running, you can access the admin console at http://localhost:${KEYCLOAK_PORT}/admin (default: http://localhost:8080/admin).

Default admin credentials:
- Username: admin
- Password: admin

## Keycloak Configuration

The Keycloak instance is configured using environment variables defined in the `.env` file:

- Admin user: `${KEYCLOAK_ADMIN}` (default: admin)
- Admin password: `${KEYCLOAK_ADMIN_PASSWORD}` (default: admin)
- Database: `${KC_DB}` (default: dev-file, suitable for development)
- Port: `${KEYCLOAK_PORT}` (default: 8080)

### Realm and Client Setup

After starting Keycloak, you need to:

1. Create a new realm named "proxym"
2. Create a new client named "my-app" with:
   - Client Protocol: openid-connect
   - Access Type: public
   - Valid Redirect URIs: http://localhost:63342/*
   - Web Origins: http://localhost:63342

## Data Persistence

Keycloak data is stored in a Docker volume named `keycloak_data`. This ensures that your configuration and user data persist even if the container is stopped or removed.

## Keycloak Client Configuration

The project includes separate `keycloak.json` files in both the `packages/frontend` and `packages/backend` directories. These files contain identical configuration for the Keycloak client:

- Realm: "proxym"
- Auth server URL: "http://localhost:8080/"
- Client ID (resource): "my-app"

## Running the Application

### Backend

To run the backend:

1. Navigate to the backend directory:
   ```bash
   cd packages/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

The backend will run on http://localhost:3000 with the following endpoints:
- `/login`: Initiates the login process with Keycloak
- `/callback`: Handles the OAuth callback from Keycloak
- `/private-route`: A protected endpoint that requires authentication
- `/check-auth`: Checks if the user is authenticated
- `/logout`: Logs the user out

### Frontend

To access the frontend:

1. Navigate to the frontend directory:
   ```bash
   cd packages/frontend
   ```

The frontend is a static HTML file that can be opened directly in a browser. It's configured to connect to the backend at http://localhost:3000.

The frontend provides a simple UI with:
- Login/logout buttons
- A button to call a protected backend endpoint
- Display areas for results and events

The frontend doesn't directly interact with Keycloak - it relies on the backend for authentication and authorization.

## Utility Scripts

The project includes a set of utility scripts in the `/packages/scripts` directory for managing Keycloak realms programmatically:

### Realm Management Scripts

- `create-realm.js`: Creates a Keycloak realm with predefined clients, users, and roles based on the configuration in `config/realm-import.json`
- `delete-realm.js`: Deletes the Keycloak realm

### Using the Scripts

To use these scripts:

1. Navigate to the scripts directory:
   ```bash
   cd packages/scripts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the scripts:
   ```bash
   # Create the realm
   npm run create-realm

   # Delete the realm
   npm run delete-realm
   ```

### Realm Configuration

The scripts create a realm named "quickstart" with:

- Two clients:
  - resource-server: A bearer-only client
  - test-cli: A public client with redirect URIs for localhost
- Two users:
  - alice: A regular user with the "user" role (password: alice)
  - admin: An administrator with the "admin" role (password: admin)
- Two realm roles:
  - user: For regular user privileges
  - admin: For administrator privileges

**Note:** The realm name in the scripts ("quickstart") differs from the one mentioned in the backend configuration ("proxym"). Make sure to use the appropriate realm name in your configuration.

## Security Considerations

The default configuration is suitable for development purposes only. For production use, consider:

1. Changing the admin credentials
2. Using a proper database (PostgreSQL, MySQL, etc.)
3. Setting up HTTPS
4. Configuring proper backup strategies
5. Updating the backend code to use the SESSION_SECRET environment variable instead of the hardcoded value

### Known Issues

- The backend currently uses a hardcoded session secret ('my-custom-secret-key') in main.js instead of reading it from the SESSION_SECRET environment variable. This should be fixed for better security by modifying the session configuration in main.js:

```javascript
app.use(session({
    secret: process.env.SESSION_SECRET || 'my-custom-secret-key',
    resave: false,
    saveUninitialized: true
}));
```
