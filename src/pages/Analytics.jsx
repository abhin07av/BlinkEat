import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import OwnerNavBar from "../components/Ownernav";
import PageTransition from "../components/PageTransition";

const CHART_COLORS = ["#FF6B35", "#2EC4B6", "#58A6FF", "#3FB950", "#D29922", "#F85149", "#BC8CF2", "#FF9A8B"];

const Analytics = () => {
  const firebase = useFirebase();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!firebase.user) return;

      try {
        const restaurantId = firebase.user.uid;
        const historyRef = collection(firebase.db, "restaurants", restaurantId, "orderHistory");
        const snapshot = await getDocs(historyRef);

        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setHistory(list);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order history:", error);
        setLoading(false);
      }
    };

    fetchHistory();
  }, [firebase.user, firebase.db]);

  // Derive analytics
  const totalRevenue = history.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
  const totalOrders = history.length;
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : 0;

  // Daily revenue (last 7 days)
  const getDailyRevenue = () => {
    const days = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
      days[key] = 0;
    }

    history.forEach((order) => {
      if (order.timestamp?.seconds) {
        const date = new Date(order.timestamp.seconds * 1000);
        const key = date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
        if (days[key] !== undefined) {
          days[key] += parseFloat(order.totalAmount || 0);
        }
      }
    });

    return Object.entries(days).map(([name, revenue]) => ({ name, revenue: Math.round(revenue) }));
  };

  // Top selling items
  const getTopItems = () => {
    const itemCounts = {};
    history.forEach((order) => {
      order.items?.forEach((item) => {
        if (!itemCounts[item.name]) {
          itemCounts[item.name] = { name: item.name, count: 0, revenue: 0 };
        }
        itemCounts[item.name].count += item.quantity || 1;
        itemCounts[item.name].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    return Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  };

  // Orders by time of day
  const getOrdersByHour = () => {
    const hours = {};
    for (let i = 0; i < 24; i++) {
      hours[i] = 0;
    }
    history.forEach((order) => {
      if (order.timestamp?.seconds) {
        const h = new Date(order.timestamp.seconds * 1000).getHours();
        hours[h]++;
      }
    });

    return Object.entries(hours)
      .map(([hour, orders]) => ({
        name: `${hour}:00`,
        orders,
      }))
      .filter((d) => d.orders > 0 || parseInt(d.name) % 3 === 0);
  };

  const dailyRevenue = getDailyRevenue();
  const topItems = getTopItems();
  const ordersByHour = getOrdersByHour();

  const customTooltipStyle = {
    backgroundColor: "var(--color-bg-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "var(--color-text-primary)",
    fontSize: "13px",
  };

  return (
    <PageTransition>
      <div className="dashboard-page">
        <OwnerNavBar />

        <div className="container py-xl">
          <h1 className="text-3xl font-extrabold text-center mb-sm">
            <span className="gradient-text">📊 Analytics</span>
          </h1>
          <p className="text-center text-secondary mb-xl">
            Insights from your order history
          </p>

          {loading ? (
            <div className="text-center py-3xl">
              <span className="spinner" style={{ margin: "0 auto" }} />
              <p className="text-secondary mt-md">Crunching numbers...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-3xl">
              <p style={{ fontSize: "60px", opacity: 0.3, marginBottom: "16px" }}>📊</p>
              <p className="text-xl font-semibold text-secondary">No data yet</p>
              <p className="text-sm text-tertiary mt-sm">
                Complete some orders to see analytics
              </p>
            </div>
          ) : (
            <>
              {/* Stats Row */}
              <div className="dashboard-stats stagger-children">
                <div className="stat-card">
                  <div className="stat-value gradient-text">₹{totalRevenue.toLocaleString()}</div>
                  <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value text-accent">{totalOrders}</div>
                  <div className="stat-label">Total Orders</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value text-coral">₹{avgOrderValue}</div>
                  <div className="stat-label">Avg. Order Value</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value" style={{ color: "var(--color-info)" }}>
                    {topItems[0]?.name || "—"}
                  </div>
                  <div className="stat-label">Top Selling Item</div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="analytics-grid">
                {/* Revenue Chart */}
                <div className="analytics-chart-card">
                  <h3 className="text-lg font-bold mb-lg">💰 Revenue (Last 7 Days)</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={dailyRevenue}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        stroke="var(--color-text-tertiary)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="var(--color-text-tertiary)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${v}`}
                      />
                      <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [`₹${v}`, "Revenue"]} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#FF6B35"
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Items Chart */}
                <div className="analytics-chart-card">
                  <h3 className="text-lg font-bold mb-lg">🏆 Top Selling Items</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={topItems} layout="vertical">
                      <XAxis
                        type="number"
                        stroke="var(--color-text-tertiary)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="var(--color-text-tertiary)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        width={120}
                      />
                      <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [v, "Orders"]} />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                        {topItems.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Orders by Hour */}
                <div className="analytics-chart-card">
                  <h3 className="text-lg font-bold mb-lg">🕐 Orders by Hour</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={ordersByHour}>
                      <XAxis
                        dataKey="name"
                        stroke="var(--color-text-tertiary)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="var(--color-text-tertiary)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip contentStyle={customTooltipStyle} />
                      <Bar dataKey="orders" fill="#2EC4B6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Revenue by Item (Pie Chart) */}
                <div className="analytics-chart-card">
                  <h3 className="text-lg font-bold mb-lg">🍕 Revenue by Item</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={topItems}
                        dataKey="revenue"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={50}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {topItems.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [`₹${v}`, "Revenue"]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="analytics-legend">
                    {topItems.slice(0, 5).map((item, i) => (
                      <div key={i} className="analytics-legend-item">
                        <span
                          className="analytics-legend-dot"
                          style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <span className="text-xs text-secondary">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Analytics;
