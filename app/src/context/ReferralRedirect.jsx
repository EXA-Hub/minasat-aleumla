import { useParams, Navigate } from 'react-router-dom';
export const ReferralRedirect = () => {
  return <Navigate to={`/login?referral=${useParams().userId}`} replace />;
};
