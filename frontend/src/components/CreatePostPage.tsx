import React, { useState } from 'react';
import { type User } from '../types';

interface CreatePostPageProps {
  currentUser: User | null;
  onPostCreated: () => void;
}

export default function CreatePostPage({ currentUser, onPostCreated }: CreatePostPageProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError("글을 작성하려면 로그인이 필요합니다.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          authorId: currentUser.id,
          authorUsername: currentUser.username,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '게시글 작성에 실패했습니다.');
      }

      // 성공 시 부모 컴포넌트에게 알림
      onPostCreated();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">새 글 작성하기</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">제목</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="content" className="block text-gray-700 font-semibold mb-2">내용</label>
          <textarea
            id="content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-400"
        >
          {isLoading ? '게시 중...' : '게시하기'}
        </button>
      </form>
    </div>
  );
}
