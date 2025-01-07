import { LucideIcon } from "lucide-react";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
}

export interface faqsType {
  question: string;
  answer: string;
}

export interface featureTypes {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Testimonials {
  text: string;
  author: string;
  role: string;
}

export interface Url {
  id: number;
  original_url: string;
  short_url: string;
  title: string;
  qr_code: string;
  created_at: string;
  total_clicks: number;
  click_details: ClickDetail[];
}

export interface ClickDetail {
  id: number;
  city: string;
  device: string;
  country: string;
  created_at: string;
}

export interface UrlAnalytics {
  devices: Record<string, number>;
  countries: Record<string, number>;
  cities: Record<string, number>;
}

export interface UrlState {
  urls: Url[];
  loading: boolean;
  error: string | null;
}

export interface AnalyticsData {
  total_clicks: number;
  click_details: ClickDetail[];
  click_count_by_device: Record<string, number>;
  click_count_by_country: Record<string, number>;
  click_count_by_city: Record<string, number>;
}

export interface AnalyticsState {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
}
