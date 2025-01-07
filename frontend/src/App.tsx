import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { Header } from "./components/Header";
import { AppRoutes } from "./routes/AppRoutes";
import { Footer } from "./components/Footer";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./store/store";
import { checkAndRestoreUser } from "./utils/persistentAuth";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(checkAndRestoreUser());
    const interval = setInterval(() => {
      dispatch(checkAndRestoreUser());
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <AppRoutes />
        </main>
        <Footer />
      </div>
      <Toaster />
    </Router>
  );
}

export default App;
