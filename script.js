// Global Variables
let currentUser = null;
let isAdmin = false;
let transactions = [];
let allUsers = [];
let kycSubmissions = [];

// REAL USER DATABASE
const users = [
    { 
        email: 'user@gmail.com', 
        password: 'user123', 
        name: 'Test User', 
        phone: '+92 300 1234567', 
        kycVerified: true,
        joinDate: '2024-01-15',
        status: 'active'
    },
    { 
        email: 'test@example.com', 
        password: 'test123', 
        name: 'Test Account', 
        phone: '+92 311 7654321', 
        kycVerified: false,
        joinDate: '2024-01-20',
        status: 'active'
    }
];

// REAL ADMIN CREDENTIALS
const adminCredentials = {
    username: 'admin',
    password: 'admin123'
};

let adminSettings = {
    paypal: {
        email1: 'payments@gpaytransfer.com',
        email2: 'business@gpaytransfer.com',
        email3: 'support@gpaytransfer.com',
        commission: 2.5
    },
    pakistanBank: {
        bankName: 'HBL Pakistan',
        accountNumber: '1234-5678901-2',
        accountHolder: 'GPAY TRANSFER',
        iban: 'PK00HBL123456789012'
    },
    thailandBank: {
        bankName: 'Bangkok Bank',
        accountNumber: '123-4-56789-0',
        accountHolder: 'GPAY TRANSFER',
        swift: 'BKKBTHBK'
    },
    rates: {
        transferCommission: 1.5,
        pkrToThb: 0.30,
        thbToPkr: 3.33
    },
    system: {
        minTransferAmount: 1000,
        maxTransferAmount: 500000,
        autoApproveKYC: false
    }
};

// User balances
let balances = {
    USD: { total: 1000.00, available: 800.00, hold: 200.00 },
    EUR: { total: 500.00, available: 500.00, hold: 0.00 },
    PKR: { total: 50000.00, available: 45000.00, hold: 5000.00 },
    THB: { total: 15000.00, available: 12000.00, hold: 3000.00 }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing app...');
    initializeApp();
    setupEventListeners();
    loadAdminSettings();
    loadSampleData();
});

function initializeApp() {
    console.log('Showing login section');
    showSection('login');
    updateBankDetailsDisplay();
    toggleNavigation();
}

function loadSampleData() {
    console.log('Loading sample data...');
    
    // Load transactions from localStorage
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
        console.log('Loaded transactions:', transactions);
    } else {
        // Sample transactions
        transactions = [
            {
                id: 1,
                type: 'invoice',
                amount: 100,
                currency: 'USD',
                recipient: 'customer1@example.com',
                description: 'Product shipment - Order #001',
                status: 'completed',
                date: '2024-01-15T10:30:00Z',
                fee: 2.5,
                user: 'Test User'
            },
            {
                id: 2,
                type: 'transfer',
                fromCurrency: 'PKR',
                toCurrency: 'THB',
                sendAmount: 5000,
                receiveAmount: 1500,
                receiverBank: 'Bangkok Bank',
                receiverAccount: '987-6-54321-0',
                receiverName: 'John Smith',
                status: 'pending',
                date: '2024-01-16T14:20:00Z',
                fee: 75,
                user: 'Test User',
                exchangeRate: '1 PKR = 0.30 THB'
            }
        ];
        localStorage.setItem('transactions', JSON.stringify(transactions));
        console.log('Created sample transactions');
    }

    // Load KYC submissions
    const storedKYC = localStorage.getItem('kycSubmissions');
    if (storedKYC) {
        kycSubmissions = JSON.parse(storedKYC);
    } else {
        kycSubmissions = [];
    }

    // Load all users
    allUsers = [...users];
    console.log('All users:', allUsers);
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Login forms
    const loginForm = document.getElementById('loginForm');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login form listener added');
    }
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
        console.log('Admin login form listener added');
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('Register form listener added');
    }
    
    // Invoice form
    const invoiceForm = document.getElementById('invoiceForm');
    const invoiceAmount = document.getElementById('invoiceAmount');
    
    if (invoiceForm) {
        invoiceForm.addEventListener('submit', handleInvoiceSubmit);
    }
    
    if (invoiceAmount) {
        invoiceAmount.addEventListener('input', calculateInvoiceFees);
    }
    
    // Transfer form
    const transferForm = document.getElementById('transferForm');
    const sendAmount = document.getElementById('sendAmount');
    const fromCountry = document.getElementById('fromCountry');
    const toCountry = document.getElementById('toCountry');
    
    if (transferForm) {
        transferForm.addEventListener('submit', handleTransferSubmit);
    }
    
    if (sendAmount) {
        sendAmount.addEventListener('input', calculateExchange);
    }
    
    if (fromCountry) {
        fromCountry.addEventListener('change', updateSendCurrency);
    }
    
    if (toCountry) {
        toCountry.addEventListener('change', calculateExchange);
    }
    
    // Receiver form
    const receiverForm = document.getElementById('receiverForm');
    if (receiverForm) {
        receiverForm.addEventListener('submit', handleReceiverSubmit);
    }
    
    // KYC form
    const kycForm = document.getElementById('kycForm');
    if (kycForm) {
        kycForm.addEventListener('submit', handleKYCSubmit);
    }
    
    // File upload
    const paymentProof = document.getElementById('paymentProof');
    const profilePhoto = document.getElementById('profilePhoto');
    const idDocument = document.getElementById('idDocument');
    
    if (paymentProof) {
        paymentProof.addEventListener('change', handleFileUpload);
    }
    
    if (profilePhoto) {
        profilePhoto.addEventListener('change', validateFileUpload);
    }
    
    if (idDocument) {
        idDocument.addEventListener('change', validateFileUpload);
    }
}

// Mobile Menu Function
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('mobile-open');
}

