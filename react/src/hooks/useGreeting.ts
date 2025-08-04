import { useState } from 'react';
import { getHelloContract, getNearRpc } from '../config';


export function useGreeting() {
  const [greeting, setGreeting] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGreeting = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const NearRpc = getNearRpc();
      const HelloContract = getHelloContract();

      const response = await fetch(NearRpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "dontcare",
          method: "query",
          params: {
            request_type: "call_function",
            account_id: HelloContract,
            method_name: "get_greeting",
            args_base64: "",
            finality: "final"
          }
        })
      });

      const data = await response.json();
      console.log("Full response:", data);

      if (data.result && data.result.result) {
        const greetingText = new TextDecoder().decode(new Uint8Array(data.result.result));
        setGreeting(greetingText);
      } else {
        throw new Error("Error fetching greeting");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setGreeting("Error fetching greeting");
    } finally {
      setIsLoading(false);
    }
  };

  const updateGreeting = async (message: string, wallet: any) => {
    if (!wallet) {
      throw new Error('Please connect your wallet first');
    }

    setIsLoading(true);
    setError(null);

    try {
      const contractName = getHelloContract();

      const result = await wallet.signAndSendTransaction({
        signerId: wallet.accountId,
        receiverId: contractName,
        actions: [{
          type: 'FunctionCall',
          params: {
            methodName: 'set_greeting',
            args: { greeting: message },
            gas: '30000000000000', // 30 TGas
            deposit: '0',
          }
        }]
      });

      console.log('Transaction successful:', result);
      // Refresh greeting after successful update
      await fetchGreeting();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    greeting,
    isLoading,
    error,
    fetchGreeting,
    updateGreeting,
  };
}