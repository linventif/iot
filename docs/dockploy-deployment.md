# Déploiement avec Dockploy

Ce projet démarre les services suivants via `docker-compose.yml` :

- `api` (image API buildée depuis `apps/api/Dockerfile`)

La base de données est un fichier SQLite persistant dans le volume Docker `sqlite_data`.

## Services et ports

- `api`: `${API_PUBLIC_PORT:-4001}:${API_CONTAINER_PORT:-4001}`

## Variables `.env` à configurer

SQLite :

- `SQLITE_FILE` (par défaut `/data/iot.sqlite`, utilisé si `DATABASE_URL` est absent)

Supprimer les anciennes variables MySQL (`MYSQL_*`) et tout ancien `DATABASE_URL=mysql://...`
dans Dockploy. Le `docker-compose.yml` force `DATABASE_URL=file:${SQLITE_FILE}` pour éviter
qu'une ancienne URL MySQL casse le démarrage.

Ports :

- `API_PUBLIC_PORT` (par défaut `4001`)
- `API_CONTAINER_PORT` (par défaut `4001`)

CORS :

- `API_ALLOWED_ORIGINS` (liste séparée par des virgules)
- Par défaut, l'API autorise `https://pool.linv.dev`, `https://iot.linv.dev`,
  `https://iot-dev.linv.dev`, les origines locales Vite (`http://localhost:4000`,
  `http://127.0.0.1:4000`) et les anciennes origines locales/LAN sur le port API.
- Si `API_ALLOWED_ORIGINS` est défini dans Dockploy, il remplace entièrement cette
  liste. Ajouter explicitement `https://pool.linv.dev` pour que le site puisse lire
  les réponses de `https://iot-api.linv.dev`.

## Déploiement Dockploy

1. Importer le repo.
2. Choisir le fichier `docker-compose.yml`.
3. Définir les variables d'environnement (`API_PUBLIC_PORT`, `API_CONTAINER_PORT`,
   `SQLITE_FILE`, `API_ALLOWED_ORIGINS` si besoin).
4. Déployer.

## Vérifications rapides

- `api` doit démarrer sans service `db` ni `migrate`.
- Si `API_PUBLIC_PORT=4001`, tester `http://<host>:4001`.

## Notes

- L'API crée automatiquement les tables SQLite manquantes au démarrage.
- Supprimer le volume `sqlite_data` efface les données applicatives.
