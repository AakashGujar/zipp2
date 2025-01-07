import { faqsType, featureTypes, Testimonials } from "../types/utils";
import { Zap, BarChart, Link2, FileCode, QrCode, Lock } from "lucide-react";

export const backendUrl = "https://zipp2.onrender.com";
// export const backendUrl = "http://localhost:3000";

export const faqs: faqsType[] = [
  {
    question: "What is a URL Shortener?",
    answer:
      "A URL shortener is a tool that creates a short, unique URL that will redirect to the specific website of your choosing.",
  },
  {
    question: "Benefits of a short URL?",
    answer:
      "Short URLs are easier to share, remember, and look cleaner in your marketing materials. They also provide tracking capabilities.",
  },
  {
    question: "Why Choose zipp2?",
    answer:
      "zipp2 offers advanced features like click tracking, custom domains, and password protection, all while maintaining a user-friendly interface.",
  },
  {
    question: "What is a QR Code?",
    answer:
      "A QR Code is a two-dimensional barcode that can be quickly read by digital devices such as smartphones.",
  },
];

export const features: featureTypes[] = [
  {
    icon: Zap,
    title: "Managing links",
    description:
      "Generate, safeguard, and manage your hyperlinks while overseeing them with complete analytics.",
  },
  {
    icon: BarChart,
    title: "Tracking Clicks",
    description:
      "Track all of your clicks anytime and anyhere for clear, like clockwork.",
  },
  {
    icon: Link2,
    title: "Branded Domain Names",
    description:
      "Easily add your own domain name for short your links and take control of your brand name and your users trust.",
  },
  {
    icon: FileCode,
    title: "Robust API",
    description:
      "Use our powerful API to build custom applications or extend your own application with our powerful tools.",
  },
  {
    icon: QrCode,
    title: "Share",
    description:
      "Share your links on popular social platforms or via QR codes, create a unique QR code for specific urls.",
  },
  {
    icon: Lock,
    title: "Password Protection",
    description:
      "Password protection links is a feature that allows users to secure their shared content by requiring a password for access.",
  },
];

export const testimonials: Testimonials[] = [
  {
    text: "Great experience using the URL shortener! The links work perfectly every time, and I appreciate the analytics feature to track clicks!",
    author: "Leslie Alexander",
    role: "Freelance React Developer",
  },
  {
    text: "The URL shortener service provided was excellent. It allowed me to easily shorten long URLs and share them efficiently!",
    author: "Jacob Jones",
    role: "Digital Marketer",
  },
  {
    text: "Great URL shortener! It's user-friendly, fast and reliable. Highly recommended!",
    author: "Jenny Wilson",
    role: "Graphic Designer",
  },
];