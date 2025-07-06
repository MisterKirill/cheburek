# cheburek
The real cheburek bot 🥟

## Docker
Run using Docker:
```
docker run \
  -e TOKEN={bot-token} \
  -e FUSIONBRAIN_API_KEY={api-key} \
  -e FUSIONBRAIN_API_SECRET={api-secret} \
  -v ./docker-data:/app/data \
  -d misterkirill/cheburek
```
