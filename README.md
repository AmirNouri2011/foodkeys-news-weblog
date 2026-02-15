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
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

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
cp .env.example .env
```

4. Initialize the database:
```bash
npm run db:generate
npm run db:push
```

5. (Optional) Seed sample data:
```bash
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

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
├── prisma/
│   ├── schema.prisma       # Database schema
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
├── .env.example
├── package.json
└── README.md
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed sample data
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Self-Hosted

1. Build the project:
```bash
npm run build
```

2. Start the server:
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
