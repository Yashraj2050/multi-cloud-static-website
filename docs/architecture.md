# Architecture Documentation

## Independent Multi-Cloud Static Website Architecture

This project demonstrates an independent static web hosting solution across three major cloud providers (AWS, Azure, and Google Cloud).

**Architecture Flow:**
User → Static Website → AWS S3
                         → Azure Blob Storage
                         → GCP Cloud Storage

*Note: These cloud deployments are completely independent. They are not connected to one another, there is no cross-cloud synchronization, and they do not share any backend resources.*

### Core Components

1. **Global Routing (Cloudflare DNS)**
   - Acts as the primary entry point for all incoming user requests.
   - Configured with active health checks against all storage endpoints.
   - Utilizes sequential failover routing policies.

2. **Primary Storage (AWS S3)**
   - **Service:** Amazon Simple Storage Service (S3)
   - **Region:** us-east-1 (N. Virginia)
   - **Role:** Primary Origin. Handles 100% of traffic under normal operating conditions.
   - **Configuration:** Static website hosting enabled, public read access configured via bucket policy.

3. **Secondary Storage (Azure Blob Storage)**
   - **Service:** Azure Storage Accounts (Blob)
   - **Region:** East US
   - **Role:** Warm standby. Takes over immediately if AWS health checks fail.
   - **Configuration:** Blob anonymous read access enabled on a `$web` container.

4. **Tertiary Storage (Google Cloud Storage)**
   - **Service:** Cloud Storage
   - **Region:** us-east4
   - **Role:** Cold standby / Tertiary failover.
   - **Configuration:** `StorageObjectViewer` IAM role assigned to `allUsers`.

### Deployment & CI/CD Strategy

Code is maintained in a central Git repository. A CI/CD pipeline (e.g., GitHub Actions) is responsible for syncing the built static assets to all three cloud storage locations simultaneously on every push to the `main` branch. This parallel deployment strategy ensures eventual consistency across all environments before traffic routing decisions are made.

### Failover Scenario (Simulated in UI)

1. **Healthy State:** All providers are online. Cloudflare resolves the domain to the AWS S3 endpoint.
2. **Primary Failure:** AWS S3 endpoint experiences an outage or elevated latency.
3. **Detection:** Cloudflare health checks detect the anomaly and mark the primary origin as degraded.
4. **First Failover:** Traffic is automatically rerouted to the Azure Blob endpoint without user intervention.
5. **Secondary Failure:** If Azure also fails, traffic falls back to the tertiary Google Cloud Storage endpoint.
6. **Recovery:** Once AWS recovers and passes health checks consistently, traffic is automatically routed back to the primary origin.
