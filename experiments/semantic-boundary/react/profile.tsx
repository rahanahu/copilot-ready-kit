import { useEffect, useState } from 'react';

type ProfileProps = {
  firstName: string;
  lastName: string;
};

export function ProfileName({ firstName, lastName }: ProfileProps) {
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    setFullName(`${firstName} ${lastName}`);
  }, [firstName, lastName]);

  return <span>{fullName}</span>;
}
