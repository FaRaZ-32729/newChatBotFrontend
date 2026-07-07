const ACCESS_LABELS = {
  'head movement': 'Head Movement',
  'hand movement': 'Hand Movement',
};

const ACCESS_VALUES = {
  'Head Movement': 'head movement',
  'Hand Movement': 'hand movement',
};

export function toBackendAccess(selectedAccess) {
  if (!selectedAccess?.length) return null;

  const values = selectedAccess
    .map((label) => ACCESS_VALUES[label])
    .filter(Boolean);

  return values.length ? [...new Set(values)] : null;
}

export function formatAccessForDisplay(access) {
  if (!access) return [];

  const list = Array.isArray(access) ? access : [access];
  return list.map((item) => ACCESS_LABELS[item]).filter(Boolean);
}
