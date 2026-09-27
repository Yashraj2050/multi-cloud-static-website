# Google Cloud Storage Static Website Deployment

## Prerequisites
- Google Cloud SDK (`gcloud`) installed and authenticated (`gcloud auth login`).
- A GCP project with billing enabled.

## Deployment Steps

1. **Set Environment Variables**
   ```bash
   export PROJECT_ID="your-gcp-project-id"
   export BUCKET_NAME="my-multi-cloud-static-site-gcp-$(date +%s)"
   export LOCATION="us-east4"
   
   # Set active project
   gcloud config set project $PROJECT_ID
   ```

2. **Create the Cloud Storage Bucket**
   ```bash
   gcloud storage buckets create gs://$BUCKET_NAME \
       --location=$LOCATION \
       --uniform-bucket-level-access
   ```

3. **Make the Bucket Publicly Readable**
   Grant the `roles/storage.objectViewer` role to `allUsers`.
   ```bash
   gcloud storage buckets add-iam-policy-binding gs://$BUCKET_NAME \
       --member=allUsers \
       --role=roles/storage.objectViewer
   ```

4. **Enable Static Website Hosting Configuration**
   ```bash
   gcloud storage buckets update gs://$BUCKET_NAME \
       --web-main-page-suffix=index.html
   ```

5. **Upload Static Files**
   Navigate to the repository root and sync the files:
   ```bash
   gcloud storage rsync . gs://$BUCKET_NAME/ \
       --recursive \
       --exclude-path="^(.git|deployment)/.*" \
       --exclude-path="^(\.gitignore|README\.md)$"
   ```

## Verification
Retrieve your website endpoint URL:
```bash
echo "https://storage.googleapis.com/$BUCKET_NAME/index.html"
```
Visit the URL to verify that the site, CSS, JS, and SVG load properly.
