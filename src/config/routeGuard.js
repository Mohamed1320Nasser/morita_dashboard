import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import authService from '@/controllers/login/authService';

function RouteGuard({ children }) {
	const router = useRouter();
	const [authorized, setAuthorized] = useState(false);

	useEffect(() => {
		authCheck(router.asPath);

		const hideContent = () => setAuthorized(false);
		router.events.on('routeChangeStart', hideContent);

		router.events.on('routeChangeComplete', authCheck);

		return () => {
			router.events.off('routeChangeStart', hideContent);
			router.events.off('routeChangeComplete', authCheck);
		};
	}, []);

	function authCheck(url) {
		const isAuthorized = authService.checkIfAuthorized();
		const publicPaths = ['/login'];
		const path = url.split('?')[0];
		if (!isAuthorized && !publicPaths.includes(path)) {
			setAuthorized(false);
			router.push({
				pathname: '/login',
			});
		} else {
			setAuthorized(true);
		}
	}

	return authorized && children;
}

export { RouteGuard };
