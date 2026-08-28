import { useEffect } from 'react';

type TitleProps = {
  projectName: string;
};

export function ProjectTitle({ projectName }: TitleProps) {
  useEffect(() => {
    document.title = projectName;
    document.documentElement.dataset['project'] = projectName;
  }, [projectName]);

  return <h1>{projectName}</h1>;
}
