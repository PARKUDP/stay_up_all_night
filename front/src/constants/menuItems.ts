export interface MenuItem {
    href: string;
    label: string;
}

export const menuItems: MenuItem[] = [
    { href: '/', label: 'ダッシュボード' },
    { href: '/classes', label: 'クラス一覧' },
    { href: '/assignments', label: '課題一覧' },
    { href: '/profile', label: 'プロフィール' },
    { href: '/logout', label: 'ログアウト' },
];