import { useState, useEffect, useMemo } from 'react';
import { type Post } from '../types';

interface PostsPageProps {
  onNavigate: (page: string) => void;
}

export default function PostsPage({ onNavigate }: PostsPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:5000/api/posts');
        if (!response.ok) {
          throw new Error('게시글을 불러오는 데 실패했습니다.');
        }
        const data = await response.json();

        // MongoDB의 _id를 프론트엔드에서 사용할 id로 변환합니다.
        const formattedData = data.map((post: any) => ({ ...post, id: post._id, createdAt: new Date(post.createdAt).toLocaleDateString() }));
        setPosts(formattedData);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []); 

  const filteredPosts = useMemo(() => {
    if (!searchTerm) return posts;
    return posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.authorUsername.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);

  // 로딩 및 에러 UI 처리
  if (isLoading) return <div className="text-center p-10">게시글을 불러오는 중입니다...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => onNavigate('create')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          글쓰기
        </button>
      </div>

      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <div key={post.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold mb-2">{post.title}</h3>
              <p className="text-gray-600 mb-4">
                작성자: {post.authorUsername} | 작성일: {post.createdAt}
              </p>
              <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-10">게시글이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
