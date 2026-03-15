import { ReactNode, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { Home, Plus, History, BarChart3, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setLogoutModalOpen(false);
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: '대시보드' },
    { path: '/add', icon: Plus, label: '매매 기록' },
    { path: '/history', icon: History, label: '내역' },
    { path: '/review', icon: BarChart3, label: '리뷰' },
    { path: '/profile', icon: User, label: '원칙' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Desktop Navigation */}
      <nav className="hidden md:block border-b border-neutral-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 justify-between">
            <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-5 py-4 border-b-2 transition-all font-medium ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            </div>
            <button
              type="button"
              onClick={() => setLogoutModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </nav>

      <AlertDialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그아웃</AlertDialogTitle>
            <AlertDialogDescription>
              정말 로그아웃 하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
            >
              로그아웃
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <main className="flex-1 bg-neutral-50">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200/80 backdrop-blur-sm z-50 shadow-xl">
        <div className="grid grid-cols-6 gap-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-3 transition-all ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            className="flex flex-col items-center justify-center py-3 text-neutral-500 hover:text-neutral-900 transition-all"
          >
            <LogOut className="w-6 h-6 mb-1 stroke-2" />
            <span className="text-xs font-medium">로그아웃</span>
          </button>
        </div>
      </nav>
    </div>
  );
}