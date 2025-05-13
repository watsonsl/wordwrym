"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Calendar, 
  Smile, 
  Tag, 
  FileText, 
  TrendingUp,
  Award,
  PenLine
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import chart components
const BarChart = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Bar),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center">Loading chart...</div> }
);

const DoughnutChart = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Doughnut),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center">Loading chart...</div> }
);

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface StatsData {
  totalEntries: number;
  entriesByMonth: Array<{ month: string; count: number }>;
  moodDistribution: Array<{ mood: string; emoji: string; color: string; count: number }>;
  mostUsedTags: Array<{ tag: string; color: string; count: number }>;
  currentStreak: number;
  longestStreak: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch statistics");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError("Failed to load statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Prepare chart data
  const entriesByMonthData = {
    labels: stats?.entriesByMonth.map((item) => {
      const [year, month] = item.month.split("-");
      return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString("default", { month: "short" })} ${year}`;
    }) || [],
    datasets: [
      {
        label: "Journal Entries",
        data: stats?.entriesByMonth.map((item) => item.count) || [],
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderColor: "rgb(99, 102, 241)",
        borderWidth: 1,
      },
    ],
  };

  const moodDistributionData = {
    labels: stats?.moodDistribution.map((item) => `${item.emoji} ${item.mood}`) || [],
    datasets: [
      {
        label: "Mood Distribution",
        data: stats?.moodDistribution.map((item) => item.count) || [],
        backgroundColor: stats?.moodDistribution.map((item) => item.color) || [],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  // Animated counter component
  const AnimatedCounter = ({ value }: { value: number }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      let start = 0;
      const end = value;
      const duration = 1000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start > end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }, [value]);
    
    return <span>{count}</span>;
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold">Journaling Statistics</h1>
          <p className="text-muted-foreground mt-1">
            Track your journaling habits and patterns
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            {error}
          </div>
        ) : stats ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                className="bg-card rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Entries</p>
                    <h3 className="text-3xl font-bold mt-1">
                      <AnimatedCounter value={stats.totalEntries} />
                    </h3>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                className="bg-card rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Current Streak</p>
                    <h3 className="text-3xl font-bold mt-1">
                      <AnimatedCounter value={stats.currentStreak} /> days
                    </h3>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                className="bg-card rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Longest Streak</p>
                    <h3 className="text-3xl font-bold mt-1">
                      <AnimatedCounter value={stats.longestStreak} /> days
                    </h3>
                  </div>
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                    <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-card rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Entries by Month
                </h3>
                <div className="h-64">
                  <BarChart data={entriesByMonthData} options={chartOptions} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-card rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Smile className="h-5 w-5 mr-2" />
                  Mood Distribution
                </h3>
                <div className="h-64">
                  <DoughnutChart data={moodDistributionData} options={chartOptions} />
                </div>
              </motion.div>
            </div>

            {/* Most Used Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-card rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Most Used Tags
              </h3>
              
              {stats.mostUsedTags.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tags used yet. Start adding tags to your journal entries.
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.mostUsedTags.map((tag, index) => (
                    <motion.div
                      key={tag.tag}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-muted rounded-lg p-4 text-center"
                    >
                      <div
                        className="w-4 h-4 rounded-full mx-auto mb-2"
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      <p className="font-medium">{tag.tag}</p>
                      <p className="text-sm text-muted-foreground">
                        {tag.count} {tag.count === 1 ? "entry" : "entries"}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-primary/5 rounded-lg p-8 text-center"
            >
              <h3 className="text-xl font-semibold mb-2">
                Keep your journaling streak going!
              </h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Regular journaling helps improve mental clarity, reduce stress, and track personal growth.
              </p>
              <Button asChild size="lg">
                <Link href="/write">
                  <PenLine className="h-5 w-5 mr-2" />
                  Write Today's Entry
                </Link>
              </Button>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg shadow-sm">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No statistics available</h3>
            <p className="text-muted-foreground max-w-md mx-auto mt-2 mb-6">
              Start journaling to see your statistics and track your progress.
            </p>
            <Button asChild>
              <Link href="/write">
                <PenLine className="h-4 w-4 mr-2" />
                Create Your First Entry
              </Link>
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}