import PageTitle from "@/components/page-title";
import { useEffect, useState } from "react";

export default function Home() {

  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <>
      <PageTitle title="Welcome back, User." />
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <img
          src="/vite.svg"
          alt="Vite Logo"
          className="w-32 h-32 animate-spin-slow"
        />
        <h1 className="text-2xl font-bold">Welcome to Vite + React + TailwindCSS</h1>
        <p className="mt-4 text-lg">This is a template for Vite + React + TailwindCSS.</p>
        <h1 className="text-2xl font-bold">Frontend text here</h1>
        <p className="mt-4 text-lg">{message || "Loading..."} from backend</p>
      </div>
    </>
  )
}
