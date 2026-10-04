import LoginForm from "./LoginForm";

export const metadata = {
    title: "Giriş | Rentravel Yönetim",
    robots: { index: false, follow: false },
};

export default function LoginPage() {
    return (
        <div className="flex min-h-dvh items-center justify-center px-4 py-10">
            <LoginForm />
        </div>
    );
}