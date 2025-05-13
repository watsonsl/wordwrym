import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PenLine, BookOpen, Calendar, BarChart3, Search } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const features = [
    {
      title: "Distraction-Free Writing",
      description: "Focus mode eliminates distractions for a clean writing experience",
      icon: PenLine,
      color: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Mood Tracking",
      description: "Track your emotional state with each journal entry",
      icon: BookOpen,
      color: "bg-purple-100 dark:bg-purple-900/30",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Calendar View",
      description: "Navigate your entries with an intuitive calendar interface",
      icon: Calendar,
      color: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Journaling Statistics",
      description: "Visualize your writing habits with detailed statistics",
      icon: BarChart3,
      color: "bg-amber-100 dark:bg-amber-900/30",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Powerful Search",
      description: "Find any entry with our comprehensive search functionality",
      icon: Search,
      color: "bg-rose-100 dark:bg-rose-900/30",
      textColor: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://thumbs.dreamstime.com/b/coffee-hand-writing-journal-top-view-candle-calm-peace-relax-morning-routine-woman-notebook-diary-planning-goals-265671522.jpg"
            alt="Journal writing background"
            fill
            className="object-cover opacity-20 dark:opacity-10"
            priority
          />
        </div>
        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Capture your thoughts with <span className="text-primary">clarity</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              A distraction-free journaling experience designed to help you focus, reflect, and grow through mindful writing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" asChild>
                <Link href="/write">
                  <PenLine className="mr-2 h-5 w-5" />
                  Start Writing
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/journal">
                  <BookOpen className="mr-2 h-5 w-5" />
                  View Journal
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Features designed for mindful journaling</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to maintain a consistent journaling practice and gain insights from your writing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className={`${feature.color} p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.textColor}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="bg-card rounded-xl p-8 md:p-12 shadow-md text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to start your journaling journey?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Begin capturing your thoughts, tracking your moods, and discovering insights about yourself today.
            </p>
            <Button size="lg" asChild>
              <Link href="/write">
                <PenLine className="mr-2 h-5 w-5" />
                Create Your First Entry
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}