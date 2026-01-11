# XORIG Backend API

A Node.js/Express backend API for PC component management and build generation with price tracking capabilities.

## 🚀 Features

- **Component Management**: CRUD operations for PC components (CPU, GPU, Motherboard, etc.)
- **Price Tracking**: Automated price monitoring with cron jobs
- **Build Generation**: AI-powered PC build recommendations
- **Rule Engine**: Compatibility validation using JSON Logic
- **Web Scraping**: Product specifications and pricing from various sources
- **PostgreSQL Database**: Robust data storage with Prisma ORM

## 📋 Prerequisites

Before running this project, make sure you have installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v7.0.0 or higher) - Comes with Node.js
- **PostgreSQL** database - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/downloads)

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd xorig-backadmin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/xorig_db?schema=public"

# Server Configuration
PORT=5000
NODE_ENV=development

# Add other environment variables as needed
```

### 4. Database Setup

#### Generate Prisma Client

```bash
npx prisma generate
```

#### Run Database Migrations

```bash
npx prisma db push
```

#### (Optional) Seed the Database

```bash
npx prisma db seed
```

## 🏃‍♂️ Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

The server will start on http://localhost:5000

### Production Mode

```bash
npm start
```

## 📁 Project Structure

```
xorig-backadmin/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.js               # Database seeding
├── src/
│   ├── controllers/          # Route handlers
│   │   ├── buildController.js
│   │   ├── categoryController.js
│   │   ├── componentController.js
│   │   ├── masterController.js
│   │   └── ruleController.js
│   ├── jobs/
│   │   └── priceTracker.js   # Cron jobs for price tracking
│   ├── logic/
│   │   ├── BuilderService.js # PC build generation logic
│   │   └── RuleEngine.js     # Compatibility validation
│   ├── routes/
│   │   └── apiRoutes.js      # API route definitions
│   ├── utils/
│   │   └── scraper.js        # Web scraping utilities
│   ├── config/
│   │   └── db.js             # Database configuration
│   ├── app.js                # Express app configuration
│   └── server.js             # Server entry point
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🛠 Available Scripts

- `npm run dev` - Start development server with auto-reload (nodemon)
- `npm start` - Start production server
- `npm run db:push` - Push database schema changes to database
- `npx prisma generate` - Generate Prisma client
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply new migration

## 🔌 API Endpoints

### Components

- `GET /api/components` - Get all components
- `GET /api/components/:id` - Get component by ID
- `POST /api/components` - Create new component
- `PATCH /api/components/:id` - Update component
- `DELETE /api/components/:id` - Delete component
- `POST /api/components/manual-offer` - Add manual offer
- `POST /api/components/fetch-specs` - Fetch component specifications

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

### Rules & Validation

- `GET /api/rules` - Get compatibility rules
- `POST /api/rules` - Create new rule
- `DELETE /api/rules/:id` - Delete rule
- `POST /api/rules/validate` - Validate PC build

### Build Generation

- `POST /api/build/generate` - Generate PC build recommendation

### Master Data

- `GET /api/master-data` - Get initial application data

## 🔧 Database Schema

The application uses PostgreSQL with the following main entities:

- **Component**: PC components (CPU, GPU, RAM, etc.)
- **Category**: Component categories
- **Offer**: Price offers from different sources
- **ExternalId**: External product identifiers
- **Rule**: Compatibility rules for build validation

## 🤖 Background Jobs

The application includes automated price tracking:

- **Price Tracker**: Monitors component prices from various sources
- **Runs periodically** using node-cron
- **Updates component prices** in the database

## 🧪 Testing the API

You can test the API using tools like:

- **Postman** - [Download here](https://www.postman.com/)
- **Insomnia** - [Download here](https://insomnia.rest/)
- **curl** commands
- **VS Code REST Client** extension

Example API call:

```bash
curl -X GET http://localhost:5000/api/components
```

## 🚨 Troubleshooting

### Common Issues

1. **"Cannot find module '.prisma/client/default'"**

   ```bash
   npx prisma generate
   ```

2. **Database connection errors**

   - Check your `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Verify database exists

3. **Port already in use**

   - Change `PORT` in `.env` file
   - Or kill the process using the port

4. **Migration errors**
   ```bash
   npx prisma db push --force-reset
   npx prisma generate
   ```

## 📦 Key Dependencies

- **Express.js** - Web framework
- **Prisma** - Database ORM
- **Puppeteer** - Web scraping
- **node-cron** - Task scheduling
- **json-logic-js** - Rule engine
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

---

**Happy coding! 🚀**

For any questions or issues, please create an issue in the repository.
