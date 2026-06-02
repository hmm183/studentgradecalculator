function NoData({ message }) {
  return (
    <div className="tangy-wrapper center-flex">
      <div className="retro-card">
        <div className="card-header-strip color-alt">NO DATA AVAILABLE</div>
        <div className="card-body" style={{ textAlign: "center" }}>
          <h2 style={{ marginTop: 0 }}>Oops!</h2>
          <p className="retro-subtitle">{message || "You have not registered yet for anything."}</p>
          <p>Please contact admin to get started.</p>
          <h5>If you registered anything ,wait for a min</h5>
        </div>
      </div>
    </div>
  );
}

export default NoData;
