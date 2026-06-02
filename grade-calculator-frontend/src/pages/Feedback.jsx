import { useState } from "react";
import axios from "../api/axios";

function Feedback() {
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");

  const submitFeedback = async () => {
    if (!feedback.trim()) {
      setMessage("Please enter feedback");
      return;
    }
    try {
      const response = await axios.post("/user/feedback", { feedback });

      setMessage(response.data.message);
      setFeedback("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Error submitting feedback");
    }
  };

  return (
    <div className="tangy-wrapper center-flex">
      <div className="retro-card small-card">
        <div className="card-header-strip color-alt">FEEDBACK</div>
        <div className="card-body">
          <p className="retro-text">Any faculty or slot missing ,write it here with full details or any changes needed </p>
          <textarea
            className="retro-textarea"
            placeholder="Type your feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button className="btn-retro-primary full-width" onClick={submitFeedback}>
            Submit Feedback
          </button>
          {message && <p className="retro-text" style={{ color: message.includes("Error") ? "red" : "green" }}>{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default Feedback;