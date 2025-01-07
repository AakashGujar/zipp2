import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Mountain } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { toast } from "sonner";
import { useCallback } from "react";
import { User } from "../types/utils";
import { handleLogout } from "../handlers/handlers";

export function Header() {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const user = useSelector(
    (state: RootState) => state.auth.user
  ) as User | null;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
const location = useLocation();

  const handleLogoutFnc = async (): Promise<void> => {
    try {
      await dispatch(handleLogout());
      navigate("/");
      toast.success('Logged out successfully')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Logout failed";
      toast.error(errorMessage);
    }
  };

  const getInitials = useCallback(() => {
    if (!user?.name) return user?.email?.charAt(0).toUpperCase() || "U";
    return user.name
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase();
  }, [user]);

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 lg:px-28 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Mountain className="h-5 w-5" strokeWidth={3} />
          <span className="text-xl font-bold tracking-tighter">zipp2</span>
        </Link>
        <nav className="flex items-center space-x-6">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage alt={user?.name || user?.email || "User"} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="w-full">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/contact" className="w-full">
                    Contact
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/report" className="w-full">
                    Report
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogoutFnc}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            !isAuthPage && (
              <Button variant="default" size="sm" asChild>
                <Link to="/login">Log in / Sign up</Link>
              </Button>
            )
          )}
        </nav>
      </div>
    </motion.header>
  );
}