// Navigation Functions
function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log('Section activated:', sectionId);
    } else {
        console.error('Section not found:', sectionId);
    }
    
    // Close mobile menu
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.remove('mobile-open');
    }
    
    // Update navigation display
    toggleNavigation();
    
    // Update content based on section
    switch(sectionId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'send-invoice':
            calculateInvoiceFees();
            break;
        case 'send-money':
            calculateExchange();
            break;
        case 'transactions':
            renderTransactions();
            break;
        case 'admin-panel':
            loadAdminSettingsToForm();
            loadAdminData();
            break;
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function toggleNavigation() {
    const navbar = document.querySelector('.navbar');
    const currentSection = document.querySelector('.section.active');
    
    if (currentSection && (currentSection.id === 'login' || currentSection.id === 'admin-login' || currentSection.id === 'register')) {
        navbar.style.display = 'none';
    } else {
        navbar.style.display = 'flex';
    }
}

// REAL AUTHENTICATION FUNCTIONS
function handleLogin(e) {
    e.preventDefault();
    console.log('Login attempt...');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    console.log('Email:', email, 'Password:', password);
    
    // REAL VALIDATION
    if (!email || !password) {
        showNotification('Please enter both email and password!', 'error');
        return;
    }

    // Check if user exists
    const user = users.find(u => u.email === email && u.password === password);
    console.log('Found user:', user);
    
    if (user) {
        currentUser = {
            email: user.email,
            name: user.name,
            phone: user.phone,
            id: Date.now(),
            kycVerified: user.kycVerified,
            joinDate: user.joinDate,
            status: user.status
        };
        
        console.log('Login successful, currentUser:', currentUser);
        showNotification('Login successful! Welcome back ' + user.name, 'success');
        showSection('dashboard');
        updateDashboard();
    } else {
        console.log('Login failed - invalid credentials');
        showNotification('Invalid email or password! Only registered users can login.', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    console.log('Registration attempt...');
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('regPassword').value;
    
    console.log('Registration data:', { fullName, email, phone, password });
    
    // REAL VALIDATION
    if (!fullName || !email || !phone || !password) {
        showNotification('Please fill all fields!', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters!', 'error');
        return;
    }

    // Check if user already exists
    if (users.find(u => u.email === email)) {
        showNotification('User already exists with this email!', 'error');
        return;
    }

    // Add new user
    const newUser = {
        email: email,
        password: password,
        name: fullName,
        phone: phone,
        kycVerified: false,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active'
    };
    users.push(newUser);
    allUsers.push(newUser);
    
    currentUser = {
        name: fullName,
        email: email,
        phone: phone,
        id: Date.now(),
        kycVerified: false,
        joinDate: newUser.joinDate,
        status: 'active'
    };
    
    console.log('Registration successful, currentUser:', currentUser);
    showNotification('Registration successful! Please complete KYC verification.', 'success');
    showSection('kyc');
}

function handleAdminLogin(e) {
    e.preventDefault();
    console.log('Admin login attempt...');
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    console.log('Admin credentials:', { username, password });
    
    // REAL ADMIN VALIDATION
    if (!username || !password) {
        showNotification('Please enter both username and password!', 'error');
        return;
    }

    if (username === adminCredentials.username && password === adminCredentials.password) {
        currentUser = { name: 'Administrator', role: 'admin' };
        isAdmin = true;
        console.log('Admin login successful');
        showNotification('Admin login successful! Welcome to Admin Panel.', 'success');
        showSection('admin-panel');
        loadAdminSettingsToForm();
        loadAdminData();
    } else {
        console.log('Admin login failed');
        showNotification('Invalid admin credentials! Access denied.', 'error');
    }
}

// File Validation
function validateFileUpload(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    
    if (!file) return;
    
    const validation = validateFile(file, 5, ['image/jpeg', 'image/png', 'application/pdf']);
    
    if (!validation.valid) {
        showNotification(validation.message, 'error');
        fileInput.value = '';
        fileInput.classList.add('upload-error');
    } else {
        fileInput.classList.remove('upload-error');
        showNotification('File uploaded successfully!', 'success');
    }
}

function validateFile(file, maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) {
    if (!file) {
        return { valid: false, message: 'Please select a file' };
    }
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, message: 'Only JPEG, PNG and PDF files are allowed' };
    }
    
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
        return { valid: false, message: `File size must be less than ${maxSizeMB}MB` };
    }
    
    return { valid: true, message: 'File is valid' };
}

function handleKYCSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Please login first!', 'error');
        showSection('login');
        return;
    }
    
    const profilePhoto = document.getElementById('profilePhoto').files[0];
    const idDocument = document.getElementById('idDocument').files[0];
    const address = document.getElementById('address').value;
    
    // Validate files
    const profileValidation = validateFile(profilePhoto);
    const idDocumentValidation = validateFile(idDocument);
    
    if (!profileValidation.valid) {
        showNotification(profileValidation.message, 'error');
        return;
    }
    
    if (!idDocumentValidation.valid) {
        showNotification(idDocumentValidation.message, 'error');
        return;
    }
    
    if (!address.trim()) {
        showNotification('Please enter your complete address', 'error');
        return;
    }
    
    // Create KYC submission
    const kycSubmission = {
        id: Date.now(),
        userId: currentUser.email,
        userName: currentUser.name,
        profilePhoto: profilePhoto.name,
        idDocument: idDocument.name,
        address: address,
        status: adminSettings.system.autoApproveKYC ? 'approved' : 'pending',
        submitDate: new Date().toISOString(),
        reviewDate: adminSettings.system.autoApproveKYC ? new Date().toISOString() : null
    };
    
    kycSubmissions.push(kycSubmission);
    localStorage.setItem('kycSubmissions', JSON.stringify(kycSubmissions));
    
    if (adminSettings.system.autoApproveKYC) {
        // Auto approve
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex].kycVerified = true;
        }
        currentUser.kycVerified = true;
        showNotification('KYC approved automatically! You can now start transactions.', 'success');
    } else {
        showNotification('KYC submitted successfully! Under review by admin.', 'success');
    }
    
    showSection('dashboard');
    updateDashboard();
}

function logout() {
    console.log('Logging out...');
    currentUser = null;
    isAdmin = false;
    showNotification('Logged out successfully!', 'info');
    showSection('login');
    
    // Reset forms
    document.getElementById('loginForm').reset();
    document.getElementById('adminLoginForm').reset();
}

// Dashboard Functions
function updateDashboard() {
    if (!currentUser) {
        console.log('No current user for dashboard');
        return;
    }
    
    console.log('Updating dashboard for:', currentUser.name);
    
    // Update balances
    updateAllBalances();
    
    // Update KYC status
    updateKYCStatus();
    
    // Update recent transactions
    updateRecentTransactions();
}

