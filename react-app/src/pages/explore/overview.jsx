import { useOutletContext } from 'react-router-dom';
import Username from '../../components/explore/widgets/Username';

const OverviewPage = () => {
  const { user } = useOutletContext();

  return <div>{user && <Username username={user.username} />}</div>;
};

export default OverviewPage;
