export const getAcronym = (name: string) => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 3).toUpperCase();
};

export const getRoleLabel = (name: string) => {
  const hash = name.length % 3;
  if (hash === 0) return 'Unit Head';
  if (hash === 1) return 'Division Lead';
  return 'Dept. Manager';
};

export const getPlaceholderDesc = (name: string) => {
  const templates = [
    `Strategic division focusing on cross-platform execution and ${name.toLowerCase()} deliverables.`,
    `Validation and continuous governance overseeing global operations for ${name}.`,
    `Core entity managing corporate logistics and execution wing for ${name}.`,
    `Ensuring optimal performance and forecasting for all internal ${name} systems.`
  ];
  return templates[name.length % templates.length];
};