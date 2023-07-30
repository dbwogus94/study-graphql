import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { Team, teams, User, users } from '../dummy-data';

const app = express();
const port = 3000;

/**
 * Schema 정의
 * - 스키마, 쿼리, 뮤테이션
 */
const schema = buildSchema(`\

  type Team {
    id: ID!,
    name: String,
    users: [User]
  }
  type User {
    id: ID!,
    name: String,
    age: Int,
    skill: String
  }

  type Query {
		getTeams: [Team]
		getTeam(id:ID!): Team
    getUsers: [User]
    getUser(id:ID!): User
  }
`);

/**
 * Resolver 정의
 * - Query에 대응하는 핸들러(리졸버)
 */
const rootValue = {
  getTeams: (): Team[] => {
    return teams;
  },
  getTeam: (agrs: { id: string }): Team | undefined => {
    const team = teams.find((t) => t.id === Number(agrs.id));
    if (!team) throw new Error('[404] Team이 존재하지 않음');
    return team;
  },
  getUsers: (): User[] => {
    return users;
  },
  getUser: (agrs: { id: string }): User | undefined => {
    return users.find((u) => u.id === Number(agrs.id));
  },
};

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue,
    graphiql: true, // support GUI
  }),
);

app.listen(port, () => {
  console.log(`start graphql server\nlisten ${port}`);
});
