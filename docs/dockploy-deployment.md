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

## Déploiement Dockploy

1. Importer le repo.
2. Choisir le fichier `docker-compose.yml`.
3. Définir les variables d'environnement (`API_PUBLIC_PORT`, `API_CONTAINER_PORT`, `SQLITE_FILE` si besoin).
4. Déployer.

## Vérifications rapides

- `api` doit démarrer sans service `db` ni `migrate`.
- Si `API_PUBLIC_PORT=4001`, tester `http://<host>:4001`.

## Notes

- L'API crée automatiquement les tables SQLite manquantes au démarrage.
- Supprimer le volume `sqlite_data` efface les données applicatives.
