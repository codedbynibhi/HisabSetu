

import { useEffect, useState } from "react";
import "./App.css";

const initialCustomers = [
  { id: 1, name: "Aman Sharma", phone: "", balance: 1250 },
  { id: 2, name: "Priya Verma", phone: "", balance: 800 },
  { id: 3, name: "Rahul Singh", phone: "", balance: 2400 },
];

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [customers, setCustomers] = useState(() =>
    loadData("hs-customers", initialCustomers)
  );

  const [transactions, setTransactions] = useState(() =>
    loadData("hs-transactions", [])
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [customerId, setCustomerId] = useState("1");
  const [type, setType] = useState("credit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  useEffect(() => {
    localStorage.setItem("hs-customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("hs-transactions", JSON.stringify(transactions));
  }, [transactions]);
const selectedCustomer = customers.find(
  (customer) => customer.id === selectedCustomerId
);

const customerTransactions = transactions.filter(
  (transaction) => transaction.customerId === selectedCustomerId
);
  const totalOutstanding = customers.reduce(
    (total, customer) => total + customer.balance,
    0
  );

  const today = new Date().toDateString();

  const todayCollections = transactions
    .filter(
      (transaction) =>
        transaction.type === "payment" &&
        new Date(transaction.date).toDateString() === today
    )
    .reduce((total, transaction) => total + transaction.amount, 0);

  function addCustomer(event) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter a customer name.");
      return;
    }

    const customer = {
      id: Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      balance: 0,
    };

    setCustomers((previous) => [...previous, customer]);
    setCustomerId(String(customer.id));
    setName("");
    setPhone("");
    setMessage("Customer added successfully!");
  }

  function recordTransaction(event) {
    event.preventDefault();

    const value = Number(amount);
    const selectedCustomer = customers.find(
      (customer) => customer.id === Number(customerId)
    );

    if (!selectedCustomer) {
      setMessage("Please select a customer.");
      return;
    }

    if (!Number.isFinite(value) || value <= 0) {
      setMessage("Enter a valid amount greater than zero.");
      return;
    }

    if (type === "payment" && value > selectedCustomer.balance) {
      setMessage("Payment cannot exceed the outstanding balance.");
      return;
    }

    const transaction = {
      id: crypto.randomUUID(),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      type,
      amount: value,
      note: note.trim(),
      date: new Date().toISOString(),
    };

    setCustomers((previous) =>
      previous.map((customer) =>
        customer.id === selectedCustomer.id
          ? {
              ...customer,
              balance:
                customer.balance +
                (type === "credit" ? value : -value),
            }
          : customer
      )
    );

    setTransactions((previous) => [transaction, ...previous]);
    setAmount("");
    setNote("");
    setMessage("Transaction recorded successfully!");
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  }
const filteredCustomers = customers.filter((customer) =>
  customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  customer.phone.includes(searchTerm)
);
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>HisaabSetu</h2>
        <p>Your business, in balance.</p>

        <nav>
          <a href="#dashboard">Dashboard</a>
          <a href="#customers">Customers</a>
          <a href="#transactions">Transactions</a>
        </nav>

        <div className="sidebar-footer">Simple. Clear. Reliable.</div>
      </aside>

      <main className="main" id="dashboard">
        <header className="page-header">
          <div>
            <p className="eyebrow">BUSINESS OVERVIEW</p>
            <h1>Dashboard</h1>
            <p className="muted">
              Welcome back! Here is your business summary.
            </p>
          </div>
          <span className="date">
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </header>

        <section className="stats">
          <article className="stat-card">
            <span>Total customers</span>
            <h2>{customers.length}</h2>
            <p>Customers in your ledger</p>
          </article>

          <article className="stat-card">
            <span>Total outstanding</span>
            <h2>{formatMoney(totalOutstanding)}</h2>
            <p>Amount customers still owe</p>
          </article>

          <article className="stat-card">
            <span>Today's collections</span>
            <h2>{formatMoney(todayCollections)}</h2>
            <p>Payments recorded today</p>
          </article>
        </section>

        {message && (
          <div className="message" role="status">
            {message}
            <button
              className="dismiss"
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        <section className="panel" id="customers">
          <div className="section-heading">
            <div>
              <h2>Customers</h2>
              <p className="muted">Manage your customer ledger.</p>
            </div>
          </div>

          <form className="customer-form" onSubmit={addCustomer}>
            <input
              placeholder="Customer name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <input
              placeholder="Phone (optional)"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <button className="primary-btn" type="submit">
              + Add customer
            </button>
          </form>
          <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
/>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                    <button
                    type="button"
                    onClick={() => setSelectedCustomerId(customer.id)}
  >
                  {customer.name}
                  </button>
                  </td>
                    <td>{customer.phone || "—"}</td>
                    <td className="money">
                      {formatMoney(customer.balance)}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan="3">No customers yet. Add one above.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel" id="transactions">
          <h2>Record a transaction</h2>
          <p className="muted">
            Credit increases the balance; a payment decreases it.
          </p>

          <form className="transaction-form" onSubmit={recordTransaction}>
            <label>
              Customer
              <select
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                required
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Transaction type
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option value="credit">Credit / Udhaar</option>
                <option value="payment">Payment received</option>
              </select>
            </label>

            <label>
              Amount (₹)
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 500"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </label>

            <label>
              Note (optional)
              <input
                placeholder="e.g. Grocery purchase"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>

            <button
              className="primary-btn"
              type="submit"
              disabled={customers.length === 0}
            >
              Save transaction
            </button>
          </form>
        </section>

{selectedCustomer && (
  <section className="panel">
    <h2>{selectedCustomer.name}'s Ledger</h2>

    <p className="muted">
      Outstanding: {formatMoney(selectedCustomer.balance)}
    </p>

    {customerTransactions.length === 0 ? (
      <p>No transactions for this customer yet.</p>
    ) : (
      customerTransactions.map((transaction) => (
        <article className="transaction-row" key={transaction.id}>
          <div>
            <strong>{transaction.note || "No note"}</strong>
            <p className="muted">
              {new Date(transaction.date).toLocaleString("en-IN")}
            </p>
          </div>

          <strong
            className={
              transaction.type === "payment" ? "payment" : "credit"
            }
          >
            {transaction.type === "payment" ? "−" : "+"}
            {formatMoney(transaction.amount)}
          </strong>
        </article>
      ))
    )}

    <button
      type="button"
      onClick={() => setSelectedCustomerId(null)}
    >
      Close ledger
    </button>
  </section>
)}

        <section className="panel">
          <h2>Recent transactions</h2>

          {transactions.length === 0 ? (
            <p className="empty">
              No transactions yet. Record your first transaction above.
            </p>
          ) : (
            <div className="transaction-list">
              {transactions.map((transaction) => (
                <article className="transaction-row" key={transaction.id}>
                  <div>
                    <strong>{transaction.customerName}</strong>
                    <p className="muted">
                      {transaction.note || "No note"} ·{" "}
                      {new Date(transaction.date).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <strong
                    className={
                      transaction.type === "payment"
                        ? "payment"
                        : "credit"
                    }
                  >
                    {transaction.type === "payment" ? "−" : "+"}
                    {formatMoney(transaction.amount)}
                  </strong>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="footer">
          HisaabSetu · Your records, organised.
        </footer>
      </main>
    </div>
  );
}

export default App;
