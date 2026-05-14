import { Link, useNavigate } from "react-router";
import { Button } from "./components/ui/button";

function App() {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-[#1e1f3b] to-[#2d3250] text-white">
      <Hero />
    </div>
  );
}

export default App;

function Hero() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto mt-16 flex w-[90%] flex-1 flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        A Notion like Note Editor
      </h1>

      <p className="mt-3 max-w-md text-white/70">Create, edit and share</p>

      <Link to="/dashboard" className="mt-8">
        <Button className="cursor-pointer px-6 py-2 text-base ring-white hover:ring-2">
          Try now
        </Button>
      </Link>

      <div className="my-6">
        <span
          onClick={() => navigate("/signup")}
          className="cursor-pointer text-sm hover:underline"
        >
          Register
        </span>
      </div>
    </main>
  );
}
