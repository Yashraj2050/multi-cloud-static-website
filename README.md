# Multi-Cloud Static Website

An academic Cloud Computing mini project demonstrating a highly available, fault-tolerant static web hosting architecture distributed across AWS, Azure, and Google Cloud Platform.

## Project Objective
To demonstrate the principles of multi-cloud architecture, failover mechanisms, and cloud redundancy using static web hosting techniques.

## Tech Stack
- **HTML5:** Semantic markup structure.
- **CSS3:** Custom variables, Flexbox, CSS Grid.
- **Vanilla JavaScript:** DOM manipulation and state management for the simulation.
- **Zero Dependencies:** No external UI frameworks (No React, Vue, Tailwind, etc.) to keep the footprint extremely minimal and performant.

## Features
- **Professional Engineering Dashboard Aesthetic:** Clean, minimal, and technically focused UI suitable for an academic defense.
- **Responsive Architecture Diagram:** Pure CSS/HTML visual representation of the multi-cloud topology.
- **Failover Simulator:** Interactive component demonstrating DNS-level failover routing when primary, secondary, or tertiary cloud providers go offline.
- **Deployment Matrix:** Comprehensive breakdown of cloud providers and their respective roles in the network.
- **Semantic Structure:** Accessible HTML5 tags and clean typography.

## Local Development
To run this project locally, simply serve the directory via any local web server.

### Option 1: Using Python
```bash
# From the project root directory
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000`

### Option 2: Using Node.js/npx
```bash
# From the project root directory
npx serve .
```
Then navigate to `http://localhost:3000`

### Option 3: Direct File Opening
You can simply drag and drop `index.html` into your web browser, though running a local server is recommended to avoid CORS restrictions if external assets were to be added in the future.

## Documentation
See [Architecture Documentation](docs/architecture.md) for detailed information on the multi-cloud setup and failover logistics.

## Multi-Cloud Deployment
The same static website has been prepared to be independently deployed to:
- AWS S3
- Azure Blob Storage
- Google Cloud Storage

*Note: The website is currently designed and structured for independent deployment. The deployments are entirely decoupled from one another.*

## Deployment Status

| Provider | Service | Region | Endpoint | Deployment | Verification |
|----------|---------|--------|----------|------------|--------------|
| AWS | S3 | ap-south-1 | [Live Site](http://multicloud-static-site-1790490640-406d7816.s3-website.ap-south-1.amazonaws.com) | ✅ DEPLOYED (2026-09-27) | ✅ Verified (HTTP 200, all assets) |
| Azure | Blob Storage | indiasouthcentral | [Live Site](https://multicloudstatic8036366b.z58.web.core.windows.net) | ✅ DEPLOYED (2026-09-27) | ✅ Verified (HTTP 200, all assets) |
| GCP | Cloud Storage | — | — | ⏳ Pending | N/A |

| Feature | Status |
|---------|--------|
| DNS Routing | ✅ Cloudflare Worker ([Live Router](https://multicloud-failover-router.multicloud-yash.workers.dev)) |
| Failover | ✅ Active (AWS Primary → Azure Secondary) |
| CI/CD | ❌ Not Configured |

*Note: The frontend's "Cloud Failover Simulator" is a UI simulation. The actual infrastructure failover is handled by the Cloudflare Worker.*

