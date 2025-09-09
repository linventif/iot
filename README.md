# Auto Pool Pump

// ...existing content...

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
docker run -e MYSQL_USER=pooluser -e MYSQL_PASSWORD=poolpassword -e MYSQL_DATABASE=auto_pool_pump -p 4001:4001 auto-pool-pump-api
```

Combine both approaches:

```bash
docker run --env-file .env -e ADDITIONAL_VAR=value -p 4001:4001 auto-pool-pump-api
```

### Required Environment Variables

-   `MYSQL_USER` - Database username (default: pooluser)
-   `MYSQL_PASSWORD` - Database password (default: poolpassword)
-   `MYSQL_DATABASE` - Database name (default: auto_pool_pump)
-   `MYSQL_HOST` - Database host (default: localhost)
-   `MYSQL_PORT` - Database port (default: 3306)

### Published Images

The API is automatically built and published to GitHub Container Registry via GitHub Actions:

```bash
docker pull ghcr.io/linventif/iot/api:latest
```

Available tags:

-   `latest` - Latest build from main branch
-   `main` - Latest main branch build
-   `main-<sha>` - Specific commit builds
