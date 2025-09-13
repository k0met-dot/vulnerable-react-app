import { type User } from '../types'; // 분리된 타입 import

interface NavbarProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Navbar({ user, onNavigate, onLogout }: NavbarProps) {
  const displayName = user ? user.username : 'guest';

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => onNavigate('home')}>React Board</h1>
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded" onClick={() => onNavigate('posts')}>게시판</button>
          
          {/* 관리자일 경우에만 '관리자' 버튼 렌더링 */}
          {user?.isAdmin && <button className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded" onClick={() => onNavigate('admin')}>관리자</button>}
          
          <span className="font-semibold text-gray-700">{displayName}님</span>

          {user ? (
            <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300" onClick={onLogout}>
              로그아웃
            </button>
          ) : (
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300" onClick={() => onNavigate('login')}>
              로그인
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
