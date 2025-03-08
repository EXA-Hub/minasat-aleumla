import PropTypes from 'prop-types';
import { useModal } from '../../../context/modal-context.js';
import verifiedUserNames from '../../../utils/verifiedUserNames.json';

const Username = ({ username }) => {
  const { openModal } = useModal();
  const openProfile = () => openModal('profile', { username: `@${username}` });

  if (verifiedUserNames.includes(username)) {
    return (
      <div className="flex inline-flex items-center">
        <span className="bg-primary text-primary-foreground flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold">
          <span
            onClick={openProfile}
            className="hover:text-90foreground cursor-pointer transition duration-200 ease-in-out hover:shadow-lg">
            {username}@
          </span>
          <svg
            className="h-4 w-4 animate-pulse text-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M12 2a10 10 0 1 1-7.07 2.93A10 10 0 0 1 12 2zm-1.414 12.414L8 11.828l-1.414 1.414 3.414 3.414 6.414-6.414L15.414 9 10.586 14.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    );
  } else {
    return (
      <span
        onClick={openProfile}
        className="hover:text-primary cursor-pointer transition duration-200 ease-in-out hover:shadow-lg">
        {username}@
      </span>
    );
  }
};

Username.propTypes = {
  username: PropTypes.string.isRequired,
};

export default Username;
