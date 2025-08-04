import { WalletSelector, WalletSelectorUI } from "@hot-labs/near-connect";
import "@hot-labs/near-connect/modal-ui.css";
import { getCurrentNetworkId } from './config.js';

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

        // Set up event listeners exactly as in docs
        selector.on("wallet:signOut", async () => {
            console.log("Wallet signed out");
            currentWallet = null;
            updateLoginButton();
        });

        selector.on("wallet:signIn", async (t) => {
            console.log("Wallet signed in:", t);
            const wallet = await selector.wallet(); // api like near-wallet-selector
            const address = t.accounts[0].accountId;
            console.log("Connected account:", address);

            currentWallet = wallet;
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
                console.log("Attempting to sign out...");

                try {
                    await currentWallet.signOut();
                    console.log("SignOut method completed");

                    // Manually update UI since event might not fire
                    currentWallet = null;
                    updateLoginButton();
                    console.log("UI updated after logout");

                    // Optional: Reload page to ensure clean state
                    // Uncomment the next line if you want automatic page reload
                    // window.location.reload();

                } catch (signOutError) {
                    console.error("SignOut failed:", signOutError);

                    // Force logout by clearing state and reloading
                    currentWallet = null;
                    updateLoginButton();
                    console.log("Forced logout - reloading page");
                    window.location.reload();
                }
            } else {
                // If not logged in, show modal
                // Based on your feedback, one of these methods works
                if (typeof modal.show === 'function') {
                    modal.show();
                } else if (typeof modal.open === 'function') {
                    modal.open();
                } else {
                    // Fallback - try to trigger wallet selection
                    console.log("Trying to open wallet selector...");
                    modal.show();
                }
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
        loginButton.style.backgroundColor = '#4CAF50'; // Green for logged in
    } else {
        loginButton.textContent = 'LOGIN';
        loginButton.title = 'Connect your NEAR wallet';
        loginButton.style.backgroundColor = ''; // Reset to default
    }
}

// Manual refresh function to check wallet state
export async function refreshWalletState() {
    try {
        const wallet = await selector.wallet();
        if (wallet && wallet.accountId) {
            currentWallet = wallet;
            console.log("Wallet state refreshed - logged in as:", wallet.accountId);
        } else {
            currentWallet = null;
            console.log("Wallet state refreshed - not logged in");
        }
    } catch (error) {
        currentWallet = null;
        console.log("Wallet state refreshed - no wallet connected");
    }
    updateLoginButton();
    return currentWallet;
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