const supportedAssets = ['USD', 'PI', 'ZPE', 'ZPP', 'ZPW', 'ZHV', 'GOATE', 'GySt', 'SD', 'ZGI', 'GP', 'zS'];
let currentUser = null;
let userPin = null;
let userPassword = null;
let userData = {
    piAddress: null,
    email: null,
    appleId: null,
    bank: { accountNumber: null, routingNumber: null },
    card: { number: null, expiration: null, cvc: null },
    phoneNumber: null,
    ssn: null,
    username: null
};
let devices = [];
let isNewDevice = false;

window.onload = async () => {
    await Pi.init({ version: "2.0" });

    document.getElementById('login').onclick = showLoginModal;
    document.getElementById('connect-device').onclick = connectDevice;
    document.getElementById('settings').onclick = showSettings;
    document.getElementById('sign-in-pi').onclick = signInWithPi;
    document.getElementById('sign-in-google').onclick = signInWithGoogle;
    document.getElementById('sign-in-apple').onclick = signInWithApple;
};

function showLoginModal() {
    if (currentUser) {
        alert('Already logged in as ' + userData.username);
        return;
    }
    document.getElementById('login-modal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function signInWithPi() {
    try {
        const auth = await Pi.authenticate();
        document.getElementById('pi-auth').style.display = 'block';
        userData.piAddress = auth.user.username;
    } catch (error) {
        console.error("Pi Authentication failed:", error);
        alert('Pi Authentication failed. Try again.');
    }
}

function acceptPiAuth() {
    completeLogin('pi', userData.piAddress);
}

function declinePiAuth() {
    document.getElementById('pi-auth').style.display = 'none';
}

function createPiAccount() {
    window.open('https://minepi.com/cj03nes', '_blank');
}

function signInWithGoogle() {
    // Mock Google Sign-In
    userData.email = prompt('Enter Google email:');
    completeLogin('google', userData.email);
}

function signInWithApple() {
    // Mock Apple Sign-In
    userData.appleId = prompt('Enter Apple ID:');
    completeLogin('apple', userData.appleId);
}

async function completeLogin(method, identifier) {
    if (isNewDevice || !localStorage.getItem('deviceId')) {
        const password = prompt('Enter password for new device/IP:');
        if (!await verifyPassword(identifier, password)) {
            alert('Invalid password.');
            return;
        }
    }

    currentUser = identifier;
    userData.username = identifier.split('@')[0] || identifier;
    document.getElementById('login').textContent = userData.username;

    if (!userPin) {
        userPin = prompt('Create a 4-digit PIN:');
        while (!/^\d{4}$/.test(userPin)) {
            userPin = prompt('Invalid PIN. Create a 4-digit PIN:');
        }
        userPassword = prompt('Create a password:');
        let confirmPassword = prompt('Confirm your password:');
        while (userPassword !== confirmPassword) {
            userPassword = prompt('Passwords do not match. Create a password:');
            confirmPassword = prompt('Confirm your password:');
        }
    }

    // Generate bank and card details
    if (!userData.bank.accountNumber) {
        userData.bank.accountNumber = generateBankAccountNumber();
        userData.bank.routingNumber = generateRoutingNumber();
    }
    if (!userData.card.number) {
        userData.card = generateCardDetails();
    }

    // Prompt for additional details
    if (!userData.phoneNumber) {
        userData.phoneNumber = prompt('Enter phone number:');
    }
    if (!userData.ssn) {
        userData.ssn = prompt('Enter SSN (optional):');
    }

    await updateBalances();
    closeModal('login-modal');
}

async function verifyPassword(identifier, password) {
    // Mock password verification (replace with actual backend call)
    return password === userPassword;
}

function generateBankAccountNumber() {
    return 'XXXX' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
}

function generateRoutingNumber() {
    return '0' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
}

function generateCardDetails() {
    const number = '4' + Math.floor(Math.random() * 10**15).toString().padStart(15, '0');
    const expiration = new Date();
    expiration.setFullYear(expiration.getFullYear() + 20);
    const expStr = `${expiration.getMonth() + 1}/${expiration.getFullYear() % 100}`;
    const cvc = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return { number, expiration: expStr, cvc };
}

async function updateBalances() {
    if (!currentUser) return;
    for (const asset of supportedAssets) {
        const balance = await getBalance(asset);
        document.getElementById(`${asset.toLowerCase()}-balance`)?.textContent = balance.toFixed(2);
    }
}

async function getBalance(asset) {
    // Mock balance fetch
    return Math.random() * 100;
}

async function connectDevice() {
    if (!currentUser) {
        alert('Please login first.');
        return;
    }

    const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
    localStorage.setItem('deviceId', deviceId);

    // Sync device with QuantumZeropointDataStorage
    await syncDeviceData(deviceId);

    document.getElementById('connect-device').textContent = 'deviceConnected';
    setTimeout(() => {
        document.getElementById('connect-device').textContent = 'Manage Devices';
        document.getElementById('connect-device').onclick = showManageDevices;
    }, 2000);

    devices.push({ id: deviceId, name: 'Device ' + devices.length + 1 });
}

function generateDeviceId() {
    return 'DEV' + Math.random().toString(36).substr(2, 9);
}

async function syncDeviceData(deviceId) {
    // Mock QuantumZeropointDataStorage sync
    console.log(`Syncing device ${deviceId} with 800M data points`);
}

function showManageDevices() {
    const modal = document.getElementById('feature-modal');
    const title = document.getElementById('feature-title');
    const content = document.getElementById('feature-content');

    title.textContent = 'Manage Devices';
    content.innerHTML = `
        <div class="devices">
            ${devices.map(device => `
                <div class="device">
                    <p>Device Name: ${device.name}</p>
                    <p>IMEI: ${device.id}</p>
                    <input type="number" placeholder="Input $ZPE" id="zpe-${device.id}">
                    <button onclick="consumeZPE('${device.id}')">Consume Zeropoint</button>
                    <input type="number" placeholder="Input $ZPWP" id="zpwp-${device.id}">
                    <button onclick="consumeZPWP('${device.id}')">Consume Zeropoint Phone Service</button>
                    <input type="number" placeholder="Input $ZPW" id="zpw-${device.id}">
                    <button onclick="consumeToDevice('ZPW', '${device.id}')">Consume To Device</button>
                    <input type="number" placeholder="Input $ZPE" id="zpe-device-${device.id}">
                    <button onclick="consumeToDevice('ZPE', '${device.id}')">Consume To Device</button>
                    <input type="number" placeholder="Input $ZPE" id="zpe-insurance-${device.id}">
                    <button onclick="addToInsurance('${device.id}')">Add to Insurance Balance</button>
                    <select id="chain-${device.id}">
                        <option value="default">Default</option>
                    </select>
                    <label>Insure Connected Item: <input type="checkbox" id="insure-${device.id}" disabled></label>
                    <button onclick="removeDevice('${device.id}')">Remove Device</button>
                </div>
            `).join('')}
            <button class="add-device" onclick="addDevice()">+</button>
            <button onclick="manualInputIMEI()">Manual Input IMEI</button>
            <button onclick="scanDevice()">Scan</button>
        </div>
    `;
    modal.style.display = 'flex';
}

function consumeZPE(deviceId) {
    const amount = document.getElementById(`zpe-${deviceId}`).value;
    console.log(`Consuming ${amount} $ZPE for ${deviceId}`);
}

function consumeZPWP(deviceId) {
    const amount = document.getElementById(`zpwp-${deviceId}`).value;
    console.log(`Consuming ${amount} $ZPWP for ${deviceId}`);
}

function consumeToDevice(asset, deviceId) {
    const amount = document.getElementById(`${asset.toLowerCase()}-device-${deviceId}`).value;
    console.log(`Consuming ${amount} ${asset} to ${deviceId}`);
}

function addToInsurance(deviceId) {
    const amount = document.getElementById(`zpe-insurance-${deviceId}`).value;
    console.log(`Adding ${amount} $ZPE to insurance for ${deviceId}`);
    document.getElementById(`insure-${deviceId}`).checked = true;
}

function removeDevice(deviceId) {
    devices = devices.filter(d => d.id !== deviceId);
    showManageDevices();
}

function addDevice() {
    const name = prompt('Enter device name:');
    const id = generateDeviceId();
    devices.push({ id, name });
    showManageDevices();
}

function manualInputIMEI() {
    const imei = prompt('Enter IMEI:');
    devices.push({ id: imei, name: 'Manual Device' });
    showManageDevices();
}

function scanDevice() {
    // Mock NFC/QR scan
    alert('Scanning device...');
    devices.push({ id: generateDeviceId(), name: 'Scanned Device' });
    showManageDevices();
}

function showSettings() {
    if (!currentUser) {
        alert('Please login first.');
        return;
    }

    const modal = document.getElementById('feature-modal');
    const title = document.getElementById('feature-title');
    const content = document.getElementById('feature-content');

    title.textContent = 'Settings';
    content.innerHTML = `
        <div class="settings">
            <h3>Account Settings</h3>
            <p>THE LAMBDUCK INC Monopolies Bank</p>
            <p>TheLambduckCard: ${userData.card.number} Exp: ${userData.card.expiration} CVC: ${userData.card.cvc}</p>
            <p>Account Type: Checking</p>
            <p>Account Number: ${userData.bank.accountNumber}</p>
            <p>Routing Number: ${userData.bank.routingNumber}</p>
            <p>Name: ${userData.username}</p>
            <p>SSN: ${userData.ssn ? '****-**-****' : 'Not Provided'}</p>
            <button onclick="connectBank()">Connect Bank</button>
            <button onclick="updateBank()">Update Bank</button>
            <button onclick="connectCard()">Connect Card</button>
            <button onclick="updateCard()">Update Card</button>
            <button onclick="updateUsername()">Update Username</button>
            <button onclick="updatePassword()">Update Password</button>
            <button onclick="updatePin()">Update Pin Code</button>
            <button onclick="updateEmail()">Update Email Address</button>
            <button onclick="updatePhone()">Update Phone Number</button>
            <button onclick="updateAddress()">Update Address</button>
            <button onclick="updateLambduckCard()">Update TheLambduckCard</button>
        </div>
    `;
    modal.style.display = 'flex';
}

function connectBank() {
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    userData.bank.accountNumber = generateBankAccountNumber();
    userData.bank.routingNumber = generateRoutingNumber();
    showSettings();
}

function updateBank() {
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    content.innerHTML = `
        <button onclick="removeBank()">Remove Bank</button>
        <button onclick="replaceBank()">Replace Bank</button>
    `;
}

function removeBank() {
    userData.bank = { accountNumber: null, routingNumber: null };
    showSettings();
}

function replaceBank() {
    userData.bank.accountNumber = generateBankAccountNumber();
    userData.bank.routingNumber = generateRoutingNumber();
    showSettings();
}

function connectCard() {
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    userData.card = generateCardDetails();
    showSettings();
}

function updateCard() {
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    userData.card = generateCardDetails();
    showSettings();
}

function updateUsername() {
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    userData.username = prompt('Enter new username:');
    showSettings();
}

function updatePassword() {
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    userPassword = prompt('Enter new password:');
    let confirmPassword = prompt('Confirm new password:');
    while (userPassword !== confirmPassword) {
        userPassword = prompt('Passwords do not match. Enter new password:');
        confirmPassword = prompt('Confirm new password:');
    }
    showSettings();
}

function updatePin() {
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    userPin = prompt('Enter new 4-digit PIN:');
    while (!/^\d{4}$/.test(userPin)) {
        userPin = prompt('Invalid PIN. Enter new 4-digit PIN:');
    }
    showSettings();
}

function updateEmail() {
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    userData.email = prompt('Enter new email:');
    showSettings();
}

function updatePhone() {
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    userData.phoneNumber = prompt('Enter new phone number:');
    showSettings();
}

function updateAddress() {
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    userData.address = prompt('Enter new address:');
    showSettings();
}

function updateLambduckCard() {
    const pin = prompt('Enter 4-digit PIN or password:');
    if (pin !== userPin && pin !== userPassword) {
        alert('Invalid PIN or password.');
        return;
    }
    userData.card = generateCardDetails();
    const newPin = prompt('Create new 4-digit PIN:');
    while (!/^\d{4}$/.test(newPin)) {
        newPin = prompt('Invalid PIN. Create new 4-digit PIN:');
    }
    const confirmPin = prompt('Confirm new 4-digit PIN:');
    if (newPin === confirmPin) {
        userPin = newPin;
    } else {
        alert('PINs do not match.');
    }
    showSettings();
}

function navigateTo(service) {
    if (!currentUser) {
        alert('Please login first.');
        return;
    }

    const modal = document.getElementById('feature-modal');
    const title = document.getElementById('feature-title');
    const content = document.getElementById('feature-content');

    if (service === 'goate-electric') {
        title.textContent = 'Goate Electric';
        content.innerHTML = `
            <div class="balances">
                ${supportedAssets.map(asset => `
                    <div class="balance">
                        <img src="${asset.toLowerCase()}_logo.png" class="token-logo" alt="${asset} Logo">
                        ${asset}: <span id="${asset.toLowerCase()}-balance">0</span>
                        <p>USD: $${(Math.random() * 100).toFixed(2)}</p>
                        ${asset === 'ZGI' ? `<label>Insurance: <input type="checkbox" id="zgi-toggle" disabled></label>` : ''}
                    </div>
                `).join('')}
            </div>
            <button onclick="deposit()">Deposit</button>
            <button onclick="withdraw()">Withdraw</button>
            <button onclick="swap()">Swap</button>
            <button onclick="consume()">Consume</button>
            <button onclick="transfer()">Transfer</button>
            <button onclick="stake()">Stake</button>
            <h3>Transaction History</h3>
            <div id="transaction-history"></div>
        `;
        updateBalances();
    } else if (service === 'gerastyx') {
        title.textContent = 'Gerastyx';
        content.innerHTML = `
            <div class="balances">
                <div class="balance">GySt: <span id="gyst-balance">0</span></div>
                <div class="balance">GOATE: <span id="goate-balance">0</span></div>
            </div>
            <div class="games">
                <button onclick="playGame('HomeTeamBets')">HomeTeamBets</button>
                <button onclick="playGame('Goate ScratchOffs')">Goate ScratchOffs</button>
                <button onclick="playGame('Goate Spades')">Goate Spades</button>
                <button onclick="playGame('GerastyxOpol')">GerastyxOpol</button>
                <button onclick="playGame('Goat War')">Goat War</button>
                <button onclick="playGame('Goate Pity Pat')">Goate Pity Pat</button>
                <button onclick="watchAds()">Watch Ads</button>
                <button onclick="zeropointHolographicView()">ZeropointHolographicView</button>
                <button onclick="validationPortal()">Validation Portal</button>
            </div>
        `;
        updateBalances();
    } else if (service === 'goatepig') {
        title.textContent = 'GoatePig';
        content.innerHTML = `
            <div class="goatepig">
                <div class="section">
                    <h3>GoatePig</h3>
                    <p>$GP Balance: <span id="gp-balance">0</span></p>
                    <p>$GP Address: ${userData.piAddress || 'N/A'}</p>
                </div>
                <div class="section">
                    <h3>Circumference of Pi</h3>
                    <p>$PiR2 Balance: <span id="pir2-balance">0</span></p>
                    <p>$PiR2 Address: ${userData.piAddress || 'N/A'}</p>
                </div>
                <select id="sort-assets">
                    <option value="balance-desc">Highest Balance</option>
                    <option value="balance-asc">Lowest Balance</option>
                    <option value="name-asc">Alphabetical (A-Z)</option>
                    <option value="name-desc">Reverse Alphabetical (Z-A)</option>
                    <option value="crypto-stocks">Crypto - Stocks</option>
                    <option value="stocks-crypto">Stocks - Crypto</option>
                </select>
                <input type="text" id="asset-search" placeholder="Search assets">
                <div id="assets-list">
                    ${supportedAssets.map(asset => `
                        <div class="asset-card">
                            <p>Token: ${asset}</p>
                            <p>Balance: <span id="${asset.toLowerCase()}-balance">0</span></p>
                            <input type="number" placeholder="Stake Amount" id="stake-${asset}">
                            <button onclick="stakeAsset('${asset}')">Stake</button>
                            <input type="number" placeholder="Farm Amount" id="farm-${asset}">
                            <button onclick="farmAsset('${asset}')">Farm</button>
                            <input type="number" placeholder="Liquidity Amount" id="lp-${asset}">
                            <button onclick="provideLiquidity('${asset}')">Provide Liquidity</button>
                            <input type="number" placeholder="Dual Stake Amount" id="dual-${asset}">
                            <select id="dual-asset-${asset}">
                                ${supportedAssets.filter(a => a !== asset).map(a => `<option value="${a}">${a}</option>`).join('')}
                            </select>
                            <button onclick="dualStake('${asset}')">Dual Stake</button>
                            <input type="number" placeholder="Lend Amount" id="lend-${asset}">
                            <button onclick="lendAsset('${asset}')">Lend</button>
                            <input type="number" placeholder="Collateral Amount" id="collateral-${asset}">
                            <input type="number" placeholder="Borrow Amount" id="borrow-${asset}">
                            <button onclick="borrowAsset('${asset}')">Borrow</button>
                            <button onclick="watchAd('${asset}')">Watch Ad</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        updateBalances();
    }
    modal.style.display = 'flex';
}

function deposit() {
    const amount = prompt('Enter USD amount to deposit:');
    console.log(`Depositing ${amount} USD`);
}

function withdraw() {
    if (!userData.ssn && prompt('Enter amount:') > 1000000) {
        alert('Accounts without SSN are limited to $1M daily bank withdrawals.');
        return;
    }
    console.log('Withdrawing USD');
}

function swap() {
    navigateTo('goatepig');
}

function consume() {
    showManageDevices();
}

function transfer() {
    const modal = document.getElementById('feature-modal');
    const content = document.getElementById('feature-content');
    content.innerHTML = `
        <select id="transfer-asset">
            ${supportedAssets.map(asset => `<option value="${asset}">${asset}</option>`).join('')}
        </select>
        <input type="number" id="transfer-amount" placeholder="Amount">
        <p>USD Denomination: <span id="usd-denomination">0</span></p>
        <input type="text" id="transfer-recipient" placeholder="Pi Address, Username, Phone, Email">
        <button onclick="executeTransfer()">Transfer</button>
        <h3>Transaction History</h3>
        <div id="transaction-history"></div>
    `;
}

function executeTransfer() {
    const asset = document.getElementById('transfer-asset').value;
    const amount = document.getElementById('transfer-amount').value;
    const recipient = document.getElementById('transfer-recipient').value;
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    console.log(`Transferring ${amount} ${asset} to ${recipient}`);
}

function stake() {
    navigateTo('goatepig');
}

function playGame(game) {
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    const modes = {
        'HomeTeamBets': ['Free', '$1', '$20', '$100'],
        'Goate ScratchOffs': ['Pennies', 'Nickels', 'Dimes', 'Quarters', 'Dollars'],
        'Goate Spades': ['Free', '$1', '$20', '$100'],
        'GerastyxOpol': ['Free', 'Civilian', 'Banker', 'Monopoly'],
        'Goat War': ['Free', '$1', '$20', '$100'],
        'Goate Pity Pat': ['Free', '$1', '$20', '$100']
    };
    const content = document.getElementById('feature-content');
    content.innerHTML = `
        <h3>${game}</h3>
        ${modes[game].map(mode => `<button onclick="startGame('${game}', '${mode}')">${mode}</button>`).join('')}
    `;
}

function startGame(game, mode) {
    console.log(`Starting ${game} in ${mode} mode`);
}

function watchAds() {
    // Mock ad watch
    console.log('Watching ad...');
    alert('Ad watched. 50% of revenue added to $GOATE balance.');
}

function zeropointHolographicView() {
    console.log('Accessing ZeropointHolographicView');
}

function validationPortal() {
    const content = document.getElementById('feature-content');
    content.innerHTML = `
        <h3>Validation Portal</h3>
        <p>Rewards: <span id="validation-rewards">0</span> $SD</p>
        <button onclick="checkAvailable()">Check Available</button>
        <div id="shot-view" style="display: none;">
            <p>$SD Shot View</p>
            <button onclick="noHarm()">Do Not Disturb (No Harm, No Foul)</button>
            <button onclick="callPolice()">Call Police (Somebody is Being Harmed)</button>
        </div>
    `;
}

function checkAvailable() {
    document.getElementById('shot-view').style.display = 'block';
}

function noHarm() {
    if (confirm('Confirm with 4-digit PIN:')) {
        // Mock 911 call
        console.log('Calling 911 for patrol...');
    }
}

function callPolice() {
    if (confirm('Confirm with 4-digit PIN:')) {
        // Mock 911 call
        console.log('Calling 911 for armed officers...');
    }
}

function stakeAsset(asset) {
    const amount = document.getElementById(`stake-${asset}`).value;
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    console.log(`Staking ${amount} ${asset} for 3 months`);
}

function farmAsset(asset) {
    const amount = document.getElementById(`farm-${asset}`).value;
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    console.log(`Farming ${amount} ${asset} for 6 months`);
}

function provideLiquidity(asset) {
    const amount = document.getElementById(`lp-${asset}`).value;
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    console.log(`Providing ${amount} ${asset} liquidity for 9 months`);
}

function dualStake(asset) {
    const amount = document.getElementById(`dual-${asset}`).value;
    const secondAsset = document.getElementById(`dual-asset-${asset}`).value;
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    console.log(`Dual staking ${amount} ${asset} and ${secondAsset}`);
}

function lendAsset(asset) {
    const amount = document.getElementById(`lend-${asset}`).value;
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    console.log(`Lending ${amount} ${asset}`);
}

function borrowAsset(asset) {
    const collateral = document.getElementById(`collateral-${asset}`).value;
    const amount = document.getElementById(`borrow-${asset}`).value;
    const pin = prompt('Enter 4-digit PIN:');
    if (pin !== userPin) {
        alert('Invalid PIN.');
        return;
    }
    console.log(`Borrowing ${amount} ${asset} with ${collateral} collateral`);
}

function watchAd(asset) {
    console.log(`Watching ad for ${asset}`);
    alert('Ad watched. 50% of revenue added to balance.');
}
