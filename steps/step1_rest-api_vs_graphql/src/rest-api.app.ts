/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Request, Response } from 'express';
import { Skill, teams, users } from '../dummy-data';

const app = express();
const port = 3000;

const handler = {
  getTeams: (req: Request, res: Response) => {
    return res.status(200).json(teams);
  },
  getTeam: (req: Request, res: Response) => {
    const { teamId } = req.params;
    const team = teams.find((t) => t.id === Number(teamId));
    if (!team) return res.sendStatus(404);
    const { users, ...other } = team;
    return res.status(200).json(other);
  },
  getTeamWithUsers: (req: Request, res: Response) => {
    const { teamId } = req.params;
    const team = teams.find((t) => t.id === Number(teamId));
    return team ? res.status(200).json(team) : res.sendStatus(404);
  },
  getUsers: (req: Request, res: Response) => {
    return res.status(200).json(users);
  },
  getUser: (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = users.find((u) => u.id === Number(userId));
    return user ? res.status(200).json(user) : res.sendStatus(404);
  },
};

/**
 * GET /teams
 */
app.get('/teams', handler.getTeams);
/**
 * GET /teams/:teamId
 */
app.get('/teams/:teamId', handler.getTeam);
/**
 * GET /teams/:teamId/users
 */
app.get('/teams/:teamId/users', handler.getTeamWithUsers);
/**
 * GET /users
 */
app.get('/users', handler.getUsers);
/**
 * GET /users/:userId
 */
app.get('/users/:userId', handler.getUser);

app.listen(port, () => {
  console.log(`start rest api server\nlisten ${port}`);
});
