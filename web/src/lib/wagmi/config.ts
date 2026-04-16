import { baseAccount, injected, walletConnect } from "wagmi/connectors";
import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { base, mainnet } from "wagmi/chains";

function connectors() {
  const list = [
    injected(),
    baseAccount({ appName: "Power Grid Sim" }),
  ];
  const wc = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  if (wc) {
    list.push(
      walletConnect({
        projectId: wc,
        showQrModal: true,
      }),
    );
  }
  return list;
}

export const wagmiConfig = createConfig({
  chains: [base, mainnet],
  connectors: connectors(),
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
