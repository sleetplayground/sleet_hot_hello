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

        // Periodically check wallet state to keep UI in sync
        setInterval(async () => {
            const wasSignedIn = currentWallet !== null;
            await refreshWalletState();
            const isSignedIn = currentWallet !== null;

            // Only log if state changed
            if (wasSignedIn !== isSignedIn) {
                console.log(`Wallet state changed: ${isSignedIn ? 'signed in' : 'signed out'}`);
            }
        }, 5000); // Check every 5 seconds

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
                try {
                    if (typeof currentWallet.signOut === 'function') {
                        await currentWallet.signOut();
                    } else if (typeof modal.signOut === 'function') {
                        await modal.signOut();
                    } else if (typeof selector.disconnect === 'function') {
                        await selector.disconnect();
                    } else {
                        console.log("Available wallet methods:", Object.getOwnPropertyNames(currentWallet));
                        throw new Error("No suitable signOut method found");
                    }

                    // Manually update UI since event might not fire
                    currentWallet = null;
                    updateLoginButton();
                    console.log("Successfully signed out");
                } catch (signOutError) {
                    console.error("SignOut error:", signOutError);
                    throw signOutError;
                }
            } else {
                // If not logged in, show modal to sign in
                try {
                    if (typeof modal.show === 'function') {
                        modal.show();
                    } else if (typeof modal.open === 'function') {
                        modal.open();
                    } else if (typeof modal.signIn === 'function') {
                        await modal.signIn();
                    } else {
                        // Try different approaches
                        console.log("Trying alternative modal methods...");
                        modal.show();
                    }
                } catch (modalError) {
                    console.error("Modal error:", modalError);
                    // If modal methods fail, try selector methods
                    try {
                        await selector.connect();
                    } catch (selectorError) {
                        console.error("Selector connect error:", selectorError);
                        throw new Error("Unable to open wallet selector");
                    }
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

// Refresh wallet state
export async function refreshWalletState() {
    try {
        currentWallet = await selector.wallet();
        updateLoginButton();
        return true;
    } catch (error) {
        currentWallet = null;
        updateLoginButton();
        return false;
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