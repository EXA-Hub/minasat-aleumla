// my-react-app/src/components/explore/widgets/ProfileModal.jsx
import { lazy, Suspense } from 'react';

const ProfilePage = lazy(() => import('../../../pages/autoRouting/:username'));

const ProfileModal = ({ username, onClose }) => {
  return (
    <div
      onClick={() => onClose()}
      className="modal-backdrop fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-200">
      <div
        onClick={(e) => e.stopPropagation()} // Prevent click event from propagating to the backdrop
        className="scrollbar-hide fixed bottom-0 left-1/2 -translate-x-1/2 transform rounded-t-2xl bg-white shadow-lg transition-transform duration-200"
        style={{
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          scrollbarWidth: 'none', // Hide scrollbar for Firefox
          msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
        }}>
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center bg-background">
              <div className="text-xl text-primary">جارٍ التحميل...</div>
            </div>
          }>
          <ProfilePage username={username} closeWidget={onClose} />
        </Suspense>
      </div>
    </div>
  );
};

import PropTypes from 'prop-types';
ProfileModal.propTypes = {
  username: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProfileModal;