function updateAllBalances() {
    // Update USD
    const usdBalance = document.getElementById('usdBalance');
    const usdAvailable = document.getElementById('usdAvailable');
    const usdHold = document.getElementById('usdHold');
    
    if (usdBalance) usdBalance.textContent = balances.USD.total.toFixed(2);
    if (usdAvailable) usdAvailable.textContent = balances.USD.available.toFixed(2);
    if (usdHold) usdHold.textContent = balances.USD.hold.toFixed(2);
    
    // Update EUR
    const eurBalance = document.getElementById('eurBalance');
    const eurAvailable = document.getElementById('eurAvailable');
    const eurHold = document.getElementById('eurHold');
    
    if (eurBalance) eurBalance.textContent = balances.EUR.total.toFixed(2);
    if (eurAvailable) eurAvailable.textContent = balances.EUR.available.toFixed(2);
    if (eurHold) eurHold.textContent = balances.EUR.hold.toFixed(2);
    
    // Update PKR
    const pkrBalance = document.getElementById('pkrBalance');
    const pkrAvailable = document.getElementById('pkrAvailable');
    const pkrHold = document.getElementById('pkrHold');
    
    if (pkrBalance) pkrBalance.textContent = balances.PKR.total.toFixed(2);
    if (pkrAvailable) pkrAvailable.textContent = balances.PKR.available.toFixed(2);
    if (pkrHold) pkrHold.textContent = balances.PKR.hold.toFixed(2);
    
    // Update THB
    const thbBalance = document.getElementById('thbBalance');
    const thbAvailable = document.getElementById('thbAvailable');
    const thbHold = document.getElementById('thbHold');
    
    if (thbBalance) thbBalance.textContent = balances.THB.total.toFixed(2);
    if (thbAvailable) thbAvailable.textContent = balances.THB.available.toFixed(2);
    if (thbHold) thbHold.textContent = balances.THB.hold.toFixed(2);
}

function updateKYCStatus() {
    const kycBadge = document.getElementById('kycBadge');
    const kycStatus = document.getElementById('kycStatus');
    
    if (!kycBadge || !kycStatus) return;
    
    if (currentUser.kycVerified) {
        kycBadge.innerHTML = '<i class="fas fa-shield-alt"></i><span>KYC Verified</span>';
        kycBadge.style.background = 'var(--success)';
        kycStatus.innerHTML = `
            <div class="status-completed">
                <i class="fas fa-check-circle"></i>
                <h3>KYC Verified</h3>
                <p>You can now start transactions</p>
            </div>
        `;
    } else {
        kycBadge.innerHTML = '<i class="fas fa-clock"></i><span>KYC Pending</span>';
        kycBadge.style.background = 'var(--warning)';
        kycStatus.innerHTML = `
            <div class="status-pending">
                <i class="fas fa-clock"></i>
                <h3>KYC Verification Pending</h3>
                <p>Upload documents to start transfers</p>
            </div>
        `;
    }
}

function updateRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;
    
    const userTransactions = transactions.filter(t => t.user === currentUser.name);
    const recentTransactions = userTransactions.slice(0, 3);
    
    if (recentTransactions.length === 0) {
        container.innerHTML = `
            <div class="no-transactions">
                <i class="fas fa-receipt"></i>
                <p>No transactions yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentTransactions.map(transaction => `
        <div class="transaction-item" onclick="showTransactionDetails(${transaction.id})">
            <div class="transaction-header">
                <div class="transaction-type ${transaction.type}">
                    <i class="fas ${transaction.type === 'invoice' ? 'fa-file-invoice' : 'fa-money-bill-transfer'}"></i>
                    <span>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span>
                </div>
                <div class="transaction-amount ${transaction.status}">
                    ${transaction.type === 'invoice' ? '-$' : '-'}${transaction.sendAmount || transaction.amount} ${transaction.currency || transaction.fromCurrency}
                </div>
            </div>
            <div class="transaction-details">
                <div class="transaction-info">
                    <span>To: ${transaction.recipient || transaction.receiverName}</span>
                    <span>Date: ${new Date(transaction.date).toLocaleDateString()}</span>
                </div>
                <div class="transaction-status ${transaction.status}">
                    <i class="fas ${getStatusIcon(transaction.status)}"></i>
                    <span>${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Invoice Functions
function calculateInvoiceFees() {
    const amount = parseFloat(document.getElementById('invoiceAmount').value) || 0;
    const feePercentage = adminSettings.paypal.commission;
    const feeAmount = (amount * feePercentage) / 100;
    const netAmount = amount - feeAmount;
    
    const displayAmount = document.getElementById('displayAmount');
    const feePercentageElem = document.getElementById('feePercentage');
    const feeAmountElem = document.getElementById('feeAmount');
    const netAmountElem = document.getElementById('netAmount');
    
    if (displayAmount) displayAmount.textContent = amount.toFixed(2);
    if (feePercentageElem) feePercentageElem.textContent = feePercentage;
    if (feeAmountElem) feeAmountElem.textContent = feeAmount.toFixed(2);
    if (netAmountElem) netAmountElem.textContent = netAmount.toFixed(2);
}

function handleInvoiceSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Please login first!', 'error');
        showSection('login');
        return;
    }
    
    if (!currentUser.kycVerified) {
        showNotification('Please complete KYC verification first!', 'error');
        showSection('kyc');
        return;
    }
    
    const recipientEmail = document.getElementById('recipientEmail').value;
    const amount = parseFloat(document.getElementById('invoiceAmount').value);
    const description = document.getElementById('itemDescription').value;
    
    if (!recipientEmail || !amount || !description) {
        showNotification('Please fill all fields!', 'error');
        return;
    }

    if (amount < 1) {
        showNotification('Amount must be at least $1!', 'error');
        return;
    }
    
    // Create transaction
    const transaction = {
        id: Date.now(),
        type: 'invoice',
        amount: amount,
        currency: 'USD',
        recipient: recipientEmail,
        description: description,
        status: 'pending',
        date: new Date().toISOString(),
        fee: (amount * adminSettings.paypal.commission) / 100,
        user: currentUser.name
    };
    
    // Add to hold balance
    balances.USD.hold += amount;
    balances.USD.total += amount;
    
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    showNotification(`Invoice sent to ${recipientEmail} for $${amount}`, 'success');
    updateDashboard();
    renderTransactions();
    
    // Reset form
    e.target.reset();
    calculateInvoiceFees();
}

