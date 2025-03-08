'use client';
import type { ReactNode } from 'react';
import { OnchainKitProvider as Provider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains'; // add baseSepolia for testing

export default function OnchainKitProvider(props: { children: ReactNode }) {
  return (
    <Provider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_CLIENT_API_KEY}
      chain={base} // add baseSepolia for testing
    >
      {props.children}
    </Provider>
  );
}
