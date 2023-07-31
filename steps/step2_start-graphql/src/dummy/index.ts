import { Team, User, Skill } from './create-dummy-data';
import teamsData from './dummy-teams.json';
import usersData from './dummy-users.json';

const teams = teamsData as Team[];
const users = usersData as User[];
export { Team, User, Skill };
export { teams, users };
