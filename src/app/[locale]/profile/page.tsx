'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface User {
  name: string;
  username: string;
  email: string;
  image: string;
  phone: string;
  birthDate: string;
  gender: string;
  shippingAddress: string;
  billingAddress: string;
  accountStatus: string;
  verifiedEmail: boolean;
}

interface UserProfileProps {
  readonly params: {
    readonly locale: string;
  };
}

export default function UserProfile({ params: { locale } }: UserProfileProps) {
  const t = useTranslations('UserProfile');
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionVerifiedEmail, setSessionVerifiedEmail] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [sessionExists, setSessionExists] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = await getSession();
        if (!session?.user) {
          setSessionExists(false);
          setLoading(false);
          return;
        }

        setSessionExists(true);
        setUserRole(session.user.role);
        setSessionVerifiedEmail(session.user.verifiedEmail);

        const response = await fetch(`/api/profile?userId=${session.user.id}`);
        if (!response.ok) throw new Error(t('fetchError'));

        const userData = await response.json();
        if (userData.error) throw new Error(t('userNotFound'));

        setUser(userData);
      } catch (err) {
        setError(t('fetchUserError'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [locale, router, t]);

  const handleActionClick = (message: string, action: () => void) => {
    if (sessionVerifiedEmail) {
      action();
    } else {
      setModalMessage(message);
      setShowModal(true);
    }
  };

  const closeModal = () => setShowModal(false);

  const userDetails = useMemo(() => user ? {
    [t('username')]: user.username,
    [t('name')]: user.name,
    [t('email')]: user.email,
    [t('phone')]: user.phone || t('notProvided'),
    [t('birthDate')]: user.birthDate || t('notProvided'),
    [t('gender')]: user.gender || t('notProvided'),
    [t('shippingAddress')]: user.shippingAddress || t('notProvided'),
    [t('billingAddress')]: user.billingAddress || t('notProvided'),
    [t('accountStatus')]: (
      <span className={user.accountStatus === 'healthy' ? 'text-green-500' : 'text-red-500'}>
        {user.accountStatus === 'healthy' ? t('healthy') : user.accountStatus || t('notProvided')}
      </span>
    ),
    [t('emailStatus')]: (
      <span className={user.verifiedEmail ? 'text-green-500' : 'text-red-500'}>
        {user.verifiedEmail ? t('verified') : t('notVerified')}
      </span>
    ),
  } : {}, [user, t]);

  if (loading) return <LoadingSpinner />;

  if (!sessionExists) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="bg-base-100 p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-4">
          <h1 className="text-3xl font-bold text-primary">{t('sessionNotFound')}</h1>
          <p className="text-base-content">{t('loginToViewProfile')}</p>
          <button onClick={() => router.push('/')} className="btn btn-primary w-full">
            {t('goToHome')}
          </button>
        </div>
      </div>
    );
  }

  if (error) return <ErrorAlert message={error} />;
  if (!user) return <UserNotFoundAlert t={t} />;

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-base-100 shadow-lg rounded-lg p-8 border border-base-content/20">
        <h2 className="text-4xl font-bold text-center text-primary mb-8">{t('userProfile')}</h2>
        <ProfileAvatar image={user.image} t={t} />
        <div className="flex flex-col space-y-6">
          {Object.entries(userDetails).map(([label, value]) => (
            <div key={label}>
              <UserDetail label={label} value={value} />
              <div className="border-t border-dashed border-base-content/30 my-4"></div>
            </div>
          ))}
        </div>
        <UserActions
          userRole={userRole}
          locale={locale}
          router={router}
          sessionVerifiedEmail={sessionVerifiedEmail}
          onActionClick={handleActionClick}
          t={t}
        />
        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">{t('actionRequired')}</h3>
              <p className="py-4">{modalMessage}</p>
              <div className="modal-action">
                <button className="btn btn-primary" onClick={closeModal}>{t('close')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <span className="loading loading-spinner loading-lg text-primary"></span>
  </div>
);

const ErrorAlert = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="alert alert-warning shadow-lg">
      <span>{message}</span>
    </div>
  </div>
);

const UserNotFoundAlert = ({ t }: { t: any }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="alert alert-warning shadow-lg">
      <span>{t('userNotFound')}</span>
    </div>
  </div>
);

const ProfileAvatar = ({ image, t }: { image: string, t: any }) => (
  <div className="avatar flex justify-center mb-6">
    <div className="ring-primary ring-offset-base-100 w-32 h-32 rounded-full ring ring-offset-2 relative">
      <Image
        src={image}
        alt={t('profilePicture')}
        width={128}
        height={128}
        className="rounded-full"
      />
    </div>
  </div>
);

const UserDetail = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="mb-2 flex justify-between items-center">
    <strong className="text-lg text-base-content">{label}:</strong>
    <span className="text-base-content/80 text-base">{value}</span>
  </div>
);

const UserActions = ({ userRole, locale, router, sessionVerifiedEmail, onActionClick, t }: {
  userRole: string | null;
  locale: string;
  router: any;
  sessionVerifiedEmail: boolean | null;
  onActionClick: (message: string, action: () => void) => void;
  t: any;
}) => (
  <div className="flex flex-col items-center mt-8 space-y-4">
    {sessionVerifiedEmail === false && (
      <button
        className="btn btn-warning w-full"
        onClick={() => router.push(`/${locale}/profile/verify-email`)}
      >
        {t('verifyEmail')}
      </button>
    )}
    <button
      onClick={() => onActionClick(t('verifyEmailToEditProfile'), () => router.push(`/${locale}/profile/edit-profile`))}
      className="btn btn-secondary w-full"
    >
      {t('editProfileData')}
    </button>
    {userRole !== 'seller' && userRole !== 'admin' && (
      <button
        className="btn btn-primary w-full"
        onClick={() => onActionClick(t('verifyEmailToRequestSellerAccount'), () => router.push(`/${locale}/profile/request-seller`))}
      >
        {t('requestSellerAccount')}
      </button>
    )}
  </div>
);
