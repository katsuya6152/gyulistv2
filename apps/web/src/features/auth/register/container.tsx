import RegisterPresentation from './presentational';

interface RegisterContainerProps {
  searchParams?: {
    error?: string;
  };
}

export default function RegisterContainer({ searchParams }: RegisterContainerProps) {
  // Server Component としてデータ取得やエラーハンドリングを行う
  // 現在はクライアントサイドでのエラーハンドリングのため、searchParamsからエラーを取得
  
  return (
    <RegisterPresentation 
      error={searchParams?.error}
    />
  );
}