// Money Transfer Functions
function updateSendCurrency() {
    const fromCountry = document.getElementById('fromCountry').value;
    const currencyLabel = document.getElementById('sendCurrency');
    
    if (!currencyLabel) return;
    
    if (fromCountry === 'PK') {
        currencyLabel.textContent = 'PKR';
        const pakistanBank = document.getElementById('pakistanBank');
        const thailandBank = document.getElementById('thailandBank');
        if (pakistanBank) pakistanBank.style.display = 'block';
        if (thailandBank) thailandBank.style.display = 'none';
    } else if (fromCountry === 'TH') {
        currencyLabel.textContent = 'THB';
        const pakistanBank = document.getElementById('pakistanBank');
        const thailandBank = document.getElementById('thailandBank');
        if (pakistanBank) pakistanBank.style.display = 'none';
        if (thailandBank) thailandBank.style.display = 'block';
    }
    
    calculateExchange();
}

function calculateExchange() {
    const fromCountry = document.getElementById('fromCountry').value;
    const toCountry = document.getElementById('toCountry').value;
    const amount = parseFloat(document.getElementById('sendAmount').value) || 0;
    
    if (!fromCountry || !toCountry) return;
    
    let exchangeRate = 1;
    let receiveAmount = amount;
    let transferFee = 0;
    
    const exchangeRateElem = document.getElementById('exchangeRate');
    const transferFeeElem = document.getElementById('transferFee');
    const receiveAmountElem = document.getElementById('receiveAmount');
    
    if (fromCountry === 'PK' && toCountry === 'TH') {
        exchangeRate = adminSettings.rates.pkrToThb;
        transferFee = (amount * adminSettings.rates.transferCommission) / 100;
        receiveAmount = (amount - transferFee) * exchangeRate;
        
        if (exchangeRateElem) exchangeRateElem.textContent = `1 PKR = ${exchangeRate.toFixed(4)} THB`;
        if (transferFeeElem) transferFeeElem.textContent = `${transferFee.toFixed(2)} PKR`;
        if (receiveAmountElem) receiveAmountElem.textContent = `${receiveAmount.toFixed(2)} THB`;
    } else if (fromCountry === 'TH' && toCountry === 'PK') {
        exchangeRate = adminSettings.rates.thbToPkr;
        transferFee = (amount * adminSettings.rates.transferCommission) / 100;
        receiveAmount = (amount - transferFee) * exchangeRate;
        
        if (exchangeRateElem) exchangeRateElem.textContent = `1 THB = ${exchangeRate.toFixed(4)} PKR`;
        if (transferFeeElem) transferFeeElem.textContent = `${transferFee.toFixed(2)} THB`;
        if (receiveAmountElem) receiveAmountElem.textContent = `${receiveAmount.toFixed(2)} PKR`;
    }
}

function handleTransferSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Please login first!', 'error');
        showSection('login');
        return;
    }
    
    if (!currentUser.kycVerified) {
        showNotification('Please complete KYC verification first!', 'error');
        showSection('kyc');
        return;
    }
    
    const fromCountry = document.getElementById('fromCountry').value;
    const toCountry = document.getElementById('toCountry').value;
    const amount = parseFloat(document.getElementById('sendAmount').value);
    
    if (!fromCountry || !toCountry || !amount) {
        showNotification('Please fill all fields!', 'error');
        return;
    }

    // Check minimum and maximum amounts
    const minAmount = adminSettings.system.minTransferAmount;
    const maxAmount = adminSettings.system.maxTransferAmount;
    
    if (amount < minAmount) {
        showNotification(`Minimum transfer amount is ${minAmount}`, 'error');
        return;
    }
    
    if (amount > maxAmount) {
        showNotification(`Maximum transfer amount is ${maxAmount}`, 'error');
        return;
    }
    
    // Store transfer details for next step
    const transferDetails = {
        fromCountry,
        toCountry,
        amount,
        receiveAmount: parseFloat(document.getElementById('receiveAmount').textContent),
        exchangeRate: document.getElementById('exchangeRate').textContent,
        transferFee: parseFloat(document.getElementById('transferFee').textContent)
    };
    
    localStorage.setItem('currentTransfer', JSON.stringify(transferDetails));
    
    // Update bank details display
    const displayAmountToSend = document.getElementById('displayAmountToSend');
    if (displayAmountToSend) {
        displayAmountToSend.textContent = `${amount.toFixed(2)} ${fromCountry === 'PK' ? 'PKR' : 'THB'}`;
    }
    
    showSection('bank-details');
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const validation = validateFile(file);
        if (validation.valid) {
            showNotification('Payment proof uploaded successfully!', 'success');
        } else {
            showNotification(validation.message, 'error');
            e.target.value = '';
        }
    }
}

function handleReceiverSubmit(e) {
    e.preventDefault();
    
    const transferDetails = JSON.parse(localStorage.getItem('currentTransfer'));
    if (!transferDetails) {
        showNotification('Transfer details not found!', 'error');
        return;
    }
    
    const receiverBankName = document.getElementById('receiverBankName').value;
    const receiverAccountNumber = document.getElementById('receiverAccountNumber').value;
    const receiverAccountHolder = document.getElementById('receiverAccountHolder').value;
    const paymentProof = document.getElementById('paymentProof').files[0];
    
    if (!receiverBankName || !receiverAccountNumber || !receiverAccountHolder) {
        showNotification('Please fill all receiver details!', 'error');
        return;
    }
    
    if (!paymentProof) {
        showNotification('Please upload payment proof!', 'error');
        return;
    }
    
    // Create transaction
    const transaction = {
        id: Date.now(),
        type: 'transfer',
        fromCurrency: transferDetails.fromCountry === 'PK' ? 'PKR' : 'THB',
        toCurrency: transferDetails.toCountry === 'PK' ? 'PKR' : 'THB',
        sendAmount: transferDetails.amount,
        receiveAmount: transferDetails.receiveAmount,
        receiverBank: receiverBankName,
        receiverAccount: receiverAccountNumber,
        receiverName: receiverAccountHolder,
        status: 'pending',
        date: new Date().toISOString(),
        fee: transferDetails.transferFee,
        user: currentUser.name,
        exchangeRate: transferDetails.exchangeRate,
        paymentProof: paymentProof.name
    };
    
    // Add to hold balance
    const currency = transferDetails.fromCountry === 'PK' ? 'PKR' : 'THB';
    balances[currency].hold += transferDetails.amount;
    balances[currency].total += transferDetails.amount;
    
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    showNotification('Transfer submitted successfully! Under review.', 'success');
    updateDashboard();
    renderTransactions();
    
    // Clear transfer details and reset form
    localStorage.removeItem('currentTransfer');
    e.target.reset();
    document.getElementById('paymentProof').value = '';
    showSection('dashboard');
}

