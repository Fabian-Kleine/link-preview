import { LinkPreviewGenerator } from "@/components/link-preview-generator";
import { Toaster } from "./components/ui/sonner";

export function App() {
  return (
    <>
      <LinkPreviewGenerator />
      <Toaster richColors />
    </>
  );
}

export default App;