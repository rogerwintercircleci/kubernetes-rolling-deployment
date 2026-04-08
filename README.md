# kubernetes-rolling-deployment

Sample application for the CircleCI tutorial: **How to Set Up Rolling Deployments on Kubernetes with CircleCI**.

## What's in this repo

```
app/          Node.js HTTP server (zero dependencies)
k8s/          Kubernetes Deployment and Service manifests (envsubst templates)
.circleci/    CircleCI pipeline config and rollback pipeline config
```

## Prerequisites

- A CircleCI account
- A Kubernetes cluster (the tutorial uses GKE, but any cluster works)
- `kubectl` configured to reach the cluster
- Docker installed locally
- A Docker Hub account

## CircleCI context variables

Create a context named `rolling-tutorial` in your CircleCI organization and add these variables:

| Variable | Description |
|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_PASSWORD` | Your Docker Hub password or access token |
| `KUBECONFIG_DATA` | Base64-encoded kubeconfig for your cluster |

To generate `KUBECONFIG_DATA` for GKE:

```bash
gcloud container clusters get-credentials <cluster-name> --zone <zone> --project <project-id>
cat ~/.kube/config | base64
```

## Running the app locally

```bash
docker build -t rolling-tutorial-app:local ./app
docker run -p 3000:3000 rolling-tutorial-app:local
```

Verify it's running:

```bash
curl localhost:3000
# {"version":"1.0.0","hostname":"...","timestamp":"..."}

curl localhost:3000/health
# {"status":"ok"}
```

## Kubernetes manifests

`k8s/deployment.yml` is an envsubst template. The pipeline substitutes these variables at deploy time:

- `IMAGE_TAG` — set to `$CIRCLE_SHA1` by the pipeline
- `DOCKERHUB_USERNAME` — from the CircleCI context
- `CIRCLE_PROJECT_ID` — injected automatically by CircleCI

To apply manually (for testing):

```bash
export IMAGE_TAG=local
export DOCKERHUB_USERNAME=yourusername
export CIRCLE_PROJECT_ID=your-project-id
envsubst < k8s/deployment.yml | kubectl apply -f -
kubectl apply -f k8s/service.yml
```

## Rolling update configuration

The Deployment is configured with:

- `strategy.type: RollingUpdate`
- `maxSurge: 1` — one extra pod during the rollout
- `maxUnavailable: 0` — no pods go offline until a replacement is ready

This means Kubernetes brings up one new pod, waits for its readiness probe to pass, then terminates one old pod — one pod at a time, with no downtime.

## Rollback pipeline

`.circleci/rollback.yml` defines the rollback pipeline. Configure it in the CircleCI Deploys dashboard under **Project Settings → Deploys → Rollback Pipeline**. Once set, rollbacks can be triggered from the CircleCI web UI without running any kubectl commands manually.
