# CI/CD Pipeline

The Continuous Integration and Continuous Deployment (CI/CD) pipelines ensure that the static website is consistently deployed to both the primary (AWS) and secondary (Azure) cloud origins simultaneously.

## Deployment Flow
The pipelines are orchestrated using GitHub Actions. They are triggered automatically whenever new code is pushed to the `master` branch. 

Because the project utilizes a multi-cloud strategy, two independent workflows execute in parallel:
1. **AWS Workflow (`deploy.yml`)**
2. **Azure Workflow (`deploy-azure.yml`)**

Both workflows are strictly designed to upload only the necessary production website files (`index.html`, `styles.css`, `script.js`, and `assets/`), intentionally excluding repository metadata (like `.git/`, `.github/`, and `docs/`) from the public buckets.

## Workflows

### AWS Workflow
- **Trigger:** Push to `master`
- **Action:** Authenticates via the `aws-actions/configure-aws-credentials` action.
- **Command:** Uses `aws s3 sync` with strict inclusion and exclusion flags to update the bucket while removing deleted files (`--delete`).
- **Target:** S3 Bucket `multicloud-static-site-1790490640-406d7816` (ap-south-1)

### Azure Workflow
- **Trigger:** Push to `master`
- **Action:** Authenticates via the `azure/login` action using Service Principal JSON credentials.
- **Preparation:** A bash step copies the necessary files into a temporary `dist` directory to prevent uploading unwanted repository files.
- **Command:** Uses `az storage blob upload-batch` pointing to the `$web` container.
- **Target:** Azure Storage Account `multicloudstatic8036366b` (Static Website)

## Security and Least Privilege
Both deployment pipelines adhere to the principle of least privilege. No broad administrative permissions are granted to GitHub Actions.

### AWS Least Privilege
- A dedicated IAM User (`github-actions-deployer`) was created specifically for this pipeline.
- The IAM Policy attached to this user restricts permissions to exactly four actions: `s3:ListBucket`, `s3:GetObject`, `s3:PutObject`, and `s3:DeleteObject`.
- The resource scope is hardcoded to the exact S3 bucket ARN (`arn:aws:s3:::multicloud-static-site-1790490640-406d7816`).

### Azure Least Privilege
- A dedicated Azure Service Principal (`github-actions-azure-deployer`) was created.
- The principal is assigned the `Storage Blob Data Contributor` role, which allows managing blob data but strictly forbids modifying the storage account's configuration.
- The role assignment is scoped directly to the storage account resource, preventing access to the overarching Resource Group or Azure Subscription.

### GitHub Secrets
To maintain absolute repository security, no raw credentials are ever committed to the codebase. The workflows utilize the following GitHub Secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AZURE_CREDENTIALS`

## Validation Performed
The CI/CD pipelines have been fully tested end-to-end:
1. A commit containing a visual UI update ("Multi-Cloud CI/CD Verified" footer text) was pushed to `master`.
2. Both GitHub Actions ran and completed successfully in parallel.
3. Independent HTTP validation confirmed the updated assets were successfully deployed and served by both the AWS S3 endpoint and the Azure Blob endpoint independently.