// Copy to Clipboard
function copyText(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const text = element.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Copied to clipboard!', 'success');
    });
}

// Transactions Functions
function renderTransactions(filter = 'all') {
    const container = document.getElementById('transactionsContainer');
    if (!container) return;
    
    const userTransactions = transactions.filter(t => t.user === currentUser.name);
    const filteredTransactions = filter === 'all' 
        ? userTransactions 
        : userTransactions.filter(t => t.status === filter);
    
    if (filteredTransactions.length === 0) {
        container.innerHTML = `
            <div class="no-transactions">
                <i class="fas fa-receipt"></i>
                <p>No ${filter === 'all' ? '' : filter} transactions yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredTransactions.map(transaction => `
        <div class="transaction-item" onclick="showTransactionDetails(${transaction.id})">
            <div class="transaction-header">
                <div class="transaction-type ${transaction.type}">
                    <i class="fas ${transaction.type === 'invoice' ? 'fa-file-invoice' : 'fa-money-bill-transfer'}"></i>
                    <span>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span>
                </div>
                <div class="transaction-amount ${transaction.status}">
                    ${transaction.type === 'invoice' ? '-$' : '-'}${transaction.sendAmount || transaction.amount} ${transaction.currency || transaction.fromCurrency}
                </div>
            </div>
            <div class="transaction-details">
                <div class="transaction-info">
                    <span>To: ${transaction.recipient || transaction.receiverName}</span>
                    <span>Date: ${new Date(transaction.date).toLocaleDateString()}</span>
                </div>
                <div class="transaction-status ${transaction.status}">
                    <i class="fas ${getStatusIcon(transaction.status)}"></i>
                    <span>${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function filterTransactions(filter) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTransactions(filter);
}

function getStatusIcon(status) {
    switch(status) {
        case 'completed': return 'fa-check-circle';
        case 'pending': return 'fa-clock';
        case 'failed': return 'fa-times-circle';
        case 'hold': return 'fa-pause-circle';
        default: return 'fa-info-circle';
    }
}

function showTransactionDetails(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
        const details = `
Transaction Details:
─────────────────
ID: #${transaction.id}
Type: ${transaction.type.toUpperCase()}
Amount: ${transaction.sendAmount || transaction.amount} ${transaction.currency || transaction.fromCurrency}
Status: ${transaction.status.toUpperCase()}
Date: ${new Date(transaction.date).toLocaleString()}
${transaction.recipient ? `Recipient: ${transaction.recipient}` : ''}
${transaction.receiverName ? `Receiver: ${transaction.receiverName}` : ''}
${transaction.receiverBank ? `Bank: ${transaction.receiverBank}` : ''}
${transaction.receiverAccount ? `Account: ${transaction.receiverAccount}` : ''}
${transaction.description ? `Description: ${transaction.description}` : ''}
${transaction.exchangeRate ? `Exchange Rate: ${transaction.exchangeRate}` : ''}
${transaction.fee ? `Fee: ${transaction.fee} ${transaction.currency || transaction.fromCurrency}` : ''}
${transaction.paymentProof ? `Payment Proof: ${transaction.paymentProof}` : ''}
        `.trim();
        
        alert(details);
    }
}

// Admin Panel Functions
function loadAdminSettingsToForm() {
    console.log('Loading admin settings to form...');
    
    // PayPal Accounts
    const paypalEmail1 = document.getElementById('paypalEmail1');
    const paypalEmail2 = document.getElementById('paypalEmail2');
    const paypalEmail3 = document.getElementById('paypalEmail3');
    const paypalCommission = document.getElementById('paypalCommission');
    
    if (paypalEmail1) paypalEmail1.value = adminSettings.paypal.email1;
    if (paypalEmail2) paypalEmail2.value = adminSettings.paypal.email2;
    if (paypalEmail3) paypalEmail3.value = adminSettings.paypal.email3;
    if (paypalCommission) paypalCommission.value = adminSettings.paypal.commission;
    
    // Pakistan Bank
    const pkBankNameInput = document.getElementById('pkBankNameInput');
    const pkAccountNumberInput = document.getElementById('pkAccountNumberInput');
    const pkAccountHolderInput = document.getElementById('pkAccountHolderInput');
    const pkIBANInput = document.getElementById('pkIBANInput');
    
    if (pkBankNameInput) pkBankNameInput.value = adminSettings.pakistanBank.bankName;
    if (pkAccountNumberInput) pkAccountNumberInput.value = adminSettings.pakistanBank.accountNumber;
    if (pkAccountHolderInput) pkAccountHolderInput.value = adminSettings.pakistanBank.accountHolder;
    if (pkIBANInput) pkIBANInput.value = adminSettings.pakistanBank.iban;
    
    // Thailand Bank
    const thBankNameInput = document.getElementById('thBankNameInput');
    const thAccountNumberInput = document.getElementById('thAccountNumberInput');
    const thAccountHolderInput = document.getElementById('thAccountHolderInput');
    const thSWIFTInput = document.getElementById('thSWIFTInput');
    
    if (thBankNameInput) thBankNameInput.value = adminSettings.thailandBank.bankName;
    if (thAccountNumberInput) thAccountNumberInput.value = adminSettings.thailandBank.accountNumber;
    if (thAccountHolderInput) thAccountHolderInput.value = adminSettings.thailandBank.accountHolder;
    if (thSWIFTInput) thSWIFTInput.value = adminSettings.thailandBank.swift;
    
    // Commission & Rates
    const transferCommission = document.getElementById('transferCommission');
    const pkrToThbRate = document.getElementById('pkrToThbRate');
    const thbToPkrRate = document.getElementById('thbToPkrRate');
    
    if (transferCommission) transferCommission.value = adminSettings.rates.transferCommission;
    if (pkrToThbRate) pkrToThbRate.value = adminSettings.rates.pkrToThb;
    if (thbToPkrRate) thbToPkrRate.value = adminSettings.rates.thbToPkr;
    
    // System Settings
    const minTransferAmount = document.getElementById('minTransferAmount');
    const maxTransferAmount = document.getElementById('maxTransferAmount');
    const autoApproveKYC = document.getElementById('autoApproveKYC');
    
    if (minTransferAmount) minTransferAmount.value = adminSettings.system.minTransferAmount;
    if (maxTransferAmount) maxTransferAmount.value = adminSettings.system.maxTransferAmount;
    if (autoApproveKYC) autoApproveKYC.value = adminSettings.system.autoApproveKYC.toString();
}

function loadAdminData() {
    console.log('Loading admin data...');
    loadUsersList();
    loadAllTransactions();
    loadKYCApprovals();
}

function loadUsersList() {
    const container = document.getElementById('usersList');
    if (!container) {
        console.log('Users list container not found');
        return;
    }
    
    if (allUsers.length === 0) {
        container.innerHTML = '<div class="no-transactions"><p>No users found</p></div>';
        return;
    }
    
    container.innerHTML = allUsers.map(user => `
        <div class="user-item">
            <div class="user-info">
                <h4>${user.name}</h4>
                <p>${user.email} | ${user.phone} | Joined: ${user.joinDate}</p>
                <p>KYC: ${user.kycVerified ? 'Verified' : 'Pending'} | Status: ${user.status}</p>
            </div>
            <div class="user-actions">
                ${!user.kycVerified ? `
                    <button class="user-action-btn btn-approve" onclick="approveKYC('${user.email}')">
                        <i class="fas fa-check"></i> Approve KYC
                    </button>
                ` : ''}
                <button class="user-action-btn btn-view" onclick="viewUserDetails('${user.email}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="user-action-btn ${user.status === 'active' ? 'btn-reject' : 'btn-approve'}" 
                        onclick="toggleUserStatus('${user.email}')">
                    <i class="fas ${user.status === 'active' ? 'fa-ban' : 'fa-check'}"></i> 
                    ${user.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        </div>
    `).join('');
}

function loadAllTransactions() {
    const container = document.getElementById('adminTransactionsList');
    if (!container) {
        console.log('Admin transactions container not found');
        return;
    }
    
    if (transactions.length === 0) {
        container.innerHTML = '<div class="no-transactions"><p>No transactions found</p></div>';
        return;
    }
    
    container.innerHTML = transactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-header">
                <div class="transaction-type ${transaction.type}">
                    <i class="fas ${transaction.type === 'invoice' ? 'fa-file-invoice' : 'fa-money-bill-transfer'}"></i>
                    <span>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span>
                </div>
                <div class="transaction-amount ${transaction.status}">
                    ${transaction.type === 'invoice' ? '$' : ''}${transaction.sendAmount || transaction.amount} ${transaction.currency || transaction.fromCurrency}
                </div>
            </div>
            <div class="transaction-details">
                <div class="transaction-info">
                    <span>User: ${transaction.user}</span>
                    <span>To: ${transaction.recipient || transaction.receiverName}</span>
                    <span>Date: ${new Date(transaction.date).toLocaleDateString()}</span>
                </div>
                <div class="transaction-status ${transaction.status}">
                    <i class="fas ${getStatusIcon(transaction.status)}"></i>
                    <span>${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span>
                </div>
            </div>
            <div class="transaction-actions">
                <button class="transaction-action-btn btn-approve" onclick="updateTransactionStatus(${transaction.id}, 'completed')">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="transaction-action-btn btn-reject" onclick="updateTransactionStatus(${transaction.id}, 'failed')">
                    <i class="fas fa-times"></i> Reject
                </button>
                <button class="transaction-action-btn btn-hold" onclick="updateTransactionStatus(${transaction.id}, 'hold')">
                    <i class="fas fa-pause"></i> Hold
                </button>
                <button class="transaction-action-btn btn-view" onclick="showTransactionDetails(${transaction.id})">
                    <i class="fas fa-eye"></i> Details
                </button>
            </div>
        </div>
    `).join('');
}

function loadKYCApprovals() {
    const container = document.getElementById('kycApprovalsList');
    if (!container) {
        console.log('KYC approvals container not found');
        return;
    }
    
    const pendingSubmissions = kycSubmissions.filter(kyc => kyc.status === 'pending');
    
    if (pendingSubmissions.length === 0) {
        container.innerHTML = '<div class="no-transactions"><p>No pending KYC approvals</p></div>';
        return;
    }
    
    container.innerHTML = pendingSubmissions.map(kyc => `
        <div class="kyc-item">
            <div class="kyc-info">
                <h4>${kyc.userName}</h4>
                <p>${kyc.userId} | Submitted: ${new Date(kyc.submitDate).toLocaleDateString()}</p>
                <p>Address: ${kyc.address}</p>
                <p>Documents: ${kyc.profilePhoto}, ${kyc.idDocument}</p>
            </div>
            <div class="kyc-actions">
                <button class="kyc-action-btn btn-approve" onclick="approveKYCSubmission(${kyc.id})">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="kyc-action-btn btn-reject" onclick="rejectKYCSubmission(${kyc.id})">
                    <i class="fas fa-times"></i> Reject
                </button>
                <button class="kyc-action-btn btn-view" onclick="viewKYCDetails(${kyc.id})">
                    <i class="fas fa-eye"></i> View
                </button>
            </div>
        </div>
    `).join('');
}

// Admin Actions
function approveKYC(userEmail) {
    const userIndex = users.findIndex(u => u.email === userEmail);
    if (userIndex !== -1) {
        users[userIndex].kycVerified = true;
        
        // Update KYC submission
        const kycIndex = kycSubmissions.findIndex(k => k.userId === userEmail);
        if (kycIndex !== -1) {
            kycSubmissions[kycIndex].status = 'approved';
            kycSubmissions[kycIndex].reviewDate = new Date().toISOString();
        }
        
        localStorage.setItem('kycSubmissions', JSON.stringify(kycSubmissions));
        showNotification(`KYC approved for ${userEmail}`, 'success');
        loadAdminData();
    }
}

function approveKYCSubmission(kycId) {
    const kycIndex = kycSubmissions.findIndex(k => k.id === kycId);
    if (kycIndex !== -1) {
        kycSubmissions[kycIndex].status = 'approved';
        kycSubmissions[kycIndex].reviewDate = new Date().toISOString();
        
        // Update user KYC status
        const userIndex = users.findIndex(u => u.email === kycSubmissions[kycIndex].userId);
        if (userIndex !== -1) {
            users[userIndex].kycVerified = true;
        }
        
        localStorage.setItem('kycSubmissions', JSON.stringify(kycSubmissions));
        showNotification(`KYC approved for ${kycSubmissions[kycIndex].userName}`, 'success');
        loadKYCApprovals();
    }
}

function rejectKYCSubmission(kycId) {
    const kycIndex = kycSubmissions.findIndex(k => k.id === kycId);
    if (kycIndex !== -1) {
        kycSubmissions[kycIndex].status = 'rejected';
        kycSubmissions[kycIndex].reviewDate = new Date().toISOString();
        
        localStorage.setItem('kycSubmissions', JSON.stringify(kycSubmissions));
        showNotification(`KYC rejected for ${kycSubmissions[kycIndex].userName}`, 'warning');
        loadKYCApprovals();
    }
}

function viewKYCDetails(kycId) {
    const kyc = kycSubmissions.find(k => k.id === kycId);
    if (kyc) {
        const details = `
KYC Submission Details:
─────────────────────
User: ${kyc.userName}
Email: ${kyc.userId}
Address: ${kyc.address}
Profile Photo: ${kyc.profilePhoto}
ID Document: ${kyc.idDocument}
Status: ${kyc.status.toUpperCase()}
Submitted: ${new Date(kyc.submitDate).toLocaleString()}
${kyc.reviewDate ? `Reviewed: ${new Date(kyc.reviewDate).toLocaleString()}` : 'Not reviewed yet'}
        `.trim();
        
        alert(details);
    }
}

function viewUserDetails(userEmail) {
    const user = users.find(u => u.email === userEmail);
    if (user) {
        const userTransactions = transactions.filter(t => t.user === user.name);
        const kyc = kycSubmissions.find(k => k.userId === userEmail);
        
        const details = `
User Details:
────────────
Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone}
KYC Verified: ${user.kycVerified ? 'Yes' : 'No'}
Join Date: ${user.joinDate}
Status: ${user.status}

Transactions: ${userTransactions.length}
${kyc ? `KYC Status: ${kyc.status}` : 'No KYC submission'}
        `.trim();
        
        alert(details);
    }
}

function toggleUserStatus(userEmail) {
    const userIndex = users.findIndex(u => u.email === userEmail);
    if (userIndex !== -1) {
        users[userIndex].status = users[userIndex].status === 'active' ? 'inactive' : 'active';
        showNotification(`User ${users[userIndex].status === 'active' ? 'activated' : 'deactivated'}`, 'success');
        loadUsersList();
    }
}

function updateTransactionStatus(transactionId, status) {
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex !== -1) {
        const transaction = transactions[transactionIndex];
        const oldStatus = transaction.status;
        transaction.status = status;
        
        // Update balances based on status change
        if (oldStatus === 'pending' && status === 'completed') {
            // Release hold and deduct from available balance
            const currency = transaction.fromCurrency || 'USD';
            balances[currency].hold -= (transaction.sendAmount || transaction.amount);
            balances[currency].available -= (transaction.sendAmount || transaction.amount);
        } else if (oldStatus === 'pending' && status === 'failed') {
            // Release hold back to available
            const currency = transaction.fromCurrency || 'USD';
            balances[currency].hold -= (transaction.sendAmount || transaction.amount);
            balances[currency].available += (transaction.sendAmount || transaction.amount);
        }
        
        localStorage.setItem('transactions', JSON.stringify(transactions));
        showNotification(`Transaction #${transactionId} ${status}`, 'success');
        loadAllTransactions();
    }
}

