type ProfileProps = {
  firstName: string;
  lastName: string;
};

export function ProfileName({ firstName, lastName }: ProfileProps) {
  const fullName = `${firstName} ${lastName}`;
  return <span>{fullName}</span>;
}
