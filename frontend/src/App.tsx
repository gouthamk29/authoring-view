import { useState } from "react";
import { Button } from "./components/Button";
import { Link } from "react-router";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div
      className="flex h-full min-h-dvh flex-col"
      style={{
        background: "linear-gradient(to bottom right, #1e1f3b, #2d3250)",
      }}
    >
      <nav className="my-4 flex w-9/10 items-center justify-between self-center rounded-xl bg-white/80 px-4 py-3">
        <div>Logo</div>
        <ul className="flex gap-2">
          <NavButton name="Login" link="/login" />
          <NavButton name="Theme" />
        </ul>
      </nav>

      <Hero />
    </div>
  );
}

export default App;

function NavButton({ name, link = "" }) {
  return (
    <li className="cursor-pointer rounded-md bg-white/50 px-2 py-1 ring-1 ring-gray-500 hover:bg-white/80 active:bg-white/90">
      <Link to={link}>{name}</Link>
    </li>
  );
}

export function Hero() {
  return (
    <main className="my-8 flex min-h-100 w-8/10 flex-col self-center rounded-md bg-white/60 py-4 shadow-2xl shadow-black/60">
      <h1 className="m-4 text-3xl font-semibold text-indigo-700/90">
        An Collabrative Note Editor{" "}
      </h1>
      <div className="mt-auto flex justify-center">
        <Button>Try now</Button>
      </div>
    </main>
  );
}
