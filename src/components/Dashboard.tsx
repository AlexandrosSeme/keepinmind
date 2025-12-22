import React from "react";
import {
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Euro,
  AlertCircle,
  Plus,
} from "lucide-react";
import Chart from "react-apexcharts";
import type { Stats, UpcomingExpiry, Debt } from "../types";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
  stats: Stats;
  upcomingExpiries: UpcomingExpiry[];
  debts: Debt[];
}

const Dashboard: React.FC<DashboardProps> = ({
  stats,
  upcomingExpiries,
  debts,
}) => {
  const navigate = useNavigate();
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }> = ({ title, value, icon, color, bgColor }) => (
    <div className="col-6 col-md-4 col-lg-2 mb-3">
      <div className="card h-100 border-0 shadow-sm">
        <div className="card-body p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p
                className="card-text text-muted small mb-1"
                style={{ fontSize: "0.75rem" }}
              >
                {title}
              </p>
              <h5 className={`card-title mb-0 ${color}`}>{value}</h5>
            </div>
            <div className={`p-2 rounded-circle ${bgColor}`}>
              {React.cloneElement(icon as React.ReactElement, { size: 18 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Stats Grid */}
      <div className="row mb-4">
        <StatCard
          title="Σύνολο Μελών"
          value={stats.totalMembers}
          icon={<Users size={24} className="text-primary" />}
          color="text-dark"
          bgColor="bg-primary bg-opacity-10"
        />
        <StatCard
          title="Ενεργές Συνδρομές"
          value={stats.activeSubscriptions}
          icon={<CheckCircle size={24} className="text-success" />}
          color="text-success"
          bgColor="bg-success bg-opacity-10"
        />
        <StatCard
          title="Λήγουν Αυτή την Εβδομάδα"
          value={stats.expiringThisWeek}
          icon={<Clock size={24} className="text-warning" />}
          color="text-warning"
          bgColor="bg-warning bg-opacity-10"
        />
        <StatCard
          title="Μηνιαία Έσοδα"
          value={`€${stats.monthlyRevenue}`}
          icon={<TrendingUp size={24} className="text-info" />}
          color="text-info"
          bgColor="bg-info bg-opacity-10"
        />
        <StatCard
          title="Εκκρεμείς Πληρωμές"
          value={`€${stats.pendingPayments}`}
          icon={<Euro size={24} className="text-warning" />}
          color="text-warning"
          bgColor="bg-warning bg-opacity-10"
        />
        <StatCard
          title="Ληξιπρόθεσμες Οφειλές"
          value={stats.overdueDebts}
          icon={<AlertCircle size={24} className="text-danger" />}
          color="text-danger"
          bgColor="bg-danger bg-opacity-10"
        />
      </div>

      {/* Main Content Row */}
      <div className="row">
        {/* Left Column - Lists */}
        <div className="col-12 col-md-6 col-lg-5 mb-3">
          {/* Upcoming Expiries */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white border-bottom py-2 d-flex align-items-center justify-content-between">
              <h6 className="card-title mb-0">Επερχόμενες Λήξεις</h6>
              <button
                className="btn btn-link btn-sm text-primary p-0"
                style={{ fontSize: "0.75rem" }}
                onClick={() => navigate("/debts")}
              >
                Προβολή Όλων
              </button>
            </div>
            <div className="card-body p-3">
              {upcomingExpiries.map((exp) => (
                <div
                  key={exp.id}
                  className="d-flex align-items-center justify-content-between p-2 bg-warning bg-opacity-10 rounded mb-2"
                >
                  <div className="flex-grow-1">
                    <div
                      className="text-dark"
                      style={{ fontSize: "0.85rem", fontWeight: "500" }}
                    >
                      {exp.name}
                    </div>
                    <small
                      className="text-muted"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {exp.package}
                    </small>
                  </div>
                  <div className="text-end">
                    <div
                      className="fw-semibold text-warning"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Σε {exp.days} ημέρες
                    </div>
                    <small
                      className="text-muted"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {exp.expiry}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Members Distribution */}
        <div className="col-12 col-md-6 col-lg-2 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-2">
              <h6 className="card-title mb-0">Κατανομή Μελών</h6>
            </div>
            <div className="card-body p-3">
              <Chart
                options={{
                  chart: {
                    type: "donut",
                    height: 200,
                  },
                  colors: ["#28a745", "#ffc107", "#dc3545", "#17a2b8"],
                  labels: ["Ενεργά", "Λήγουν Σύντομα", "Ανενεργά", "Νέα"],
                  legend: {
                    position: "bottom",
                  },
                  plotOptions: {
                    pie: {
                      donut: {
                        size: "30%",
                      },
                    },
                  },
                  dataLabels: {
                    enabled: true,
                    formatter: function (val) {
                      return val + "%";
                    },
                  },
                }}
                series={[45, 20, 25, 10]}
                type="donut"
                height={200}
              />
            </div>
          </div>
        </div>
        {/* Overdue Debts */}
        <div className="col-12 col-md-6 col-lg-5 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-2 d-flex align-items-center justify-content-between">
              <h6 className="card-title mb-0">Ληξιπρόθεσμες Οφειλές</h6>
              <button
                className="btn btn-link btn-sm text-primary p-0"
                style={{ fontSize: "0.75rem" }}
                onClick={() => navigate("/debts")}
              >
                Προβολή Όλων
              </button>
            </div>
            <div className="card-body p-3">
              {debts.map((debt) => (
                <div
                  key={debt.id}
                  className="d-flex align-items-center justify-content-between p-2 bg-danger bg-opacity-10 rounded mb-2"
                >
                  <div className="flex-grow-1">
                    <div
                      className="text-dark"
                      style={{ fontSize: "0.85rem", fontWeight: "500" }}
                    >
                      {debt.name}
                    </div>
                    <small
                      className="text-muted"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {debt.daysOverdue} ημέρες καθυστέρηση
                    </small>
                  </div>
                  <div className="text-end">
                    <div
                      className="fw-bold text-danger"
                      style={{ fontSize: "0.85rem" }}
                    >
                      €{debt.amount}
                    </div>
                    <button
                      className="btn btn-link btn-sm text-primary p-0"
                      style={{ fontSize: "0.7rem" }}
                    >
                      Καταγραφή Πληρωμής
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Charts Row */}
      <div className="row">
        {/* Revenue Chart */}
        <div className="col-12 col-sm-6 col-lg-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-2">
              <h6 className="card-title mb-0">Μηνιαία Έσοδα</h6>
            </div>
            <div className="card-body p-3">
              <Chart
                options={{
                  chart: {
                    type: "area",
                    height: 200,
                    toolbar: {
                      show: false,
                    },
                  },
                  colors: ["#007bff"],
                  dataLabels: {
                    enabled: true,
                  },
                  stroke: {
                    curve: "smooth",
                    width: 2,
                  },
                  xaxis: {
                    categories: ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μαι", "Ιουν"],
                  },
                  yaxis: {
                    title: {
                      text: "Έσοδα (€)",
                    },
                  },
                  fill: {
                    type: "gradient",
                    gradient: {
                      shadeIntensity: 1,
                      opacityFrom: 0.7,
                      opacityTo: 0.3,
                      stops: [0, 90, 100],
                    },
                  },
                  tooltip: {
                    y: {
                      formatter: function (val) {
                        return "€" + val;
                      },
                    },
                  },
                }}
                series={[
                  {
                    name: "Έσοδα",
                    data: [1200, 1500, 1800, 1600, 2000, 2200],
                  },
                ]}
                type="area"
                height={250}
              />
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="col-12 col-sm-6 col-lg-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-2">
              <h6 className="card-title mb-0">Κατάσταση Πληρωμών</h6>
            </div>
            <div className="card-body p-3">
              <Chart
                options={{
                  chart: {
                    type: "bar",
                    height: 200,
                    toolbar: {
                      show: false,
                    },
                  },
                  colors: ["#28a745", "#ffc107", "#dc3545"],
                  plotOptions: {
                    bar: {
                      horizontal: false,
                      columnWidth: "100%",
                      endingShape: "rounded",
                    },
                  },
                  dataLabels: {
                    enabled: true,
                  },
                  stroke: {
                    show: true,
                    width: 2,
                    colors: ["transparent"],
                  },
                  xaxis: {
                    categories: ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μαι", "Ιουν"],
                  },
                  yaxis: {
                    title: {
                      text: "Αριθμός Πληρωμών",
                    },
                  },
                  fill: {
                    opacity: 1,
                  },
                  legend: {
                    position: "top",
                  },
                }}
                series={[
                  {
                    name: "Εγκαίρως",
                    data: [45, 52, 48, 55, 60, 58],
                  },
                  {
                    name: "Καθυστέρηση",
                    data: [8, 12, 10, 6, 5, 7],
                  },
                  {
                    name: "Ληξιπρόθεσμες",
                    data: [3, 2, 4, 2, 1, 2],
                  },
                ]}
                type="bar"
                height={250}
              />
            </div>
          </div>
        </div>

        {/* Subscription Trends */}
        <div className="col-12 col-sm-6 col-lg-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-2">
              <h6 className="card-title mb-0">Τάσεις Συνδρομών</h6>
            </div>
            <div className="card-body p-3">
              <Chart
                options={{
                  chart: {
                    type: "line",
                    height: 200,
                    toolbar: {
                      show: false,
                    },
                  },
                  colors: ["#28a745", "#ffc107", "#dc3545"],
                  stroke: {
                    width: 3,
                    curve: "smooth",
                  },
                  xaxis: {
                    categories: ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μαι", "Ιουν"],
                  },
                  yaxis: {
                    title: {
                      text: "Αριθμός Συνδρομών",
                    },
                  },
                  legend: {
                    position: "top",
                  },
                  markers: {
                    size: 6,
                    hover: {
                      size: 8,
                    },
                  },
                }}
                series={[
                  {
                    name: "Νέες Συνδρομές",
                    data: [12, 15, 18, 14, 20, 22],
                  },
                  {
                    name: "Ανανεώσεις",
                    data: [8, 12, 10, 15, 18, 16],
                  },
                  {
                    name: "Ακυρώσεις",
                    data: [2, 3, 4, 2, 3, 1],
                  },
                ]}
                type="line"
                height={250}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
