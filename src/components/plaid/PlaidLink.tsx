'use client';

import { useCallback, useState } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';

export function PlaidLink() {
  const [token, setToken] = useState<string | null>(null);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (publicToken, metadata) => {
    await fetch('/api/plaid/exchange-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_token: publicToken }),
    });
  }, []);

  const config: PlaidLinkOptions = {
    token,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  const createLinkToken = async () => {
    const res = await fetch('/api/plaid/create-link-token', { method: 'POST' });
    const data = await res.json();
    if (data.link_token) {
      setToken(data.link_token);
    }
  };

  return (
    <button
      onClick={() => {
        if (!token) {
          createLinkToken().then(() => open());
        } else {
          open();
        }
      }}
      disabled={!ready}
    >
      Connect Bank Account
    </button>
  );
}
