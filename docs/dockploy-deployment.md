# Déploiement avec Dockploy

Ce projet démarre 3 services via `docker-compose.yml` :

- `db` (`mariadb:11`)
- `api` (`ghcr.io/linventif/iot/api:latest`)
- `cloudflared` (`cloudflare/cloudflared:latest`)

## Services et ports

- `db`: `${MYSQL_PUBLIC_PORT:-3307}:${MYSQL_CONTAINER_PORT:-3306}`
- `api`: `${API_PUBLIC_PORT:-4001}:${API_CONTAINER_PORT:-4001}`
- `cloudflared`: pas de port publié, sortie vers Cloudflare en tunnel.

## Variables `.env` à configurer

Variables obligatoires :

- `MYSQL_ROOT_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`

Variables de réseau/ports :

- `MYSQL_HOST` (par défaut `db`)
- `MYSQL_PUBLIC_PORT` (par défaut `3307`)
- `MYSQL_CONTAINER_PORT` (par défaut `3306`)
- `MYSQL_API_PORT` (par défaut `3306`)
- `API_PUBLIC_PORT` (par défaut `4001`)
- `API_CONTAINER_PORT` (par défaut `4001`)

Cloudflared :

- `CLOUDFLARED_TOKEN` (recommandé en production)
- `CLOUDFLARED_CONFIG_YAML_B64` (optionnel, config YAML complète encodée en base64)
- `CLOUDFLARED_TUNNEL_ID` (optionnel, mode config générée)
- `CLOUDFLARED_HOSTNAME` (optionnel, mode config générée)
- `CLOUDFLARED_SERVICE_URL` (optionnel, défaut `http://api:4001`)
- `CLOUDFLARED_CREDENTIALS_JSON_B64` (optionnel, credentials JSON encodé en base64)

## Cloudflared: 3 modes

### Mode 1 (recommandé): token

1. Créer le tunnel côté Cloudflare Zero Trust.
2. Récupérer le token du tunnel.
3. Le mettre dans `CLOUDFLARED_TOKEN` (Dockploy env vars).
4. Laisser `cloudflared/config.yml` tel quel (il ne sera pas utilisé).

Le conteneur lance automatiquement :

```sh
cloudflared tunnel --no-autoupdate run --token "$CLOUDFLARED_TOKEN"
```

### Mode 2: variables Dockploy uniquement (sans fichiers)

Utilise ces variables :

- `CLOUDFLARED_TUNNEL_ID`
- `CLOUDFLARED_HOSTNAME`
- `CLOUDFLARED_CREDENTIALS_JSON_B64`
- `CLOUDFLARED_SERVICE_URL` (optionnel)

Le conteneur génère `/tmp/config.yml` et `/tmp/credentials.json` automatiquement puis démarre le tunnel.

### Mode 3: fichier config

1. Copier `cloudflared/credentials.json.example` en `cloudflared/credentials.json`.
2. Remplacer les placeholders dans `cloudflared/config.yml`.
3. Mettre `CLOUDFLARED_TOKEN` vide.

Le conteneur lance automatiquement :

```sh
cloudflared tunnel --no-autoupdate --config /etc/cloudflared/config.yml run
```

Le dossier `./cloudflared` est monté en lecture seule dans le conteneur :

```text
./cloudflared:/etc/cloudflared:ro
```

## Déploiement Dockploy

1. Importer le repo.
2. Choisir le fichier `docker-compose.yml`.
3. Définir les variables d'environnement (au minimum les variables MySQL, puis `CLOUDFLARED_TOKEN` si mode token).
4. Déployer.

## Vérifications rapides

- `db` doit être `healthy`.
- `api` doit démarrer après `db` (grâce à `depends_on` + healthcheck).
- Si `API_PUBLIC_PORT=4001`, tester `http://<host>:4001`.
- Vérifier les logs `cloudflared` pour confirmer que le tunnel est `connected`.

## Notes

- `pull_policy: always` est activé sur `api` et `cloudflared`, donc Dockploy tirera la dernière image à chaque redeploy.
- `cloudflared/credentials.json` est ignoré par Git (ne pas versionner ce fichier).
- Priorité de démarrage cloudflared: `CLOUDFLARED_TOKEN` > `CLOUDFLARED_CONFIG_YAML_B64` > variables de config générée > fichier `/etc/cloudflared/config.yml`.
