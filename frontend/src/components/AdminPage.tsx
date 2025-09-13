import { useState, useEffect } from 'react';
import { type User, type Post } from '../types';

interface AdminPageProps {
  currentUser: User | null;
}

export default function AdminPage({ currentUser }: AdminPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 사용자 목록 및 게시물 목록 요청
        const [usersResponse, postsResponse] = await Promise.all([
          fetch('http://localhost:5000/api/admin/users'),
          fetch('http://localhost:5000/api/posts')
        ]);

        if (!usersResponse.ok || !postsResponse.ok) {
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }

        const usersData = await usersResponse.json();
        const postsData = await postsResponse.json();

        // MongoDB _id 변환
        setUsers(usersData.map((user: any) => ({ ...user, id: user._id })));
        setPosts(postsData.map((post: any) => ({ ...post, id: post._id })));

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 사용자 삭제 핸들러 (API 호출)
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('사용자 삭제에 실패했습니다.');
        }
        // 삭제 성공 시, 화면에서도 해당 사용자를 즉시 제거
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // 게시물 삭제 핸들러 (API 호출)
  const handleDeletePost = async (postId: string) => {
    if (window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/posts/${postId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('게시물 삭제에 실패했습니다.');
        }
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // 로딩 및 에러 상태에 따른 UI 처리
  if (isLoading) return <div className="text-center p-10">관리자 데이터를 불러오는 중입니다...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      {/* 사용자 관리 섹션 */}
      <div>
        <h2 className="text-3xl font-bold mb-4">사용자 관리</h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">아이디</th>
                <th className="p-2">가입일</th>
                <th className="p-2">관리</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{user.username}</td>
                  <td className="p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={currentUser?.id === user.id} // 자기 자신은 삭제 불가
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 게시물 관리 섹션 */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 border-b pb-2">게시글 관리</h3>
         <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">제목</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">작성자</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">작업</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{post.id}</td>
                  <td className="py-3 px-4 truncate max-w-xs">{post.title}</td>
                  <td className="py-3 px-4">{post.authorUsername}</td>
                  <td className="py-3 px-4">
                     <button onClick={() => handleDeletePost(post.id)} className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-1 px-3 rounded">
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
