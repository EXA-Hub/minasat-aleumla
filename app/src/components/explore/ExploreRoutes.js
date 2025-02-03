// app/src/components/explore/ExploreRoutes.js
import React from 'react';
import {
  Notebook,
  Palette,
  Eye,
  FileText,
  TrendingUp,
  Gift,
  FileCheck,
  CreditCard,
  Code,
  Crown,
  Store,
} from 'lucide-react';

const menuItems = [
  {
    id: 'main',
    title: 'الرئيسية 🏠',
    items: [
      {
        name: 'نظرة عامة',
        icon: Notebook,
        path: '/explore/overview',
        component: React.lazy(() => import('../../pages/explore/overview.jsx')),
      },
    ],
  },
  {
    id: 'support',
    title: 'دعم المنصة 💝',
    items: [
      {
        name: 'الخطط والإشتراكات',
        icon: CreditCard,
        path: '/explore/support/subscriptions',
        component: React.lazy(
          () => import('../../pages/explore/support/plans.jsx')
        ),
      },
      {
        name: 'أكوادي',
        icon: Code,
        path: '/explore/support/codes',
        component: React.lazy(
          () => import('../../pages/explore/support/codes.jsx')
        ),
      },
      {
        name: 'المتبرعين',
        icon: Crown,
        path: '/explore/support/donators',
        component: React.lazy(
          () => import('../../pages/explore/support/donators.jsx')
        ),
      },
    ],
  },
  {
    id: 'transfers',
    title: 'التحويلات 🔄',
    items: [
      {
        name: 'الشيكات',
        icon: FileCheck,
        path: '/explore/transfers/cheques',
        component: React.lazy(
          () => import('../../pages/explore/transfers/cheques.jsx')
        ),
      },
      {
        name: 'الهدايا',
        icon: Gift,
        path: '/explore/transfers/gifts',
        component: React.lazy(
          () => import('../../pages/explore/transfers/gifts.jsx')
        ),
      },
      {
        name: 'السوق',
        icon: Store,
        path: '/explore/transfers/market',
        component: React.lazy(
          () => import('../../pages/explore/transfers/market.jsx')
        ),
      },
    ],
  },
  {
    id: 'platform-kings',
    title: 'ملوك المنصة 👑',
    items: [
      {
        name: 'أغنى الأثرياء',
        icon: TrendingUp,
        path: '/explore/richest',
        component: React.lazy(
          () => import('../../pages/explore/kings/richest.jsx')
        ),
      },
    ],
  },
  {
    id: 'settings',
    title: 'الإعدادات ⚙️',
    items: [
      {
        name: 'الألوان',
        icon: Palette,
        path: '/explore/settings/colors',
        component: React.lazy(
          () => import('../../pages/explore/settings/colors.jsx')
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
    ],
  },
];

export default menuItems;
