import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, User } from 'lucide-react';

export function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);
  const [notifHover, setNotifHover] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.remove('dark');
      setTheme('light');
    } else {
      html.classList.add('dark');
      setTheme('dark');
    }
  };

  if (!mounted) return null;

  return (
    <header className="fixed top-0 right-0 left-64 h-16 glass z-40 flex items-center justify-between px-6">
      <motion.div
        className="flex-1 flex items-center gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-sm font-medium text-muted-foreground">AI Configuration Generator</h1>
      </motion.div>

      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-all text-foreground hover:bg-white/10 relative group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle theme"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: theme === 'dark' ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-primary/20 rounded-lg"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        </motion.button>

        <motion.button
          onMouseEnter={() => setNotifHover(true)}
          onMouseLeave={() => setNotifHover(false)}
          className="p-2 rounded-lg transition-all text-foreground hover:bg-white/10 relative group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-5 h-5" />
          <motion.span
            className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"
            animate={notifHover ? { scale: 1.3 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          />
          <motion.div
            className="absolute inset-0 bg-destructive/20 rounded-lg"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        </motion.button>

        <motion.button
          className="p-2 rounded-lg transition-all text-foreground hover:bg-white/10 relative group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <User className="w-5 h-5" />
          <motion.div
            className="absolute inset-0 bg-accent/20 rounded-lg"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        </motion.button>
      </motion.div>
    </header>
  );
}
