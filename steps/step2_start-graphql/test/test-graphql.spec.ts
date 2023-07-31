import { Team } from '../src/dummy';
import {
  Mutation,
  QueryGql,
  callGraphql,
  rootValue,
} from '../src/start_graphql';

describe('Test Graphql - Query(조회)', () => {
  const dummyTeams = rootValue.getTeams();
  const dummyUsers = rootValue.getUsers();
  const TEAM_ID = 1;
  const USER_ID = 3;

  it(`Query ${QueryGql.getTeams()}`, async () => {
    const { getTeams } = await callGraphql({ source: QueryGql.getTeams() });
    expect(getTeams.length).toBe(dummyTeams.length);
    expect(getTeams).toEqual(dummyTeams);
  });

  it(`Query ${QueryGql.getTeam(TEAM_ID)}`, async () => {
    const { getTeam } = await callGraphql({
      source: QueryGql.getTeam(TEAM_ID),
    });
    expect(TEAM_ID).toBe(getTeam.id);

    const dummyTeam = dummyTeams.find((t) => t.id === getTeam.id);
    expect(getTeam).toEqual(dummyTeam);
  });

  it(`Query ${QueryGql.getUsers()}`, async () => {
    const { getUsers } = await callGraphql({ source: QueryGql.getUsers() });
    expect(getUsers.length).toBe(dummyUsers.length);
    expect(getUsers).toEqual(dummyUsers);
  });

  it(`Query ${QueryGql.getUser(USER_ID)}`, async () => {
    const { getUser } = await callGraphql({
      source: QueryGql.getUser(USER_ID),
    });
    expect(USER_ID).toBe(getUser.id);

    const dummyUser = dummyUsers.find((u) => u.id === getUser.id);
    expect(getUser).toEqual(dummyUser);
  });
});

describe('Test Graphql - Mutation(CUD)', () => {
  const dummyTeams = rootValue.getTeams();
  const dummyUsers = rootValue.getUsers();
  let createdTeamId: number;
  let createdUserId: number;

  describe('Mutation - Team 신규 추가', () => {
    beforeAll(async () => {
      const { appendTeam } = await callGraphql({
        ...Mutation.appendTeam({
          name: '신규 팀 name',
        }),
      });
      createdTeamId = appendTeam.id;
    });

    it(`생성된 Team id로 단일 조회시 존재해야 한다.`, async () => {
      const { getTeam } = await callGraphql({
        source: QueryGql.getTeam(createdTeamId),
      });
      expect(getTeam).not.toBeNull();
      expect(createdTeamId).toBe(getTeam.id);
    });

    it(`생성된 Team과 동일한 Team이 리스트에 존재해야 한다.`, async () => {
      const { getTeam } = await callGraphql({
        source: QueryGql.getTeam(createdTeamId),
      });
      const dummyTeam = dummyTeams.find((t) => t.id === createdTeamId);
      expect(getTeam).toEqual(dummyTeam);
    });
  });

  describe(`Mutation - User 신규 추가`, () => {
    beforeAll(async () => {
      const { appendUser } = await callGraphql({
        ...Mutation.appendUser({
          name: '신규 유저 이름',
          age: 25,
          skill: 'nestjs',
          teamId: createdTeamId,
        }),
      });
      createdUserId = appendUser.id;
    });

    it(`생성된 User id로 단일 조회시 존재해야 한다.`, async () => {
      const { getUser } = await callGraphql({
        source: QueryGql.getUser(createdUserId),
      });
      expect(getUser).not.toBeNull();
      expect(createdUserId).toBe(getUser.id);
    });

    it(`생성된 User와 동일한 User가 리스트에 존재해야 한다.`, async () => {
      const { getUser } = await callGraphql({
        source: QueryGql.getUser(createdUserId),
      });
      const dummyUser = dummyUsers.find((u) => u.id === createdUserId);
      expect(getUser).toEqual(dummyUser);
    });

    it(`생성된 User가 Team에 들어있어야 한다.`, async () => {
      const { getTeam } = await callGraphql({
        source: QueryGql.getTeam(createdTeamId),
      });
      expect(getTeam).not.toBeNull();

      const { users } = getTeam as Team;
      const { getUser } = await callGraphql({
        source: QueryGql.getUser(createdUserId),
      });
      const foundUser = users.find((u) => u.id === createdUserId);
      expect(getUser).toEqual(foundUser);
    });
  });
});
