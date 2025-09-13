export type User = {
  id: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
};

export type Post = {
  id: string;
  authorId: string;
  authorUsername: string;
  title: string;
  content: string;
  createdAt: string;
};
