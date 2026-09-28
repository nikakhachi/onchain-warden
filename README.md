# Onchain Warden

**Real-time smart contract event monitoring for EVM-compatible blockchains.**

Onchain Warden lets teams define on-chain event alerts and routes matching activity to Slack, Discord, or Telegram. It is designed to replace manual checks with a shared, configurable feed of protocol activity.

## What it does

- Monitors configured contract events across **Ethereum, Base, BNB Smart Chain, Avalanche, Arbitrum, Katana, and Monad**.
- Supports extensibility across EVM-compatible networks: new EVM chains can be added with minimal configuration.
- Lets users create alerts from protocol templates or define a contract, event ABI, filters, and displayed fields themselves.
- Evaluates event argument conditions, including comparison and custom formula conditions, before notifying a channel.
- Formats notifications with selected event data, labels, severity, chain and contract information, and explorer links.
- Routes each alert to configured Slack, Discord, and Telegram integrations.
- Supports teams, team members, shared address labels, alert management, and subscription billing.

## How it works

1. A user configures an event watcher in the web dashboard and selects one or more notification integrations.
2. The Convex backend monitors configured chains for events associated with active watchers.
3. Onchain Warden checks matching events against the watcher's conditions, formats the selected fields, and sends alerts to connected destinations.

## Alert templates

Preconfigured event templates are grouped by protocol. Most templates are available for custom contract addresses, while protocol templates with configured addresses can prefill those addresses on supported chains.

- **General DeFi:** ERC-20 transfers; ERC-4626 deposits and withdrawals; ownership transfer and transfer start; pause and unpause; role grant and revoke.
- **Aave:** supply and borrow cap changes; rate changes; supply, borrow, withdraw, repay, liquidation, and flash loan events; new token added; borrowing enabled or disabled.
- **Uniswap:** v2, v3, and v4 pool creation and swaps; v3 and v4 liquidity changes; v3 flash loans.
- **LayerZero:** token bridge in and out; new peer added; enforced option set; OFT ownership transferred.
- **Morpho:** borrow rate changes; supply, withdraw, borrow, repay, collateral supply and withdrawal, liquidation, market creation, and flash loans; vault deposits, withdrawals, reallocations, cap and queue updates, market removal, fee, curator, and allocator changes.
- **Pendle:** market deployment; liquidity added or removed; APY change; PT/SY swaps; SY mint and burn; PT/YT mint and burn.
- **Cap:** rewards distributed; operator borrow and repay; cUSD and stcUSD mint, burn, and redeem; liquidation events; interest realized; reserve asset and operator changes; benchmark and restaker rate changes.
- **Euler:** EVault and Earn Vault creation; supply and borrow cap changes; Earn Vault cap changes; deposit, withdraw, borrow, repay, and liquidation.
- **InfiniFi:** rebalancing; yield accrued; iUSD, siUSD, and liUSD mint and burn; farm asset and cap updates; vote registered; rewards deposited.
- **Reservoir:** srUSD rate updates; rUSD mint and burn across USDC, USDT, and USD1 PSMs; PSM refills, cap changes, and fee changes; wsrUSD mint, burn, and cap changes.
- **YO:** yoUSD, yoETH, yoBTC, yoEUR, and yoGOLD mint, burn, deposit fee, withdraw fee, fee recipient, and redemption request lifecycle events.

## Notification channels

- Slack (webhook)
- Discord (webhook)
- Telegram (chat ID)

## Tech stack

- **Web:** Next.js 16, React 19, TypeScript
- **UI:** Chakra UI, RainbowKit, wagmi, TanStack Query
- **Backend and data:** Convex
- **Blockchain access:** viem
- **Authentication:** Auth.js / NextAuth, Google sign-in, and wallet connection flows
- **Notifications:** Slack, Discord, Telegram
- **Billing:** Paddle

## Run locally

### Requirements

- Node.js compatible with the project's Next.js 16 dependencies
- npm
- A Convex deployment

### Install and start

```bash
npm install
npm run dev
```

The frontend expects `NEXT_PUBLIC_CONVEX_URL` to point to a configured Convex deployment. Configure the server-side variables below in that deployment's Convex environment, and set frontend variables in `.env.local` as appropriate. The exact variables needed depend on which features you enable.

### Environment configuration

Do not commit secrets. Set credentials in the appropriate local environment or Convex deployment settings.

| Variable                                                                                                   | Used for                                                      |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_CONVEX_URL`                                                                                   | Convex client connection                                      |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`                                                                     | WalletConnect project configuration                           |
| `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`                                                      | Auth.js session signing and Google OAuth                      |
| `DRPC_FREE_RPC_KEY_1`, `DRPC_FREE_RPC_KEY_2`, `DRPC_PAID_RPC_KEY`, `ALCHEMY_PAID_RPC_KEY`                  | Optional authenticated RPC endpoints and fallbacks            |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ERROR_BOT_TOKEN`, `TELEGRAM_ERROR_CHAT_ID`, `TELEGRAM_ASSISTANT_BOT_TOKEN` | Telegram delivery, error reporting, and waitlist bot features |
| `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET_KEY`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`                           | Paddle billing and webhook verification                       |
| `ETHERSCAN_API_KEY`                                                                                        | Event-fetch API route                                         |

Convex functions and scheduled jobs must be deployed to the Convex project for event monitoring to run. See the [Convex deployment documentation](https://docs.convex.dev/production/hosting) for deployment setup.

## Useful scripts

```bash
npm run dev      # Start the Next.js development server
npm run build    # Build the production app
npm run start    # Serve the production build
npm run lint     # Run ESLint
```

## Repository notes

This repository contains both the Next.js dashboard and Convex backend. `convex/jobs/` contains the scheduled event-processing flow, `convex/integrations/` contains notification adapters, and `src/app/dashboard/` contains the team and alert management UI.

The npm package is marked private. No `LICENSE` file is currently present, so the repository does not declare an open-source license.
