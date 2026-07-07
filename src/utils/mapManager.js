import { formatAccessForDisplay } from './access';

export function mapManagerToUser(manager) {
  return {
    id: manager._id,
    name: manager.name,
    email: manager.email,
    role: 'manager',
    status: manager.isActive ? 'active' : 'inactive',
    statusReason: manager.suspensionReason || null,
    access: formatAccessForDisplay(manager.access),
    conversations: 0,
    lastActive: 'Never',
    platform: 'Web Widget',
    createdAt: manager.createdAt
      ? new Date(manager.createdAt).toISOString().split('T')[0]
      : '',
    activationKeys: [],
    knowledgeBase: [],
    specificInstructions: '',
  };
}
