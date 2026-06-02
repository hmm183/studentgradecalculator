import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MarksFlow from "./pages/MarksFlow.jsx";
import Result from "./pages/Result.jsx";
import UserResult from "./pages/UserResult.jsx";
import Feedback from "./pages/Feedback.jsx";
import Admin from "./pages/Admin.jsx";
import PreviousGradeRanges from "./pages/PreviousGradeRanges.jsx";
import NoData from "./pages/NoData.jsx";
import PrivateRoute, { AdminRoute } from "./components/PrivateRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/marks-flow"
          element={
            <PrivateRoute>
              <MarksFlow />
            </PrivateRoute>
          }
        />
        <Route
          path="/result"
          element={
            <AdminRoute>
              <Result />
            </AdminRoute>
          }
        />
        <Route
          path="/user-result"
          element={
            <PrivateRoute>
              <UserResult />
            </PrivateRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <PrivateRoute>
              <Feedback />
            </PrivateRoute>
          }
        />
        <Route
          path="/previous-grade-ranges"
          element={
            <PrivateRoute>
              <PreviousGradeRanges />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route path="*" element={<NoData />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
