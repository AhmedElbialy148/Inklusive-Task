export const settings = {
    env: {
        backendHost: process.env.NEXT_PUBLIC_BACKEND_HOST_URL,
        perPage: process.env.NEXT_PUBLIC_PERPAGE,
    },
    userStatus: {
        active: 'active',
        inactive: 'inactive',
    },
    userRoles: {
        admin: 'admin',
        superAdmin: 'super-admin',
    }
};
export default { settings };
