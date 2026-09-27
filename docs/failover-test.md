# Failover Routing Verification

The high-availability multi-cloud architecture relies on a Cloudflare Worker acting as an active failover router. To verify its robustness, an end-to-end failover scenario was successfully simulated and observed.

## Test Methodology
The test was conducted by manipulating the Worker's routing layer to simulate a catastrophic primary origin failure. 
Instead of physically tearing down the primary AWS S3 bucket—which would disrupt the baseline state—we temporarily altered the `AWS_ORIGIN` environment variable within the Cloudflare Worker to point to an explicitly unresolvable, non-existent domain (`http://this-domain-does-not-exist-at-all-12345.com`). 

This perfectly simulates an origin network failure (DNS resolution failure or total network unreachable event) directly at the routing layer, causing the `fetch()` call in the Worker to throw a network exception.

## Test Results

The following table summarizes the expected versus observed behavior across the three phases of the test:

| Scenario | Expected | Observed |
|----------|----------|----------|
| **Normal** | AWS | AWS |
| **AWS origin failure** | Azure | Azure |
| **AWS restored** | AWS | AWS |

### Phase 1: Normal State
In the baseline configuration, the Worker attempts the primary origin first.

- **HTTP Status:** 200 OK
- **X-Served-By Header:** `aws-s3`
- **Behavior:** The Cloudflare router fetched the content from AWS and served it normally. The `X-Failover` header was not present.

### Phase 2: Failover State
The AWS origin environment variable was intentionally broken to simulate a network outage. The Cloudflare Worker was then redeployed.

- **HTTP Status:** 200 OK
- **X-Served-By Header:** `azure-blob`
- **X-Failover Header:** `true`
- **Behavior:** When the Cloudflare Worker attempted to reach the primary AWS origin, it encountered a network exception. The `try/catch` block immediately caught the failure and successfully fell back to the secondary Azure Blob Static Website origin, resulting in a seamless HTTP 200 response to the client with the `X-Failover: true` telemetry header attached.

### Phase 3: Restored State
The correct AWS origin URL was restored in the Cloudflare Worker configuration, and the router was redeployed.

- **HTTP Status:** 200 OK
- **X-Served-By Header:** `aws-s3`
- **Behavior:** The system instantly recovered. Requests were once again fulfilled by the primary AWS origin, and the `X-Failover` header was removed from the response.

## Origin Health Verification
Throughout the simulated failover, both the AWS and Azure cloud origins were directly polled to ensure they remained healthy independent of the router. 
- **AWS Direct Endpoint:** HTTP 200 OK
- **Azure Direct Endpoint:** HTTP 200 OK

This verifies that the failover test correctly validated the Cloudflare routing layer logic rather than a physical infrastructure defect, leaving the environment entirely untouched and operational.