// Admin Panel Section Management
function showAdminSection(sectionName) {
    console.log('Showing admin section:', sectionName);
    
    // Hide all admin sections
    const adminUsersSection = document.getElementById('admin-users-section');
    const adminTransactionsSection = document.getElementById('admin-transactions-section');
    const adminKycSection = document.getElementById('admin-kyc-section');
    const adminSettingsSection = document.getElementById('admin-settings-section');
    
    if (adminUsersSection) adminUsersSection.style.display = 'none';
    if (adminTransactionsSection) adminTransactionsSection.style.display = 'none';
    if (adminKycSection) adminKycSection.style.display = 'none';
    if (adminSettingsSection) adminSettingsSection.style.display = 'none';
    
    // Show selected section
    switch(sectionName) {
        case 'users':
            if (adminUsersSection) {
                adminUsersSection.style.display = 'block';
                loadUsersList();
            }
            break;
        case 'transactions':
            if (adminTransactionsSection) {
                adminTransactionsSection.style.display = 'block';
                loadAllTransactions();
            }
            break;
        case 'kyc':
            if (adminKycSection) {
                adminKycSection.style.display = 'block';
                loadKYCApprovals();
            }
            break;
        case 'settings':
            if (adminSettingsSection) {
                adminSettingsSection.style.display = 'block';
                loadAdminSettingsToForm();
            }
            break;
    }
}

