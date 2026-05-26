# Déploiement avec Dockploy

Ce projet démarre les services suivants via `docker-compose.yml` :

- `db` (`mariadb:11`)
- `migrate` (réutilise l'image API) pour appliquer les migrations Drizzle
- `api` (image API buildée depuis `apps/api/Dockerfile`)
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

## Cloudflared: 2 modes

### Mode 1 (recommandé): token

1. Créer le tunnel côté Cloudflare Zero Trust.
2. Récupérer le token du tunnel.
3. Le mettre dans `CLOUDFLARED_TOKEN` (Dockploy env vars).
4. Laisser `cloudflared/config.yml` tel quel (il ne sera pas utilisé).

Le conteneur lance automatiquement :

```sh
cloudflared tunnel --no-autoupdate run
```

En mode token, `cloudflared` lit `TUNNEL_TOKEN` depuis l'environnement (alimenté par `CLOUDFLARED_TOKEN`).

### Mode 2: fichier config

1. Copier `cloudflared/credentials.json.example` en `cloudflared/credentials.json`.
2. Remplacer les placeholders dans `cloudflared/config.yml`.
3. Mettre `CLOUDFLARED_TOKEN` vide.

Le conteneur lance automatiquement :

```sh
cloudflared tunnel --no-autoupdate run
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
- `migrate` doit se terminer avec succès après le démarrage healthy de `db`.
- `api` doit démarrer après `migrate`.
- Si `API_PUBLIC_PORT=4001`, tester `http://<host>:4001`.
- Vérifier les logs `cloudflared` pour confirmer que le tunnel est `connected`.

## Notes

- `api` est buildé depuis le repo, puis `migrate` réutilise cette même image afin que les migrations utilisent le code du déploiement courant sans exporter deux builds vers le même tag.
- `cloudflared/credentials.json` est ignoré par Git (ne pas versionner ce fichier).
