import { Navigate } from "react-router-dom";

const decodeToken = (token) => {
  try {
    const base64UrlDecode = (str) => {
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      while (str.length % 4) {
        str += '=';
      }
      return atob(str);
    };
    const payload = JSON.parse(base64UrlDecode(token.split('.')[1]));
    return payload;
  } catch (e) {
    return null;
  }
};

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" />;

  const decoded = decodeToken(token);
  if (!decoded) return <Navigate to="/" />;

  if (role && decoded.role !== role) return <Navigate to="/dashboard" />;

  return children;
};

export const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  const decoded = decodeToken(token);
  if (!decoded || decoded.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
