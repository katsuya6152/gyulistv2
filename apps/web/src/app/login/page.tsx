import LoginContainer from '@/features/auth/login/container';

interface LoginPageProps {
  searchParams?: {
    error?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return <LoginContainer searchParams={searchParams} />;
}
