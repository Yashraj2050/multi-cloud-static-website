document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Simulator State (True = Online, False = Offline)
    const state = {
        aws: true,
        azure: true,
        gcp: true
    };

    // DOM Elements Cache
    const DOM = {
        btnFailAws: document.getElementById('btn-fail-aws'),
        btnFailAzure: document.getElementById('btn-fail-azure'),
        btnFailGcp: document.getElementById('btn-fail-gcp'),
        btnRestoreAll: document.getElementById('btn-restore-all'),
        
        statusAws: document.getElementById('status-aws'),
        statusAzure: document.getElementById('status-azure'),
        statusGcp: document.getElementById('status-gcp'),
        
        message: document.getElementById('simulator-message'),
        activeRoute: document.getElementById('active-route'),
        
        // Card indicators
        awsIndicator: document.querySelector('.card-header.border-aws .status-indicator'),
        azureIndicator: document.querySelector('.card-header.border-azure .status-indicator'),
        gcpIndicator: document.querySelector('.card-header.border-gcp .status-indicator'),
        
        // Table indicators
        tableAwsIndicator: document.getElementById('row-aws').querySelector('.status-indicator'),
        tableAzureIndicator: document.getElementById('row-azure').querySelector('.status-indicator'),
        tableGcpIndicator: document.getElementById('row-gcp').querySelector('.status-indicator')
    };

    // Update UI based on state
    function updateUI() {
        // 1. Update Status Panels in Simulator
        updateCloudStatus(DOM.statusAws, state.aws);
        updateCloudStatus(DOM.statusAzure, state.azure);
        updateCloudStatus(DOM.statusGcp, state.gcp);
        
        // 2. Update Infrastructure Cards Indicators
        updateIndicator(DOM.awsIndicator, state.aws);
        updateIndicator(DOM.azureIndicator, state.azure);
        updateIndicator(DOM.gcpIndicator, state.gcp);

        // 3. Update Matrix Table Indicators
        updateIndicator(DOM.tableAwsIndicator, state.aws);
        updateIndicator(DOM.tableAzureIndicator, state.azure);
        updateIndicator(DOM.tableGcpIndicator, state.gcp);

        // 4. Routing Logic Simulation (Determines active route)
        if (state.aws) {
            DOM.message.innerHTML = 'AWS S3 (Primary) is healthy. Traffic is routed to <strong style="color:var(--aws)">AWS</strong>.';
            DOM.message.style.borderLeftColor = 'var(--aws)';
            DOM.activeRoute.innerHTML = 'User &rarr; Cloudflare DNS &rarr; AWS S3';
            DOM.activeRoute.className = '';
            DOM.activeRoute.style.color = 'var(--success)';
        } else if (state.azure) {
            DOM.message.innerHTML = 'AWS is down. Failover triggered! Traffic routed to Secondary <strong style="color:var(--azure)">Azure Blob Storage</strong>.';
            DOM.message.style.borderLeftColor = 'var(--azure)';
            DOM.activeRoute.innerHTML = 'User &rarr; Cloudflare DNS &rarr; Azure Blob Storage';
            DOM.activeRoute.className = '';
            DOM.activeRoute.style.color = 'var(--success)';
        } else if (state.gcp) {
            DOM.message.innerHTML = 'AWS and Azure are down. Failover triggered! Traffic routed to Tertiary <strong style="color:var(--gcp)">Google Cloud Storage</strong>.';
            DOM.message.style.borderLeftColor = 'var(--gcp)';
            DOM.activeRoute.innerHTML = 'User &rarr; Cloudflare DNS &rarr; Google Cloud Storage';
            DOM.activeRoute.className = '';
            DOM.activeRoute.style.color = 'var(--success)';
        } else {
            DOM.message.innerHTML = 'CRITICAL: All cloud regions offline. Service unavailable.';
            DOM.message.style.borderLeftColor = 'var(--error)';
            DOM.activeRoute.innerHTML = 'User &rarr; Cloudflare DNS &rarr; ERROR (503 Service Unavailable)';
            DOM.activeRoute.className = 'error';
            DOM.activeRoute.style.color = '';
        }
    }

    // Helper: Update simulator panel status
    function updateCloudStatus(element, isOnline) {
        if (!element) return;
        const dot = element.querySelector('.status-dot');
        const text = element.querySelector('.status-text');
        
        if (isOnline) {
            element.classList.remove('offline');
            dot.className = 'status-dot online';
            text.textContent = 'ONLINE';
        } else {
            element.classList.add('offline');
            dot.className = 'status-dot offline';
            text.textContent = 'OFFLINE';
        }
    }
    
    // Helper: Update generic online/offline indicator (cards & table)
    function updateIndicator(element, isOnline) {
        if (!element) return;
        if (isOnline) {
            element.className = 'status-indicator online';
            element.textContent = 'Online';
        } else {
            element.className = 'status-indicator offline';
            element.textContent = 'Offline';
        }
    }

    // Bind Event Listeners
    DOM.btnFailAws.addEventListener('click', () => { 
        state.aws = false; 
        updateUI(); 
    });
    
    DOM.btnFailAzure.addEventListener('click', () => { 
        state.azure = false; 
        updateUI(); 
    });
    
    DOM.btnFailGcp.addEventListener('click', () => { 
        state.gcp = false; 
        updateUI(); 
    });
    
    DOM.btnRestoreAll.addEventListener('click', () => {
        state.aws = true;
        state.azure = true;
        state.gcp = true;
        updateUI();
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                // Offset calculation for sticky header
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Initial render
    updateUI();
});
