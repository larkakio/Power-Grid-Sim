# Power Grid Sim

Foundry smart contracts plus a Next.js mini-app on Base (`web/`). Solidity sources live under **`contracts/`** (Forge `src` directory).

## Contracts

- `contracts/CheckIn.sol` — daily `checkIn()` on Base (no `msg.value`), streak support.

## Foundry

```shell
forge build
forge test
```

### Deploy (example)

```shell
forge script script/DeployCheckIn.s.sol:DeployCheckIn --rpc-url $BASE_RPC_URL --broadcast
```

## Web app

See [`web/README.md`](web/README.md). Vercel **Root Directory** = `web`.

See [Foundry Book](https://book.getfoundry.sh/) for more.
