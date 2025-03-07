import { LoginForm } from "@/components/login-form";

export default function Login() {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center" 
      style={{ backgroundImage: "url('/login.jpeg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="relative w-full max-w-sm bg-background p-6 border rounded-lg shadow-lg">
        <LoginForm className="max-h-screen" />
      </div>
    </div>
  );
}