// Individual settings save functions
function savePayPalSettings() {
    const paypalEmail1 = document.getElementById('paypalEmail1');
    const paypalEmail2 = document.getElementById('paypalEmail2');
    const paypalEmail3 = document.getElementById('paypalEmail3');
    const paypalCommission = document.getElementById('paypalCommission');
    
    if (paypalEmail1) adminSettings.paypal.email1 = paypalEmail1.value;
    if (paypalEmail2) adminSettings.paypal.email2 = paypalEmail2.value;
    if (paypalEmail3) adminSettings.paypal.email3 = paypalEmail3.value;
    if (paypalCommission) adminSettings.paypal.commission = parseFloat(paypalCommission.value);
    
    localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
    showNotification('PayPal settings saved successfully!', 'success');
    updateBankDetailsDisplay();
}

function savePakistanBank() {
    const pkBankNameInput = document.getElementById('pkBankNameInput');
    const pkAccountNumberInput = document.getElementById('pkAccountNumberInput');
    const pkAccountHolderInput = document.getElementById('pkAccountHolderInput');
    const pkIBANInput = document.getElementById('pkIBANInput');
    
    if (pkBankNameInput) adminSettings.pakistanBank.bankName = pkBankNameInput.value;
    if (pkAccountNumberInput) adminSettings.pakistanBank.accountNumber = pkAccountNumberInput.value;
    if (pkAccountHolderInput) adminSettings.pakistanBank.accountHolder = pkAccountHolderInput.value;
    if (pkIBANInput) adminSettings.pakistanBank.iban = pkIBANInput.value;
    
    localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
    showNotification('Pakistan bank details saved successfully!', 'success');
    updateBankDetailsDisplay();
}

