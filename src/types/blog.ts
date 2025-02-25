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

export interface PostSlug {
  slug: string;
}
