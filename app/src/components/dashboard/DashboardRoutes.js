// app/src/components/dashboard/DashboardRoutes.js
import React from 'react';
import {
  Gift,
  Plane,
  User,
  Package,
  Share2,
  LineChart,
  Shield,
  Lock,
  Eye,
  FileText,
  Heart,
  HelpCircle,
  DollarSign,
  SendIcon,
  Notebook,
  Link2Icon,
  LinkIcon,
  Briefcase,
} from 'lucide-react';

const menuItems = [
  {
    id: 'main',
    title: 'الرئيسية',
    items: [
      {
        name: 'نظرة عامة',
        icon: Notebook,
        path: '/dashboard/overview',
        component: React.lazy(() => import('../../pages/dashboard/overview')),
      },
      {
        name: 'التحويلات',
        icon: SendIcon,
        path: '/dashboard/transactions',
        component: React.lazy(
          () => import('../../pages/dashboard/transactions')
        ),
      },
      {
        name: 'الرصيد',
        icon: DollarSign,
        path: '/dashboard/wallet',
        component: React.lazy(() => import('../../pages/dashboard/wallet')),
      },
    ],
  },
  {
    id: 'finance',
    title: 'المالية',
    items: [
      {
        name: 'المهام',
        icon: Gift,
        path: '/dashboard/finance/tasks',
        component: React.lazy(
          () => import('../../pages/dashboard/finance/tasks')
        ),
      },
      {
        name: 'الإيحلات',
        icon: Link2Icon,
        path: '/dashboard/finance/affiliate',
        component: React.lazy(
          () => import('../../pages/dashboard/finance/affiliate')
        ),
      },
      {
        name: 'الهدايا الجوية',
        icon: Plane,
        path: '/dashboard/finance/airdrop',
        component: React.lazy(
          () => import('../../pages/dashboard/finance/airdrop')
        ),
      },
      {
        name: 'التبرعات',
        icon: Heart,
        path: '/dashboard/finance/donations',
        component: React.lazy(
          () => import('../../pages/dashboard/finance/donations')
        ),
      },
    ],
  },
  {
    id: 'business',
    title: 'التجارة',
    items: [
      {
        name: 'المنتجات',
        icon: Package,
        path: '/dashboard/social/products',
        component: React.lazy(
          () => import('../../pages/dashboard/finance/products')
        ),
      },
      {
        name: 'الصفقات',
        icon: Briefcase,
        path: '/dashboard/social/trades',
        component: React.lazy(
          () => import('../../pages/dashboard/finance/trades')
        ),
      },
    ],
  },
  {
    id: 'social',
    title: 'الاجتماعية',
    items: [
      {
        name: 'الملف الشخصي',
        icon: User,
        path: '/dashboard/social/profile',
        component: React.lazy(
          () => import('../../pages/dashboard/social/profile')
        ),
      },
      {
        path: '/dashboard/social/apps',
        component: React.lazy(
          () => import('../../pages/dashboard/social/apps')
        ),
        name: 'التطبيقات المتصلة',
        icon: LinkIcon,
      },
      {
        name: 'التفاعل',
        icon: Share2,
        path: '/dashboard/social/engagement',
        component: React.lazy(
          () => import('../../pages/dashboard/social/engagement')
        ),
      },
      {
        name: 'الإحصائيات',
        icon: LineChart,
        path: '/dashboard/social/stats',
        component: React.lazy(
          () => import('../../pages/dashboard/social/stats')
        ),
      },
    ],
  },
  {
    id: 'security',
    title: 'الأمان',
    items: [
      {
        name: 'الحساب',
        icon: Shield,
        path: '/dashboard/security/account',
        component: React.lazy(
          () => import('../../pages/dashboard/security/account')
        ),
      },
      {
        name: 'الخصوصية',
        icon: Lock,
        path: '/dashboard/security/privacy',
        component: React.lazy(
          () => import('../../pages/dashboard/security/privacy')
        ),
      },
      {
        name: 'الشروط والأحكام',
        icon: Eye,
        path: '/terms',
      },
      {
        name: 'سياسة الخصوصية',
        icon: FileText,
        path: '/privacy-policy',
      },
      {
        name: 'المساعدة',
        icon: HelpCircle,
        path: '/dashboard/security/help',
        component: React.lazy(
          () => import('../../pages/dashboard/security/help')
        ),
      },
    ],
  },
];

export default menuItems;
