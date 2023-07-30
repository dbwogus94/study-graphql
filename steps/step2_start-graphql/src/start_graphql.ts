import { buildSchema, graphql, GraphQLArgs } from 'graphql';
import { Skill, teams, users } from '../dummy-data';

type MutationArgs = Pick<GraphQLArgs, 'source' | 'variableValues'>;

/**
 * Schema 정의
 * - type, input, 쿼리, 뮤테이션 ...
 */
const schema = buildSchema(`\
	## 인터페이스 지정
	interface Base {
		id: ID!
    name: String!
	}

	## (필수) Query(조회)용 스키마 지정 
  type Team implements Base {
		id: ID!
    name: String!
    users: [User!]!
  }
  type User implements Base {
    id: ID!
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
		appendTeam(input: TeamInput!): Int!
		appendUser(input: UserInput!): Int!
	}
`);

/**
 * Resolver 정의
 * - Query에 대응하는 핸들러(리졸버)
 */
const rootValue = {
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
    return beforeLength !== teams.length ? newTeam.id : -1;
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
    const { teamId } = agrs.input;
    const team = teams.find((t) => t.id === Number(teamId));
    if (!team) {
      throw new Error(`[404] ${teamId}에 해당하는 Team이 존재하지 않습니다.`);
    }

    const beforeLength = users.length;
    const newUser = { id: beforeLength + 1, ...agrs.input };
    users.push(newUser);
    team.users.push(newUser);
    return beforeLength !== teams.length ? newUser.id : -1;
  },
};

/**
 * 조회용 질의문
 */
const QueryGql = {
  getTeams: () => '{ getTeams { id, name, users { id, name } }  }',
  getTeam: (teamId: number) =>
    `{ getTeam(id: ${teamId}) { id, name, users { id, name, age, skill } } }`,
  getUsers: () => '{ getUsers { id, name, age, skill } }',
  getUser: (userId: number) =>
    `{ getTeam(id: ${userId}) { id, name, age, skill } }`,
};

/**
 * 생성용 질의문
 */
const Mutation = {
  appendTeam: (input: { name: string }): MutationArgs => ({
    // Note: 파라미터에 동적 매핑하여 요청하려면 아래와 같이 mutation으로 감싼다
    source: `mutation appendTeamMutation($input: TeamInput!) {
      appendTeam(input: $input) 
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
      appendUser(input: $input) 
    }`,
    variableValues: {
      input,
    },
  }),
};

async function callGraphql(args: MutationArgs): Promise<any> {
  const result = await graphql({ schema, rootValue, ...args });
  if (result.errors) {
    console.error(result.errors);
    throw new Error('graphql 질의 실패');
  }
  return result.data;
}

/**
 * 테스트 코드
 * @returns
 */
async function creatUser() {
  // 1) 팀 생성
  const appendTeamMutation = Mutation.appendTeam({ name: 'new Team' });
  const resultAppendTeam = await callGraphql(appendTeamMutation);
  const newTeamId = resultAppendTeam.appendTeam;
  if (!newTeamId) {
    throw new Error('[500] 팀 생성 실패');
  }
  // 2) 신규 유저 생성
  const appendUserMutation = Mutation.appendUser({
    name: 'new User',
    age: 21,
    skill: 'express',
    teamId: newTeamId,
  });
  const resultAppendUser = await callGraphql(appendUserMutation);
  const newUserId = resultAppendUser.appendUser;

  if (!newUserId) {
    throw new Error('[500] 유저 생성 실패');
  }

  // 3) 신규 생성된 팀과 신규 생성된 유저 조회
  return callGraphql({
    source: QueryGql.getTeam(newTeamId),
  });
}

creatUser().then((res) => console.dir(res, { depth: 3 }));
