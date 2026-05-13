import { setUser, clearUser } from "@/features/auth/authSlice";
import { useMeQuery } from "@/features/auth/services";
import AppRouter from "@/routes/AppRouter";
import LoadingOverlay from "@/components/loading/LoadingOverlay";
import PageLoader from "@/components/loading/PageLoader";
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
      <>
        <LoadingOverlay />
        <PageLoader label="Loading application..." />
      </>
    );
  }

  return (
    <>
      <LoadingOverlay />
      <AppRouter />
    </>
  );
}

export default App;