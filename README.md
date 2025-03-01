# Stock Market Simulator

This is a stock market simulator built with Next.js, TypeScript, and Prisma. The project aims to provide a realistic stock market experience with real-time updates, user management, and admin controls. The application uses a local PostgreSQL server for data storage and Socket.io for real-time updates. The UI/UX design is enhanced using ShadCN components.

## Features

- **Real-time Market Data**: View stock market data with charts and visualizations.
- **User Management**: Users can buy/sell stocks and view their portfolio, including personal information and stock holdings.
- **Admin Controls**: Admins can manipulate stock prices, add/remove stocks, and control the random price updates.
- **Random Price Updates**: Stock prices are updated randomly with options to toggle and adjust the frequency and magnitude of changes.
- **Real-time Updates**: All changes are reflected in real-time using Socket.io.

## Project Structure

- **/components**: React components used throughout the application.
- **/lib**: Utility functions and libraries.
- **/pages**: Next.js pages for different routes.
- **/prisma**: Prisma schema and database configuration.
- **/public**: Public assets such as images and icons.
- **/styles**: Global styles and CSS files.

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- Prisma CLI

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/stock-simulator.git
    cd stock-simulator
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up the PostgreSQL database and update the `.env` file with your database credentials.

4. Run Prisma migrations:
    ```bash
    npx prisma migrate dev
    ```

5. Start the development server:
    ```bash
    npm run dev
    ```

## Usage

- **User**: Sign up and log in to view and manage your stock portfolio.
- **Admin**: Log in to the admin panel to control stock prices and manage the stock market.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Socket.io](https://socket.io/)
- [ShadCN](https://shadcn.dev/)

stock-market-simulator/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── stocks/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── market/
│   │   ├── [symbol]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── portfolio/
│   │   └── page.tsx
│   ├── trades/
│   │   └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── stocks/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── trades/
│   │   │   └── route.ts
│   │   └── users/
│   │       ├── [id]/
│   │       │   └── route.ts
│   │       └── route.ts
│   ├── error.tsx
│   ├── loading.tsx
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── components/
│   ├── admin/
│   │   ├── stock-control-panel.tsx
│   │   ├── price-simulator-controls.tsx
│   │   ├── jump-settings.tsx
│   │   └── user-management.tsx
│   ├── charts/
│   │   ├── stock-price-chart.tsx
│   │   ├── volume-chart.tsx
│   │   ├── market-overview.tsx
│   │   └── portfolio-performance.tsx
│   ├── market/
│   │   ├── stock-card.tsx
│   │   ├── stock-grid.tsx
│   │   ├── stock-details.tsx
│   │   └── market-trends.tsx
│   ├── portfolio/
│   │   ├── holdings-table.tsx
│   │   ├── trade-history.tsx
│   │   └── portfolio-summary.tsx
│   ├── trading/
│   │   ├── trade-form.tsx
│   │   ├── order-confirmation.tsx
│   │   └── quick-trade-panel.tsx
│   ├── ui/
│   │   └── (shadcn components)
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   └── layout/
│       ├── header.tsx
│       ├── sidebar.tsx
│       ├── user-menu.tsx
│       └── footer.tsx
├── lib/
│   ├── auth.ts
│   ├── socket.ts
│   ├── price-simulator.ts
│   ├── db.ts
│   ├── utils.ts
│   └── validators.ts
├── hooks/
│   ├── use-stocks.ts
│   ├── use-portfolio.ts
│   ├── use-socket.ts
│   ├── use-auth.ts
│   └── use-trading.ts
├── providers/
│   ├── socket-provider.tsx
│   ├── auth-provider.tsx
│   └── theme-provider.tsx
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── images/
│   └── icons/
├── types/
│   ├── stock.ts
│   ├── user.ts
│   ├── trade.ts
│   └── index.ts
├── styles/
│   └── globals.css
├── .env
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md