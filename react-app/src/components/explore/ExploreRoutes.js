import React from 'react';
import {
  Notebook,
  Palette,
  Eye,
  FileText,
  TrendingUp,
  Gift,
  FileCheck,
} from 'lucide-react';

const menuItems = [
  {
    id: 'main',
    title: 'الرئيسية',
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
    id: 'transfers',
    title: 'التحويلات',
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
    ],
  },
  {
    id: 'platform-kings',
    title: 'ملوك المنصة',
    items: [
      {
        name: 'أغنى الأشخاص',
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
    title: 'الإعدادات',
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
