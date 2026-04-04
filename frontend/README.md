# AntiGravity Frontend

Decentralized dark-period forensics and accountability layer for metaverse digital twins.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Socket.io-client
- Ethers.js v6
- Framer Motion
- Recharts

## Setup Instructions

1. Copy the `.env.local.example` file to create your local environment configuration:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your missing environment values in `.env.local`:
   ```
   NEXT_PUBLIC_BACKEND_URL=...
   NEXT_PUBLIC_CONTRACT_ANCHOR=...
   NEXT_PUBLIC_CONTRACT_TOKEN=...
   NEXT_PUBLIC_CONTRACT_FORENSICS=...
   NEXT_PUBLIC_CHAIN_ID=80002
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
