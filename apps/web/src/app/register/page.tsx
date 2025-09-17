import RegisterContainer from '@/features/auth/register/container';

interface RegisterPageProps {
  searchParams?: {
    error?: string;
  };
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  return <RegisterContainer searchParams={searchParams} />;
}
