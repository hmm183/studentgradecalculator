import { useNavigate } from "react-router-dom";

const decodeToken = (token) => {
  try {
    const base64UrlDecode = (str) => {
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      while (str.length % 4) {
        str += '=';
      }
      return atob(str);
    };
    const payload = JSON.parse(base64UrlDecode(token.split(".")[1]));
    return payload;
  } catch (e) {
    return null;
  }
};

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decoded = token ? decodeToken(token) : null;
  const isAdmin = decoded && decoded.role === "admin";

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="tangy-wrapper center-flex">
      <div className="retro-card dashboard-card">
        <div className="card-header-strip">DASHBOARD</div>
        <div className="card-body" style={{ textAlign: "center" }}>
          <h2 style={{marginTop: 0}}>Welcome Back!</h2>
          <p className="retro-subtitle">Grade Calculator System</p>

          <div className="dashboard-actions">
            <button className="btn-tile" onClick={() => navigate("/marks-flow")}>
              ✏️ Enter Marks
            </button>
            <button className="btn-tile" onClick={() => navigate("/user-result")}>
              📊 View Result
            </button>
            <button className="btn-tile" onClick={() => navigate("/previous-grade-ranges")}>
              📚 Previous Grade Ranges
            </button>
            <button className="btn-tile" onClick={() => navigate("/feedback")}>
              💬 Feedback
            </button>
            {isAdmin && (
              <button className="btn-tile admin-tile" style={{ gridColumn: "span 2" }} onClick={() => navigate("/admin")}>
                ⚙️ Admin Panel
              </button>
            )}
          </div>

          <div className="logout-wrapper">
            <button
              onClick={logout}
              className="btn-retro-danger"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;