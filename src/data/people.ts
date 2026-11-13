/** Fictional team at Northwind Labs. All names, emails and photos are placeholders. */
export type Role = 'owner' | 'admin' | 'builder' | 'reviewer' | 'member' | 'viewer';

export interface Person {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  avatar?: string;
}

const avatar = (file: string) => `${import.meta.env.BASE_URL}images/avatars/${file}.jpg`;

export const people = {
  maya: {
    id: 'maya',
    name: 'Maya Chen',
    email: 'maya@northwindlabs.com',
    role: 'owner',
    title: 'Head of Support Ops',
    avatar: avatar('maya-chen'),
  },
  daniel: {
    id: 'daniel',
    name: 'Daniel Okafor',
    email: 'daniel@northwindlabs.com',
    role: 'admin',
    title: 'IT Admin',
    avatar: avatar('daniel-okafor'),
  },
  priya: {
    id: 'priya',
    name: 'Priya Nair',
    email: 'priya@northwindlabs.com',
    role: 'builder',
    title: 'Automation Engineer',
    avatar: avatar('priya-nair'),
  },
  leo: {
    id: 'leo',
    name: 'Leo Martins',
    email: 'leo@northwindlabs.com',
    role: 'reviewer',
    title: 'Finance Lead',
    avatar: avatar('leo-martins'),
  },
  sofia: {
    id: 'sofia',
    name: 'Sofia Rossi',
    email: 'sofia@northwindlabs.com',
    role: 'member',
    title: 'Support Specialist',
    avatar: avatar('sofia-rossi'),
  },
  omar: {
    id: 'omar',
    name: 'Omar Haddad',
    email: 'omar@northwindlabs.com',
    role: 'viewer',
    title: 'Analyst',
    avatar: avatar('omar-haddad'),
  },
  jae: {
    id: 'jae',
    name: 'Jae Kim',
    email: 'jae@northwindlabs.com',
    role: 'builder',
    title: 'Product Engineer',
    avatar: avatar('jae-kim'),
  },
  dana: {
    id: 'dana',
    name: 'Dana Whitfield',
    email: 'dana.whitfield@acme.example',
    role: 'member',
    title: 'Customer · Acme Co.',
    avatar: avatar('dana-whitfield'),
  },
} satisfies Record<string, Person>;

export type PersonId = keyof typeof people;

/** Extra stock portraits for member lists and avatar groups. */
export const extraAvatars = Array.from({ length: 12 }, (_, i) =>
  avatar(`person-${String(i + 1).padStart(2, '0')}`),
);

/** The signed-in user shown in the shell for each role (matches the kit's role previews). */
export const userForRole: Record<Role, Person> = {
  owner: people.maya,
  admin: people.daniel,
  builder: people.priya,
  reviewer: people.leo,
  member: people.sofia,
  viewer: people.omar,
};

export const roleLabels: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  builder: 'Builder',
  reviewer: 'Reviewer',
  member: 'Member',
  viewer: 'Viewer',
};
