import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function Admin() {
  const navigate = useNavigate();
  const [course, setCourse] = useState({
    courseCode: "",
    courseName: "",
    hasLab: false,
    hasProject: false,
  });
  const [slot, setSlot] = useState({
    courseCode: "",
    slotName: "",
    faculties: "",
  });
  const [users, setUsers] = useState([]);
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    actionType: "", // "course" or "slot"
    password: "",
  });

  const handleCourseChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourse({
      ...course,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSlotChange = (e) => {
    setSlot({ ...slot, [e.target.name]: e.target.value });
  };

  const addCourse = () => {
    if (!course.courseCode || !course.courseName) {
      alert("Enter course code and name");
      return;
    }
    setPasswordModal({ isOpen: true, actionType: "course", password: "" });
  };

  const addSlot = () => {
    if (!slot.courseCode || !slot.slotName || !slot.faculties) {
      alert("Enter all fields");
      return;
    }
    setPasswordModal({ isOpen: true, actionType: "slot", password: "" });
  };

  const handleConfirmPassword = async () => {
    const password = passwordModal.password;
    if (!password) {
      alert("Please enter the password");
      return;
    }

    if (passwordModal.actionType === "course") {
      try {
        await API.post("/admin/course", course, {
          headers: { "X-Admin-Password": password },
        });
        alert("Course added");
        setCourse({ courseCode: "", courseName: "", hasLab: false, hasProject: false });
        setPasswordModal({ isOpen: false, actionType: "", password: "" });
      } catch (err) {
        alert(err.response?.data?.message || "Error adding course");
      }
    } else if (passwordModal.actionType === "slot") {
      try {
        const facultiesArray = slot.faculties.split(",").map((f) => f.trim());
        await API.post("/admin/slot", {
          ...slot,
          faculties: facultiesArray,
        }, {
          headers: { "X-Admin-Password": password },
        });
        alert("Slot added");
        setSlot({ courseCode: "", slotName: "", faculties: "" });
        setPasswordModal({ isOpen: false, actionType: "", password: "" });
      } catch (err) {
        alert(err.response?.data?.message || "Error adding slot");
      }
    }
  };

  return (
    <div className="tangy-wrapper">
      <div className="tangy-container">
        <header className="page-header">
          <h2>Admin <span className="highlight">Panel</span></h2>
          <button className="btn-retro-secondary" onClick={() => navigate("/result")}>
            View Results
          </button>
        </header>

        <div className="retro-grid">
          {/* Panel 1: Course */}
          <div className="retro-card">
            <div className="card-header-strip">NEW COURSE</div>
            <div className="card-body">
              <input
                className="retro-input"
                name="courseCode"
                placeholder="Course Code (e.g. CS101)"
                value={course.courseCode}
                onChange={handleCourseChange}
              />
              <input
                className="retro-input"
                name="courseName"
                placeholder="Course Name"
                value={course.courseName}
                onChange={handleCourseChange}
              />
              <div className="checkbox-row">
                <label className="retro-checkbox">
                  <input
                    type="checkbox"
                    name="hasLab"
                    checked={course.hasLab}
                    onChange={handleCourseChange}
                  />
                  <span>Has Lab</span>
                </label>
                <label className="retro-checkbox">
                  <input
                    type="checkbox"
                    name="hasProject"
                    checked={course.hasProject}
                    onChange={handleCourseChange}
                  />
                  <span>Has Project</span>
                </label>
              </div>
              <button className="btn-retro-primary full-width" onClick={addCourse}>
                Add Course
              </button>
            </div>
          </div>

          {/* Panel 2: Slot */}
          <div className="retro-card">
            <div className="card-header-strip color-alt">NEW SLOT</div>
            <div className="card-body">
              <input
                className="retro-input"
                name="courseCode"
                placeholder="Link Course Code"
                value={slot.courseCode}
                onChange={handleSlotChange}
              />
              <input
                className="retro-input"
                name="slotName"
                placeholder="Slot Name"
                value={slot.slotName}
                onChange={handleSlotChange}
              />
              <input
                className="retro-input"
                name="faculties"
                placeholder="Faculties (comma separated)"
                value={slot.faculties}
                onChange={handleSlotChange}
              />
              <button className="btn-retro-primary full-width" onClick={addSlot}>
                Add Slot
              </button>
            </div>
          </div>
        </div>
      </div>
      {passwordModal.isOpen && (
        <div className="pwd-modal-overlay">
          <div className="retro-card pwd-modal-content">
            <div className="card-header-strip color-dark">AUTHORIZATION REQUIRED</div>
            <div className="card-body">
              <p className="retro-text" style={{ marginTop: 0, marginBottom: "15px" }}>
                Please enter the admin password to authorize this action.
              </p>
              <input
                type="password"
                className="retro-input"
                placeholder="Enter Admin Password"
                value={passwordModal.password}
                onChange={(e) => setPasswordModal({ ...passwordModal, password: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmPassword();
                }}
                autoFocus
              />
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  className="btn-retro-primary"
                  style={{ flex: 1, padding: "10px" }}
                  onClick={handleConfirmPassword}
                >
                  Confirm
                </button>
                <button
                  className="btn-retro-secondary"
                  style={{ flex: 1, padding: "10px", boxShadow: "none" }}
                  onClick={() => setPasswordModal({ isOpen: false, actionType: "", password: "" })}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .pwd-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(34, 47, 62, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }
        .pwd-modal-content {
          width: 100%;
          max-width: 400px;
          box-shadow: 8px 8px 0px var(--dark-ink) !important;
        }
      `}</style>
    </div>
  );
}

export default Admin;