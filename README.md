# Purple Stock - Inventory Management System

Purple Stock is a comprehensive inventory management system designed for businesses of all sizes. It provides a robust set of features for tracking inventory across multiple locations, managing stock movements, and generating detailed reports.

<img width="1695" alt="Screenshot 2025-03-03 at 10 30 20" src="https://github.com/user-attachments/assets/7e78f8d0-c98c-4366-be14-f24f6650a0f8" />

## Core Features

### Item Management
- Create, edit, and delete items
- Assign categories and suppliers
- Generate unique QR codes for each item
- Track item history and movement
- Set minimum stock levels and reorder points
- Bulk import/export via CSV

### Stock Operations
- Stock-in: Record new inventory arrivals
- Stock-out: Track inventory departures
- Stock adjustment: Correct inventory levels
- Stock movement: Transfer items between locations
- QR code scanning for all stock operations
- Real-time stock level updates

### Location Management
- Create and manage multiple storage locations
- Track item quantities per location
- View location-specific inventory history
- Transfer items between locations
- Location-based stock reports

### QR Code Integration
- Generate QR codes for all inventory items
- Scan QR codes for quick item lookup
- Perform stock operations via QR scanning
- Mobile-friendly scanning interface
- Real-time validation during scanning

### Reporting & Analytics
- Dashboard with key metrics
- Stock level summaries
- Movement history reports
- Location-based analytics
- Value-based reporting
- Export reports to CSV

### Supplier Management
- Create and manage supplier profiles
- Track supplier-specific inventory
- Link items to suppliers
- Supplier contact information

## Technical Features
- Progressive Web App (PWA) support
- Offline capability
- Dark/Light theme
- Responsive design
- Multi-language support
- Real-time updates

## Technology Stack

- **Frontend:**
  - Next.js 13 (App Router)
  - React
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components

- **Backend:**
  - Supabase
  - PostgreSQL
  - Row Level Security (RLS)
  - Database Functions & Triggers

## Getting Started

### Prerequisites
- Node.js (v16.x or later)
- npm (v7.x or later)
- Supabase account

### Environment Variables
Create a \`.env.local\` file with:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/purple-stock.git
cd purple-stock
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run database migrations:
\`\`\`bash
npm run migrate
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Database Setup

The application uses Supabase with the following key tables:
- items
- categories
- suppliers
- locations
- stock_movements
- location_history

Database migrations are provided in the \`/migrations\` directory.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintenance team.

## Acknowledgments

- shadcn/ui for the component library
- Supabase for the backend infrastructure
- Next.js team for the framework
- All contributors who have helped shape this project

