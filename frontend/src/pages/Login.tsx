import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { handleLogin } from "../handlers/handlers";
import { toast } from "sonner";

export function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isLoggedIn && user) {
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await handleLogin(dispatch, { email, password });
      if (user) {
        toast.success("Logged in successfully");
        navigate(from, { replace: true });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Log In</CardTitle>
            <CardDescription>Enter your zipp2 account details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full mt-6"
                disabled={loading || !email || !password}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
