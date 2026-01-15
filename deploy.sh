#!/bin/bash
set -euo pipefail

# --- CONFIG ---
PROJECT_ID="ninth-potion-455712-g9"
REGION="us-east1"
SERVICE_NAME="dockbloxx-dev-staging"

# These are PUBLIC build-time values (safe to store in repo)
NEXT_PUBLIC_APP_URL="https://dockbloxx-dev-staging-952978338090.us-east1.run.app"
NEXT_PUBLIC_BACKEND_URL="https://dockbloxx.mystagingwebsite.com"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51QsxN9GbwNBR3bzvSzpYHfIUKnO0EQy0TXY9iH54VAN6kzsijUO4ldqbo8vb9lTCze5DWRBwWauMLkLienN2wMvn00FmEKheXy"

echo "🚀 Submitting Cloud Build (build + push + deploy)"
echo "   Project: $PROJECT_ID"
echo "   Region:  $REGION"
echo "   Service: $SERVICE_NAME"
echo "--------------------------------------------------"

gcloud builds submit \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --config cloudbuild.yaml \
  --substitutions _REGION="$REGION",_SERVICE_NAME="$SERVICE_NAME",_NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL",_NEXT_PUBLIC_BACKEND_URL="$NEXT_PUBLIC_BACKEND_URL",_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"

echo "--------------------------------------------------"
echo "✅ Build submitted. Check Cloud Build logs if needed."
echo "✅ Build deployed to the cloud."
