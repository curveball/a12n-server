export type PrivilegeMap = {
  [resource: string]: string[],
};

export type Privilege = {
  privilege: string,
  description: string
}