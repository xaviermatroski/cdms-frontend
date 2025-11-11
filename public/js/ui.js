// UI Interactions for CDMS Frontend

document.addEventListener('DOMContentLoaded', function() {
  initSidebarToggle();
  initUserDropdown();
  initAlerts();
  highlightActiveSidebarLink();
});

function initSidebarToggle() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      sidebar.classList.toggle('hidden');
      sidebar.classList.toggle('open');
    });

    // Close sidebar on link click
    const sidebarLinks = sidebar.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth < 768) {
          sidebar.classList.add('hidden');
          sidebar.classList.remove('open');
        }
      });
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
      if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        if (window.innerWidth < 768) {
          sidebar.classList.add('hidden');
          sidebar.classList.remove('open');
        }
      }
    });
  }
}

function initUserDropdown() {
  const userMenu = document.getElementById('userMenu');
  const userDropdown = document.getElementById('userDropdown');

  if (userMenu && userDropdown) {
    userMenu.addEventListener('click', function(e) {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!userMenu.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.add('hidden');
      }
    });
  }
}

function initAlerts() {
  const alertCloseButtons = document.querySelectorAll('.alert-close');
  alertCloseButtons.forEach(button => {
    button.addEventListener('click', function() {
      const alert = this.closest('.alert');
      alert.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => alert.remove(), 300);
    });
  });

  // Auto-hide alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      alert.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  });
}

function highlightActiveSidebarLink() {
  const currentPage = window.location.pathname;
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  
  sidebarLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || href === currentPage + '/') {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Helper: Show alert
function showAlert(message, type = 'info') {
  const alertsContainer = document.getElementById('alertsContainer');
  if (!alertsContainer) return;

  const alertClass = `alert-${type}`;
  const alertHtml = `
    <div class="alert ${alertClass}">
      <div class="alert-icon">
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
      </div>
      <div>
        <p>${message}</p>
      </div>
      <button class="alert-close">
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
  `;

  alertsContainer.insertAdjacentHTML('beforeend', alertHtml);
  
  // Re-initialize alerts
  setTimeout(() => initAlerts(), 0);
}

// Add slideUp animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
`;
document.head.appendChild(style);
