# Auto Pool Pump

// ...existing content...

## Documentation

- [Deployment with Dockploy](./docs/dockploy-deployment.md)

## Docker Deployment

### Building the API Image

Build the Docker image for the API:

```bash
bun run docker:api:build
```

Or manually:

```bash
docker build -f apps/api/Dockerfile -t auto-pool-pump-api .
```

### Running the API Container

Run the container with environment variables from a file:

```bash
docker run --env-file .env -p 4001:4001 auto-pool-pump-api
```

Run with a specific environment file:

```bash
docker run --env-file production.env -p 4001:4001 auto-pool-pump-api
```

Run with individual environment variables:

```bash
docker run -e DATABASE_URL=file:/data/iot.sqlite -v auto-pool-pump-data:/data -p 4001:4001 auto-pool-pump-api
```

Combine both approaches:

```bash
docker run --env-file .env -e ADDITIONAL_VAR=value -p 4001:4001 auto-pool-pump-api
```

### Required Environment Variables

-   `DATABASE_URL` - SQLite database URL (default: `file:./data/iot.sqlite`)
-   `SQLITE_FILE` - SQLite file path used when `DATABASE_URL` is not set
-   `PORT` - API port inside the container (default: `4001`)

### Published Images

The API is automatically built and published to GitHub Container Registry via GitHub Actions:

```bash
docker pull ghcr.io/linventif/iot/api:latest
```

Available tags:

-   `latest` - Latest build from main branch
-   `main` - Latest main branch build
-   `main-<sha>` - Specific commit builds
