import EditorPanel from "./_components/EditorPanel";
import Header from "./_components/Header";
import OutputPanel from "./_components/OutputPanel";
import Terminal from "./_components/Terminal";
import Sidebar from "./_components/Sidebar";
import FileExplorer from "./_components/FileExplorer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-[1800px] w-full mx-auto p-4 flex flex-col gap-4 flex-1">
        <Header />

        <div className="flex flex-1 gap-4 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-auto">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <EditorPanel />
            </div>
            <div className="lg:col-span-4">
              <OutputPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
