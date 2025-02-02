import PropTypes from 'prop-types';
import { useModal } from '../../../context/ModalManager'; // Import useModal

const Username = ({ username }) => {
  const { openModal } = useModal(); // Use the useModal hook

  const openProfile = () => openModal('profile', { username: `@${username}` }); // Open the profile modal using ModalManager

  return (
    <span
      onClick={openProfile}
      className="cursor-pointer transition duration-200 ease-in-out hover:text-primary hover:shadow-lg">
      {username}@
    </span>
  );
};

// Add PropTypes to validate the 'username' prop
Username.propTypes = {
  username: PropTypes.string.isRequired,
};

export default Username;
