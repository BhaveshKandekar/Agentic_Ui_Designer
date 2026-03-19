import { Navbar } from "@/components/navbar";
import { MainUI } from "@/components/main-ui";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <MainUI />
    </div>
  );
}
