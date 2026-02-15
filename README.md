# FoodKeys Weblog

A modern, SEO-optimized news and articles platform built with Next.js 14, featuring WordPress-like functionality with a beautiful animated UI.

## Features

### Content Management
- **Posts/Articles**: Full CRUD with rich HTML content, excerpts, featured images
- **Categories**: Hierarchical category system with parent/child relationships
- **Tags**: Flexible tagging system with tag cloud
- **Media Management**: Image upload, storage, and cleanup
- **Custom Meta Fields**: Key-value pairs for additional post data

### SEO Optimization
- **Dynamic Meta Tags**: Title, description, keywords per page
- **Open Graph & Twitter Cards**: Social media preview optimization
- **JSON-LD Structured Data**: Article, Website, Organization, Breadcrumb schemas
- **Dynamic Sitemap**: Auto-generated from posts, categories, and tags
- **Robots.txt**: Proper crawling instructions
- **Canonical URLs**: Prevent duplicate content issues
- **Semantic HTML**: Proper heading hierarchy and article tags

### UI/UX
- **Beautiful Animations**: Framer Motion throughout
- **Dark/Light Mode**: System preference detection with manual toggle
- **Responsive Design**: Mobile-first approach
- **Loading States**: Skeleton loaders for better perceived performance
- **Error Handling**: Custom 404 and error pages

### Security
- **API Key + TOTP Authentication**: Dual-factor API security
- **Dev Mode Credentials**: Easy testing with mock credentials
- **Protected Routes**: Middleware-based route protection

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Docker & Docker Compose

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker & Docker Compose (for database)

### Quick Start (Recommended)

The easiest way to get started is using the setup script:

```bash
# Clone the repository
git clone <repo-url>
cd foodkeys-weblog-react

# Copy environment file
cp .env.development .env

# Run setup (installs deps, starts DB, generates client, seeds data)
npm run setup

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Manual Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd foodkeys-weblog-react
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.development .env
```

4. Start PostgreSQL database:
```bash
npm run docker:dev
```

5. Initialize the database:
```bash
npm run db:generate
npm run db:push
```

6. (Optional) Seed sample data:
```bash
npm run db:seed
```

7. Start the development server:
```bash
npm run dev
```

## Environment Variables

```env
# Database - PostgreSQL
DATABASE_URL="postgresql://foodkeys:foodkeys_password@localhost:5432/foodkeys_db?schema=public"
POSTGRES_USER="foodkeys"
POSTGRES_PASSWORD="foodkeys_password"
POSTGRES_DB="foodkeys_db"

# Authentication
TOTP_SECRET="your-32-char-secret"
API_KEY="your-secure-api-key"

# Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="FoodKeys Weblog"
NEXT_PUBLIC_SITE_DESCRIPTION="A modern news and articles platform"

# Environment
NODE_ENV="development"
```

## API Reference

### Authentication

All write operations (POST, PUT, DELETE) require authentication headers:
- `X-API-Key`: Your API key
- `X-TOTP-Code`: 6-digit TOTP code

**Development Mode Credentials:**
- API Key: `armo`
- TOTP Code: `123456`

### Posts API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/posts` | GET | List posts (paginated) |
| `/api/posts` | POST | Create post |
| `/api/posts/[id]` | GET | Get single post |
| `/api/posts/[id]` | PUT | Update post |
| `/api/posts/[id]` | DELETE | Delete post + media |

**Query Parameters (GET /api/posts):**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `status`: Filter by status (DRAFT, PUBLISHED, SCHEDULED, ARCHIVED)
- `categoryId` or `categorySlug`: Filter by category
- `tagId` or `tagSlug`: Filter by tag
- `search`: Search in title, content, excerpt
- `sortBy`: Field to sort by (default: publishedAt)
- `sortOrder`: asc or desc (default: desc)

**Create/Update Post Body:**
```json
{
  "title": "Post Title",
  "content": "<p>HTML content</p>",
  "excerpt": "Short description",
  "featuredImage": "/uploads/2025/01/image.jpg",
  "status": "PUBLISHED",
  "categoryId": 1,
  "tagIds": [1, 2, 3],
  "meta": { "keywords": "seo, keywords" },
  "metaTitle": "Custom SEO Title",
  "metaDescription": "Custom meta description",
  "publishedAt": "2025-01-15T00:00:00Z"
}
```

### Categories API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/categories` | GET | List categories |
| `/api/categories` | POST | Create category |
| `/api/categories/[id]` | GET | Get category with posts |
| `/api/categories/[id]` | PUT | Update category |
| `/api/categories/[id]` | DELETE | Delete category |

### Tags API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tags` | GET | List tags |
| `/api/tags` | POST | Create tag |
| `/api/tags/[id]` | GET | Get tag with posts |
| `/api/tags/[id]` | PUT | Update tag |
| `/api/tags/[id]` | DELETE | Delete tag |

