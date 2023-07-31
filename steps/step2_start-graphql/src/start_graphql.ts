import { buildSchema, graphql, GraphQLArgs } from 'graphql';
import { teams, users } from './dummy';
import { Skill } from './dummy/create-dummy-data';

type MutationArgs = Pick<GraphQLArgs, 'source' | 'variableValues'>;

/**
 * Schema 정의
 * - type, input, 쿼리, 뮤테이션 ...
 */
const schema = buildSchema(`\
	## 인터페이스 지정
	interface Base {
		id: Int! # Note: ID를 사용하면 응답 결과가 문자열로 조회된다.
    name: String!
	}

	## (필수) Query(조회)용 스키마 지정 
  type Team implements Base {
		id: Int!
    name: String!
    users: [User!]!
  }
  type User implements Base {
    id: Int!
    name: String!
    age: Int!
    skill: String!
  }
	enum Skill {
		express
		nestjs
		react
		nextjs
	}

  type AppendTeamResponse {
    id: Int!
  }
  type AppendUserResponse {
    id: Int!
  }

	## 뮤테이션(CUD)용 스키마 지정
	input TeamInput {
		name: String!
	}
	input UserInput {
		name: String!
    age: Int!
    skill: String!
		teamId: Int!
	}

	## (필수) 쿼리 선언
  type Query {
		getTeams: [Team]
		getTeam(id:ID!): Team
    getUsers: [User]
    getUser(id:ID!): User
  }

	## 뮤테이션 선언
	type Mutation {
		appendTeam(input: TeamInput!): AppendTeamResponse!
		appendUser(input: UserInput!): AppendUserResponse!
	}
`);

/**
 * Resolver 정의
 * - Query에 대응하는 핸들러(리졸버)
 */
export const rootValue = {
  getTeams: () => {
    return teams;
  },
  getTeam: (agrs: { id: string }) => {
    return teams.find((t) => t.id === Number(agrs.id));
  },
  appendTeam: (agrs: { input: { name: string } }) => {
    const beforeLength = teams.length;
    const newTeam = { id: beforeLength + 1, ...agrs.input, users: [] };
    teams.push(newTeam);
    return beforeLength !== teams.length ? { id: newTeam.id } : { id: -1 };
  },

  getUsers: () => {
    return users;
  },
  getUser: (agrs: { id: string }) => {
    return users.find((u) => u.id === Number(agrs.id));
  },
  appendUser: (agrs: {
    input: {
      name: string;
      age: number;
      skill: Skill;
      teamId: number;
    };
  }) => {
    const { teamId, ...other } = agrs.input;
    const team = teams.find((t) => t.id === Number(teamId));
    if (!team) {
      throw new Error(`[404] ${teamId}에 해당하는 Team이 존재하지 않습니다.`);
    }

    const beforeLength = users.length;
    const newUser = { id: beforeLength + 1, ...other };
    users.push(newUser) && team.users.push(newUser);
    return beforeLength !== users.length ? { id: newUser.id } : { id: -1 };
  },
};

/**
 * 조회용 질의문
 */
export const QueryGql = {
  getTeams: () => '{ getTeams { id, name, users { id, name, age, skill } }  }',
  getTeam: (teamId: number) =>
    `{ getTeam(id: ${teamId}) { id, name, users { id, name, age, skill } } }`,
  getUsers: () => '{ getUsers { id, name, age, skill } }',
  getUser: (userId: number) =>
    `{ getUser(id: ${userId}) { id, name, age, skill } }`,
};

/**
 * 뮤테이션에 사용할 질의
 */
export const Mutation = {
  appendTeam: (input: { name: string }): MutationArgs => ({
    // Note: 파라미터에 동적 매핑하여 요청하려면 아래와 같이 mutation으로 감싼다
    source: `mutation appendTeamMutation($input: TeamInput!) {
      appendTeam(input: $input) { id }
    }`,
    variableValues: {
      input,
    },
  }),
  appendUser: (input: {
    name: string;
    age: number;
    skill: Skill;
    teamId: number;
  }): MutationArgs => ({
    source: `mutation appendUserMutation($input: UserInput!) {
      appendUser(input: $input) { id }
    }`,
    variableValues: {
      input,
    },
  }),
};

export async function callGraphql(args: MutationArgs): Promise<any> {
  const result = await graphql({ schema, rootValue, ...args });
  if (result.errors) {
    console.error(result.errors);
    throw new Error('graphql 질의 실패');
  }
  return result.data;
}
