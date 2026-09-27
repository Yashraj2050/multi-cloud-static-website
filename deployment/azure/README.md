# Azure Blob Storage Static Website Deployment

## Deployment Status: ✅ DEPLOYED

## Deployment Details

| Property | Value |
|----------|-------|
| **Azure Service** | Azure Blob Storage Static Website |
| **Resource Group** | `multicloud-static-site-rg` |
| **Storage Account** | `multicloudstatic8036366b` |
| **Region** | `indiasouthcentral` (India South Central) |
| **Account Kind** | StorageV2 (General Purpose v2) |
| **SKU** | Standard_LRS |
| **Subscription** | Azure for Students |
| **Website Endpoint** | https://multicloudstatic8036366b.z58.web.core.windows.net |
| **Deployment Date** | 2026-09-27 |
| **Deployment Status** | DEPLOYED |

## Static Website Configuration

| Setting | Value |
|---------|-------|
| **Index Document** | `index.html` |
| **Error Document** | `index.html` |
| **Container** | `$web` |

## Files Deployed

| File | Size (bytes) | Content-Type |
|------|--------------|--------------|
| `index.html` | 13,927 | text/html |
| `styles.css` | 11,678 | text/css |
| `script.js` | 6,536 | application/javascript |
| `assets/logo.svg` | 498 | image/svg+xml |

## Verification Results

| Resource | HTTP Status | Content-Type | Size (bytes) | Status |
|----------|-------------|--------------|--------------|--------|
| `index.html` | 200 | text/html | 13,927 | ✅ Pass |
| `styles.css` | 200 | text/css | 11,678 | ✅ Pass |
| `script.js` | 200 | application/javascript | 6,536 | ✅ Pass |
| `assets/logo.svg` | 200 | image/svg+xml | 498 | ✅ Pass |

**Overall Verification: ✅ PASSED** — All resources are accessible and correctly served with proper MIME types. File sizes match the local source files exactly.

### SSL Note
The Azure static website endpoint uses HTTPS via `*.z58.web.core.windows.net`. SSL certificate SAN propagation for new storage accounts may take up to 24 hours. The website content is fully functional and verified via Azure CLI and HTTP requests.

## Region Selection Note
The Azure for Students subscription has an "Allowed resource deployment regions" policy restricting deployments to: `uaenorth`, `malaysiawest`, `eastasia`, `indiasouthcentral`, `koreacentral`. Central India (`centralindia`) was not in the allowed set. `indiasouthcentral` was selected as the closest allowed India region.

## Prerequisites
- Azure CLI installed and authenticated (`az login`).
- An active Azure for Students subscription (or equivalent).
- `Microsoft.Storage` resource provider registered.

## Deployment Steps

1. **Register Storage Provider**
   ```bash
   az provider register --namespace Microsoft.Storage --wait
   ```

2. **Create Resource Group**
   ```bash
   az group create --name multicloud-static-site-rg --location indiasouthcentral
   ```

3. **Create Storage Account**
   ```bash
   az storage account create \
       --name multicloudstatic8036366b \
       --resource-group multicloud-static-site-rg \
       --location indiasouthcentral \
       --sku Standard_LRS \
       --kind StorageV2
   ```

4. **Enable Static Website Hosting**
   ```bash
   az storage blob service-properties update \
       --account-name multicloudstatic8036366b \
       --static-website \
       --index-document index.html \
       --404-document index.html
   ```

5. **Upload Static Files**
   ```bash
   az storage blob upload --account-name multicloudstatic8036366b --container-name '$web' \
       --name index.html --file index.html --content-type "text/html" --overwrite

   az storage blob upload --account-name multicloudstatic8036366b --container-name '$web' \
       --name styles.css --file styles.css --content-type "text/css" --overwrite

   az storage blob upload --account-name multicloudstatic8036366b --container-name '$web' \
       --name script.js --file script.js --content-type "application/javascript" --overwrite

   az storage blob upload --account-name multicloudstatic8036366b --container-name '$web' \
       --name assets/logo.svg --file assets/logo.svg --content-type "image/svg+xml" --overwrite
   ```

6. **Retrieve Website Endpoint**
   ```bash
   az storage account show \
       --name multicloudstatic8036366b \
       --resource-group multicloud-static-site-rg \
       --query "primaryEndpoints.web" \
       --output tsv
   ```

## Notes
- DNS failover and Cloudflare integration are not yet configured.
- High availability and cross-cloud failover are not yet active.
- This is an independent, standalone deployment on Azure Blob Storage.
- The Cloud Failover Simulator in the frontend is a UI simulation, not real failover.
