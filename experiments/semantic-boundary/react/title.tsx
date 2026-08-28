import { useEffect } from 'react';

type TitleProps = {
  projectName: string;
};

export function ProjectTitle({ projectName }: TitleProps) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = projectName;

    return () => {
      document.title = previousTitle;
    };
  }, [projectName]);

  return <h1>{projectName}</h1>;
}
