export function slugify(subject) {
  return subject
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function toNamespace(subject) {
  return subject
    .replace(/[\/\\]+$/, '')
    .split(/[\/\\]/)
    .map(part =>
      part
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('')
        .replace(/-/g, ''),
    )
    .join('\\');
}

export function toComposerNamespace(subject) {
  return toNamespace(subject).replace(/\\/g, '\\\\');
}

export function titleCase(subject) {
  return subject
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
