import AppRouter from "@/routes/AppRouter";
import LoadingOverlay from "@/components/loading/LoadingOverlay";

function App() {
  return (
    <>
      <LoadingOverlay />
      <AppRouter />
    </>
  );
}

export default App;