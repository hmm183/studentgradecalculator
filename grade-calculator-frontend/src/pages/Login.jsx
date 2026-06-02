import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");
    const error = params.get("error");

    if (token && email) {
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      navigate("/dashboard");
    } else if (error) {
      alert(`Login failed: ${error}`);
      // Clear query params to clean up the URL
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    const apiBaseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://grade-calculator-pjm2.onrender.com" : "http://localhost:5000");
    window.location.href = `${apiBaseURL}/auth/google`;
  };

  return (
    <div className="tangy-wrapper" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div className="retro-card small-card" style={{ maxHeight: '150px', overflow: 'auto' }}>
        <div className="card-header-strip color-alt">IMPORTANT</div>
        <div className="card-body" style={{ padding: '1rem' }}>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            <li>• Access is strictly limited to college student/faculty emails (@vitapstudent.ac.in or @vitap.ac.in).</li>
            <li>• Predict grades and calculate your targets securely with Google Authentication.</li>
            <li>• Ask MOD if any subject/faculty is missing.</li>
            <li>• Made for students by students.</li>
          </ul>
        </div>
      </div>
      <div className="retro-card small-card">
        <div className="card-header-strip">LOGIN</div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <p className="retro-text" style={{ textAlign: 'center' }}>Sign in to access your Grade Calculator Dashboard</p>

          <button
            className="btn-retro-primary full-width"
            onClick={handleGoogleLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '12px',
              cursor: 'pointer'
            }}
          >
            <img
              src="https://i.postimg.cc/3NGKBY4V/google-icon.png"
              alt="Google"
              style={{ width: '20px', height: '20px' }}
            />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;