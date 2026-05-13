import { setUser, clearUser } from "@/features/auth/authSlice";
import { useMeQuery } from "@/features/auth/services";
import AppRouter from "@/routes/AppRouter";
import { useAppDispatch } from "@/store/hooks";
import { useEffect } from "react";

function App() {
  const dispatch = useAppDispatch();

  const { data, isSuccess, isError, isLoading } = useMeQuery();

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setUser(data));
    }

    if (isError) {
      dispatch(clearUser());
    }
  }, [isSuccess, isError, data, dispatch]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading application...</span>
      </div>
    );
  }

  return <AppRouter />;
}

export default App;