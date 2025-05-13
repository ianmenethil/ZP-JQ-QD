// Data generation functions
function generateTimestamp() {
	return new Date().toISOString().slice(0, 19);
}

function generatePaymentAmount(min = 100, max = 99999) {
	return Number((Math.random() * (max - min) + min).toFixed(2));
}

function generateReference() {
	return `REF-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
}

function generateCustomerName() {
	const names = [
		'Arthas Menethil',
		'Sylvanas Windrunner',
		'Illidan Stormrage',
		'Jaina Proudmoore',
		'Tyrande Whisperwind',
		'Malfurion Stormrage',
		'Varian Wrynn',
		'Anduin Wrynn',
		'Grom Hellscream',
		'Jim Raynor',
	];
	return names[Math.floor(Math.random() * names.length)];
}

function generateCustomerEmail() {
	const firstName = generateCustomerName().split(' ')[0].toLowerCase();
	return `${firstName}@zenpay.com.au`;
}

function generateRedirectUrl() {
	return 'https://zenithpayments.support/redirect';
}

function generateCallbackUrl() {
	return 'https://zenithpayments.support/callback?' + generateReference();
}

function generateCompanyName() {
	const companies = [
		'Stormwind Enterprises',
		'Orgrimmar Industries',
		'Lordaeron Corp',
		'Terran Dynamics',
		'Protoss Technologies',
		'Sanctuary Solutions',
		'Horadrim Innovations',
		'Dominion Systems',
		'Silvermoon Services',
	];
	return companies[Math.floor(Math.random() * companies.length)];
}

function generateABN() {
	return Math.floor(Math.random() * 90000000000) + 10000000000;
}

function generateContactNumber() {
	return `0400${Math.floor(Math.random() * 1000)
		.toString()
		.padStart(3, '0')}000`;
}

// Show notification
function showNotification(message) {
	const notification = document.getElementById('notification');
	const notificationText = document.getElementById('notificationText');

	notificationText.textContent = message;
	notification.classList.add('show');

	setTimeout(() => {
		notification.classList.remove('show');
	}, 3000);
}

// Show context menu
function showContextMenu(menuId, x, y) {
	// Hide all other context menus first
	document.querySelectorAll('.context-menu').forEach((menu) => {
		menu.style.display = 'none';
	});

	const menu = document.getElementById(menuId);
	menu.style.display = 'block';
	menu.style.left = `${x}px`;
	menu.style.top = `${y}px`;

	// Close menu when clicking outside
	document.addEventListener('click', function closeMenu(e) {
		if (
			!menu.contains(e.target) &&
			e.target.id !== 'paymentMethodsOptionsBtn' &&
			e.target.id !== 'additionalOptionsBtn'
		) {
			menu.style.display = 'none';
			document.removeEventListener('click', closeMenu);
		}
	});
}

document.addEventListener('DOMContentLoaded', function () {
	// Initialize tooltips
	const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
	const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
		return new bootstrap.Tooltip(tooltipTriggerEl);
	});

	// Theme toggle functionality
	const themeToggle = document.getElementById('themeToggle');
	themeToggle.addEventListener('click', function () {
		document.body.classList.toggle('dark-mode');

		// Update icon
		const icon = themeToggle.querySelector('i');
		if (document.body.classList.contains('dark-mode')) {
			icon.classList.remove('bi-sun');
			icon.classList.add('bi-moon');
		} else {
			icon.classList.remove('bi-moon');
			icon.classList.add('bi-sun');
		}

		showNotification('Theme updated');
	});

	// URL dropdown functionality
	document.querySelectorAll('.dropdown-item').forEach((item) => {
		item.addEventListener('click', function (e) {
			e.preventDefault();

			const dropdownMenu = this.closest('.dropdown-menu');
			const targetId = dropdownMenu.getAttribute('aria-labelledby');
			const targetElement = document.getElementById(targetId);

			// Update active state
			dropdownMenu.querySelectorAll('.dropdown-item').forEach((i) => {
				i.classList.remove('active');
			});
			this.classList.add('active');

			// Update text
			if (targetElement) {
				if (targetId === 'userModeDropdown' || targetId === 'feeTypeDropdown') {
					const span = targetElement.querySelector('span');
					span.textContent = this.textContent.trim();
					span.className = `text-${this.dataset.color}`;
				} else if (targetId === 'modeText') {
					targetElement.textContent = this.textContent.trim();
					targetElement.className = `mode-value text-${this.dataset.color}`;
				} else {
					targetElement.textContent = this.textContent.trim();
				}
			}

			showNotification('Selection updated');
		});
	});

	// Payment method selection
	document.querySelectorAll('.payment-method-card').forEach((card) => {
		card.addEventListener('click', function () {
			this.classList.toggle('active');
			showNotification(
				`${this.classList.contains('active') ? 'Enabled' : 'Disabled'} ${this.querySelector('.payment-method-name').textContent}`
			);
		});
	});

	// Toggle extended options
	const toggleOptionsBtn = document.getElementById('toggleExtendedOptions');
	const extendedOptions = document.getElementById('extendedOptions');

	toggleOptionsBtn.addEventListener('click', function (e) {
		e.preventDefault();
		const isVisible = extendedOptions.style.display !== 'none';

		if (isVisible) {
			extendedOptions.style.display = 'none';
			this.innerHTML = '<i class="bi bi-chevron-down me-1"></i> Show Extended Options';
		} else {
			extendedOptions.style.display = 'block';
			this.innerHTML = '<i class="bi bi-chevron-up me-1"></i> Hide Extended Options';
		}
	});

	// Payment options context menu
	document.getElementById('paymentMethodsOptionsBtn').addEventListener('click', function (e) {
		e.preventDefault();
		e.stopPropagation();
		const rect = this.getBoundingClientRect();
		showContextMenu('paymentMethodsMenu', rect.right, rect.bottom);
	});

	// Additional options context menu
	document.getElementById('additionalOptionsBtn').addEventListener('click', function (e) {
		e.preventDefault();
		e.stopPropagation();
		const rect = this.getBoundingClientRect();
		showContextMenu('additionalOptionsMenu', rect.right, rect.bottom);
	});

	// Context menu actions
	document.getElementById('enableAllPaymentMethods').addEventListener('click', function () {
		document.querySelectorAll('[data-method]').forEach((button) => {
			button.classList.add('active');
		});
		showNotification('All payment methods enabled');
	});

	document.getElementById('disableAllPaymentMethods').addEventListener('click', function () {
		document.querySelectorAll('[data-method]').forEach((button) => {
			button.classList.remove('active');
		});
		showNotification('All payment methods disabled');
	});

	document.getElementById('enableAllOptions').addEventListener('click', function () {
		document.querySelectorAll('[data-option]').forEach((button) => {
			button.classList.add('active');
		});
		showNotification('All additional options enabled');
	});

	document.getElementById('disableAllOptions').addEventListener('click', function () {
		document.querySelectorAll('[data-option]').forEach((button) => {
			button.classList.remove('active');
		});
		showNotification('All additional options disabled');
	});

	document.getElementById('helpPaymentMethods').addEventListener('click', function () {
		showNotification('Payment methods help documentation');
	});

	document.getElementById('helpAdditionalOptions').addEventListener('click', function () {
		showNotification('Additional options help documentation');
	});

	// Action buttons
	document.getElementById('pay500Btn').addEventListener('click', function () {
		showNotification('Processing $500 payment...');
	});

	document.getElementById('tokenize500Btn').addEventListener('click', function () {
		showNotification('Tokenizing $500 payment...');
	});

	document.getElementById('preauth500Btn').addEventListener('click', function () {
		showNotification('Preauthorizing $500 payment...');
	});

	document.getElementById('payNowBtn').addEventListener('click', function () {
		showNotification('Processing $1000 payment...');
	});

	document.getElementById('tokenizeNowBtn').addEventListener('click', function () {
		showNotification('Tokenizing card/bank details...');
	});

	// Process Payment button
	document.getElementById('processPaymentBtn').addEventListener('click', function (e) {
		e.preventDefault();
		showNotification('Processing payment...');

		// Trigger the hidden initialize plugin button if it exists and has event listeners
		const initButton = document.getElementById('initializePlugin');
		if (initButton) {
			initButton.click();
		}
	});

	// Handle conditional visibility based on mode
	function updateVisibilityBasedOnMode(mode) {
		const cardProxyContainer = document.getElementById('cardProxyContainer');
		const showFeeContainer = document.getElementById('showFeeContainer');
		const showFailedFeeContainer = document.getElementById('showFailedFeeContainer');

		// Card Proxy should only be visible when mode is NOT 0 or 2
		if (mode === '0' || mode === '2') {
			cardProxyContainer.style.display = 'none';
		} else {
			cardProxyContainer.style.display = 'block';
		}

		// Show Payment Fee and Show Failed Fee should only be visible if mode = 1
		if (mode === '1') {
			showFeeContainer.style.display = 'block';
			showFailedFeeContainer.style.display = 'block';
		} else {
			showFeeContainer.style.display = 'none';
			showFailedFeeContainer.style.display = 'none';
		}
	}

	// Set initial visibility
	updateVisibilityBasedOnMode('0');

	// Update visibility when mode changes
	document.querySelectorAll('[data-value]').forEach((item) => {
		item.addEventListener('click', function () {
			if (this.closest('.dropdown-menu').getAttribute('aria-labelledby') === 'modeText') {
				updateVisibilityBasedOnMode(this.dataset.value);
			}
		});
	});
});
