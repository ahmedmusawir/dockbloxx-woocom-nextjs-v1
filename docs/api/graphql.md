# GraphQL API Documentation

This document provides comprehensive documentation for the GraphQL implementation in the Dockbloxx headless WooCommerce Next.js application. The GraphQL API is primarily used for blog management and content fetching from WordPress.

## Table of Contents

1. [Endpoint and Client Configuration](#endpoint-and-client-configuration)
2. [Schema Overview](#schema-overview)
3. [Key Queries](#key-queries)
4. [Data Structures](#data-structures)
5. [Data Handling](#data-handling)
6. [Usage Examples](#usage-examples)
7. [Error Handling](#error-handling)
8. [Performance Considerations](#performance-considerations)
9. [Testing](#testing)

---

## Endpoint and Client Configuration

### GraphQL Endpoint

**Endpoint URL**: `https://YOUR_WORDPRESS_SITE.com/graphql`

**Environment Variable**:
```bash
NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=https://YOUR_WORDPRESS_SITE.com/graphql
```

### Client Implementation

The Dockbloxx application uses **native fetch** instead of a dedicated GraphQL client like Apollo Client or URQL. This approach provides:

- **Lightweight implementation** with no additional dependencies
- **Direct control** over request/response handling
- **Simple integration** with Next.js API patterns
- **Server-side rendering compatibility**

**Client Configuration**:
```typescript
const WORDPRESS_GRAPHQL_URL = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL!;

// Standard GraphQL request function
const fetchGraphQL = async (query: string, variables?: any) => {
  const response = await fetch(WORDPRESS_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  
  return response.json();
};
```

---

## Schema Overview

The GraphQL schema is provided by **WPGraphQL**, a WordPress plugin that exposes WordPress data through GraphQL. The main types used in Dockbloxx include:

### Core Types

#### Post
Represents a blog post with the following key fields:
- `id`: Unique identifier (GraphQL ID)
- `databaseId`: WordPress database ID (Integer)
- `title`: Post title
- `slug`: URL-friendly identifier
- `date`: Publication date
- `content`: Full post content (HTML)
- `excerpt`: Post excerpt/summary
- `featuredImage`: Featured image data
- `categories`: Associated categories
- `author`: Post author information

#### Author
Represents a post author:
- `name`: Author display name
- `description`: Author bio/description

#### Category
Represents a post category:
- `name`: Category name
- `slug`: Category slug

#### FeaturedImage
Represents featured image data:
- `sourceUrl`: Direct URL to the image
- `altText`: Alternative text for accessibility

### Type Relationships

```
Post
├── Author (one-to-one)
├── Categories (one-to-many)
└── FeaturedImage (one-to-one)
```

---

## Key Queries

### 1. Get All Posts (Paginated)

**Purpose**: Retrieve a paginated list of blog posts for blog listing pages.

**Query Name**: `GetBlogPosts`

**Variables**:
- `first` (Int!): Number of posts to fetch
- `after` (String): Cursor for pagination (optional)

**GraphQL Query**:
```graphql
query GetBlogPosts($first: Int!, $after: String) {
  posts(first: $first, after: $after) {
    nodes {
      id
      title
      slug
      date
      excerpt
      featuredImage {
        node {
          sourceUrl
        }
      }
      categories {
        nodes {
          name
        }
      }
      author {
        node {
          name
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Sample Request**:
```typescript
const variables = {
  first: 6,
  after: null // or cursor string for next page
};

const response = await fetchGraphQL(GRAPHQL_QUERY_GET_ALL_POSTS, variables);
```

**Sample Response**:
```json
{
  "data": {
    "posts": {
      "nodes": [
        {
          "id": "cG9zdDoxMjM=",
          "title": "Getting Started with Docker",
          "slug": "getting-started-with-docker",
          "date": "2024-01-15T10:30:00",
          "excerpt": "Learn the basics of containerization...",
          "featuredImage": {
            "node": {
              "sourceUrl": "https://example.com/image.jpg"
            }
          },
          "categories": {
            "nodes": [
              { "name": "Technology" },
              { "name": "Docker" }
            ]
          },
          "author": {
            "node": {
              "name": "John Doe"
            }
          }
        }
      ],
      "pageInfo": {
        "hasNextPage": true,
        "endCursor": "YXJyYXljb25uZWN0aW9uOjU="
      }
    }
  }
}
```

### 2. Get Single Post by Slug

**Purpose**: Retrieve detailed information about a specific blog post for post detail pages.

**Query Name**: `GetSinglePostBySlug`

**Variables**:
- `slug` (ID!): The post slug identifier

**GraphQL Query**:
```graphql
query GetSinglePostBySlug($slug: ID!) {
  post(id: $slug, idType: SLUG) {
    id
    databaseId
    title
    slug
    date
    content
    categories {
      nodes {
        name
      }
    }
    featuredImage {
      node {
        sourceUrl
      }
    }
    author {
      node {
        name
      }
    }
  }
}
```

**Sample Request**:
```typescript
const variables = {
  slug: "getting-started-with-docker"
};

const response = await fetchGraphQL(GRAPHQL_QUERY_GET_SINGLE_POST_BY_SLUG, variables);
```

**Sample Response**:
```json
{
  "data": {
    "post": {
      "id": "cG9zdDoxMjM=",
      "databaseId": 123,
      "title": "Getting Started with Docker",
      "slug": "getting-started-with-docker",
      "date": "2024-01-15T10:30:00",
      "content": "<p>Docker is a containerization platform...</p>",
      "categories": {
        "nodes": [
          { "name": "Technology" },
          { "name": "Docker" }
        ]
      },
      "featuredImage": {
        "node": {
          "sourceUrl": "https://example.com/docker-guide.jpg"
        }
      },
      "author": {
        "node": {
          "name": "John Doe"
        }
      }
    }
  }
}
```

### 3. Get All Post Slugs

**Purpose**: Retrieve all post slugs for static site generation (SSG) in Next.js.

**Query Name**: `GetAllPostSlugs`

**Variables**:
- `first` (Int!): Number of slugs to fetch per request
- `after` (String): Cursor for pagination (optional)

**GraphQL Query**:
```graphql
query GetAllPostSlugs($first: Int!, $after: String) {
  posts(first: $first, after: $after) {
    nodes {
      slug
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Sample Request**:
```typescript
const variables = {
  first: 100,
  after: null
};

const response = await fetchGraphQL(GRAPHQL_QUERY_GET_ALL_POST_SLUGS, variables);
```

**Sample Response**:
```json
{
  "data": {
    "posts": {
      "nodes": [
        { "slug": "getting-started-with-docker" },
        { "slug": "kubernetes-best-practices" },
        { "slug": "microservices-architecture" }
      ],
      "pageInfo": {
        "hasNextPage": false,
        "endCursor": null
      }
    }
  }
}
```

---

## Data Structures

### TypeScript Interfaces

The application uses strongly-typed interfaces for GraphQL data:

```typescript
// Main blog post interface
export interface BlogPost {
  id: string;
  databaseId: number;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  featuredImage: {
    node: {
      sourceUrl: string;
    };
  };
  categories: {
    nodes: {
      name: string;
    }[];
  };
  author: {
    node: {
      name: string;
      description: string;
    };
  };
}

// Post slug interface for SSG
export interface PostSlug {
  slug: string;
}

// Paginated response interface
export interface BlogPostsResponse {
  items: BlogPost[];
  hasNextPage: boolean;
  endCursor: string | null;
}

// Single post response interface
export interface SinglePostResponse {
  post: BlogPost;
}
```

---

## Data Handling

### Service Layer Architecture

The application uses a **service layer pattern** to handle GraphQL data:

**File Structure**:
```
src/
├── graphql/
│   └── queries/
│       └── posts/
│           ├── getAllPosts.ts
│           ├── getSinglePostBySlug.ts
│           └── getAllPostSlugs.ts
├── services/
│   └── blogServices.ts
└── types/
    └── blog.ts
```

### Service Functions

#### 1. Fetch Blog Posts with Pagination

```typescript
export const fetchBlogPosts = async (
  first: number,
  after: string | null
): Promise<BlogPostsResponse> => {
  const response = await fetch(WORDPRESS_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GRAPHQL_QUERY_GET_ALL_POSTS,
      variables: { first, after },
    }),
  });

  const data = await response.json();
  
  if (data.errors) {
    console.error("GraphQL Errors:", data.errors);
    throw new Error("Failed to fetch blog posts");
  }

  return {
    items: data.data.posts.nodes,
    hasNextPage: data.data.posts.pageInfo.hasNextPage,
    endCursor: data.data.posts.pageInfo.endCursor,
  };
};
```

#### 2. Frontend Data Rendering

**Server-Side Rendering (SSR)**:
```typescript
// app/(public)/blog/page.tsx
export default async function BlogPage() {
  const { items: initialPosts, hasNextPage, endCursor } = await fetchBlogPosts(6, null);
  
  return (
    <BlogPageContent 
      initialPosts={initialPosts}
      hasNextPage={hasNextPage}
      endCursor={endCursor}
    />
  );
}
```

**Static Site Generation (SSG)**:
```typescript
// app/(public)/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = await fetchAllPostSlugs();
  
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const { post } = await fetchSinglePostBySlug(params.slug);
  
  return <PostContent post={post} />;
}
```

---

## Fragment Usage

**Current Implementation**: The Dockbloxx application does not currently use GraphQL fragments. All field selections are defined directly in queries.

**Potential Fragments** (for future implementation):

```graphql
# Post summary fragment for listing pages
fragment PostSummary on Post {
  id
  title
  slug
  date
  excerpt
  featuredImage {
    node {
      sourceUrl
    }
  }
  categories {
    nodes {
      name
    }
  }
  author {
    node {
      name
    }
  }
}

# Post detail fragment for single post pages
fragment PostDetail on Post {
  ...PostSummary
  databaseId
  content
}
```

**Benefits of Adding Fragments**:
- **Reusability**: Share common field selections across queries
- **Maintainability**: Update field selections in one place
- **Consistency**: Ensure consistent data structure across components

---

## Usage Examples

### Example 1: Blog Listing Page with Pagination

```typescript
// app/(public)/blog/BlogPageContent.tsx
import { fetchBlogPosts } from "@/services/blogServices";
import { BlogPost } from "@/types/blog";

interface BlogPageContentProps {
  initialPosts: BlogPost[];
  hasNextPage: boolean;
  endCursor: string | null;
}

export default function BlogPageContent({ 
  initialPosts, 
  hasNextPage, 
  endCursor 
}: BlogPageContentProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(endCursor);
  const [hasMore, setHasMore] = useState(hasNextPage);

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const { items, hasNextPage, endCursor } = await fetchBlogPosts(6, cursor);
      setPosts(prev => [...prev, ...items]);
      setCursor(endCursor);
      setHasMore(hasNextPage);
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
      
      {hasMore && (
        <button 
          onClick={loadMorePosts} 
          disabled={loading}
          className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          {loading ? "Loading..." : "Load More Posts"}
        </button>
      )}
    </div>
  );
}
```

### Example 2: Single Post Page

```typescript
// app/(public)/blog/[slug]/page.tsx
import { fetchSinglePostBySlug } from "@/services/blogServices";
import { notFound } from "next/navigation";

export default async function PostPage({ params }: { params: { slug: string } }) {
  try {
    const { post } = await fetchSinglePostBySlug(params.slug);
    
    if (!post) {
      notFound();
    }

    return (
      <article className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString()}
            </time>
            <span>By {post.author.node.name}</span>
          </div>
          <div className="flex gap-2 mt-4">
            {post.categories.nodes.map((category) => (
              <span 
                key={category.name} 
                className="px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {category.name}
              </span>
            ))}
          </div>
        </header>
        
        {post.featuredImage?.node?.sourceUrl && (
          <img 
            src={post.featuredImage.node.sourceUrl} 
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-8"
          />
        )}
        
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    );
  } catch (error) {
    console.error("Error fetching post:", error);
    notFound();
  }
}
```

---

## Error Handling

### GraphQL Error Handling

```typescript
// Enhanced error handling in service functions
export const fetchBlogPosts = async (
  first: number,
  after: string | null
): Promise<BlogPostsResponse> => {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GRAPHQL_QUERY_GET_ALL_POSTS,
        variables: { first, after },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle GraphQL errors
    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      throw new Error(`GraphQL Error: ${data.errors[0]?.message || 'Unknown error'}`);
    }

    // Handle missing data
    if (!data.data?.posts) {
      throw new Error("No posts data returned from GraphQL");
    }

    return {
      items: data.data.posts.nodes || [],
      hasNextPage: data.data.posts.pageInfo?.hasNextPage || false,
      endCursor: data.data.posts.pageInfo?.endCursor || null,
    };
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    throw error;
  }
};
```

### Common Error Scenarios

1. **Network Errors**: Handle connectivity issues
2. **GraphQL Syntax Errors**: Handle malformed queries
3. **Missing Environment Variables**: Validate configuration
4. **Data Validation**: Ensure expected data structure

---

## Performance Considerations

### 1. Query Optimization

- Only request fields that are actually used in the UI
- Use different queries for listing vs. detail views
- Avoid over-fetching data

### 2. Pagination Strategy

**Cursor-based Pagination Benefits**:
- Consistent results even when new posts are added
- Better performance than offset-based pagination
- Handles real-time data changes gracefully

### 3. Caching Strategies

**Next.js ISR (Incremental Static Regeneration)**:
```typescript
// Enable ISR for blog posts
export const revalidate = 60; // Revalidate every 60 seconds

export default async function BlogPage() {
  const posts = await fetchBlogPosts(10, null);
  return <BlogContent posts={posts} />;
}
```

---

## Testing

### 1. Unit Testing GraphQL Services

```typescript
// __tests__/services/blogServices.test.ts
import { fetchBlogPosts } from '@/services/blogServices';

// Mock fetch globally
global.fetch = jest.fn();

describe('Blog Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch blog posts successfully', async () => {
    const mockResponse = {
      data: {
        posts: {
          nodes: [
            {
              id: '1',
              title: 'Test Post',
              slug: 'test-post',
              excerpt: 'Test excerpt',
            }
          ],
          pageInfo: {
            hasNextPage: false,
            endCursor: null
          }
        }
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await fetchBlogPosts(6, null);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Test Post');
    expect(result.hasNextPage).toBe(false);
  });

  it('should handle GraphQL errors', async () => {
    const mockErrorResponse = {
      errors: [{ message: 'GraphQL Error' }]
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockErrorResponse
    });

    await expect(fetchBlogPosts(6, null)).rejects.toThrow('GraphQL Error');
  });
});
```

### 2. Testing Environment Setup

```bash
# .env.test
NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=https://test-wordpress-site.com/graphql
```

---

## Security Considerations

### 1. Environment Variables
- Store GraphQL endpoint URL in environment variables
- Never expose WordPress admin credentials in client-side code
- Use HTTPS for all GraphQL requests in production

### 2. Query Validation
- Validate input parameters before sending GraphQL requests
- Sanitize user inputs to prevent injection attacks
- Implement rate limiting for GraphQL endpoints

### 3. Error Information
- Don't expose sensitive error details to client-side
- Log detailed errors server-side for debugging
- Provide user-friendly error messages in the UI

```typescript
// Safe error handling
try {
  const result = await fetchBlogPosts(first, after);
  return result;
} catch (error) {
  // Log detailed error server-side
  console.error('GraphQL Error:', error);
  
  // Return safe error message to client
  throw new Error('Unable to load blog posts. Please try again later.');
}
```

---

This completes the comprehensive GraphQL API documentation for the Dockbloxx project. The documentation covers all aspects of the GraphQL implementation, from basic configuration to advanced usage patterns, error handling, performance optimization, and testing strategies.