### Media API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/media` | GET | List media files |
| `/api/media` | POST | Upload media (multipart/form-data) |
| `/api/media/[id]` | GET | Get media details |
| `/api/media/[id]` | PUT | Update media metadata |
| `/api/media/[id]` | DELETE | Delete media file |

**Upload Example:**
```bash
curl -X POST http://localhost:3000/api/media \
  -H "X-API-Key: armo" \
  -H "X-TOTP-Code: 123456" \
  -F "file=@image.jpg" \
  -F "alt=Image description" \
  -F "postId=1"
```

## Project Structure

```
foodkeys-weblog-react/
├── deploy/
│   ├── Dockerfile          # Production build
│   ├── Dockerfile.seed     # Database seeding
│   ├── docker-compose.yml  # Main stack
│   ├── docker-compose.dev.yml   # Development
│   ├── docker-compose.prod.yml  # Production optimized
│   ├── init-db/            # PostgreSQL init scripts
│   └── README.md           # Deployment guide
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Database migrations
│   └── seed.ts             # Sample data
├── public/
│   └── uploads/            # Uploaded media
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── posts/          # Post pages
│   │   ├── category/       # Category pages
│   │   ├── tag/            # Tag pages
│   │   ├── search/         # Search page
│   │   ├── sitemap.ts      # Dynamic sitemap
│   │   ├── robots.ts       # Robots.txt
│   │   └── layout.tsx      # Root layout
│   ├── components/
│   │   ├── animations/     # Framer Motion wrappers
│   │   ├── home/           # Home page components
│   │   ├── layout/         # Header, Footer
│   │   ├── posts/          # Post cards, grids
│   │   ├── search/         # Search form
│   │   ├── seo/            # JSON-LD components
│   │   └── ui/             # UI components
│   ├── lib/
│   │   ├── auth.ts         # Authentication
│   │   ├── prisma.ts       # Database client
│   │   ├── seo.ts          # SEO utilities
│   │   └── utils.ts        # Helpers
│   └── types/
│       └── index.ts        # TypeScript types
├── .dockerignore
├── .env.example
├── .env.development
├── .env.production.template
├── package.json
└── README.md
```

## Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Create migration (dev)
npm run db:migrate:deploy # Deploy migrations (prod)
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed sample data
npm run db:reset         # Reset database

# Docker - Development
npm run docker:dev       # Start PostgreSQL for development
npm run docker:dev:down  # Stop development database
npm run docker:dev:logs  # View development database logs
npm run docker:dev:pgadmin # Start pgAdmin UI

# Docker - Production
npm run docker:build     # Build production Docker image
npm run docker:up        # Start production stack
npm run docker:down      # Stop production stack
npm run docker:logs      # View production logs
npm run docker:migrate   # Run migrations in Docker
npm run docker:seed      # Seed database in Docker
npm run docker:prod      # Start optimized production stack
npm run docker:prod:down # Stop optimized production stack

# Quick Setup
npm run setup            # Full setup (install, db, generate, seed)
```

## Docker Deployment

### Development with Docker (Database only)

```bash
# Start PostgreSQL
npm run docker:dev

# Optionally start pgAdmin UI (http://localhost:5050)
npm run docker:dev:pgadmin

# Run your Next.js app locally
npm run dev
```

### Full Production Deployment

```bash
# Configure environment
cp .env.production.template .env
# Edit .env with your production values

# Build and start
npm run docker:build
npm run docker:up

# Run migrations
npm run docker:migrate

# (Optional) Seed data
npm run docker:seed
```

See [deploy/README.md](deploy/README.md) for detailed deployment instructions.

## Deployment

### Docker (Recommended)

See [deploy/README.md](deploy/README.md) for complete Docker deployment guide.

```bash
# Quick production deployment
npm run docker:build
npm run docker:up
npm run docker:migrate
```

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add a PostgreSQL database (Vercel Postgres, Supabase, Neon, etc.)
4. Set environment variables
5. Deploy

### Self-Hosted

1. Set up a PostgreSQL database
2. Configure environment variables
3. Build the project:
```bash
npm run build
```
4. Run migrations:
```bash
npm run db:migrate:deploy
```
5. Start the server:
```bash
npm run start
```

## SEO Best Practices Implemented

1. **Technical SEO**
   - Semantic HTML structure
   - Fast page loads with Next.js optimization
   - Mobile-responsive design
   - Clean URL structure

2. **On-Page SEO**
   - Unique titles and descriptions per page
   - Proper heading hierarchy (H1, H2, etc.)
   - Alt text for images
   - Internal linking

3. **Structured Data**
   - Article schema for blog posts
   - Website schema
   - Breadcrumb navigation
   - Organization schema

4. **Crawlability**
   - XML Sitemap
   - Robots.txt
   - Canonical URLs

## License

MIT
