import { formatAccessForDisplay } from './access';

export function mapClientUserFromApi(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || 'user',
    status: user.isActive ? 'active' : 'inactive',
    verified: user.verified,
    statusReason: user.suspensionReason || null,
    access: formatAccessForDisplay(user.access),
    createdBy: user.createdBy,
    createdAt: user.createdAt
      ? new Date(user.createdAt).toISOString().split('T')[0]
      : '',
  };
}
