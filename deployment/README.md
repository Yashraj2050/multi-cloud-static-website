# Multi-Cloud Independent Deployment Guide

## 1. Architecture Overview
This project strictly demonstrates **independent** static web application deployment across three major cloud providers (AWS, Azure, and Google Cloud). 

**Important Constraints:**
- The deployments are 100% independent.
- There is NO cross-cloud synchronization, replication, or Terraform configuration.
- There is NO shared backend, database, API gateway, or automatic DNS failover currently active.
- Each cloud provider serves an exact, independent copy of the static files (`index.html`, `styles.css`, `script.js`, `assets/`).

## 2. AWS Deployment
**Provider:** Amazon Web Services  
**Service:** S3 (Simple Storage Service)  
- [View AWS Deployment Instructions](./aws/README.md)

## 3. Azure Deployment
**Provider:** Microsoft Azure  
**Service:** Azure Blob Storage (Static Website feature)  
- [View Azure Deployment Instructions](./azure/README.md)

## 4. GCP Deployment
**Provider:** Google Cloud Platform  
**Service:** Cloud Storage  
- [View GCP Deployment Instructions](./gcp/README.md)

## 5. Verification Procedure
For every independent deployment, you must navigate to the provided endpoint URL in a web browser and verify:
- The `index.html` structure loads.
- The CSS styles are correctly applied.
- The JavaScript simulator logic executes.
- The `assets/logo.svg` image successfully resolves.
- The browser developer console is free of 404 or 403 errors.

## 6. Security Considerations
- **No Hardcoded Credentials:** Never hardcode or commit API keys, service account JSON files, or access tokens into this repository. Use environment variables and local CLI profiles.
- **Public Read Access:** Static websites require buckets to be publicly readable. Ensure that only the designated buckets/containers have public read access, and never store sensitive or backend data in these specific buckets.

## 7. Cleanup & Decommission Commands
To avoid ongoing charges for storage, use the following commands to tear down the infrastructure:

**AWS:**
```bash
aws s3 rm s3://$BUCKET_NAME --recursive
aws s3 rb s3://$BUCKET_NAME
```

**Azure:**
```bash
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

**GCP:**
```bash
gcloud storage rm --recursive gs://$BUCKET_NAME/
```

## 8. Cost Considerations
Since this architecture utilizes pure object storage without compute instances (EC2, VMs), the running cost is exceptionally low—typically fractions of a cent per month, driven strictly by storage size (KB) and outbound bandwidth (egress).

## 9. Comparison of the Three Approaches
| Feature | AWS S3 | Azure Blob | GCP Cloud Storage |
|---------|--------|------------|-------------------|
| **Service Tier** | Standard | Standard LRS | Standard |
| **Index Document** | Supported | Supported | Supported |
| **Container Structure** | Root Bucket | `$web` container | Root Bucket |
| **Public Access Config** | Bucket Policy + Block Public Access OFF | Anonymous access on `$web` | `allUsers` IAM Binding |
| **Custom Domains** | Requires CloudFront/Route53 for SSL | Supported natively or via CDN | Supported via Load Balancer |