function saveThailandBank() {
    const thBankNameInput = document.getElementById('thBankNameInput');
    const thAccountNumberInput = document.getElementById('thAccountNumberInput');
    const thAccountHolderInput = document.getElementById('thAccountHolderInput');
    const thSWIFTInput = document.getElementById('thSWIFTInput');
    
    if (thBankNameInput) adminSettings.thailandBank.bankName = thBankNameInput.value;
    if (thAccountNumberInput) adminSettings.thailandBank.accountNumber = thAccountNumberInput.value;
    if (thAccountHolderInput) adminSettings.thailandBank.accountHolder = thAccountHolderInput.value;
    if (thSWIFTInput) adminSettings.thailandBank.swift = thSWIFTInput.value;
    
    localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
    showNotification('Thailand bank details saved successfully!', 'success');
    updateBankDetailsDisplay();
}

function saveCommissionRates() {
    const transferCommission = document.getElementById('transferCommission');
    const pkrToThbRate = document.getElementById('pkrToThbRate');
    const thbToPkrRate = document.getElementById('thbToPkrRate');
    
    if (transferCommission) adminSettings.rates.transferCommission = parseFloat(transferCommission.value);
    if (pkrToThbRate) adminSettings.rates.pkrToThb = parseFloat(pkrToThbRate.value);
    if (thbToPkrRate) adminSettings.rates.thbToPkr = parseFloat(thbToPkrRate.value);
    
    localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
    showNotification('Commission rates saved successfully!', 'success');
}

function saveSystemSettings() {
    const minTransferAmount = document.getElementById('minTransferAmount');
    const maxTransferAmount = document.getElementById('maxTransferAmount');
    const autoApproveKYC = document.getElementById('autoApproveKYC');
    
    if (minTransferAmount) adminSettings.system.minTransferAmount = parseFloat(minTransferAmount.value);
    if (maxTransferAmount) adminSettings.system.maxTransferAmount = parseFloat(maxTransferAmount.value);
    if (autoApproveKYC) adminSettings.system.autoApproveKYC = autoApproveKYC.value === 'true';
    
    localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
    showNotification('System settings saved successfully!', 'success');
}

function saveAdminSettings() {
    savePayPalSettings();
    savePakistanBank();
    saveThailandBank();
    saveCommissionRates();
    saveSystemSettings();
}

function loadAdminSettings() {
    const storedSettings = localStorage.getItem('adminSettings');
    if (storedSettings) {
        adminSettings = JSON.parse(storedSettings);
        console.log('Loaded admin settings from localStorage');
    }
}

function updateBankDetailsDisplay() {
    // Update PayPal emails
    const paypalEmail1Display = document.getElementById('paypalEmail1Display');
    const paypalEmail2Display = document.getElementById('paypalEmail2Display');
    const paypalEmail3Display = document.getElementById('paypalEmail3Display');
    
    if (paypalEmail1Display) paypalEmail1Display.textContent = adminSettings.paypal.email1;
    if (paypalEmail2Display) paypalEmail2Display.textContent = adminSettings.paypal.email2;
    if (paypalEmail3Display) paypalEmail3Display.textContent = adminSettings.paypal.email3;
    
    // Update Pakistan Bank
    const pkBankName = document.getElementById('pkBankName');
    const pkAccountNumber = document.getElementById('pkAccountNumber');
    const pkAccountHolder = document.getElementById('pkAccountHolder');
    const pkIBAN = document.getElementById('pkIBAN');
    
    if (pkBankName) pkBankName.textContent = adminSettings.pakistanBank.bankName;
    if (pkAccountNumber) pkAccountNumber.textContent = adminSettings.pakistanBank.accountNumber;
    if (pkAccountHolder) pkAccountHolder.textContent = adminSettings.pakistanBank.accountHolder;
    if (pkIBAN) pkIBAN.textContent = adminSettings.pakistanBank.iban;
    
    // Update Thailand Bank
    const thBankName = document.getElementById('thBankName');
    const thAccountNumber = document.getElementById('thAccountNumber');
    const thAccountHolder = document.getElementById('thAccountHolder');
    const thSWIFT = document.getElementById('thSWIFT');
    
    if (thBankName) thBankName.textContent = adminSettings.thailandBank.bankName;
    if (thAccountNumber) thAccountNumber.textContent = adminSettings.thailandBank.accountNumber;
    if (thAccountHolder) thAccountHolder.textContent = adminSettings.thailandBank.accountHolder;
    if (thSWIFT) thSWIFT.textContent = adminSettings.thailandBank.swift;
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-bell';
    }
}

// Export functions for global access
window.toggleMobileMenu = toggleMobileMenu;
window.showSection = showSection;
window.logout = logout;
window.copyText = copyText;
window.filterTransactions = filterTransactions;
window.showTransactionDetails = showTransactionDetails;
window.approveKYC = approveKYC;
window.viewUserDetails = viewUserDetails;
window.toggleUserStatus = toggleUserStatus;
window.updateTransactionStatus = updateTransactionStatus;
window.approveKYCSubmission = approveKYCSubmission;
window.rejectKYCSubmission = rejectKYCSubmission;
window.viewKYCDetails = viewKYCDetails;
window.saveAdminSettings = saveAdminSettings;
window.showAdminSection = showAdminSection;
window.savePayPalSettings = savePayPalSettings;
window.savePakistanBank = savePakistanBank;
window.saveThailandBank = saveThailandBank;
window.saveCommissionRates = saveCommissionRates;
window.saveSystemSettings = saveSystemSettings;

console.log('Script loaded successfully!');