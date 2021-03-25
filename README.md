# Deploy

## Deploy



```bash
export PROJECT="www-eaga";
export QUEUE_NAME="my-queue";
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/credentials.json";
```

```bash
# Create taskqueue
gcloud tasks queues create "${QUEUE_NAME}" --project="${PROJECT}";

# Deploy
gcloud app deploy . --project="${PROJECT}" -q;
```