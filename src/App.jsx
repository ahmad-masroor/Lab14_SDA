import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// =======================
// SIMPLE STRATEGY PATTERN
// =======================
const strategies = {
  "50-30-20": (income) => ({
    needs: income * 0.5,
    wants: income * 0.3,
    savings: income * 0.2
  }),
  "zero-based": (income, expenses) => ({
    expenses,
    remaining: income - expenses
  })
};

// =======================
// CATEGORY LOGIC
// =======================
const KEYWORDS = {
  food: ["restaurant", "pizza", "kfc"],
  transport: ["uber", "fuel"],
  bills: ["bill", "ptcl"],
  shopping: ["daraz"],
};

const categorize = (desc) => {
  desc = desc.toLowerCase();
  for (let k in KEYWORDS) {
    if (KEYWORDS[k].some(w => desc.includes(w))) return k;
  }
  return "other";
};

// =======================
// SAMPLE DATA
// =======================
const SAMPLE = [
  { id: 1, desc: "Salary", amount: 85000 },
  { id: 2, desc: "KFC", amount: -1200 },
  { id: 3, desc: "Fuel", amount: -3000 },
];

// =======================
// MAIN APP
// =======================
export default function App() {
  const [transactions, setTransactions] = useState(SAMPLE);
  const [strategy, setStrategy] = useState("50-30-20");

  // =======================
  // CENTRALIZED LOGIC
  // =======================
  const data = useMemo(() => {
    const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

    const categories = {};
    transactions.forEach(t => {
      if (t.amount < 0) {
        const cat = categorize(t.desc);
        categories[cat] = (categories[cat] || 0) + Math.abs(t.amount);
      }
    });

    return { income, expenses, savings: income - expenses, categories };
  }, [transactions]);

  const analysis = strategies[strategy](data.income, data.expenses);

  // =======================
  // LOCAL "AI" RECOMMENDER
  // =======================
  const recommendations = useMemo(() => {
    const recs = [];

    if (data.expenses > data.income * 0.8) {
      recs.push("⚠️ Your expenses are too high. Reduce unnecessary spending.");
    }
    if (data.savings < data.income * 0.2) {
      recs.push("💡 Try to save at least 20% of your income.");
    }
    if (data.categories.food > 5000) {
      recs.push("🍔 High food spending detected. Consider cooking more.");
    }

    if (recs.length === 0) recs.push("✅ Your finances look healthy!");

    return recs;
  }, [data]);

  // =======================
  // ADD TRANSACTION
  // =======================
  const addTransaction = () => {
    const desc = prompt("Enter description:");
    const amt = parseInt(prompt("Enter amount (+income, -expense):"));

    if (!desc || isNaN(amt)) return;

    setTransactions(prev => [...prev, {
      id: Date.now(),
      desc,
      amount: amt
    }]);
  };

  // =======================
  // UI
  // =======================
  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20, fontFamily: "sans-serif" }}>
      <h2>💰 Finance App (Simplified)</h2>

      {/* SUMMARY */}
      <p><b>Income:</b> ₨{data.income}</p>
      <p><b>Expenses:</b> ₨{data.expenses}</p>
      <p><b>Savings:</b> ₨{data.savings}</p>

      {/* STRATEGY */}
      <select value={strategy} onChange={e => setStrategy(e.target.value)}>
        <option value="50-30-20">50-30-20</option>
        <option value="zero-based">Zero-Based</option>
      </select>

      <pre>{JSON.stringify(analysis, null, 2)}</pre>

      {/* CHART */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={[
          { name: "Income", value: data.income },
          { name: "Expenses", value: data.expenses },
          { name: "Savings", value: data.savings },
        ]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line dataKey="value" stroke="#3B82F6" />
        </LineChart>
      </ResponsiveContainer>

      {/* TRANSACTIONS */}
      <h3>Transactions</h3>
      {transactions.map(t => (
        <div key={t.id}>
          {t.desc} → {t.amount > 0 ? "+" : ""}{t.amount}
        </div>
      ))}

      <button onClick={addTransaction}>+ Add</button>

      {/* RECOMMENDATIONS */}
      <h3>Recommendations</h3>
      {recommendations.map((r, i) => <p key={i}>{r}</p>)}
    </div>
  );
}