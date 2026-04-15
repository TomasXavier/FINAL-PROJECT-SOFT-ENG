import "./SystemArchitecture.css";

function Box({ title, children }) {
  return (
    <div className="box">
      <h3>{title}</h3>
      <div className="box-content">{children}</div>
    </div>
  );
}

function SystemArchitecture() {
  return (
    <div className="architecture-container">
      <h1>Web-Based Ordering System for Tire Supply</h1>

      <div className="architecture-grid">

        {/* USERS */}
        <div className="column">
          <Box title="Users">
            <p>Customers</p>
            <p>Admin</p>
          </Box>
        </div>

        {/* WEB APPLICATION */}
        <div className="column">
          <Box title="Web Application (React)">
            <p>User Interface</p>
            <p>Order Management</p>
            <p>Product Catalog</p>
            <p>Authentication (Login/Register)</p>
          </Box>
        </div>

        {/* BACKEND */}
        <div className="column">
          <Box title="Backend Server & Database">
            <p>REST API</p>
            <p>Order Processing</p>
            <p>Inventory Management</p>
            <p>Reports Generation</p>
          </Box>
        </div>

      </div>

      {/* DATABASE */}
      <div className="database-section">
        <div className="database-box">
          <h3>MySQL Database</h3>
          <p>Customers</p>
          <p>Orders</p>
          <p>Products</p>
          <p>Inventory</p>
        </div>
      </div>

      {/* FLOW LABELS */}
      <div className="flow-labels">
        <span>User Requests →</span>
        <span>← Responses</span>
        <span>API Calls ↔</span>
        <span>Database Queries ↓</span>
      </div>

    </div>
  );
}

export default SystemArchitecture;