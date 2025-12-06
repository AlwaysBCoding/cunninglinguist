export enum UI_ROUTES {
  Home = '/',
  LevelSelect = '/levels',
  LevelShow = '/levels/:level'
}

export const getLevelShowRoute = (ident: string): string => {
  return `/levels/${ident}`;
};
