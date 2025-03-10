import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Flame, Zap, FireExtinguisher } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Username from '../../../components/explore/widgets/Username';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import api from '../../../utils/api';
import { cn } from '@/lib/utils';

const TopStreaks = () => {
  const [streaks, setStreaks] = useState([[], []]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await Promise.all([
          api.top.streaks.onFire(),
          api.top.streaks.daily(),
        ]);
        setStreaks(data);
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
      return `${baseStyle} bg-linear-to-r from-red-300 to-red-500`;
    if (index === 1)
      return `${baseStyle} bg-linear-to-r from-orange-300 to-orange-500`;
    if (index === 2)
      return `${baseStyle} bg-linear-to-r from-yellow-400 to-yellow-600`;
    return '';
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Flame className="h-6 w-6 text-red-500" />;
    if (index === 1) return <Zap className="h-6 w-6 text-orange-400" />;
    if (index === 2)
      return <FireExtinguisher className="h-6 w-6 text-yellow-500" />;
    return null;
  };

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        حدث خطأ في تحميل البيانات
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Link to="/dashboard/finance/tasks" className="mb-4 block text-right">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            إنضم إلى الاستمراريات المشتعلة واليومية
          </h1>
        </div>
      </Link>
      {streaks.map((streak, index) => (
        <Card
          key={index}
          className="to-0foreground dark:from-0primary from-15foreground dark:to-5primary mb-4 bg-linear-to-br shadow-xl">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Flame className="h-8 w-8 text-red-500" />
              <span className="bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                أطول الاستمراريات
              </span>
              {index === 0 ? ' مشتعلة' : ' يومية'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative z-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right text-lg font-bold">
                      الترتيب
                    </TableHead>
                    <TableHead className="text-right text-lg font-bold">
                      المستخدم
                    </TableHead>
                    <TableHead className="text-left text-lg font-bold">
                      أيام الاستمرارية
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
                    : streak?.map((user, index) => (
                        <motion.tr
                          key={user._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className={cn(
                            'group relative transition-all duration-300 hover:scale-[1.02]',
                            index < 3 ? 'font-semibold' : ''
                          )}>
                          <td
                            className={cn(
                              'relative p-4',
                              index < 3 ? 'text-lg' : ''
                            )}>
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
                                    'bg-linear-to-r from-red-300 to-red-500',
                                  index === 1 &&
                                    'bg-linear-to-r from-orange-300 to-orange-400',
                                  index === 2 &&
                                    'bg-linear-to-r from-yellow-500 to-yellow-600'
                                )}>
                                <Avatar className="h-12 w-12 border-2 border-white">
                                  <AvatarImage
                                    src={
                                      user.profile?.profilePicture ||
                                      '/avatar.jpg'
                                    }
                                    alt={user.username}
                                  />
                                  <AvatarFallback className="text-lg font-bold">
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
                              className="flex items-center gap-2">
                              <span className="font-bold">{user.streak}</span>
                              يوم
                            </motion.div>
                          </td>
                        </motion.tr>
                      ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TopStreaks;
