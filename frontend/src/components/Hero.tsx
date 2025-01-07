import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { toast } from "sonner";
import { handleShortenUrl } from "../handlers/handlers";

export function Hero() {
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      toast.error("Please enter a valid URL");
      return;
    }

    if (!isLoggedIn) {
      toast.info("You need to log in to shorten a URL");
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(
        handleShortenUrl({ originalUrl: url})
      );

      toast.success("URL shortened successfully!");
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Something went wrong. Please try again.");
      }
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-100/50 to-white dark:from-zinc-900/50 dark:to-zinc-900" />
      <motion.div
        className="absolute inset-0 opacity-30 dark:opacity-40"
        initial={{ backgroundPosition: "0 0" }}
        animate={{ backgroundPosition: "100% 100%" }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        style={{
          backgroundImage:
            "radial-gradient(circle at center, transparent 0%, transparent 50%, currentColor 100%)",
          backgroundSize: "50% 50%",
        }}
      />
      <div className="container relative mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tighter mb-8 relative inline-block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Create Links! Shorter
            <motion.div
              className="absolute -bottom-2 left-0 right-0 h-[0.5em] opacity-20"
              initial={{ backgroundSize: "0% 100%" }}
              animate={{ backgroundSize: "100% 100%" }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{
                background:
                  "radial-gradient(circle at center, currentColor 2px, transparent 2px)",
                backgroundSize: "8px 8px",
              }}
            />
          </motion.h1>
          <motion.form
            onSubmit={handleSubmit}
            className="relative max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-200 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700 rounded-full blur-md opacity-60 transition duration-1000 group-hover:opacity-100" />
              <div className="relative flex gap-2 bg-background rounded-full p-2 shadow-lg">
                <Input
                  type="url"
                  placeholder="Paste your long URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-12 px-6 rounded-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-12 w-12 rounded-full shrink-0 transition-transform group-hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground/80">
              Transform your links into powerful insights • Track • Analyze •
              Grow
            </p>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
}
