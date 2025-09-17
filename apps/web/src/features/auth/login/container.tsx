import LoginPresentation from './presentational';

interface LoginContainerProps {
  searchParams?: {
    error?: string;
  };
}

export default function LoginContainer({ searchParams }: LoginContainerProps) {
  // Server Component としてデータ取得やエラーハンドリングを行う
  // 現在はクライアントサイドでのエラーハンドリングのため、searchParamsからエラーを取得
  
  return (
    <LoginPresentation 
      error={searchParams?.error}
    />
  );
}
