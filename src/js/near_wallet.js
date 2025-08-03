import { WalletSelector, WalletSelectorUI } from "@hot-labs/near-connect";
import "@hot-labs/near-connect/modal-ui.css";
import { getCurrentNetworkId } from './config';

let selector = null;
let modal = null;
let currentWallet = null;

// Initialize the wallet selector
export async function initWallet() {
    try {
        const networkId = getCurrentNetworkId();
        
        selector = new WalletSelector({ 
            network: networkId 
        });
        
        modal = new WalletSelectorUI(selector);

        // Set up event listeners
        selector.on("wallet:signOut", async () => {
            console.log("Wallet signed out");
            currentWallet = null;
            updateLoginButton();
        });

        selector.on("wallet:signIn", async (event) => {
            console.log("Wallet signed in:", event);
            currentWallet = await selector.wallet();
            updateLoginButton();
        });

        // Initialize login button
        initLoginButton();
        
        // Check if already signed in
        try {
            currentWallet = await selector.wallet();
            updateLoginButton();
        } catch (error) {
            console.log("No wallet connected yet");
        }

        console.log("Wallet initialized successfully");
    } catch (error) {
        console.error("Failed to initialize wallet:", error);
    }
}

// Initialize login button functionality
function initLoginButton() {
    const loginButton = document.getElementById('near_login_button');
    
    if (!loginButton) {
        console.error('Login button not found');
        return;
    }

    loginButton.addEventListener('click', async () => {
        try {
            if (currentWallet) {
                // If logged in, sign out
                await selector.signOut();
            } else {
                // If not logged in, show modal to sign in
                await selector.connect();
            }
        } catch (error) {
            console.error('Login/logout error:', error);
            alert(`Error: ${error.message}`);
        }
    });
}

// Update login button text and state
function updateLoginButton() {
    const loginButton = document.getElementById('near_login_button');
    
    if (!loginButton) return;

    if (currentWallet) {
        loginButton.textContent = 'LOGOUT';
        loginButton.title = `Logged in as ${currentWallet.accountId}`;
    } else {
        loginButton.textContent = 'LOGIN';
        loginButton.title = 'Connect your NEAR wallet';
    }
}

// Export functions for use in other modules
export function getWallet() {
    return currentWallet;
}

export function getSelector() {
    return selector;
}

export function isSignedIn() {
    return currentWallet !== null;
}

export function getAccountId() {
    return currentWallet ? currentWallet.accountId : null;
}

// Initialize wallet when module loads
initWallet();