import * as fs from 'fs/promises';
import * as path from 'path';

export type Skill = 'express' | 'nestjs' | 'react' | 'nextjs';
export interface User {
  id: number;
  name: string;
  age: number;
  skill: Skill;
}
export interface Team {
  id: number;
  name: string;
  users: User[];
}

const randomInt = (maxInt: number) => Math.floor(Math.random() * maxInt) + 1;
const deepCopy = <T>(array: T[]): T[] => JSON.parse(JSON.stringify(array));
const shuffle = <T>(array: T[]): T[] => array.sort(() => Math.random() - 0.5);
const createUsers = (createCount: number): User[] => {
  const skills = ['express', 'nestjs', 'react', 'nextjs'];
  return Array.from({ length: createCount }, (_, idx) => ({
    id: idx + 1,
    name: `Sample User ${idx + 1}`,
    age: 20 + randomInt(20),
    skill: skills[randomInt(3)] as Skill,
  }));
};

const users: User[] = createUsers(20);
const useTeamUsers = shuffle(deepCopy(users));

const teamCount = 4;
const teamInUserCount = useTeamUsers.length / teamCount;
const teams: Team[] = Array.from({ length: teamCount }, (_, idx) => ({
  id: idx + 1,
  name: `Sample Team ${idx + 1}`,
  users: useTeamUsers.splice(0, teamInUserCount),
}));

fs.writeFile(
  path.join(__dirname, './dummy-teams.json'),
  JSON.stringify(teams),
).then(() => console.log('success create dummy-teams.json'));

fs.writeFile(
  path.join(__dirname, './dummy-users.json'),
  JSON.stringify(users),
).then(() => console.log('success create dummy-users.json'));
