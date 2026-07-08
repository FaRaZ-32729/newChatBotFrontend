import { formatAccessForDisplay } from './access';

// Convert manager API object into the shape the admin UI expects
export function mapManagerToUser(manager) {
  return {
    id: manager._id,
    name: manager.name,
    email: manager.email,
    role: 'manager',
    status: manager.isActive ? 'active' : 'inactive',
    statusReason: manager.suspensionReason || null,
    access: formatAccessForDisplay(manager.access),
    createdAt: manager.createdAt
      ? new Date(manager.createdAt).toISOString().split('T')[0]
      : '',
  };
}
