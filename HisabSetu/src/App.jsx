import { formatMoney } from "./utils/formatMoney";
import { loadData } from "./utils/storage";
import { initialCustomers } from "./data/initialCustomers";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import "./App.css";




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
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [filterCustomer, setFilterCustomer] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("");

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

const totalCredit = customerTransactions
  .filter((transaction) => transaction.type === "credit")
  .reduce((total, transaction) => total + transaction.amount, 0);

const totalPayments = customerTransactions
  .filter((transaction) => transaction.type === "payment")
  .reduce((total, transaction) => total + transaction.amount, 0);

  const totalOutstanding = customers.reduce(
    (total, customer) => total + customer.balance,
    0
  );

  const totalCreditGiven = transactions
    .filter((transaction) => transaction.type === "credit")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalPaymentsReceived = transactions
    .filter((transaction) => transaction.type === "payment")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const today = new Date().toDateString();

  const todayCollections = transactions
    .filter(
      (transaction) =>
        transaction.type === "payment" &&
        new Date(transaction.date).toDateString() === today
    )
    .reduce((total, transaction) => total + transaction.amount, 0);

  const monthlyCollections = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    const monthDate = new Date(
      date.getFullYear(),
      date.getMonth() - i,
      1
    );

    const total = transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date);

        return (
          transaction.type === "payment" &&
          transactionDate.getMonth() === monthDate.getMonth() &&
          transactionDate.getFullYear() === monthDate.getFullYear()
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      month: monthDate.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      }),
      total,
    };
  }).reverse();

  const maxMonthlyCollection = Math.max(
    ...monthlyCollections.map((item) => item.total),
    1
  );

  function addCustomer(event) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter a customer name.");
      return;
    }

    if (editingCustomerId !== null) {
      setCustomers((previous) =>
        previous.map((customer) =>
          customer.id === editingCustomerId
            ? {
                ...customer,
                name: name.trim(),
                phone: phone.trim(),
              }
            : customer
        )
      );

      setEditingCustomerId(null);
      setName("");
      setPhone("");
      setMessage("Customer updated successfully!");
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

  function deleteCustomer(id) {
    const confirmDelete = window.confirm(
      "Are you sure? This will also delete all transactions of this customer."
    );

    if (!confirmDelete) {
      return;
    }

    setCustomers((previous) =>
      previous.filter((customer) => customer.id !== id)
    );

    setTransactions((previous) =>
      previous.filter((transaction) => transaction.customerId !== id)
    );

    if (selectedCustomerId === id) {
      setSelectedCustomerId(null);
    }

    if (editingCustomerId === id) {
      setEditingCustomerId(null);
      setName("");
      setPhone("");
    }

    if (Number(customerId) === id) {
      const remainingCustomer = customers.find(
        (customer) => customer.id !== id
      );

      setCustomerId(
        remainingCustomer ? String(remainingCustomer.id) : ""
      );
    }

    setMessage("Customer deleted successfully!");
  }

  function recordTransaction(event) {
    event.preventDefault();

    const value = Number(amount);

    const newCustomer = customers.find(
      (customer) => customer.id === Number(customerId)
    );

    if (!newCustomer) {
      setMessage("Please select a customer.");
      return;
    }

    if (!Number.isFinite(value) || value <= 0) {
      setMessage("Enter a valid amount greater than zero.");
      return;
    }

    const oldTransaction = transactions.find(
      (transaction) => transaction.id === editingTransactionId
    );

    const oldEffect = oldTransaction
      ? oldTransaction.type === "credit"
        ? oldTransaction.amount
        : -oldTransaction.amount
      : 0;

    const oldCustomer = oldTransaction
      ? customers.find(
          (customer) => customer.id === oldTransaction.customerId
        )
      : null;

    const availableBalance =
      newCustomer.balance -
      (oldTransaction && oldTransaction.customerId === newCustomer.id
        ? oldEffect
        : 0);

    if (type === "payment" && value > availableBalance) {
      setMessage("Payment cannot exceed the outstanding balance.");
      return;
    }

    const transaction = {
      id: editingTransactionId || crypto.randomUUID(),
      customerId: newCustomer.id,
      customerName: newCustomer.name,
      type,
      amount: value,
      note: note.trim(),
      date: oldTransaction ? oldTransaction.date : new Date().toISOString(),
    };

    const newEffect = type === "credit" ? value : -value;

    setCustomers((previous) =>
      previous.map((customer) => {
        let balanceChange = 0;

        if (oldTransaction && customer.id === oldTransaction.customerId) {
          balanceChange -= oldEffect;
        }

        if (customer.id === newCustomer.id) {
          balanceChange += newEffect;
        }

        return balanceChange !== 0
          ? { ...customer, balance: customer.balance + balanceChange }
          : customer;
      })
    );

    if (editingTransactionId !== null) {
      setTransactions((previous) =>
        previous.map((item) =>
          item.id === editingTransactionId ? transaction : item
        )
      );
      setMessage("Transaction updated successfully!");
    } else {
      setTransactions((previous) => [transaction, ...previous]);
      setMessage("Transaction recorded successfully!");
    }

    setEditingTransactionId(null);
    setAmount("");
    setNote("");
  }

 function editTransaction(transaction) {
   setEditingTransactionId(transaction.id);
   setCustomerId(String(transaction.customerId));
   setType(transaction.type);
   setAmount(String(transaction.amount));
   setNote(transaction.note || "");
   setMessage("Editing transaction. Make your changes below.");
 }

 function deleteTransaction(id) {
   const confirmDelete = window.confirm(
     "Are you sure you want to delete this transaction?"
   );

   if (!confirmDelete) {
     return;
   }

   const transactionToDelete = transactions.find(
     (transaction) => transaction.id === id
   );

   if (!transactionToDelete) {
     return;
   }

   const balanceChange =
     transactionToDelete.type === "credit"
       ? -transactionToDelete.amount
       : transactionToDelete.amount;

   setCustomers((previous) =>
     previous.map((customer) =>
       customer.id === transactionToDelete.customerId
         ? {
             ...customer,
             balance: customer.balance + balanceChange,
           }
         : customer
     )
   );

   setTransactions((previous) =>
     previous.filter((transaction) => transaction.id !== id)
   );

   if (editingTransactionId === id) {
     setEditingTransactionId(null);
     setAmount("");
     setNote("");
   }

   setMessage("Transaction deleted successfully!");
 }

 const filteredTransactions = transactions.filter((transaction) => {
   const matchesCustomer =
     filterCustomer === "all" ||
     transaction.customerId === Number(filterCustomer);

   const matchesType =
     filterType === "all" ||
     transaction.type === filterType;

   const matchesDate =
     filterDate === "" ||
     new Date(transaction.date).toLocaleDateString("en-CA") === filterDate;

   return matchesCustomer && matchesType && matchesDate;
 });

const filteredCustomers = customers.filter((customer) =>
  customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  customer.phone.includes(searchTerm)
);
  return (
    <div className="app">
       <Sidebar />

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

          <article className="stat-card">
            <span>Total Credit Given</span>
            <h2>{formatMoney(totalCreditGiven)}</h2>
            <p>Total udhaar recorded</p>
          </article>

          <article className="stat-card">
            <span>Total Payments Received</span>
            <h2>{formatMoney(totalPaymentsReceived)}</h2>
            <p>Total money collected</p>
          </article>
        </section>

        <section className="panel">
          <h2>Monthly Collections</h2>
          <p className="muted">
            Payment collections over the last 6 months.
          </p>

          <div className="monthly-chart">
            {monthlyCollections.map((item) => (
              <div className="month-bar" key={item.month}>
                <strong>{formatMoney(item.total)}</strong>

                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(item.total / maxMonthlyCollection) * 100}%`,
                    }}
                  />
                </div>

                <span>{item.month}</span>
              </div>
            ))}
          </div>
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
            {editingCustomerId !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingCustomerId(null);
                  setName("");
                  setPhone("");
                }}
              >
                Cancel
              </button>
            )}

            <button className="primary-btn" type="submit">
              {editingCustomerId !== null
                ? "Update Customer"
                : "+ Add customer"}
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
                  <th>Actions</th>
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
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCustomerId(customer.id);
                          setName(customer.name);
                          setPhone(customer.phone);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCustomer(customer.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan="4">No customers yet. Add one above.</td>
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
              {editingTransactionId !== null
                ? "Update transaction"
                : "Save transaction"}
            </button>

            {editingTransactionId !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingTransactionId(null);
                  setAmount("");
                  setNote("");
                  setMessage("");
                }}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </section>

{selectedCustomer && (
  <section className="panel">
    <h2>{selectedCustomer.name}'s Ledger</h2>

    <div className="ledger-summary">
      <div className="ledger-stat">
        <span>Total Credit</span>
        <strong>{formatMoney(totalCredit)}</strong>
      </div>

      <div className="ledger-stat">
        <span>Total Payments</span>
        <strong>{formatMoney(totalPayments)}</strong>
      </div>

      <div className="ledger-stat">
        <span>Outstanding</span>
        <strong>{formatMoney(selectedCustomer.balance)}</strong>
      </div>
    </div>

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

          <div className="transaction-filters">
            <select
              value={filterCustomer}
              onChange={(event) => setFilterCustomer(event.target.value)}
            >
              <option value="all">All Customers</option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
            >
              <option value="all">All Types</option>
              <option value="credit">Credit</option>
              <option value="payment">Payment</option>
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={(event) => setFilterDate(event.target.value)}
            />

            <button
              type="button"
              onClick={() => {
                setFilterCustomer("all");
                setFilterType("all");
                setFilterDate("");
              }}
            >
              Clear Filters
            </button>
          </div>

          {filteredTransactions.length === 0 ? (
            <p className="empty">
              No transactions found. Try changing your filters.
            </p>
          ) : (
            <div className="transaction-list">
              {filteredTransactions.map((transaction) => (
                <article className="transaction-row" key={transaction.id}>
                  <div>
                    <strong>{transaction.customerName}</strong>
                    <p className="muted">
                      {transaction.note || "No note"} ·{" "}
                      {new Date(transaction.date).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
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

                    <button
                      type="button"
                      onClick={() => editTransaction(transaction)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTransaction(transaction.id)}
                    >
                      Delete
                    </button>
                  </div>
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
