import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy, Crown, Award } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import api from '../../../utils/api';
import CoinsIcon from '../../../components/ui/CoinIcon';
import { cn } from '@/lib/utils';
import Username from '../../../components/explore/widgets/Username';

const TopUsers = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await api.top.rich();
        setData(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTopRankStyle = (index) => {
    const baseStyle = 'absolute inset-0 opacity-10 pointer-events-none';
    if (index === 0)
      return `${baseStyle} bg-gradient-to-r from-yellow-300 to-yellow-500`;
    if (index === 1)
      return `${baseStyle} bg-gradient-to-r from-gray-300 to-gray-500`;
    if (index === 2)
      return `${baseStyle} bg-gradient-to-r from-orange-400 to-orange-600`;
    return '';
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Trophy className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Award className="h-6 w-6 text-orange-500" />;
    return null;
  };

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        حدث خطأ في تحميل البيانات
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 shadow-xl">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="text-yellow-500 h-8 w-8" />
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-transparent bg-clip-text">
              أغنى المستخدمين
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative z-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right font-bold text-lg">
                    الترتيب
                  </TableHead>
                  <TableHead className="text-right font-bold text-lg">
                    المستخدم
                  </TableHead>
                  <TableHead className="text-left font-bold text-lg">
                    الرصيد
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array(10)
                      .fill(null)
                      .map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton className="h-4 w-8" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                        </TableRow>
                      ))
                  : data?.users.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={cn(
                          'relative group hover:scale-[1.02] transition-all duration-300',
                          index < 3 ? 'font-semibold' : ''
                        )}
                      >
                        <td
                          className={cn(
                            'p-4 relative',
                            index < 3 ? 'text-lg' : ''
                          )}
                        >
                          <div className={getTopRankStyle(index)} />
                          <div className="flex items-center gap-2">
                            {getRankIcon(index)}
                            <span>{index + 1}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'rounded-full p-1 transition-transform group-hover:scale-110',
                                index === 0 &&
                                  'bg-gradient-to-r from-yellow-300 to-yellow-500',
                                index === 1 &&
                                  'bg-gradient-to-r from-gray-300 to-gray-400',
                                index === 2 &&
                                  'bg-gradient-to-r from-orange-500 to-orange-600'
                              )}
                            >
                              <Avatar className="h-12 w-12 border-2 border-white">
                                <AvatarImage
                                  src={
                                    user.profile?.profilePicture ||
                                    '/avatar.jpg'
                                  }
                                  alt={user.username}
                                />
                                <AvatarFallback className="font-bold text-lg">
                                  {user.username[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="inline-block">
                              <Username username={user.username} />
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="flex items-center gap-2"
                          >
                            <CoinsIcon
                              amount={user.balance}
                              className="h-6 w-6"
                            />
                          </motion.div>
                        </td>
                      </motion.tr>
                    ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopUsers;
