
import './App.css';

const customers = [
  { id: 1, name: 'Aman Sharma', detail: 'Last payment: Today', balance: 1250 },
  { id: 2, name: 'Priya Verma', detail: 'Last payment: Yesterday', balance: 800 },
  { id: 3, name: 'Rahul Singh', detail: 'Last payment: 12 Oct', balance: 2400 },
];

function App() {
  const totalCredit = customers.reduce(
    (sum, customer) => sum + customer.balance,
    0
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>HisaabSetu<span>.</span></h2>
        <p className="nav active">Dashboard</p>
        <p className="nav">Customers</p>
        <p className="nav">Transactions</p>
        <p className="nav">Reports</p>
        <div className="sidebar-bottom">Your business, organized.</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR BUSINESS OVERVIEW</p>
            <h1>Good morning 👋</h1>
            <p className="muted">Here's what's happening with your hisaab.</p>
          </div>
          <button className="profile">Shop Owner</button>
        </header>

        <section className="stats">
          <div className="stat-card">
            <p>Total customer credit</p>
            <h2>₹{totalCredit.toLocaleString('en-IN')}</h2>
            <span>Money customers owe you</span>
          </div>
          <div className="stat-card">
            <p>Total customers</p>
            <h2>{customers.length}</h2>
            <span>Customers in your ledger</span>
          </div>
          <div className="stat-card">
            <p>Today's collections</p>
            <h2>₹0</h2>
            <span>Payments recorded today</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Customer ledger</h2>
              <p className="muted">A quick look at outstanding balances</p>
            </div>
            <button className="secondary-button">View all</button>
          </div>

          <div className="customer-list">
            {customers.map((customer) => (
              <div className="customer" key={customer.id}>
                <div className="avatar">
                  {customer.name.charAt(0)}
                </div>
                <div className="customer-info">
                  <strong>{customer.name}</strong>
                  <span>{customer.detail}</span>
                </div>
                <div className="balance">
                  <strong>₹{customer.balance.toLocaleString('en-IN')}</strong>
                  <span>Due</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="footer-note">
          HisaabSetu · Simple records. Clear hisaab.
        </p>
      </main>
    </div>
  );
}

export default App;
