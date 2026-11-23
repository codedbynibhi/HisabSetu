function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>HisaabSetu</h2>
      <p>Your business, in balance.</p>

      <nav>
        <a href="#dashboard">Dashboard</a>
        <a href="#customers">Customers</a>
        <a href="#transactions">Transactions</a>
      </nav>

      <div className="sidebar-footer">
        Simple. Clear. Reliable.
      </div>
    </aside>
  );
}

export default Sidebar;