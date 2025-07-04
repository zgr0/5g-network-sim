// src/components/MetricsDashboard.js
import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MetricsDashboard = ({ results }) => {
  const latencyData = {
    labels: results.latency.map((_, i) => `Node ${i + 1}`),
    datasets: [{
      label: 'Latency (ms)',
      data: results.latency.map(d => d.latency),
      backgroundColor: 'rgba(76, 201, 240, 0.7)',
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: 'rgba(26, 35, 126, 0.8)'
    }]
  };

  const throughputData = {
    labels: ['Average', 'Maximum', 'Minimum'],
    datasets: [{
      label: 'Throughput (Mbps)',
      data: [
        results.throughput.average,
        results.throughput.max,
        results.throughput.min
      ],
      borderColor: 'rgba(92, 107, 192, 1)',
      backgroundColor: 'rgba(92, 107, 192, 0.3)',
      pointBackgroundColor: '#fff',
      pointBorderColor: 'rgba(92, 107, 192, 1)',
      tension: 0.4,
      fill: true
    }]
  };

  const latencyOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Node Latency',
        color: '#1a237e',
        font: { size: 18, weight: 'bold' }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Node', color: '#1a237e', font: { weight: 'bold' } },
        ticks: { color: '#1a237e' }
      },
      y: {
        title: { display: true, text: 'Latency (ms)', color: '#1a237e', font: { weight: 'bold' } },
        ticks: { color: '#1a237e' },
        beginAtZero: true
      }
    }
  };

  const throughputOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Network Throughput',
        color: '#1a237e',
        font: { size: 18, weight: 'bold' }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Metric', color: '#1a237e', font: { weight: 'bold' } },
        ticks: { color: '#1a237e' }
      },
      y: {
        title: { display: true, text: 'Mbps', color: '#1a237e', font: { weight: 'bold' } },
        ticks: { color: '#1a237e' },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="chart">
        <h3>Latency per Node</h3>
        <Bar data={latencyData} options={latencyOptions} />
      </div>
      <div className="chart">
        <h3>Network Throughput</h3>
        <Line data={throughputData} options={throughputOptions} />
      </div>
    </div>
  );
};

export default MetricsDashboard;