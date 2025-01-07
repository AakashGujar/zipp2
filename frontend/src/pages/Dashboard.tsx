import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Header } from "../components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Globe,
  Link,
  Clock,
  Copy,
  ExternalLink,
  Download,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { AppDispatch, RootState } from "../store/store";
import AnalyticsCards from "./AnalyticsCards";
import { Url } from "../types/utils";
import { backendUrl } from "../utils/utils";
import axios, { AxiosError } from "axios";
import {
  handleDeleteUrl,
  handleFetchAnalytics,
  handleFetchUrls,
} from "../handlers/handlers";

export function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingUrlId, setDeletingUrlId] = useState<string | null>(null);
  const { urls, loading, error } = useSelector((state: RootState) => state.url);

  useEffect(() => {
    dispatch(handleFetchUrls());
  }, [dispatch]);

  const filteredUrls = urls.filter((url: Url) =>
    [url.title, url.original_url, url.short_url].some((field) =>
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(`${backendUrl}/${url}`);
      toast.success("URL copied to clipboard!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to copy URL"
      );
    }
  };

  const handleRedirectFunc = async (shortUrl: string) => {
    try {
      const response = await axios.get(`${backendUrl}/${shortUrl}`);
      if (response.data.success) {
        let urlToRedirect = response.data.data.originalUrl;
        if (
          !urlToRedirect.startsWith("http://") &&
          !urlToRedirect.startsWith("https://")
        ) {
          urlToRedirect = `https://${urlToRedirect}`;
        }
        window.open(urlToRedirect, "_blank", "noopener,noreferrer");
        dispatch(handleFetchUrls());
        dispatch(handleFetchAnalytics(response.data.data.id.toString()));
      } else {
        toast.error("Failed to redirect to URL");
      }
    } catch (error) {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to redirect to URL"
          : "An unexpected error occurred"
      );
    }
  };

  const handleDelete = async () => {
    if (deletingUrlId) {
      dispatch(handleDeleteUrl(deletingUrlId));
      setDeletingUrlId(null);
    }
  };

  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  if (!urls.length) {
    return <EmptyDashboard navigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-28 py-24">
        <DashboardContent
          filteredUrls={filteredUrls}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleCopy={handleCopy}
          handleRedirectFunc={handleRedirectFunc}
          setDeletingUrlId={setDeletingUrlId}
          loading={loading}
          dispatch={dispatch}
        />
        <DeleteUrlDialog
          isOpen={deletingUrlId !== null}
          onClose={() => setDeletingUrlId(null)}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}

const LoadingView = () => (
  <div className="flex items-center justify-center min-h-screen">
    Loading...
  </div>
);

const ErrorView = ({ error }: { error: string }) => (
  <div className="flex items-center justify-center min-h-screen text-red-500">
    {error}
  </div>
);

const EmptyDashboard = ({ navigate }: { navigate: (path: string) => void }) => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 lg:px-28 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center space-y-6 text-center"
      >
        <Globe className="h-16 w-16 text-muted-foreground/60" />
        <h2 className="text-2xl font-medium">No Links Yet</h2>
        <p className="text-muted-foreground max-w-md">
          Create your first short link and start tracking its performance
        </p>
        <Button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Create Your First Link
        </Button>
      </motion.div>
    </main>
  </div>
);

const DashboardContent = ({
  filteredUrls,
  searchTerm,
  setSearchTerm,
  handleCopy,
  handleRedirectFunc,
  setDeletingUrlId,
  loading,
  dispatch,
}: {
  filteredUrls: Url[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleCopy: (url: string) => void;
  handleRedirectFunc: (shortUrl: string) => void;
  setDeletingUrlId: (id: string | null) => void;
  loading: boolean;
  dispatch: AppDispatch;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="space-y-8"
  >
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-medium tracking-tight">Your Links</h1>
        <Input
          type="search"
          placeholder="Search links..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
    {filteredUrls.map((url: Url) => (
      <UrlCard
        key={url.id}
        url={url}
        handleCopy={handleCopy}
        handleRedirectFunc={handleRedirectFunc}
        setDeletingUrlId={setDeletingUrlId}
        loading={loading}
        dispatch={dispatch}
      />
    ))}
  </motion.div>
);

const UrlCard = ({
  url,
  handleCopy,
  handleRedirectFunc,
  setDeletingUrlId,
  loading,
  dispatch,
}: {
  url: Url;
  handleCopy: (url: string) => void;
  handleRedirectFunc: (shortUrl: string) => void;
  setDeletingUrlId: (id: string | null) => void;
  loading: boolean;
  dispatch: AppDispatch;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-medium">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            {url.short_url}
          </div>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCopy(url.short_url)}
            title="Copy URL"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRedirectFunc(url.short_url)}
            title="Open URL"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeletingUrlId(url.id.toString())}
            title="Delete URL"
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link className="h-4 w-4" />
          <span className="truncate">{url.original_url}</span>
        </div>
        <UrlTabs url={url} loading={loading} dispatch={dispatch} />
      </CardContent>
    </Card>
  </motion.div>
);

const UrlTabs = ({
  url,
  loading,
  dispatch,
}: {
  url: Url;
  loading: boolean;
  dispatch: AppDispatch;
}) => (
  <Tabs
    defaultValue="analytics"
    className="w-full"
    onValueChange={(value) => {
      if (value === "analytics") {
        dispatch(handleFetchAnalytics(url.id.toString()));
      }
    }}
  >
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="qr-details">QR Code & Details</TabsTrigger>
      <TabsTrigger value="analytics">Analytics</TabsTrigger>
    </TabsList>
    <TabsContent value="analytics" className="space-y-4">
      <AnalyticsCards
        click_details={url.click_details}
        total_clicks={url.total_clicks}
        isLoading={loading}
      />
    </TabsContent>
    <TabsContent value="qr-details" className="space-y-4">
      <QrCodeAndDetails url={url} />
    </TabsContent>
  </Tabs>
);

const QrCodeAndDetails = ({ url }: { url: Url }) => (
  <div className="grid gap-4 md:grid-cols-2">
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-6">
        <div className="relative mb-4">
          <img src={url.qr_code} alt="QR Code" className="w-48 h-48" />
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => {
            const link = document.createElement("a");
            link.href = url.qr_code;
            link.download = `qr-${url.short_url}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Created: {url.created_at}</span>
        </div>
      </CardContent>
    </Card>
  </div>
);

const DeleteUrlDialog = ({
  isOpen,
  onClose,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}) => (
  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          Are you sure you want to delete this URL?
        </AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the
          selected URL.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
