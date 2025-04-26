// Public/js/dashboard.js

document.addEventListener('DOMContentLoaded', function() {
    // Enable all tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Enable all popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl);
    });
  
    // Toggle mobile sidebar
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('show');
      });
    }
  
    // Search functionality for tables
    const tableSearchInputs = document.querySelectorAll('.table-search');
    tableSearchInputs.forEach(input => {
      input.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const tableId = this.getAttribute('data-table-id');
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          if (text.includes(searchTerm)) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    });
  
    // Handle agent details modal loading
    const agentDetailModal = document.getElementById('agentDetailModal');
    if (agentDetailModal) {
      agentDetailModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        const agentId = button.getAttribute('data-agent-id');
        
        // Load agent recent tickets if ticketsContainer exists
        const ticketsContainer = document.getElementById('agentRecentTickets');
        if (ticketsContainer && agentId) {
          // Show loading
          ticketsContainer.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
          
          // Fetch tickets data
          fetch(`/admin/api/agents/${agentId}/tickets`)
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.json();
            })
            .then(data => {
              if (data.length === 0) {
                ticketsContainer.innerHTML = '<p class="text-center">No tickets assigned to this agent.</p>';
                return;
              }
              
              // Build table HTML
              let tableHTML = `
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
              `;
              
              data.forEach(ticket => {
                let statusBadge = '';
                if (ticket.status === 'Pending') {
                  statusBadge = '<span class="badge rounded-pill bg-warning text-dark">Pending</span>';
                } else if (ticket.status === 'Active') {
                  statusBadge = '<span class="badge rounded-pill bg-success">Active</span>';
                } else if (ticket.status === 'Monitoring') {
                  statusBadge = '<span class="badge rounded-pill bg-info text-dark">Monitoring</span>';
                } else if (ticket.status === 'Closed') {
                  statusBadge = '<span class="badge rounded-pill bg-secondary">Closed</span>';
                }
                
                tableHTML += `
                  <tr>
                    <td>${ticket.title}</td>
                    <td>${statusBadge}</td>
                    <td>${new Date(ticket.createdAt).toLocaleDateString()}</td>
                  </tr>
                `;
              });
              
              tableHTML += `
                  </tbody>
                </table>
              `;
              
              ticketsContainer.innerHTML = tableHTML;
            })
            .catch(error => {
              ticketsContainer.innerHTML = '<p class="text-center text-danger">Error loading tickets.</p>';
              console.error('Error fetching tickets:', error);
            });
        }
      });
    }
  
    // Handle customer details modal loading
    const viewCustomerButtons = document.querySelectorAll('.view-customer');
    const customerDetailsContainer = document.getElementById('customerDetails');
    if (viewCustomerButtons.length > 0 && customerDetailsContainer) {
      viewCustomerButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          const customerId = this.getAttribute('data-id');
          
          // Show loading spinner
          customerDetailsContainer.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
          
          // Show modal
          const modal = new bootstrap.Modal(document.getElementById('viewCustomerModal'));
          modal.show();
          
          // Fetch customer details
          fetch(`/admin/api/customers/${customerId}`)
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.json();
            })
            .then(customer => {
              // Format the customer details
              let detailsHTML = `
                <div class="mb-4">
                  <h4>${customer.name}</h4>
                  <p class="text-muted">${customer.email}</p>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <p><strong>Joined:</strong> ${new Date(customer.createdAt).toLocaleDateString()}</p>
                    <p><strong>Tickets:</strong> ${customer.ticketCount}</p>
                  </div>
                </div>
              `;
              
              // If there are recent tickets
              if (customer.recentTickets && customer.recentTickets.length > 0) {
                detailsHTML += `
                  <h5 class="mt-4">Recent Tickets</h5>
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                `;
                
                customer.recentTickets.forEach(ticket => {
                  let statusBadge = '';
                  if (ticket.status === 'Pending') {
                    statusBadge = '<span class="badge rounded-pill bg-warning text-dark">Pending</span>';
                  } else if (ticket.status === 'Active') {
                    statusBadge = '<span class="badge rounded-pill bg-success">Active</span>';
                  } else if (ticket.status === 'Monitoring') {
                    statusBadge = '<span class="badge rounded-pill bg-info text-dark">Monitoring</span>';
                  } else if (ticket.status === 'Closed') {
                    statusBadge = '<span class="badge rounded-pill bg-secondary">Closed</span>';
                  }
                  
                  detailsHTML += `
                    <tr>
                      <td>${ticket.title}</td>
                      <td>${statusBadge}</td>
                      <td>${new Date(ticket.createdAt).toLocaleDateString()}</td>
                    </tr>
                  `;
                });
                
                detailsHTML += `
                      </tbody>
                    </table>
                  </div>
                `;
              } else {
                detailsHTML += `
                  <div class="alert alert-info mt-4">
                    This customer has no tickets yet.
                  </div>
                `;
              }
              
              customerDetailsContainer.innerHTML = detailsHTML;
            })
            .catch(error => {
              customerDetailsContainer.innerHTML = '<p class="text-center text-danger">Error loading customer details.</p>';
              console.error('Error fetching customer details:', error);
            });
        });
      });
    }
  
    // Handle deletion confirmation
    const deleteAgentModal = document.getElementById('deleteAgentModal');
    if (deleteAgentModal) {
      deleteAgentModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        const agentId = button.getAttribute('data-agent-id');
        const agentName = button.getAttribute('data-agent-name');
        
        document.getElementById('deleteAgentId').value = agentId;
        document.getElementById('deleteAgentName').textContent = agentName;
      });
    }
  
    // Handle ticket status update
    const updateStatusModal = document.getElementById('updateStatusModal');
    if (updateStatusModal) {
      updateStatusModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        const ticketId = button.getAttribute('data-ticket-id');
        const currentStatus = button.getAttribute('data-ticket-status');
        
        document.getElementById('statusTicketId').value = ticketId;
        const statusSelect = document.getElementById('statusSelect');
        if (statusSelect) {
          statusSelect.value = currentStatus;
        }
      });
    }
  
    // Handle ticket details modal
    const ticketDetailModal = document.getElementById('ticketDetailModal');
    if (ticketDetailModal) {
      ticketDetailModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        const ticketId = button.getAttribute('data-ticket-id');
        const ticketTitle = button.getAttribute('data-ticket-title');
        const ticketDescription = button.getAttribute('data-ticket-description');
        const ticketStatus = button.getAttribute('data-ticket-status');
        const ticketCustomer = button.getAttribute('data-ticket-customer');
        const ticketAgent = button.getAttribute('data-ticket-agent');
        
        document.getElementById('ticketId').textContent = ticketId;
        document.getElementById('ticketTitle').textContent = ticketTitle;
        document.getElementById('ticketDescription').textContent = ticketDescription;
        document.getElementById('ticketStatus').textContent = ticketStatus;
        document.getElementById('ticketCustomer').textContent = ticketCustomer;
        document.getElementById('ticketAgent').textContent = ticketAgent;
      });
    }
  });