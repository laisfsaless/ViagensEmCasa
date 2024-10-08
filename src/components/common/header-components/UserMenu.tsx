import { Dispatch, SetStateAction, useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import ToggleThemeButton from '../ToggleThemeButton';
import { useLocale, useTranslations } from 'next-intl';

interface UserMenuProps {
  setLoginOpen: Dispatch<SetStateAction<boolean>>;
  setSignupOpen: Dispatch<SetStateAction<boolean>>;
  handleLoginSuccess: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ setLoginOpen, setSignupOpen, handleLoginSuccess }) => {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const t = useTranslations('UserMenu');

  const isUserLoggedIn = !!session;
  const userAvatar = session?.user?.image ?? '/images/profile.png';
  const userRole = session?.user?.role;

  const handleLogout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      window.location.reload();
    } catch (error) {
      console.error(t('logoutError'), error);
    }
  }, [t]);

  const handleClickOutside = (event: MouseEvent) => {
    if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown dropdown-end" ref={userDropdownRef}>
      <button
        type="button"
        className="btn btn-ghost btn-circle"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {isUserLoggedIn ? (
          <Image alt="User Avatar" src={userAvatar} width={40} height={40} className="w-10 h-10 rounded-full" />
        ) : (
          <span className="icon-[mdi--account] h-6 w-6 text-base-content"></span>
        )}
      </button>
      {dropdownOpen && (
        <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-48 p-2 shadow-md text-base-content">
          {isUserLoggedIn ? (
            <>
              <li>
                <Link href={`/${locale}/profile`} locale={locale} className="text-sm">
                  {t('profile')}
                </Link>
              </li>
              {userRole === 'client' && (
                <>
                  <li>
                    <Link href={`/${locale}/profile/purchase-history`} locale={locale} className="text-sm">
                      {t('purchaseHistory')}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${locale}/profile/tickets-history`} locale={locale} className="text-sm">
                      {t('ticketsHistory')}
                    </Link>
                  </li>
                </>
              )}
              <li className="my-2 border-t border-gray-200"></li>
              <li>
                <button onClick={handleLogout} className="text-sm">
                  {t('logout')}
                </button>
              </li>
              <li className="my-2 border-t border-gray-200"></li>
            </>
          ) : (
            <>
              <li>
                <button onClick={() => setLoginOpen(true)} className="text-sm">
                  {t('login')}
                </button>
              </li>
              <li>
                <button onClick={() => setSignupOpen(true)} className="text-sm">
                  {t('register')}
                </button>
              </li>
              <li className="my-2 border-t border-gray-200"></li>
            </>
          )}
          <li>
            <ToggleThemeButton />
          </li>
        </ul>
      )}
    </div>
  );
};

export default UserMenu;